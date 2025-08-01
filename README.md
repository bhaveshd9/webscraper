# Advanced Web Scraper with Car Data Extraction

## Overview

This project provides both general web scraping capabilities and specialized car data extraction. It includes:

1. **General Web Scraper** (Node.js): HTTP-based scraping, browser automation, anti-scraping bypass, and method comparison
2. **Car Data Scraper** (Python): Specialized extraction of car specifications from manufacturer websites

## General Web Scraper Features

### Simple Mode (Basic Scraping)
- **HTTP-based Scraping**: Fast extraction of headlines, links, images, and text content
- **Anti-Detection**: User-agent rotation, request delays, and stealth headers
- **Error Handling**: Robust retry mechanisms and timeout management

### Enhanced Mode (Advanced Scraping)
- **Browser Automation**: Puppeteer integration for JavaScript-heavy sites
- **Dynamic Content**: Handles SPAs and AJAX-loaded content
- **Advanced Selectors**: CSS and XPath selector support
- **Data Validation**: Automatic content verification and cleaning

### Method Tester
- **Performance Comparison**: Tests HTTP, Puppeteer, and Selenium methods
- **Speed Analysis**: Measures response times and success rates
- **Method Recommendations**: Suggests optimal scraping approach
- **Real-time Progress**: Terminal-like progress display in browser

## Car Data Scraper Features

### Data Extraction
- **Vehicle Specifications**: Brand, model, engine details, dimensions
- **Variant Information**: Trim levels, pricing, feature lists
- **Media Assets**: Vehicle images and gallery URLs
- **Technical Details**: Fuel type, transmission, body type, mileage

### Advanced Capabilities
- **Headless Browser**: Playwright integration for dynamic content
- **Anti-Bot Bypass**: Stealth mode, mobile simulation, plugin detection
- **Multi-Strategy Extraction**: Multiple approaches for reliable data extraction
- **Real-time Processing**: Live progress updates and error handling

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons
- **React Router** for navigation

### Backend (JavaScript)
- **Node.js** with Express.js
- **Puppeteer** for browser automation
- **Cheerio** for HTML parsing
- **Axios** for HTTP requests
- **CORS** for cross-origin requests

### Backend (Python)
- **Flask** web framework
- **BeautifulSoup** for HTML parsing
- **Playwright** for headless browser automation
- **Requests** for HTTP handling
- **Flask-CORS** for cross-origin requests

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webscraper
   ```

2. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Playwright browsers (for Python)**
   ```bash
   playwright install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Usage

### Development Mode

1. **Start the JavaScript backend (General Web Scraper)**
   ```bash
   npm run server
   # Server runs on http://localhost:3000
   ```

2. **Start the Python backend (Car Data Scraper)**
   ```bash
   python car_scraper_app.py
   # Server runs on http://localhost:5000
   ```

3. **Start the React frontend**
   ```bash
   npm run client
   # Frontend runs on http://localhost:5173
   ```

### API Endpoints

#### JavaScript Backend (Port 3000)
- `POST /api/simple-scrape` - Basic web scraping
- `POST /api/enhanced-scrape` - Advanced scraping with browser automation
- `POST /api/method-test` - Compare scraping methods
- `GET /api/health` - Health check

#### Python Backend (Port 5000)
- `POST /api/scrape-car` - Car data extraction
- `GET /health` - Health check

### Example API Usage

#### General Web Scraping
```javascript
// Simple scraping
const response = await fetch('http://localhost:3000/api/simple-scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

// Enhanced scraping
const response = await fetch('http://localhost:3000/api/enhanced-scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    url: 'https://example.com',
    options: { 
      waitForSelector: '.content',
      screenshot: true 
    }
  })
});
```

#### Car Data Scraping
```python
import requests

response = requests.post('http://localhost:5000/api/scrape-car', 
  json={'url': 'https://www.toyota.com/camry/'})
car_data = response.json()
```

## Deployment

### Deployment Options

This project can be deployed using various platforms. Choose the option that best fits your needs:

### 1. Heroku Deployment

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### JavaScript Backend Deployment
```bash
# Create Heroku app
heroku create your-webscraper-app

# Set buildpacks
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Python Backend Deployment
```bash
# Create separate Heroku app for Python
heroku create your-carscraper-app

# Set buildpacks
heroku buildpacks:set heroku/python

# Add Chrome buildpack for Playwright
heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-google-chrome
heroku buildpacks:add --index 2 https://github.com/heroku/heroku-buildpack-chromedriver

# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set PORT=5000

# Deploy
git add .
git commit -m "Deploy Python backend to Heroku"
git push heroku main
```

### 2. Railway Deployment

#### JavaScript Backend
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Deploy
railway up
```

#### Python Backend
```bash
# Create new Railway project for Python
railway init --name car-scraper-python

# Set environment variables
railway variables set FLASK_ENV=production
railway variables set PORT=5000

# Deploy
railway up
```

### 3. Render Deployment

#### JavaScript Backend
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=3000`

#### Python Backend
1. Create a new Web Service for Python
2. Set build command: `pip install -r requirements.txt && playwright install`
3. Set start command: `python car_scraper_app.py`
4. Set environment variables:
   - `FLASK_ENV=production`
   - `PORT=5000`

### 4. Vercel Deployment (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.com
```

### 5. AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Create application**
```bash
eb init webscraper --platform node.js --region us-east-1
eb create webscraper-env
```

2. **Configure environment**
```bash
eb setenv NODE_ENV=production
eb setenv PORT=3000
```

3. **Deploy**
```bash
eb deploy
```

#### Using AWS EC2

1. **Launch EC2 instance**
2. **Install dependencies**
```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip
```

3. **Clone and setup**
```bash
git clone <repository-url>
cd webscraper
npm install
pip install -r requirements.txt
```

4. **Configure PM2 for Node.js**
```bash
npm install -g pm2
pm2 start server.js --name "webscraper"
pm2 startup
pm2 save
```

5. **Configure systemd for Python**
```bash
sudo nano /etc/systemd/system/carscraper.service
```

```ini
[Unit]
Description=Car Scraper Flask App
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/webscraper
Environment=PATH=/home/ubuntu/webscraper/venv/bin
ExecStart=/home/ubuntu/webscraper/venv/bin/python car_scraper_app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable carscraper
sudo systemctl start carscraper
```

### 6. Docker Deployment

#### Create Dockerfile for JavaScript Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

#### Create Dockerfile for Python Backend
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium

COPY . .
EXPOSE 5000

CMD ["python", "car_scraper_app.py"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  webscraper-js:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped

  carscraper-python:
    build: .
    dockerfile: Dockerfile.python
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - PORT=5000
    restart: unless-stopped

  frontend:
    build: .
    dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - webscraper-js
      - carscraper-python
    restart: unless-stopped
```

### Environment Variables

#### JavaScript Backend
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Python Backend
```bash
FLASK_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Frontend
```bash
VITE_API_URL=https://your-backend-url.com
VITE_CAR_API_URL=https://your-python-backend-url.com
```

### Production Considerations

1. **Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Add authentication if needed
   - Validate and sanitize all inputs

2. **Performance**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies
   - Monitor resource usage

3. **Monitoring**
   - Set up logging (Winston for Node.js, Python logging)
   - Implement health checks
   - Use monitoring services (New Relic, DataDog, etc.)
   - Set up error tracking (Sentry)

4. **Scaling**
   - Use load balancers for multiple instances
   - Implement database connection pooling
   - Use Redis for session storage
   - Consider serverless deployment for variable loads

### Local Production Setup

```bash
# Install PM2 for process management
npm install -g pm2

# Start JavaScript backend
pm2 start server.js --name "webscraper"

# Start Python backend
pm2 start car_scraper_app.py --name "carscraper" --interpreter python

# Start frontend (build first)
npm run build
pm2 serve dist 3000 --name "frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Testing

### Run Tests
```bash
# JavaScript tests
npm test

# Python tests
python -m pytest tests/
```

### Manual Testing
```bash
# Test JavaScript backend
curl -X POST http://localhost:3000/api/simple-scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test Python backend
curl -X POST http://localhost:5000/api/scrape-car \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.toyota.com/camry/"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## Changelog

### Version 2.0.0
- Added Python Flask car scraper
- Removed hardcoded fallbacks
- Enhanced deployment documentation
- Improved error handling

### Version 1.0.0
- Initial release with Node.js web scraper
- Basic scraping functionality
- Method comparison tool 