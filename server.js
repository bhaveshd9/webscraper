import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'web-scraper-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// Validation schemas
const scrapeRequestSchema = z.object({
  url: z.string().url(),
  options: z.object({
    includeImages: z.boolean(),
    includeLinks: z.boolean(),
    includeHeadlines: z.boolean(),
    includeParagraphs: z.boolean(),
    maxResults: z.number().min(1).max(100),
  }),
});

// Price history storage (in production, use a proper database)
const priceHistory = new Map();

async function scrapeWebsite(url, options) {
  const startTime = Date.now();
  logger.info(`Starting scrape for URL: ${url}`);

  try {
    // Try with Puppeteer first for dynamic content
    let html;
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      html = await page.content();
      await browser.close();
    } catch (puppeteerError) {
      logger.warn(`Puppeteer failed, falling back to fetch: ${puppeteerError.message}`);
      // Fallback to fetch
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      });
      html = await response.text();
    }

    const $ = cheerio.load(html);
    
    const data = {
      title: $('title').text().trim() || 'No title found',
      headlines: [],
      links: [],
      images: [],
      paragraphs: [],
      prices: []
    };

    // Extract headlines (h1, h2, h3)
    if (options.includeHeadlines) {
      $('h1, h2, h3').each((i, element) => {
        if (i >= options.maxResults) return false;
        const text = $(element).text().trim();
        if (text) {
          data.headlines.push({
            type: element.name,
            text: text
          });
        }
      });
    }

    // Extract links
    if (options.includeLinks) {
      $('a').each((i, element) => {
        if (i >= options.maxResults) return false;
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href && text && !href.startsWith('#')) {
          try {
            const fullUrl = href.startsWith('http') ? href : new URL(href, url).toString();
            data.links.push({ href: fullUrl, text });
          } catch (e) {
            logger.warn(`Invalid URL: ${href}`);
          }
        }
      });
    }

    // Extract images
    if (options.includeImages) {
      $('img').each((i, element) => {
        if (i >= options.maxResults) return false;
        const src = $(element).attr('src');
        const alt = $(element).attr('alt') || '';
        if (src) {
          try {
            const fullUrl = src.startsWith('http') ? src : new URL(src, url).toString();
            data.images.push({ src: fullUrl, alt });
          } catch (e) {
            logger.warn(`Invalid image URL: ${src}`);
          }
        }
      });
    }

    // Extract paragraphs
    if (options.includeParagraphs) {
      $('p').each((i, element) => {
        if (i >= options.maxResults) return false;
        const text = $(element).text().trim();
        if (text) {
          data.paragraphs.push(text);
        }
      });
    }

    // Extract prices from all text content
    const allText = $('body').text();
    const priceRegex = /\$?\d+(?:,\d{3})*(?:\.\d{2})?/g;
    const prices = allText.match(priceRegex) || [];
    data.prices = [...new Set(prices)].slice(0, options.maxResults);

    // Store price history
    if (data.prices.length > 0) {
      const historyEntry = {
        timestamp: new Date().toISOString(),
        prices: data.prices
      };
      
      if (!priceHistory.has(url)) {
        priceHistory.set(url, []);
      }
      priceHistory.get(url).push(historyEntry);
      
      // Keep only last 10 entries per URL
      if (priceHistory.get(url).length > 10) {
        priceHistory.get(url).shift();
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`Scrape completed for ${url} in ${duration}ms`);

    return data;
  } catch (error) {
    logger.error(`Error scraping website ${url}:`, error);
    throw error;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/scrape', async (req, res) => {
  try {
    // Validate request
    const validationResult = scrapeRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { url, options } = validationResult.data;
    
    logger.info(`Scrape request received for: ${url}`);
    
    const data = await scrapeWebsite(url, options);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Scraping error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to scrape website',
      message: error.message 
    });
  }
});

app.get('/api/price-history', (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'URL parameter is required' 
      });
    }

    const history = priceHistory.get(url) || [];
    res.json(history);
  } catch (error) {
    logger.error('Price history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch price history' 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`API Server running on http://localhost:${PORT}`);
  
  if (isDev) {
    logger.info('Starting Vite development server...');
    const vite = spawn('npx', ['vite', '--port', '5173'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: 'true'
      }
    });

    vite.on('error', (err) => {
      logger.error('Failed to start Vite server:', err);
      process.exit(1);
    });

    const cleanup = () => {
      vite.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }
});