import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

class SeleniumScraper {
  constructor() {
    this.driver = null;
  }

  static getInstance() {
    if (!SeleniumScraper.instance) {
      SeleniumScraper.instance = new SeleniumScraper();
    }
    return SeleniumScraper.instance;
  }

  async scrapeWithSelenium(url, options) {
    const startTime = Date.now();
    const maxTimeout = 15000; // 15 second timeout for testing
    
    try {
      // Configure Chrome options for speed
      const chromeOptions = new chrome.Options();
      chromeOptions.addArguments(
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1280,720',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Disable images for faster loading
        '--disable-javascript-harmony-shipping',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      );

      // Set user agent
      if (options.userAgent) {
        chromeOptions.addArguments(`--user-agent=${options.userAgent}`);
      }

      // Build the driver with timeout
      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

      // Set window size
      await this.driver.manage().window().setRect({ width: 1280, height: 720 });

      // Navigate to the page with timeout
      console.log(`Navigating to ${url} with Selenium...`);
      await this.driver.get(url);

      // Wait for additional timeout if specified (but cap it for testing)
      if (options.waitForTimeout) {
        const waitTime = Math.min(options.waitForTimeout, 5000); // Cap at 5 seconds for testing
        await this.driver.sleep(waitTime);
      }

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        try {
          await this.driver.wait(until.elementLocated(By.css(options.waitForSelector)), 5000);
        } catch (error) {
          console.warn(`Selector ${options.waitForSelector} not found, continuing...`);
        }
      }

      // Scroll to bottom if requested (but limit for testing)
      if (options.scrollToBottom) {
        await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
        await this.driver.sleep(1000); // Reduced wait time
      }

      // Execute user interactions if specified (but limit for testing)
      if (options.userInteractions && options.userInteractions.length > 0) {
        const maxInteractions = 2; // Limit interactions for testing
        for (let i = 0; i < Math.min(options.userInteractions.length, maxInteractions); i++) {
          const interaction = options.userInteractions[i];
          try {
            await this.executeUserInteraction(interaction);
            await this.driver.sleep(300); // Reduced wait time
          } catch (error) {
            console.warn(`User interaction failed: ${interaction.type} on ${interaction.selector}`, error);
          }
        }
      }

      // Extract data
      const data = await this.extractDataWithSelenium(options);
      
      const processingTime = Date.now() - startTime;
      console.log(`Selenium scraping completed for ${url} in ${processingTime}ms`);

      return data;

    } catch (error) {
      console.error('Selenium scraping failed:', error.message);
      throw error;
    } finally {
      if (this.driver) {
        await this.driver.quit().catch(() => {});
        this.driver = null;
      }
    }
  }

  async executeUserInteraction(interaction) {
    switch (interaction.type) {
      case 'click':
        const clickElement = await this.driver.findElement(By.css(interaction.selector));
        await clickElement.click();
        break;
      case 'type':
        const typeElement = await this.driver.findElement(By.css(interaction.selector));
        await typeElement.clear();
        await typeElement.sendKeys(interaction.value || '');
        break;
      case 'wait':
        await this.driver.sleep(interaction.value ? parseInt(interaction.value) : 1000);
        break;
      case 'scroll':
        const scrollElement = await this.driver.findElement(By.css(interaction.selector));
        await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth"});', scrollElement);
        break;
      default:
        console.warn(`Unknown interaction type: ${interaction.type}`);
    }
  }

  async extractDataWithSelenium(options) {
    const data = await this.driver.executeScript((opts) => {
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
}

export default SeleniumScraper; 