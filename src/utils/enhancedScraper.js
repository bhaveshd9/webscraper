import puppeteer from 'puppeteer';

class EnhancedScraper {
  constructor() {
    this.browser = null;
  }

  static getInstance() {
    if (!EnhancedScraper.instance) {
      EnhancedScraper.instance = new EnhancedScraper();
    }
    return EnhancedScraper.instance;
  }

  // Helper function to safely wait for timeout
  async safeWaitForTimeout(page, timeout) {
    try {
      // Use page.evaluate with setTimeout for all versions
      await page.evaluate((ms) => new Promise(resolve => setTimeout(resolve, ms)), timeout);
    } catch (error) {
      // Fallback to a simple delay
      await new Promise(resolve => setTimeout(resolve, timeout));
    }
  }

  async scrapeWithBrowser(url, options) {
    const startTime = Date.now();
    let page = null;
    const maxTimeout = 15000; // 15 second timeout for testing

    try {
      // Launch browser with optimized settings for speed
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images', // Disable images for faster loading
          '--disable-javascript-harmony-shipping',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        ignoreHTTPSErrors: true,
        timeout: maxTimeout
      });

      page = await this.browser.newPage();

      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 720 });
      await page.setExtraHTTPHeaders({
      'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

      // Set extra headers for better compatibility
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      // Navigate to the page with timeout
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: maxTimeout 
      });

      // Wait for additional timeout if specified (but cap it for testing)
      if (options.waitForTimeout) {
        const waitTime = Math.min(options.waitForTimeout, 5000); // Cap at 5 seconds for testing
        await this.safeWaitForTimeout(page, waitTime);
      }

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        try {
          await page.waitForSelector(options.waitForSelector, { timeout: 5000 });
        } catch (error) {
          console.warn(`Selector ${options.waitForSelector} not found, continuing...`);
        }
      }

      // Scroll to bottom if requested (but limit for testing)
      if (options.scrollToBottom) {
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await this.safeWaitForTimeout(page, 1000); // Reduced wait time
      }

      // Execute user interactions if specified (but limit for testing)
      if (options.userInteractions && options.userInteractions.length > 0) {
        const maxInteractions = 2; // Limit interactions for testing
        for (let i = 0; i < Math.min(options.userInteractions.length, maxInteractions); i++) {
          const interaction = options.userInteractions[i];
          try {
            await this.executeUserInteraction(page, interaction);
            await this.safeWaitForTimeout(page, 300); // Reduced wait time
          } catch (error) {
            console.warn(`User interaction failed: ${interaction.type} on ${interaction.selector}`, error);
          }
        }
      }

      // Extract data
      const data = await this.extractDataWithBrowser(page, options);
      
      const processingTime = Date.now() - startTime;
      console.log(`Browser scraping completed for ${url} in ${processingTime}ms`);

      return data;

    } catch (error) {
      console.error('Browser scraping failed:', error.message);
      throw error;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
        this.browser = null;
      }
    }
  }

  async executeUserInteraction(page, interaction) {
    switch (interaction.type) {
      case 'click':
        await page.click(interaction.selector);
        break;
      case 'type':
        await page.type(interaction.selector, interaction.value || '');
        break;
      case 'wait':
        await this.safeWaitForTimeout(page, interaction.value ? parseInt(interaction.value) : 1000);
        break;
      case 'scroll':
        await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, interaction.selector);
        break;
      default:
        console.warn(`Unknown interaction type: ${interaction.type}`);
    }
  }

  async extractDataWithBrowser(page, options) {
    const data = await page.evaluate((opts) => {
      const extractText = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean);
      };

      const extractLinks = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => ({
          text: el.textContent?.trim() || '',
          href: el.href || '',
          title: el.title || ''
        }));
      };

      const extractImages = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => ({
          src: el.src || '',
          alt: el.alt || '',
          title: el.title || ''
        }));
      };

      const extractPrices = () => {
        const pricePattern = /\$[\d,]+(?:\.\d{2})?/g;
        const text = document.body.textContent || '';
        return Array.from(text.matchAll(pricePattern)).map(match => match[0]);
      };

      const extractMetadata = () => {
        const meta = document.querySelectorAll('meta');
        const metadata = {};
        
        meta.forEach(m => {
          const name = m.getAttribute('name') || m.getAttribute('property');
          const content = m.getAttribute('content');
          if (name && content) {
            metadata[name] = content;
          }
        });
        
        return metadata;
      };

      const extractForms = () => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).map(form => ({
          action: form.action || '',
          method: form.method || 'get',
          inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || '',
            placeholder: input.placeholder || '',
            value: input.value || ''
          }))
        }));
      };

      const extractTables = () => {
        const tables = document.querySelectorAll('table');
        return Array.from(tables).map(table => {
          const rows = Array.from(table.querySelectorAll('tr'));
          return rows.map(row => 
            Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim() || '')
          );
        });
      };

      const extractScripts = () => {
        const scripts = document.querySelectorAll('script');
        return Array.from(scripts).map(script => ({
          src: script.src || '',
          type: script.type || 'text/javascript',
          content: script.textContent?.trim() || ''
        }));
      };

      const extractStyles = () => {
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        return Array.from(styles).map(style => ({
          href: style.href || '',
          type: style.getAttribute('type') || 'text/css',
          content: style.textContent?.trim() || ''
        }));
      };

      const wordCount = document.body.textContent?.split(/\s+/).length || 0;

      return {
        title: document.title || 'No title found',
        headlines: opts.includeHeadlines ? extractText('h1, h2, h3').map((text, i) => ({
          type: i < document.querySelectorAll('h1').length ? 'h1' : 
                i < document.querySelectorAll('h1, h2').length ? 'h2' : 'h3',
          text
        })) : [],
        links: opts.includeLinks ? extractLinks('a') : [],
        images: opts.includeImages ? extractImages('img') : [],
        paragraphs: opts.includeParagraphs ? extractText('p') : [],
        prices: opts.includePrices ? extractPrices() : [],
        metadata: opts.includeMetadata ? extractMetadata() : {},
        socialMedia: opts.includeSocialMedia ? extractLinks('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]') : [],
        forms: opts.includeForms ? extractForms() : [],
        tables: opts.includeTables ? extractTables() : [],
        scripts: opts.includeScripts ? extractScripts() : [],
        styles: opts.includeStyles ? extractStyles() : [],
        wordCount,
        language: document.documentElement.lang || 'Unknown',
        lastModified: document.lastModified ? new Date(document.lastModified).toISOString() : null
      };
    }, options);

    return data;
  }

  async scrapeWithHttp(url, options) {
    // This is a fallback method - the actual HTTP scraping is handled in server-simple.js
    throw new Error('HTTP scraping is handled by the server');
  }

  async smartScrape(url, options) {
    try {
      // Try browser first
      console.log('Attempting browser scraping...');
      return await this.scrapeWithBrowser(url, options);
    } catch (browserError) {
      console.log('Browser scraping failed, falling back to HTTP:', browserError.message);
      // Fallback to HTTP scraping (handled by server)
      throw browserError;
    }
  }
}

export default EnhancedScraper; 