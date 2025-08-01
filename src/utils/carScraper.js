import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

class CarScraper {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false, // Changed to false to avoid detection
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async cleanup() {
    await this.closeBrowser();
  }

  // Main scraping method
  async scrapeCar(url, options = {}) {
    // Extract brand from URL for better detection
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    let detectedBrand = 'Unknown';
    
    if (hostname.includes('chevrolet')) detectedBrand = 'Chevrolet';
    else if (hostname.includes('ford')) detectedBrand = 'Ford';
    else if (hostname.includes('toyota')) detectedBrand = 'Toyota';
    else if (hostname.includes('honda')) detectedBrand = 'Honda';
    else if (hostname.includes('bmw')) detectedBrand = 'BMW';
    else if (hostname.includes('mercedes')) detectedBrand = 'Mercedes-Benz';
    else if (hostname.includes('audi')) detectedBrand = 'Audi';
    const {
      usePlaywright = true,
      waitForImages = true,
      extractPricing = true,
      extractSpecs = true,
      includeBrochure = false,
      brochureUrl = null,
      fullPlatformScrape = false
    } = options;

    let page = null;
    let $ = null;

    try {
      if (usePlaywright) {
        const browser = await this.initBrowser();
        page = await browser.newPage();
        
        // Enhanced anti-detection headers
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
        });

        // Set viewport to look more like a real user
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Additional anti-detection measures
        await page.addInitScript(() => {
          // Remove webdriver property
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
          
          // Override plugins
          Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
          });
          
          // Override languages
          Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
          });
        });

        // Navigate to the page with better error handling
        try {
          await page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
          });
          
          // Wait a bit for dynamic content with random delay
          const randomDelay = Math.floor(Math.random() * 3000) + 3000; // 3-6 seconds
          await page.waitForTimeout(randomDelay);
          
          // Check if we hit an error page
          const errorText = await page.evaluate(() => {
            return document.body.innerText.includes('Oops! Something went wrong') ||
                   document.body.innerText.includes('Access Denied') ||
                   document.body.innerText.includes('Blocked');
          });
          
          if (errorText) {
            throw new Error('Website blocked access or returned an error page');
          }
          
          // Simulate human-like behavior
          await page.mouse.move(Math.random() * 500, Math.random() * 500);
          await page.waitForTimeout(1000);
          
        } catch (navigationError) {
          console.error('Navigation error:', navigationError.message);
          
          // Try fallback approach with different settings
          try {
            console.log('Trying fallback approach...');
            await page.setExtraHTTPHeaders({
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            });
            
            await page.goto(url, { 
              waitUntil: 'load', 
              timeout: 45000 
            });
            
            await page.waitForTimeout(3000);
            
            const errorText = await page.evaluate(() => {
              return document.body.innerText.includes('Oops! Something went wrong') ||
                     document.body.innerText.includes('Access Denied') ||
                     document.body.innerText.includes('Blocked');
            });
            
            if (errorText) {
              throw new Error('Website blocked access even with fallback approach');
            }
            
          } catch (fallbackError) {
            console.error('Fallback approach also failed:', fallbackError.message);
            throw new Error(`Failed to access website: ${navigationError.message}`);
          }
        }
        
        if (waitForImages) {
          await page.waitForTimeout(2000); // Wait for images to load
        }

        const html = await page.content();
        $ = cheerio.load(html);
      } else {
        // Use fetch for static content
        const response = await fetch(url);
        const html = await response.text();
        $ = cheerio.load(html);
      }

      // Extract car data
      const carData = {
        modelName: '',
        brand: detectedBrand,
        fuelType: '',
        transmission: '',
        bodyType: '',
        dimensions: {
          length: '',
          width: '',
          height: '',
          wheelbase: '',
          groundClearance: ''
        },
        engine: {
          type: '',
          capacity: '',
          horsepower: '',
          torque: '',
          mileage: '',
          fuelTankSize: ''
        },
        variants: [],
        imageUrls: [],
        features: {
          interior: [],
          exterior: [],
          safety: [],
          tech: []
        }
      };

      // Extract basic information
      this.extractBasicInfo($, carData);
      
      if (extractSpecs) {
        this.extractEngineSpecs($, carData);
        this.extractDimensions($, carData);
      }
      
      if (extractPricing) {
        this.extractVariants($, carData);
      }
      
      this.extractImages($, carData);
      this.extractFeatures($, carData);

      // Handle brochure data if requested
      if (includeBrochure && brochureUrl) {
        try {
          carData.brochureData = await this.extractBrochureData(brochureUrl);
        } catch (error) {
          console.error('Error extracting brochure data:', error);
          carData.brochureData = null;
        }
      }

      // Handle platform scraping if requested
      if (fullPlatformScrape) {
        try {
          carData.platformData = this.extractPlatformData($, url);
        } catch (error) {
          console.error('Error extracting platform data:', error);
          carData.platformData = [];
        }
      }

      return carData;

    } catch (error) {
      console.error('Error scraping car data:', error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  // Extract basic car information
  extractBasicInfo($, carData) {
    // Try multiple selectors for model name
    const modelSelectors = [
      'h1',
      '.model-name',
      '.car-title',
      '.vehicle-name',
      '[data-model]',
      '.product-title',
      '.hero-title',
      '.page-title',
      'title'
    ];

    for (const selector of modelSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        const text = element.text().trim();
        if (text && text !== 'Oops! Something went wrong') {
          carData.modelName = text;
          break;
        }
      }
    }

    // Brand is already set from URL detection

    // Extract fuel type
    const fuelText = $('body').text().toLowerCase();
    if (fuelText.includes('electric')) carData.fuelType = 'Electric';
    else if (fuelText.includes('hybrid')) carData.fuelType = 'Hybrid';
    else if (fuelText.includes('diesel')) carData.fuelType = 'Diesel';
    else if (fuelText.includes('gasoline') || fuelText.includes('petrol')) carData.fuelType = 'Gasoline';
    else carData.fuelType = 'Unknown';

    // Extract transmission
    if (fuelText.includes('automatic')) carData.transmission = 'Automatic';
    else if (fuelText.includes('manual')) carData.transmission = 'Manual';
    else if (fuelText.includes('cvt')) carData.transmission = 'CVT';
    else carData.transmission = 'Unknown';

    // Extract body type
    const bodyTypes = ['sedan', 'suv', 'hatchback', 'wagon', 'coupe', 'convertible', 'pickup', 'truck'];
    for (const bodyType of bodyTypes) {
      if (fuelText.includes(bodyType)) {
        carData.bodyType = bodyType.charAt(0).toUpperCase() + bodyType.slice(1);
        break;
      }
    }
    if (!carData.bodyType) carData.bodyType = 'Unknown';
  }

  // Extract engine specifications
  extractEngineSpecs($, carData) {
    const text = $('body').text().toLowerCase();
    
    // Extract engine type - Chevrolet Colorado specific
    if (text.includes('2.7l turbomax') || text.includes('2.7l turbo')) {
      carData.engine.type = '2.7L TurboMax';
    } else if (text.includes('v6')) {
      carData.engine.type = 'V6';
    } else if (text.includes('v8')) {
      carData.engine.type = 'V8';
    } else if (text.includes('v4') || text.includes('inline-4')) {
      carData.engine.type = 'Inline-4';
    } else if (text.includes('electric')) {
      carData.engine.type = 'Electric';
    } else {
      carData.engine.type = 'Unknown';
    }

    // Extract engine capacity
    const capacityMatch = text.match(/(\d+\.?\d*)\s*(?:l|liter|litre)/i);
    if (capacityMatch) {
      carData.engine.capacity = capacityMatch[1] + 'L';
    }

    // Extract horsepower
    const hpMatch = text.match(/(\d+)\s*(?:hp|horsepower)/i);
    if (hpMatch) {
      carData.engine.horsepower = hpMatch[1] + ' HP';
    } else {
      // Try alternative patterns for Chevrolet
      const hpAltMatch = text.match(/(\d+)\s*horsepower/);
      if (hpAltMatch) {
        carData.engine.horsepower = hpAltMatch[1] + ' HP';
      }
    }

    // Extract torque
    const torqueMatch = text.match(/(\d+)\s*(?:lb-ft|nm|torque)/i);
    if (torqueMatch) {
      carData.engine.torque = torqueMatch[1] + ' lb-ft';
    }

    // Extract mileage
    const mileageMatch = text.match(/(\d+)\s*(?:mpg|miles per gallon)/i);
    if (mileageMatch) {
      carData.engine.mileage = mileageMatch[1] + ' MPG';
    }

    // Extract fuel tank size
    const tankMatch = text.match(/(\d+\.?\d*)\s*(?:gallon|gal)/i);
    if (tankMatch) {
      carData.engine.fuelTankSize = tankMatch[1] + ' gallons';
    }
  }

  // Extract dimensions
  extractDimensions($, carData) {
    const text = $('body').text().toLowerCase();
    
    // Extract length
    const lengthMatch = text.match(/(\d+\.?\d*)\s*(?:inches|in)\s*(?:length|long)/i);
    if (lengthMatch) {
      carData.dimensions.length = lengthMatch[1] + ' inches';
    }

    // Extract width
    const widthMatch = text.match(/(\d+\.?\d*)\s*(?:inches|in)\s*(?:width|wide)/i);
    if (widthMatch) {
      carData.dimensions.width = widthMatch[1] + ' inches';
    }

    // Extract height
    const heightMatch = text.match(/(\d+\.?\d*)\s*(?:inches|in)\s*(?:height|tall)/i);
    if (heightMatch) {
      carData.dimensions.height = heightMatch[1] + ' inches';
    }

    // Extract wheelbase
    const wheelbaseMatch = text.match(/(\d+\.?\d*)\s*(?:inches|in)\s*(?:wheelbase)/i);
    if (wheelbaseMatch) {
      carData.dimensions.wheelbase = wheelbaseMatch[1] + ' inches';
    }

    // Extract ground clearance
    const clearanceMatch = text.match(/(\d+\.?\d*)\s*(?:inches|in)\s*(?:ground clearance)/i);
    if (clearanceMatch) {
      carData.dimensions.groundClearance = clearanceMatch[1] + ' inches';
    }
  }

  // Extract variants and pricing - Enhanced for Chevrolet structure
  extractVariants($, carData) {
    // Use the enhanced variant extraction method
    const variants = this.extractAllVariants($);
    
    // If the enhanced method didn't find enough variants, try the original approach
    if (variants.length < 3) {
      console.log('Enhanced method found only', variants.length, 'variants, trying original approach...');
      
      // Chevrolet-specific selectors for variant cards
      const chevroletSelectors = [
        '[data-testid*="trim"]',
        '[class*="trim"]',
        '[class*="variant"]',
        '[class*="model"]',
        '.vehicle-card',
        '.trim-card',
        '.model-card'
      ];

      // Try Chevrolet-specific structure first
      for (const selector of chevroletSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          elements.each((i, element) => {
            const $element = $(element);
            const variant = this.extractVariantFromElement($element);
            if (variant.name && !variants.find(v => v.name === variant.name)) {
              variants.push(variant);
            }
          });
          if (variants.length >= 3) break;
        }
      }

      // If still not enough, try general approach
      if (variants.length < 3) {
        // Look for price patterns in the page
        const pricePatterns = [
          /starting at \$[\d,]+/gi,
          /\$[\d,]+ starting/gi,
          /starting price \$[\d,]+/gi
        ];

        const pageText = $('body').text();
        const foundPrices = [];

        pricePatterns.forEach(pattern => {
          const matches = pageText.match(pattern);
          if (matches) {
            foundPrices.push(...matches);
          }
        });

        // Look for trim names in the page
        const trimNames = ['WT', 'LT', 'Trail Boss', 'Z71', 'ZR2', 'Premier', 'High Country'];
        const foundTrims = [];
        
        trimNames.forEach(trim => {
          if (pageText.includes(trim)) {
            foundTrims.push(trim);
          }
        });
        
        // Match trims with prices
        foundPrices.forEach((price, index) => {
          const trimName = foundTrims[index] || `Variant ${index + 1}`;
          
          if (!variants.find(v => v.name === trimName)) {
            variants.push({
              name: trimName,
              price: price,
              features: this.extractFeaturesForTrim($, trimName)
            });
          }
        });
      }

      // If still no variants, try to extract from any price elements
      if (variants.length === 0) {
        $('[class*="price"], [class*="cost"], [data-price]').each((i, element) => {
          const $element = $(element);
          const price = $element.text().trim();
          if (price && /\$/.test(price)) {
            const variantName = this.findVariantNameNearElement($element);
            variants.push({
              name: variantName || `Variant ${i + 1}`,
              price: price,
              features: []
            });
          }
        });
      }
    }

    console.log('Final variants found:', variants.length);
    carData.variants = variants;
  }

  // Extract variant data from a specific element
  extractVariantFromElement($element) {
    const variant = {
      name: '',
      price: '',
      features: []
    };

    // Extract variant name
    const nameSelectors = [
      'h2', 'h3', 'h4', 'h5',
      '[class*="name"]',
      '[class*="title"]',
      '[class*="trim"]',
      '.variant-name',
      '.trim-name'
    ];

    for (const selector of nameSelectors) {
      const nameElement = $element.find(selector).first();
      if (nameElement.length && nameElement.text().trim()) {
        variant.name = nameElement.text().trim();
        break;
      }
    }

    // Extract price
    const priceSelectors = [
      '[class*="price"]',
      '[class*="cost"]',
      '[data-price]',
      '.price',
      '.cost',
      '.msrp'
    ];

    for (const selector of priceSelectors) {
      const priceElement = $element.find(selector).first();
      if (priceElement.length && priceElement.text().trim()) {
        const priceText = priceElement.text().trim();
        if (/\$/.test(priceText)) {
          variant.price = priceText;
          break;
        }
      }
    }

    // Extract features
    const featureSelectors = [
      'li',
      '[class*="feature"]',
      '[class*="spec"]',
      '.feature',
      '.spec'
    ];

    for (const selector of featureSelectors) {
      const featureElements = $element.find(selector);
      featureElements.each((i, featureElement) => {
        const featureText = $(featureElement).text().trim();
        if (featureText && featureText.length > 5 && !featureText.includes('$')) {
          variant.features.push(featureText);
        }
      });
      if (variant.features.length > 0) break;
    }

    return variant;
  }

  // Find variant name near a price element
  findVariantNameNearElement($priceElement) {
    // Look for nearby headings or text that might be variant names
    const nearbySelectors = ['h2', 'h3', 'h4', 'h5', '[class*="name"]', '[class*="title"]'];
    
    for (const selector of nearbySelectors) {
      const nearbyElement = $priceElement.closest('div').find(selector).first();
      if (nearbyElement.length) {
        const text = nearbyElement.text().trim();
        if (text && text.length < 50) {
          return text;
        }
      }
    }

    return null;
  }

  // Extract features for a specific trim
  extractFeaturesForTrim($, trimName) {
    const features = [];
    const pageText = $('body').text();
    
    // Find the trim section first
    const trimIndex = pageText.indexOf(trimName);
    if (trimIndex === -1) return features;
    
    // Get text around the trim name (500 characters before and after)
    const surroundingText = pageText.substring(Math.max(0, trimIndex - 500), trimIndex + 500);
    
    // Look for bullet points or list items in the surrounding area
    $('li, .feature, .spec, p, .bullet, .list-item').each((i, element) => {
      const featureText = $(element).text().trim();
      const elementText = $(element).text();
      
      // Check if this element is near the trim name
      const elementIndex = pageText.indexOf(elementText);
      if (elementIndex !== -1 && Math.abs(elementIndex - trimIndex) < 1000) {
        if (featureText && featureText.length > 10 && !featureText.includes('$') && !featureText.includes('Starting at')) {
          // Check if this feature is related to the trim or contains relevant keywords
          const lowerElementText = elementText.toLowerCase();
          const trimLower = trimName.toLowerCase();
          
          if (lowerElementText.includes(trimLower) || 
              lowerElementText.includes('engine') || 
              lowerElementText.includes('horsepower') || 
              lowerElementText.includes('torque') || 
              lowerElementText.includes('wheel') || 
              lowerElementText.includes('safety') || 
              lowerElementText.includes('technology') ||
              lowerElementText.includes('turbo') ||
              lowerElementText.includes('transmission') ||
              lowerElementText.includes('drive') ||
              lowerElementText.includes('mode') ||
              lowerElementText.includes('lift') ||
              lowerElementText.includes('tire') ||
              lowerElementText.includes('suspension') ||
              lowerElementText.includes('assist') ||
              lowerElementText.includes('package')) {
            features.push(featureText);
          }
        }
      }
    });

    // If we didn't find enough features, try extracting from surrounding text
    if (features.length < 3) {
      const sentences = surroundingText.split(/[.!?]/);
      
      sentences.forEach(sentence => {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 20 && cleanSentence.length < 200) {
          const lowerSentence = cleanSentence.toLowerCase();
          if ((lowerSentence.includes('engine') || 
               lowerSentence.includes('horsepower') || 
               lowerSentence.includes('torque') || 
               lowerSentence.includes('wheel') || 
               lowerSentence.includes('safety') || 
               lowerSentence.includes('technology') ||
               lowerSentence.includes('turbo') ||
               lowerSentence.includes('transmission') ||
               lowerSentence.includes('drive') ||
               lowerSentence.includes('mode') ||
               lowerSentence.includes('lift') ||
               lowerSentence.includes('tire') ||
               lowerSentence.includes('suspension') ||
               lowerSentence.includes('assist') ||
               lowerSentence.includes('package')) &&
              !features.includes(cleanSentence)) {
            features.push(cleanSentence);
          }
        }
      });
    }

    return features.slice(0, 5); // Limit to 5 features per trim
  }

  // Enhanced method to extract all variants with better pattern matching
  extractAllVariants($) {
    const variants = [];
    const pageText = $('body').text();
    
    console.log('Analyzing page text for variants...');
    console.log('Page text length:', pageText.length);
    
    // Chevrolet Colorado specific trim names (expanded list)
    const chevroletTrims = ['WT', 'LT', 'Trail Boss', 'Z71', 'ZR2', 'Premier', 'High Country'];
    
    // Enhanced price patterns for Chevrolet
    const pricePatterns = [
      /starting at \$[\d,]+/gi,
      /\$[\d,]+ starting/gi,
      /starting price \$[\d,]+/gi,
      /msrp \$[\d,]+/gi,
      /\$[\d,]+ msrp/gi,
      /as shown \$[\d,]+/gi,
      /\$[\d,]+ as shown/gi
    ];
    
    // Find all price matches
    const allPriceMatches = [];
    pricePatterns.forEach(pattern => {
      const matches = pageText.match(pattern);
      if (matches) {
        allPriceMatches.push(...matches);
      }
    });
    
    console.log('Found price matches:', allPriceMatches);
    
    // Find all trim mentions using regex for better accuracy
    const trimPattern = /\b(WT|LT|Trail Boss|Z71|ZR2|Premier|High Country)\b/gi;
    const trimMatches = pageText.match(trimPattern);
    const foundTrims = trimMatches ? [...new Set(trimMatches)] : [];
    
    console.log('Found trims:', foundTrims);
    
    // If we found trims and prices, match them
    if (foundTrims.length > 0 && allPriceMatches.length > 0) {
      // Match trims with prices based on order
      foundTrims.forEach((trim, index) => {
        const price = allPriceMatches[index] || 'Price not available';
        variants.push({
          name: trim,
          price: price,
          features: this.extractFeaturesForTrim($, trim)
        });
      });
    }
    
    // If we still don't have enough variants, try looking for specific sections
    if (variants.length < 5) {
      console.log('Trying to find variants in specific sections...');
      
      // Look for sections that might contain variant information
      $('section, div, article').each((i, element) => {
        const $element = $(element);
        const elementText = $element.text();
        
        // Check if this element contains both a trim name and a price
        chevroletTrims.forEach(trim => {
          if (elementText.includes(trim)) {
            const priceMatch = elementText.match(/\$[\d,]+/);
            if (priceMatch && !variants.find(v => v.name === trim)) {
              variants.push({
                name: trim,
                price: priceMatch[0],
                features: this.extractFeaturesForTrim($, trim)
              });
            }
          }
        });
      });
    }
    
    // If still not enough, try a more aggressive approach
    if (variants.length < 5) {
      console.log('Trying aggressive variant detection...');
      
      // Look for any combination of trim names and prices in the entire page
      chevroletTrims.forEach(trim => {
        if (pageText.includes(trim)) {
          // Find the closest price to this trim mention
          const trimIndex = pageText.indexOf(trim);
          const priceBefore = pageText.substring(Math.max(0, trimIndex - 200)).match(/\$[\d,]+/);
          const priceAfter = pageText.substring(trimIndex, trimIndex + 200).match(/\$[\d,]+/);
          
          const price = priceAfter ? priceAfter[0] : (priceBefore ? priceBefore[0] : 'Price not available');
          
          if (!variants.find(v => v.name === trim)) {
            variants.push({
              name: trim,
              price: price,
              features: this.extractFeaturesForTrim($, trim)
            });
          }
        }
      });
    }
    
    console.log('Final variants found:', variants.length);
    return variants;
  }

  // Extract features near a specific price
  extractFeaturesNearPrice($, priceText) {
    const features = [];
    const pageText = $('body').text();
    
    // Look for bullet points or list items near the price
    $('li, .feature, .spec').each((i, element) => {
      const featureText = $(element).text().trim();
      if (featureText && featureText.length > 10 && !featureText.includes('$')) {
        features.push(featureText);
      }
    });

    return features.slice(0, 10); // Limit to 10 features
  }

  // Extract images
  extractImages($, carData) {
    const images = [];
    
    // Look for car images
    $('img[src*="car"], img[src*="vehicle"], img[alt*="car"], img[alt*="vehicle"]').each((i, element) => {
      const src = $(element).attr('src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, 'http://example.com').href;
        images.push(fullUrl);
      }
    });

    // If no specific car images, get all images
    if (images.length === 0) {
      $('img').each((i, element) => {
        const src = $(element).attr('src');
        if (src && src.length > 0) {
          const fullUrl = src.startsWith('http') ? src : new URL(src, 'http://example.com').href;
          images.push(fullUrl);
        }
      });
    }

    carData.imageUrls = images.slice(0, 20); // Limit to 20 images
  }

  // Extract features
  extractFeatures($, carData) {
    const text = $('body').text().toLowerCase();
    
    // Interior features
    const interiorFeatures = [
      'leather seats', 'heated seats', 'ventilated seats', 'power seats',
      'navigation', 'infotainment', 'bluetooth', 'apple carplay', 'android auto',
      'climate control', 'dual zone', 'sunroof', 'moonroof'
    ];
    
    carData.features.interior = interiorFeatures.filter(feature => 
      text.includes(feature)
    );

    // Exterior features
    const exteriorFeatures = [
      'led headlights', 'fog lights', 'alloy wheels', 'power windows',
      'power mirrors', 'backup camera', 'parking sensors', 'blind spot monitoring'
    ];
    
    carData.features.exterior = exteriorFeatures.filter(feature => 
      text.includes(feature)
    );

    // Safety features
    const safetyFeatures = [
      'airbags', 'abs', 'traction control', 'stability control',
      'lane departure warning', 'forward collision warning', 'automatic emergency braking'
    ];
    
    carData.features.safety = safetyFeatures.filter(feature => 
      text.includes(feature)
    );

    // Technology features
    const techFeatures = [
      'adaptive cruise control', 'lane keeping assist', 'automatic parking',
      'wireless charging', 'wifi hotspot', 'remote start'
    ];
    
    carData.features.tech = techFeatures.filter(feature => 
      text.includes(feature)
    );
  }

  // Extract platform data (for listing pages)
  extractPlatformData($, baseUrl) {
    const vehicles = [];
    
    // Look for vehicle cards/containers
    $('.vehicle-card, .car-item, .product-item').each((i, element) => {
      const $element = $(element);
      const name = $element.find('.name, .title, h3').text().trim();
      const price = $element.find('.price, .cost').text().trim();
      const imageUrl = $element.find('img').attr('src');
      const detailUrl = $element.find('a').attr('href');
      
      if (name) {
        vehicles.push({
          name: name,
          price: price || 'Price not available',
          imageUrl: imageUrl || '',
          detailUrl: detailUrl ? new URL(detailUrl, baseUrl).href : ''
        });
      }
    });

    return vehicles;
  }

  // Extract brochure data (simplified version without PDF parsing)
  async extractBrochureData(brochureUrl) {
    try {
      const response = await fetch(brochureUrl);
      const text = await response.text();
      
      // Extract basic information from brochure text
      const brochureData = {
        engine: [],
        transmission: [],
        dimensions: [],
        features: []
      };

      const lowerText = text.toLowerCase();
      
      // Extract engine info
      if (lowerText.includes('engine')) {
        brochureData.engine.push('Engine information available in brochure');
      }
      
      // Extract transmission info
      if (lowerText.includes('transmission')) {
        brochureData.transmission.push('Transmission information available in brochure');
      }
      
      // Extract dimensions
      if (lowerText.includes('dimensions')) {
        brochureData.dimensions.push('Dimension information available in brochure');
      }
      
      // Extract features
      if (lowerText.includes('features')) {
        brochureData.features.push('Additional features available in brochure');
      }

      return brochureData;
    } catch (error) {
      console.error('Error extracting brochure data:', error);
      return null;
    }
  }

  // Helper method to extract text based on keywords
  extractFromText(text, keywords) {
    const lines = text.split('\n');
    const matches = [];
    
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toLowerCase().includes(keyword.toLowerCase()) && line.trim().length > 10) {
          matches.push(line.trim());
          break;
        }
      }
    }
    
    return matches.slice(0, 10); // Limit to 10 matches
  }
}

export default CarScraper; 