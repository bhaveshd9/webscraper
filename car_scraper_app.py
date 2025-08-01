from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re
import json
import logging
from datetime import datetime
import time
import random
import subprocess
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

class CarScraper:
    def __init__(self):
        self.session = requests.Session()
        self.setup_session()
    
    def setup_session(self):
        """Setup session with realistic headers and anti-bot measures"""
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        })
        
        # Configure session for better timeout handling
        self.session.timeout = 60  # Default timeout
        self.session.max_redirects = 5  # Limit redirects
        
        # Configure retry strategy
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def detect_brand_from_url(self, url):
        """Detect car brand from URL"""
        url_lower = url.lower()
        if 'chevrolet' in url_lower or 'chevy' in url_lower:
            return 'Chevrolet'
        elif 'ford' in url_lower:
            return 'Ford'
        elif 'toyota' in url_lower:
            return 'Toyota'
        elif 'honda' in url_lower:
            return 'Honda'
        elif 'nissan' in url_lower:
            return 'Nissan'
        elif 'bmw' in url_lower:
            return 'BMW'
        elif 'mercedes' in url_lower or 'mercedes-benz' in url_lower:
            return 'Mercedes-Benz'
        elif 'audi' in url_lower:
            return 'Audi'
        elif 'volkswagen' in url_lower or 'vw' in url_lower:
            return 'Volkswagen'
        elif 'hyundai' in url_lower:
            return 'Hyundai'
        elif 'kia' in url_lower:
            return 'Kia'
        elif 'mazda' in url_lower:
            return 'Mazda'
        elif 'subaru' in url_lower:
            return 'Subaru'
        elif 'lexus' in url_lower:
            return 'Lexus'
        elif 'acura' in url_lower:
            return 'Acura'
        elif 'infiniti' in url_lower:
            return 'Infiniti'
        elif 'volvo' in url_lower:
            return 'Volvo'
        elif 'cadillac' in url_lower:
            return 'Cadillac'
        elif 'buick' in url_lower:
            return 'Buick'
        elif 'gmc' in url_lower:
            return 'GMC'
        elif 'dodge' in url_lower:
            return 'Dodge'
        elif 'chrysler' in url_lower:
            return 'Chrysler'
        elif 'jeep' in url_lower:
            return 'Jeep'
        elif 'ram' in url_lower:
            return 'RAM'
        elif 'tesla' in url_lower:
            return 'Tesla'
        else:
            return 'Unknown'
    
    def extract_model_name(self, soup, url):
        """Extract model name from page"""
        # Try multiple selectors for model name
        selectors = [
            'h1',
            '.model-name',
            '.car-title',
            '.vehicle-name',
            '[data-model]',
            '.product-title',
            '.hero-title',
            '.page-title',
            'title'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text().strip():
                text = element.get_text().strip()
                if text and text != 'Oops! Something went wrong':
                    # Clean up the text
                    text = re.sub(r'[^\w\s\-]', '', text).strip()
                    if text and len(text) > 2:
                        return text
        
        # Fallback: extract from URL with better pattern matching
        url_lower = url.lower()
        
        # Common model patterns
        model_patterns = [
            r'/([^/]+)/?$',  # Last part of URL
            r'/([^/]+)/[^/]+/?$',  # Second to last part
            r'/([^/]+)-([^/]+)/?$',  # Hyphenated models
        ]
        
        for pattern in model_patterns:
            match = re.search(pattern, url_lower)
            if match:
                # Handle different numbers of capture groups
                if len(match.groups()) == 1:
                    model_part = match.group(1)
                elif len(match.groups()) == 2:
                    model_part = f"{match.group(1)} {match.group(2)}"
                else:
                    continue
                
                # Clean up the model name
                model_part = re.sub(r'[^\w\s]', '', model_part).strip()
                if model_part and len(model_part) > 2:
                    return model_part.title()
        
        # Specific brand model mappings
        if 'silverado' in url_lower:
            return 'Silverado'
        elif 'camaro' in url_lower:
            return 'Camaro'
        elif 'corvette' in url_lower:
            return 'Corvette'
        elif 'camry' in url_lower:
            return 'Camry'
        elif 'tacoma' in url_lower:
            return 'Tacoma'
        elif 'f150' in url_lower or 'f-150' in url_lower:
            return 'F-150'
        elif 'kicks' in url_lower:
            return 'Kicks'
        else:
            return 'Unknown Model'
    
    def extract_variants_and_pricing(self, soup, page_text, url):
        """Extract variants and pricing from the page"""
        variants = []
        
        # Get brand for trim patterns
        brand = self.detect_brand_from_url(url)
        trim_patterns = self.get_trim_patterns_for_brand(brand)
        
        # Extract trims using patterns
        found_trims = []
        for pattern in trim_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            found_trims.extend(matches)
        
        # Remove duplicates and clean up
        found_trims = list(set([trim.strip() for trim in found_trims if trim.strip()]))
        
        # If no trims found, try manual detection
        if not found_trims:
            found_trims = self.manual_trim_detection(brand, self.extract_model_name(soup, url), page_text)
        
        # Initialize found_prices
        found_prices = []
        
        # Extract pricing patterns with more comprehensive search
        price_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*)',
            r'starting at \$(\d{1,3}(?:,\d{3})*)',
            r'msrp \$(\d{1,3}(?:,\d{3})*)',
            r'price \$(\d{1,3}(?:,\d{3})*)',
            r'from \$(\d{1,3}(?:,\d{3})*)',
            r'(\d{1,3}(?:,\d{3})*)\s*as shown',
            r'(\d{1,3}(?:,\d{3})*)\s*starting'
        ]
        
        for pattern in price_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            for match in matches:
                    if isinstance(match, tuple):
                        # Handle multiple capture groups
                        price = match[0] if match[0] else match[1] if len(match) > 1 else ''
                    else:
                        price = match
                    if price and price not in found_prices:
                        found_prices.append(f"${price}")
            
            # Remove duplicates
            found_prices = list(set(found_prices))
        
        # Create variants
        for i, trim in enumerate(found_trims):
            price = found_prices[i] if i < len(found_prices) else ''
            
            variant = {
                'name': trim,
                'price': price,
                'features': self.extract_features_for_trim(soup, page_text, trim)
            }
            variants.append(variant)
        
        return variants
    
    def manual_trim_detection(self, brand, model_name, page_text):
        """Manual trim detection for specific brands"""
        page_lower = page_text.lower()
        trims = []
        
        if brand.lower() == 'chevrolet':
            if 'wt' in page_lower:
                trims.append('WT')
            if 'lt' in page_lower:
                trims.append('LT')
            if 'trail boss' in page_lower:
                trims.append('Trail Boss')
            if 'z71' in page_lower:
                trims.append('Z71')
            if 'zr2' in page_lower:
                trims.append('ZR2')
        
        return trims
    
    def get_trim_patterns_for_brand(self, brand):
        """Get brand-specific trim patterns"""
        brand_patterns = {
            'chevrolet': [
                r'\b(WT|LT|Trail Boss|Z71|ZR2|Premier|High Country|LS|LTZ|SS|RS)\b',
                r'\b(Wt|Lt|Trail Boss|Z71|Zr2)\b',
                r'\b(wt|lt|trail boss|z71|zr2)\b'
            ],
            'ford': [
                r'\b(XL|XLT|Lariat|King Ranch|Platinum|Limited|ST|RS|GT|SVT)\b',
                r'\b(Xl|Xlt|Lariat|King Ranch|Platinum)\b',
                r'\b(xl|xlt|lariat|king ranch|platinum)\b'
            ],
            'toyota': [
                r'\b(SR|SR5|TRD Sport|TRD Off-Road|TRD Pro|Limited|Platinum|XSE|XLE|SE|LE)\b',
                r'\b(Sr|Sr5|TRD Sport|TRD Off-Road|TRD Pro)\b',
                r'\b(sr|sr5|trd sport|trd off-road|trd pro)\b'
            ],
            'honda': [
                r'\b(LX|Sport|EX|EX-L|Touring|Elite|Type R|Si)\b',
                r'\b(Lx|Sport|Ex|Ex-L|Touring)\b',
                r'\b(lx|sport|ex|ex-l|touring)\b'
            ],
            'nissan': [
                r'\b(S|SV|SL|SR|Platinum|Midnight|Rock Creek)\b',
                r'\b(s|sv|sl|sr|platinum|midnight)\b'
            ],
            'bmw': [
                r'\b(320i|330i|340i|M340i|M3|X3|X5|X7|iX|i4|i7)\b'
            ],
            'mercedes': [
                r'\b(A-Class|C-Class|E-Class|S-Class|GLA|GLC|GLE|GLS|AMG)\b'
            ],
            'audi': [
                r'\b(A3|A4|A6|A8|Q3|Q5|Q7|Q8|RS|S|e-tron)\b'
            ]
        }
        
        brand_lower = brand.lower()
        if brand_lower in brand_patterns:
            return brand_patterns[brand_lower]
        
        # Generic patterns for unknown brands
        return [
            r'\b(SE|LE|XLE|XSE|Limited|Platinum|Premium|Sport|GT|RS|ST)\b',
            r'\b(se|le|xle|xse|limited|platinum|premium|sport|gt|rs|st)\b'
        ]
    
    def extract_features_for_trim(self, soup, page_text, trim_name):
        """Extract features specific to a trim"""
        features = []
        
        # Look for features near the trim name
        trim_lower = trim_name.lower()
        page_lower = page_text.lower()
        
        # Find the position of the trim in the text
        trim_pos = page_lower.find(trim_lower)
        if trim_pos != -1:
            # Extract text around the trim (500 characters before and after)
            start = max(0, trim_pos - 500)
            end = min(len(page_text), trim_pos + 500)
            context = page_text[start:end]
            
            # Look for feature keywords
            feature_keywords = [
                'engine', 'horsepower', 'torque', 'transmission', 'drivetrain',
                'safety', 'technology', 'entertainment', 'comfort', 'convenience',
                'performance', 'efficiency', 'capacity', 'towing', 'payload'
            ]
            
            # Extract sentences containing feature keywords
            sentences = re.split(r'[.!?]', context)
            for sentence in sentences:
                sentence_lower = sentence.lower()
                for keyword in feature_keywords:
                    if keyword in sentence_lower and len(sentence.strip()) > 10:
                        feature = sentence.strip()
                        if feature not in features and len(features) < 5:
                            features.append(feature)
        
        return features
    
    def extract_engine_specs(self, soup, page_text, url):
        """Extract engine specifications from the page"""
        engine_specs = {
            'type': '',
            'capacity': '',
            'horsepower': '',
            'torque': '',
            'mileage': ''
        }
        
        # Extract engine type
        engine_patterns = [
            r'(\d+\.?\d*L(?:\s+\w+)?(?:\s+engine)?)',
            r'(\d+\.?\d*L(?:\s+\w+)?(?:\s+TurboMax)?)',
            r'(\d+\.?\d*L(?:\s+\w+)?(?:\s+EcoBoost)?)',
            r'(\d+\.?\d*L(?:\s+\w+)?(?:\s+V\d+)?)'
        ]
        
        for pattern in engine_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                engine_specs['type'] = match.group(1)
                engine_specs['capacity'] = match.group(1)
                break
        
        # Extract horsepower
        hp_patterns = [
            r'(\d+)\s*horsepower',
            r'(\d+)\s*hp',
            r'(\d+)\s*HP'
        ]
        
        for pattern in hp_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                engine_specs['horsepower'] = f"{match.group(1)} HP"
                break
        
        # Extract torque
        torque_patterns = [
            r'(\d+)\s*lb-ft',
            r'(\d+)\s*lb\.-ft',
            r'(\d+)\s*pound-feet'
        ]
        
        for pattern in torque_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                engine_specs['torque'] = f"{match.group(1)} lb-ft"
                break
        
        # Extract mileage
        mpg_patterns = [
            r'(\d+)\s*mpg',
            r'(\d+)\s*miles per gallon',
            r'(\d+)\s*city.*?(\d+)\s*highway\s*mpg'
        ]
        
        for pattern in mpg_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 1:
                    engine_specs['mileage'] = f"{match.group(1)} MPG"
                elif len(match.groups()) == 2:
                    engine_specs['mileage'] = f"{match.group(1)} city / {match.group(2)} highway MPG"
                break
        

        
        return engine_specs
    
    def extract_dimensions(self, page_text):
        """Extract vehicle dimensions from the page"""
        dimensions = {
            'length': '',
            'width': '',
            'height': '',
            'wheelbase': '',
            'groundClearance': ''
        }
        
        # Extract length
        length_match = re.search(r'(\d+\.?\d*)\s*(?:inches|in)\s*(?:length|long)', page_text, re.IGNORECASE)
        if length_match:
            dimensions['length'] = f"{length_match.group(1)} inches"
        
        # Extract width
        width_match = re.search(r'(\d+\.?\d*)\s*(?:inches|in)\s*(?:width|wide)', page_text, re.IGNORECASE)
        if width_match:
            dimensions['width'] = f"{width_match.group(1)} inches"
        
        # Extract height
        height_match = re.search(r'(\d+\.?\d*)\s*(?:inches|in)\s*(?:height|tall)', page_text, re.IGNORECASE)
        if height_match:
            dimensions['height'] = f"{height_match.group(1)} inches"
        
        # Extract wheelbase
        wheelbase_match = re.search(r'(\d+\.?\d*)\s*(?:inches|in)\s*(?:wheelbase)', page_text, re.IGNORECASE)
        if wheelbase_match:
            dimensions['wheelbase'] = f"{wheelbase_match.group(1)} inches"
        
        # Extract ground clearance
        clearance_match = re.search(r'(\d+\.?\d*)\s*(?:inches|in)\s*(?:ground clearance)', page_text, re.IGNORECASE)
        if clearance_match:
            dimensions['groundClearance'] = f"{clearance_match.group(1)} inches"
        
        return dimensions
    
    def extract_images(self, soup, base_url):
        """Extract vehicle-specific images from the page"""
        images = []
        
        # Try multiple strategies to find vehicle images
        image_strategies = [
            # Strategy 1: Look for images with vehicle-related alt text
            lambda: self._extract_images_by_alt_text(soup, base_url),
            # Strategy 2: Look for images in vehicle-specific sections
            lambda: self._extract_images_from_sections(soup, base_url),
            # Strategy 3: Look for images with vehicle-related class names
            lambda: self._extract_images_by_class(soup, base_url),
            # Strategy 4: Look for images with vehicle-related data attributes
            lambda: self._extract_images_by_data_attrs(soup, base_url)
        ]
        
        # Try each strategy and collect all images
        for strategy in image_strategies:
            try:
                strategy_images = strategy()
                if strategy_images:
                    images.extend(strategy_images)
            except Exception as e:
                logger.error(f"Error in image extraction strategy: {str(e)}")
        
        # Remove duplicates while preserving order
        seen = set()
        unique_images = []
        for img in images:
            if img not in seen:
                seen.add(img)
                unique_images.append(img)
        
        return unique_images[:10]  # Limit to 10 images
    
    def _extract_images_by_alt_text(self, soup, base_url):
        """Extract images with vehicle-related alt text"""
        images = []
        vehicle_keywords = ['car', 'vehicle', 'truck', 'suv', 'sedan', 'hatchback', 'wagon', 'coupe', 'convertible']
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            alt = img.get('alt', '').lower()
            
            # Check if alt text contains vehicle keywords
            if any(keyword in alt for keyword in vehicle_keywords):
                if src.startswith('http'):
                    images.append(src)
                elif src.startswith('/'):
                    images.append(f"{base_url.rstrip('/')}{src}")
        
        return images
    
    def _extract_images_from_sections(self, soup, base_url):
        """Extract images from vehicle-specific sections"""
        images = []
        section_keywords = ['gallery', 'images', 'photos', 'exterior', 'interior', 'hero']
        
        for section in soup.find_all(['div', 'section']):
            section_class = section.get('class', [])
            section_id = section.get('id', '')
            
            if any(keyword in str(section_class).lower() or keyword in section_id.lower() for keyword in section_keywords):
                for img in section.find_all('img'):
                    src = img.get('src', '')
                    if src.startswith('http'):
                        images.append(src)
                    elif src.startswith('/'):
                        images.append(f"{base_url.rstrip('/')}{src}")
        
        return images
    
    def _extract_images_by_class(self, soup, base_url):
        """Extract images with vehicle-related class names"""
        images = []
        class_keywords = ['image', 'photo', 'gallery', 'hero', 'banner', 'vehicle']
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            img_class = img.get('class', [])
            
            if any(keyword in str(img_class).lower() for keyword in class_keywords):
                if src.startswith('http'):
                    images.append(src)
                elif src.startswith('/'):
                    images.append(f"{base_url.rstrip('/')}{src}")
        
        return images
    
    def _extract_images_by_data_attrs(self, soup, base_url):
        """Extract images with vehicle-related data attributes"""
        images = []
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            data_attrs = {k: v for k, v in img.attrs.items() if k.startswith('data-')}
            
            # Check if any data attribute contains vehicle-related content
            vehicle_keywords = ['car', 'vehicle', 'truck', 'suv', 'image', 'photo']
            if any(keyword in str(data_attrs).lower() for keyword in vehicle_keywords):
                if src.startswith('http'):
                    images.append(src)
                elif src.startswith('/'):
                    images.append(f"{base_url.rstrip('/')}{src}")
        
        return images
    
    def scrape_car(self, url, options=None):
        """Main scraping method - only extracts from provided URL"""
        if options is None:
            options = {}
        
        logger.info(f"Starting car scraping for: {url}")
        
        try:
            # Add random delay to avoid detection
            time.sleep(random.uniform(1, 3))
            
            # Try to get rendered content using headless browser if available
            page_text = self.get_rendered_content(url)
            
            if not page_text:
                # Fallback to regular requests
                response = self.session.get(url, timeout=60)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html5lib')
                page_text = soup.get_text()
            
            # Check for error pages
            if 'oops! something went wrong' in page_text.lower():
                raise Exception("Website blocked access or returned an error page")
            
            # Parse HTML for structured data extraction
            soup = BeautifulSoup(self.session.get(url, timeout=60).content, 'html5lib')
            
            # Extract basic information
            brand = self.detect_brand_from_url(url)
            model_name = self.extract_model_name(soup, url)
            
            # Log the detected brand and model for debugging
            logger.info(f"Detected brand: {brand}, model: {model_name}")
            
            # Extract variants and pricing
            variants = self.extract_variants_and_pricing(soup, page_text, url)
            
            # Extract engine specifications
            engine_specs = self.extract_engine_specs(soup, page_text, url)
            
            # Extract dimensions
            dimensions = self.extract_dimensions(page_text)
            
            # Extract images
            images = self.extract_images(soup, url)
            
            # Extract fuel type and transmission from page
            fuel_type = self.extract_fuel_type(page_text)
            transmission = self.extract_transmission(page_text)
            body_type = self.extract_body_type(page_text, url)
            
            # Build car data - only from the provided URL
            car_data = {
                'brand': brand,
                'model': model_name,
                'url': url,
                'engine': engine_specs,
                'dimensions': dimensions,
                'variants': variants,
                'images': images,
                'fuelType': fuel_type,
                'transmission': transmission,
                'bodyType': body_type
            }
            
            logger.info(f"Successfully scraped car data for {brand} {model_name}")
            return car_data
            
        except Exception as e:
            logger.error(f"Error scraping car data: {str(e)}")
            raise
    
    def get_rendered_content(self, url):
        """Get rendered content using headless browser if available"""
        try:
            # Try to use playwright if available
            import playwright
            from playwright.sync_api import sync_playwright
            
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # Set user agent
                page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                
                # Navigate to page and wait for content to load
                page.goto(url, wait_until='networkidle', timeout=30000)
                
                # Wait a bit more for dynamic content
                page.wait_for_timeout(5000)
                
                # Get the rendered content
                content = page.content()
                page_text = page.inner_text('body')
                
                browser.close()
                
                logger.info("Successfully rendered page with headless browser")
                return page_text
                
        except ImportError:
            logger.info("Playwright not available, using regular requests")
            return None
        except Exception as e:
            logger.warning(f"Headless browser failed: {str(e)}, falling back to regular requests")
            return None
    
    def extract_fuel_type(self, page_text):
        """Extract fuel type from the page"""
        fuel_patterns = [
            r'gasoline',
            r'petrol',
            r'diesel',
            r'hybrid',
            r'electric',
            r'plug-in hybrid',
            r'hydrogen'
        ]
        
        page_lower = page_text.lower()
        for pattern in fuel_patterns:
            if re.search(pattern, page_lower):
                return pattern.title()
        
        return ''  # Return empty if not found
    
    def extract_transmission(self, page_text):
        """Extract transmission type from the page"""
        transmission_patterns = [
            r'automatic',
            r'manual',
            r'cvt',
            r'dual-clutch',
            r'continuously variable'
        ]
        
        page_lower = page_text.lower()
        for pattern in transmission_patterns:
            if re.search(pattern, page_lower):
                return pattern.title()
        
        return ''  # Return empty if not found
    
    def extract_body_type(self, page_text, url):
        """Extract body type from the page"""
        body_patterns = [
            r'sedan',
            r'suv',
            r'truck',
            r'pickup',
            r'hatchback',
            r'wagon',
            r'coupe',
            r'convertible',
            r'minivan',
            r'van'
        ]
        
        page_lower = page_text.lower()
        for pattern in body_patterns:
            if re.search(pattern, page_lower):
                return pattern.title()
        
        # Fallback to URL-based detection
        url_lower = url.lower()
        if 'truck' in url_lower or 'pickup' in url_lower:
            return 'Truck'
        elif 'suv' in url_lower:
            return 'SUV'
        elif 'sedan' in url_lower:
            return 'Sedan'
        
        return ''  # Return empty if not found

# Initialize scraper
car_scraper = CarScraper()

@app.route('/api/scrape-car', methods=['POST'])
def scrape_car_endpoint():
    """API endpoint for car scraping"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL is required'
            }), 400
        
        url = data['url']
        options = data.get('options', {})
        
        # Validate URL
        if not url.startswith(('http://', 'https://')):
            return jsonify({
                'success': False,
                'error': 'Invalid URL format'
            }), 400
        
        # Scrape car data
        car_data = car_scraper.scrape_car(url, options)
        
        return jsonify({
            'success': True,
            'carData': car_data
        })
        
    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 