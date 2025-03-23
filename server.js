import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const isDev = process.env.NODE_ENV !== 'production';

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

async function scrapeWebsite(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const data = {
      title: $('title').text(),
      headlines: [],
      links: [],
      images: [],
      paragraphs: []
    };

    // Extract headlines (h1, h2, h3)
    $('h1, h2, h3').each((i, element) => {
      const text = $(element).text().trim();
      if (text) {
        data.headlines.push({
          type: element.name,
          text: text
        });
      }
    });

    // Extract links
    $('a').each((i, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href && text && !href.startsWith('#')) {
        try {
          const fullUrl = href.startsWith('http') ? href : new URL(href, url).toString();
          data.links.push({ href: fullUrl, text });
        } catch (e) {
          console.warn('Invalid URL:', href);
        }
      }
    });

    // Extract images
    $('img').each((i, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || '';
      if (src) {
        try {
          const fullUrl = src.startsWith('http') ? src : new URL(src, url).toString();
          data.images.push({ src: fullUrl, alt });
        } catch (e) {
          console.warn('Invalid image URL:', src);
        }
      }
    });

    // Extract paragraphs
    $('p').each((i, element) => {
      const text = $(element).text().trim();
      if (text) {
        data.paragraphs.push(text);
      }
    });

    return data;
  } catch (error) {
    console.error('Error scraping website:', error);
    throw error;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const data = await scrapeWebsite(url);
    res.json(data);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape website', 
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  
  if (isDev) {
    console.log('Starting Vite development server...');
    const vite = spawn('npx', ['vite', '--port', '5173'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: 'true'
      }
    });

    vite.on('error', (err) => {
      console.error('Failed to start Vite server:', err);
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