import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import dns from 'dns';
// import multer from 'multer';
// import fs from 'fs';

// Force IPv4 DNS resolution to avoid IPv6 timeout issues
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));



// Price history storage
const priceHistory = new Map();

// Helper functions
const extractEmails = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return [...new Set(text.match(emailRegex) || [])];
};

const extractPhones = (text) => {
  const phoneRegex = /(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g;
  return [...new Set(text.match(phoneRegex) || [])];
};

const extractAddresses = (text) => {
  const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Terrace|Ter|Circle|Cir|Square|Sq)/gi;
  return [...new Set(text.match(addressRegex) || [])];
};

const detectLanguage = (text) => {
  // Simple language detection based on common words
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te'];
  const frenchWords = ['le', 'la', 'de', 'et', 'en', 'un', 'est', 'que', 'pour', 'dans', 'sur', 'avec'];
  
  const words = text.toLowerCase().split(/\s+/);
  const englishCount = words.filter(word => englishWords.includes(word)).length;
  const spanishCount = words.filter(word => spanishWords.includes(word)).length;
  const frenchCount = words.filter(word => frenchWords.includes(word)).length;
  
  if (englishCount > spanishCount && englishCount > frenchCount) return 'English';
  if (spanishCount > englishCount && spanishCount > frenchCount) return 'Spanish';
  if (frenchCount > englishCount && frenchCount > spanishCount) return 'French';
  return 'Unknown';
};

async function scrapeWebsite(url, options) {
  const startTime = Date.now();
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Starting scrape for URL: ${url} (attempt ${attempt}/${maxRetries})`);
    
    // Enhanced anti-scraping bypass headers
    const headers = {
      'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    };

    // Add referer if specified
    if (options.referer) {
      headers['Referer'] = options.referer;
    }

    // Add cookies if specified
    if (options.cookies) {
      headers['Cookie'] = options.cookies;
    }

    // Add proxy support if specified
    let fetchOptions = {
      headers,
      timeout: options.timeout || 30000,
      follow: options.followRedirects !== false ? 5 : 0,
      // Force IPv4 connections to avoid IPv6 timeout issues
      family: 4
    };

    // Use proxy if specified
    if (options.proxy) {
      fetchOptions.agent = new URL(options.proxy);
    }

    // Add random delay to avoid rate limiting
    if (options.randomDelay) {
      const delay = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const response = await fetch(url, fetchOptions);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const data = {
      title: $('title').text().trim() || 'No title found',
      headlines: [],
      links: [],
      images: [],
      paragraphs: [],
      prices: [],
      metadata: {
        description: '',
        keywords: [],
        author: '',
        viewport: '',
        robots: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterCard: '',
        canonical: ''
      },
      socialMedia: [],
      forms: [],
      tables: [],
      scripts: [],
      styles: [],
      wordCount: 0,
      language: 'Unknown',
      lastModified: response.headers.get('last-modified') || null
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
            console.warn(`Invalid URL: ${href}`);
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
            console.warn(`Invalid image URL: ${src}`);
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

    // Extract metadata
    if (options.includeMetadata) {
      data.metadata.description = $('meta[name="description"]').attr('content') || '';
      data.metadata.keywords = ($('meta[name="keywords"]').attr('content') || '').split(',').map(k => k.trim()).filter(k => k);
      data.metadata.author = $('meta[name="author"]').attr('content') || '';
      data.metadata.viewport = $('meta[name="viewport"]').attr('content') || '';
      data.metadata.robots = $('meta[name="robots"]').attr('content') || '';
      data.metadata.ogTitle = $('meta[property="og:title"]').attr('content') || '';
      data.metadata.ogDescription = $('meta[property="og:description"]').attr('content') || '';
      data.metadata.ogImage = $('meta[property="og:image"]').attr('content') || '';
      data.metadata.twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
      data.metadata.canonical = $('link[rel="canonical"]').attr('href') || '';
    }

    // Extract social media links
    if (options.includeSocialMedia) {
      $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="youtube.com"]').each((i, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href) {
          let type = 'other';
          if (href.includes('facebook.com')) type = 'facebook';
          else if (href.includes('twitter.com')) type = 'twitter';
          else if (href.includes('instagram.com')) type = 'instagram';
          else if (href.includes('linkedin.com')) type = 'linkedin';
          else if (href.includes('youtube.com')) type = 'youtube';
          
          data.socialMedia.push({
            platform: type,
            url: href,
            type: type
          });
        }
      });
    }

    // Extract forms
    if (options.includeForms) {
      $('form').each((i, element) => {
        const action = $(element).attr('action') || '';
        const method = $(element).attr('method') || 'GET';
        const inputs = [];
        
        $(element).find('input, textarea, select').each((j, input) => {
          const name = $(input).attr('name') || '';
          const type = $(input).attr('type') || 'text';
          const placeholder = $(input).attr('placeholder') || '';
          const required = $(input).attr('required') !== undefined;
          
          if (name) {
            inputs.push({ name, type, placeholder, required });
          }
        });
        
        if (inputs.length > 0) {
          data.forms.push({ action, method, inputs });
        }
      });
    }

    // Extract tables
    if (options.includeTables) {
      $('table').each((i, table) => {
        const headers = [];
        const rows = [];
        
        $(table).find('thead tr, tr').first().find('th, td').each((j, cell) => {
          headers.push($(cell).text().trim());
        });
        
        $(table).find('tbody tr, tr').slice(1).each((j, row) => {
          const rowData = [];
          $(row).find('td').each((k, cell) => {
            rowData.push($(cell).text().trim());
          });
          if (rowData.length > 0) {
            rows.push(rowData);
          }
        });
        
        if (headers.length > 0) {
          data.tables.push({ headers, rows });
        }
      });
    }

    // Extract scripts
    if (options.includeScripts) {
      $('script').each((i, element) => {
        const src = $(element).attr('src') || '';
        const type = $(element).attr('type') || 'text/javascript';
        const content = $(element).html() || '';
        
        data.scripts.push({ src, type, content });
      });
    }

    // Extract styles
    if (options.includeStyles) {
      $('link[rel="stylesheet"]').each((i, element) => {
        const href = $(element).attr('href') || '';
        const media = $(element).attr('media') || '';
        
        if (href) {
          data.styles.push({ href, media });
        }
      });
    }

    // Extract prices from all text content
    const allText = $('body').text();
    const priceRegex = /\$?\d+(?:,\d{3})*(?:\.\d{2})?/g;
    const prices = allText.match(priceRegex) || [];
    data.prices = [...new Set(prices)].slice(0, options.maxResults);

    // Extract contact information
    if (options.extractEmails) {
      const emails = extractEmails(allText);
      // Add emails to a special section or metadata
    }

    if (options.extractPhones) {
      const phones = extractPhones(allText);
      // Add phones to a special section or metadata
    }

    if (options.extractAddresses) {
      const addresses = extractAddresses(allText);
      // Add addresses to a special section or metadata
    }

    // Calculate word count and detect language
    data.wordCount = allText.split(/\s+/).length;
    data.language = detectLanguage(allText);

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

    const processingTime = Date.now() - startTime;
    console.log(`Scrape completed for ${url} in ${processingTime}ms`);

    // Add stats to the response
    const stats = {
      totalElements: data.headlines.length + data.links.length + data.images.length + data.paragraphs.length + data.prices.length + data.forms.length + data.tables.length + data.scripts.length,
      processingTime,
      pageSize: html.length,
      wordCount: data.wordCount,
      linkCount: data.links.length,
      imageCount: data.images.length
    };

      return { ...data, stats };
    } catch (error) {
      console.error(`Error scraping website ${url} (attempt ${attempt}):`, error);
      lastError = error;
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const retryDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error(`All ${maxRetries} attempts failed for ${url}`);
  throw lastError;
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
    const { url, options } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    if (!options) {
      return res.status(400).json({ 
        success: false,
        error: 'Options are required' 
      });
    }
    
    console.log(`Scrape request received for: ${url}`);
    console.log(`Using browser: ${options.useBrowser ? 'Yes' : 'No'}`);
    
    let data;
    let method = 'http';
    
    // Try browser scraping if requested
    if (options.useBrowser) {
      try {
        console.log('Browser scraping requested, attempting enhanced scraper...');
        
        // Choose between Puppeteer and Selenium based on options
        if (options.useSelenium) {
          console.log('Using Selenium for browser automation...');
          const { default: SeleniumScraper } = await import('./src/utils/seleniumScraper.js');
          const scraper = SeleniumScraper.getInstance();
          data = await scraper.scrapeWithSelenium(url, options);
          method = 'selenium';
        } else {
          console.log('Using Puppeteer for browser automation...');
          const { default: EnhancedScraper } = await import('./src/utils/enhancedScraper.js');
          const scraper = EnhancedScraper.getInstance();
          data = await scraper.scrapeWithBrowser(url, options);
          method = 'puppeteer';
        }
      } catch (browserError) {
        console.log('Browser scraping failed, falling back to HTTP:', browserError.message);
        data = await scrapeWebsite(url, options);
        method = 'http-fallback';
      }
    } else {
      data = await scrapeWebsite(url, options);
      method = 'http';
    }
    
    res.json({
      success: true,
      data,
      stats: data.stats,
      method
    });
  } catch (error) {
    console.error('Scraping error:', error);
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
    console.error('Price history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch price history' 
    });
  }
});

// Anti-scraping bypass techniques endpoint
app.get('/api/anti-scraping-techniques', (req, res) => {
  try {
    const techniques = {
      userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      referers: [
        'https://www.google.com/',
        'https://www.bing.com/',
        'https://www.facebook.com/',
        'https://twitter.com/',
        'https://www.linkedin.com/'
      ],
      techniques: [
        {
          name: 'Rotate User Agents',
          description: 'Use different browser user agents to avoid detection',
          implementation: 'Randomly select from a pool of user agents'
        },
        {
          name: 'Add Realistic Headers',
          description: 'Include all standard browser headers',
          implementation: 'Accept, Accept-Language, Accept-Encoding, DNT, etc.'
        },
        {
          name: 'Use Referers',
          description: 'Add realistic referer headers',
          implementation: 'Set referer to popular search engines or social media'
        },
        {
          name: 'Random Delays',
          description: 'Add random delays between requests',
          implementation: 'Wait 1-3 seconds between requests'
        },
        {
          name: 'Proxy Rotation',
          description: 'Use different IP addresses',
          implementation: 'Rotate through proxy servers'
        },
        {
          name: 'Session Management',
          description: 'Maintain cookies and sessions',
          implementation: 'Store and reuse cookies between requests'
        },
        {
          name: 'Respect Robots.txt',
          description: 'Check robots.txt before scraping',
          implementation: 'Parse and respect robots.txt rules'
        },
        {
          name: 'Rate Limiting',
          description: 'Limit requests per second',
          implementation: 'Maximum 1-2 requests per second'
        }
      ],
      commonBlockers: [
        'Cloudflare',
        'Akamai',
        'Imperva',
        'F5 Networks',
        'AWS WAF',
        'Google reCAPTCHA'
      ],
      bypassMethods: [
        {
          blocker: 'Cloudflare',
          methods: ['Use residential proxies', 'Rotate user agents', 'Add realistic headers', 'Use browser automation']
        },
        {
          blocker: 'reCAPTCHA',
          methods: ['Use 2captcha service', 'Browser automation with human-like behavior', 'OCR-based solving']
        },
        {
          blocker: 'Rate Limiting',
          methods: ['Add delays between requests', 'Use proxy rotation', 'Distribute requests across time']
        },
        {
          blocker: 'IP Blocking',
          methods: ['Use proxy/VPN services', 'Rotate IP addresses', 'Use residential proxies']
        }
      ]
    };
    
    res.json({
      success: true,
      data: techniques
    });
  } catch (error) {
    console.error('Anti-scraping techniques error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch anti-scraping techniques' 
    });
  }
});

// Test scraping with different techniques
app.post('/api/test-scraping', async (req, res) => {
  try {
    const { url, technique } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    let options = {
      includeImages: true,
      includeLinks: true,
      includeHeadlines: true,
      includeParagraphs: true,
      includeMetadata: true,
      includeSocialMedia: true,
      includeForms: false,
      includeTables: false,
      includeScripts: false,
      includeStyles: false,
      maxResults: 10,
      extractEmails: true,
      extractPhones: true,
      extractAddresses: true,
      followRedirects: true,
      timeout: 30000,
      randomDelay: true
    };

    // Apply specific technique
    switch (technique) {
      case 'stealth':
        options.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        options.referer = 'https://www.google.com/';
        options.randomDelay = true;
        break;
      case 'mobile':
        options.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
        break;
      case 'slow':
        options.timeout = 60000;
        options.randomDelay = true;
        break;
      default:
        break;
    }

    const data = await scrapeWebsite(url, options);
    
    res.json({
      success: true,
      data,
      technique,
      stats: data.stats
    });
  } catch (error) {
    console.error('Test scraping error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to test scraping',
      message: error.message 
    });
  }
});

// Compare different scraping methods
app.get('/api/compare-scraping-methods', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    // Set up a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Method comparison timeout - taking too long')), 45000); // 45 second timeout
    });

    const comparisonPromise = (async () => {
      // Send progress updates function
      const sendProgress = (method, message, type = 'info') => {
        console.log(`[${method}] ${message}`);
      };

    const testOptions = {
      includeHeadlines: true,
      includeLinks: true,
      includeImages: true,
      includeParagraphs: true,
      includePrices: true,
      includeMetadata: true,
      includeSocialMedia: true,
      includeForms: true,
      includeTables: true,
      includeScripts: true,
      includeStyles: true,
      maxResults: 10,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      timeout: 30000,
      followRedirects: true,
      referer: '',
      cookies: '',
      proxy: '',
      randomDelay: false,
      stealth: false,
      mobile: false,
      useBrowser: false, // Will be overridden
      waitForSelector: '',
      waitForTimeout: 5000,
      scrollToBottom: false,
      takeScreenshot: false,
      interceptRequests: false,
      userInteractions: []
    };

    const results = {
      http: null,
      browser: null,
      comparison: {}
    };

    // Test HTTP method
    try {
      sendProgress('SYSTEM', `Starting HTTP method test for: ${url}`);
      const httpStart = Date.now();
      results.http = await scrapeWebsite(url, { ...testOptions, useBrowser: false });
      const httpTime = Date.now() - httpStart;
      results.http.processingTime = httpTime;
      results.http.method = 'http';
      sendProgress('HTTP', `Completed in ${httpTime}ms`, 'success');
    } catch (error) {
      sendProgress('HTTP', `Failed: ${error.message}`, 'error');
      results.http = { error: error.message, method: 'http' };
    }

    // Test Puppeteer method
    try {
      sendProgress('SYSTEM', `Starting Puppeteer method test for: ${url}`);
      const puppeteerStart = Date.now();
      const { default: EnhancedScraper } = await import('./src/utils/enhancedScraper.js');
      const scraper = EnhancedScraper.getInstance();
      results.puppeteer = await scraper.scrapeWithBrowser(url, { ...testOptions, useBrowser: true, useSelenium: false });
      const puppeteerTime = Date.now() - puppeteerStart;
      results.puppeteer.processingTime = puppeteerTime;
      results.puppeteer.method = 'puppeteer';
      sendProgress('PUPPETEER', `Completed in ${puppeteerTime}ms`, 'success');
    } catch (error) {
      sendProgress('PUPPETEER', `Failed: ${error.message}`, 'error');
      results.puppeteer = { error: error.message, method: 'puppeteer' };
    }

    // Test Selenium method
    try {
      sendProgress('SYSTEM', `Starting Selenium method test for: ${url}`);
      const seleniumStart = Date.now();
      const { default: SeleniumScraper } = await import('./src/utils/seleniumScraper.js');
      const scraper = SeleniumScraper.getInstance();
      results.selenium = await scraper.scrapeWithSelenium(url, { ...testOptions, useBrowser: true, useSelenium: true });
      const seleniumTime = Date.now() - seleniumStart;
      results.selenium.processingTime = seleniumTime;
      results.selenium.method = 'selenium';
      sendProgress('SELENIUM', `Completed in ${seleniumTime}ms`, 'success');
    } catch (error) {
      sendProgress('SELENIUM', `Failed: ${error.message}`, 'error');
      results.selenium = { error: error.message, method: 'selenium' };
    }

    // Compare results
    const successfulMethods = [];
    if (results.http && !results.http.error) successfulMethods.push('http');
    if (results.puppeteer && !results.puppeteer.error) successfulMethods.push('puppeteer');
    if (results.selenium && !results.selenium.error) successfulMethods.push('selenium');

    if (successfulMethods.length > 0) {
      const methodTimes = {};
      if (results.http && !results.http.error) methodTimes.http = results.http.processingTime;
      if (results.puppeteer && !results.puppeteer.error) methodTimes.puppeteer = results.puppeteer.processingTime;
      if (results.selenium && !results.selenium.error) methodTimes.selenium = results.selenium.processingTime;

      const fastestMethod = Object.keys(methodTimes).reduce((a, b) => methodTimes[a] < methodTimes[b] ? a : b);

      results.comparison = {
        speed: {
          http: results.http?.processingTime || 0,
          puppeteer: results.puppeteer?.processingTime || 0,
          selenium: results.selenium?.processingTime || 0,
          fastest: fastestMethod
        },
        dataQuality: {
          http: {
            headlines: results.http?.headlines?.length || 0,
            links: results.http?.links?.length || 0,
            images: results.http?.images?.length || 0,
            paragraphs: results.http?.paragraphs?.length || 0
          },
          puppeteer: {
            headlines: results.puppeteer?.headlines?.length || 0,
            links: results.puppeteer?.links?.length || 0,
            images: results.puppeteer?.images?.length || 0,
            paragraphs: results.puppeteer?.paragraphs?.length || 0
          },
          selenium: {
            headlines: results.selenium?.headlines?.length || 0,
            links: results.selenium?.links?.length || 0,
            images: results.selenium?.images?.length || 0,
            paragraphs: results.selenium?.paragraphs?.length || 0
          }
        },
        success: {
          http: !results.http?.error,
          puppeteer: !results.puppeteer?.error,
          selenium: !results.selenium?.error
        },
        recommendations: {
          fastest: fastestMethod,
          mostReliable: successfulMethods.length > 1 ? 'http' : successfulMethods[0],
          bestForDynamic: successfulMethods.includes('puppeteer') ? 'puppeteer' : 
                          successfulMethods.includes('selenium') ? 'selenium' : 'http'
        }
      };
    }

      res.json({
        success: true,
        results,
        message: 'Method comparison completed'
      });
    })();

    await Promise.race([comparisonPromise, timeoutPromise]);
  } catch (error) {
    console.error('Method comparison error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to compare scraping methods',
      message: error.message 
    });
  }
});

// Car scraping endpoint
app.post('/api/scrape-car', async (req, res) => {
  try {
    const { url, options } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    console.log(`Starting car scraping for: ${url}`);
    
    // Import the car scraper
    const { default: CarScraper } = await import('./src/utils/carScraper.js');
    const carScraper = new CarScraper();

    try {
      const carData = await carScraper.scrapeCar(url, options);
      
      res.json({
        success: true,
        carData,
        message: 'Car data extracted successfully'
      });
    } finally {
      // Clean up resources
      await carScraper.cleanup();
    }

  } catch (error) {
    console.error('Car scraping error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to scrape car data',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
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
  console.log(`API Server running on http://localhost:${PORT}`);
console.log(`Frontend should be running on http://localhost:5173`);
}); 