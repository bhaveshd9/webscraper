# Web Scraper Deployment Script for Windows
# This script helps deploy the web scraper application

param(
    [Parameter(Position=0)]
    [ValidateSet("docker", "local", "heroku", "help")]
    [string]$Option = "docker"
)

Write-Host "🚀 Web Scraper Deployment Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Function to deploy with Docker Compose
function Deploy-Docker {
    Write-Host "🐳 Deploying with Docker Compose..." -ForegroundColor Yellow
    
    # Check if Docker is installed
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    
    # Check if Docker Compose is installed
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
        exit 1
    }
    
    # Build and start services
    docker-compose up --build -d
    
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host "📱 Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "🔧 JavaScript Backend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🐍 Python Backend: http://localhost:5000" -ForegroundColor Cyan
}

# Function to deploy locally
function Deploy-Local {
    Write-Host "💻 Deploying locally..." -ForegroundColor Yellow
    
    # Install JavaScript dependencies
    Write-Host "📦 Installing JavaScript dependencies..." -ForegroundColor Yellow
    npm install
    
    # Install Python dependencies
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    # Install Playwright browsers
    Write-Host "🌐 Installing Playwright browsers..." -ForegroundColor Yellow
    playwright install chromium
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To start the services:" -ForegroundColor Cyan
    Write-Host "1. JavaScript Backend: npm run server" -ForegroundColor White
    Write-Host "2. Python Backend: python car_scraper_app.py" -ForegroundColor White
    Write-Host "3. Frontend: npm run client" -ForegroundColor White
}

# Function to deploy to Heroku
function Deploy-Heroku {
    Write-Host "☁️ Deploying to Heroku..." -ForegroundColor Yellow
    
    # Check if Heroku CLI is installed
    if (-not (Get-Command heroku -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Heroku CLI is not installed. Please install it first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📝 Please follow the manual Heroku deployment steps in the README." -ForegroundColor Yellow
    Write-Host "🔗 JavaScript Backend: Use the main Procfile" -ForegroundColor Cyan
    Write-Host "🔗 Python Backend: Use Procfile.python" -ForegroundColor Cyan
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [OPTION]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  docker    Deploy using Docker Compose (recommended)" -ForegroundColor Cyan
    Write-Host "  local     Deploy locally (development)" -ForegroundColor Cyan
    Write-Host "  heroku    Show Heroku deployment instructions" -ForegroundColor Cyan
    Write-Host "  help      Show this help message" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy.ps1 docker" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 local" -ForegroundColor Gray
}

# Main script logic
switch ($Option) {
    "docker" {
        Deploy-Docker
    }
    "local" {
        Deploy-Local
    }
    "heroku" {
        Deploy-Heroku
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "❌ Unknown option: $Option" -ForegroundColor Red
        Show-Help
        exit 1
    }
} 