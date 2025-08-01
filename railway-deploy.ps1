# Railway Deployment Script for Web Scraper
# Deploys frontend, JavaScript backend, and Python backend to Railway

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "frontend", "backend-js", "backend-python", "setup", "help")]
    [string]$Service = "all"
)

Write-Host "🚂 Railway Deployment Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI is not installed. Installing now..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Function to setup Railway
function Setup-Railway {
    Write-Host "🔧 Setting up Railway..." -ForegroundColor Yellow
    
    # Login to Railway
    Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
    railway login
    
    Write-Host "✅ Railway setup complete!" -ForegroundColor Green
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create 3 Railway projects - frontend, backend-js, backend-python" -ForegroundColor White
    Write-Host "2. Set environment variables for each project" -ForegroundColor White
    Write-Host "3. Deploy each service" -ForegroundColor White
}

# Function to deploy frontend
function Deploy-Frontend {
    Write-Host "🎨 Deploying Frontend to Railway..." -ForegroundColor Yellow
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ package.json not found. Make sure you're in the project root." -ForegroundColor Red
        exit 1
    }
    
    # Build the frontend
    Write-Host "📦 Building frontend..." -ForegroundColor Yellow
    npm run build
    
    # Deploy to Railway
    Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
    railway up
    
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your frontend URL will be shown above" -ForegroundColor Cyan
}

# Function to deploy JavaScript backend
function Deploy-BackendJS {
    Write-Host "🔧 Deploying JavaScript Backend to Railway..." -ForegroundColor Yellow
    
    # Check if server files exist
    if (-not (Test-Path "server.js") -and -not (Test-Path "server-simple.js")) {
        Write-Host "❌ Server files not found. Make sure you're in the project root." -ForegroundColor Red
        exit 1
    }
    
    # Deploy to Railway
    Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
    railway up
    
    Write-Host "✅ JavaScript Backend deployed successfully!" -ForegroundColor Green
    Write-Host "🔗 Your backend URL will be shown above" -ForegroundColor Cyan
}

# Function to deploy Python backend
function Deploy-BackendPython {
    Write-Host "🐍 Deploying Python Backend to Railway..." -ForegroundColor Yellow
    
    # Check if Python files exist
    if (-not (Test-Path "car_scraper_app.py")) {
        Write-Host "❌ car_scraper_app.py not found. Make sure you're in the project root." -ForegroundColor Red
        exit 1
    }
    
    # Deploy to Railway
    Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
    railway up
    
    Write-Host "✅ Python Backend deployed successfully!" -ForegroundColor Green
    Write-Host "🔗 Your backend URL will be shown above" -ForegroundColor Cyan
}

# Function to deploy all services
function Deploy-All {
    Write-Host "🚀 Deploying all services to Railway..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 This will create 3 separate Railway projects:" -ForegroundColor Cyan
    Write-Host "1. Frontend (React app)" -ForegroundColor White
    Write-Host "2. JavaScript Backend (Node.js)" -ForegroundColor White
    Write-Host "3. Python Backend (Flask)" -ForegroundColor White
    Write-Host ""
    
    $confirm = Read-Host "Do you want to continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Deployment cancelled." -ForegroundColor Red
        exit 0
    }
    
    # Deploy frontend
    Write-Host ""
    Write-Host "🎨 Step 1: Deploying Frontend..." -ForegroundColor Green
    Deploy-Frontend
    
    # Deploy JavaScript backend
    Write-Host ""
    Write-Host "🔧 Step 2: Deploying JavaScript Backend..." -ForegroundColor Green
    Deploy-BackendJS
    
    # Deploy Python backend
    Write-Host ""
    Write-Host "🐍 Step 3: Deploying Python Backend..." -ForegroundColor Green
    Deploy-BackendPython
    
    Write-Host ""
    Write-Host "🎉 All services deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set environment variables in each Railway project" -ForegroundColor White
    Write-Host "2. Configure custom domains (optional)" -ForegroundColor White
    Write-Host "3. Test your deployed application" -ForegroundColor White
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\railway-deploy.ps1 [SERVICE]" -ForegroundColor White
    Write-Host ""
    Write-Host "Services:" -ForegroundColor White
    Write-Host "  all           Deploy all services (frontend + both backends)" -ForegroundColor Cyan
    Write-Host "  frontend      Deploy only the React frontend" -ForegroundColor Cyan
    Write-Host "  backend-js    Deploy only the JavaScript backend" -ForegroundColor Cyan
    Write-Host "  backend-python Deploy only the Python backend" -ForegroundColor Cyan
    Write-Host "  setup         Setup Railway CLI and login" -ForegroundColor Cyan
    Write-Host "  help          Show this help message" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\railway-deploy.ps1 all" -ForegroundColor Gray
    Write-Host "  .\railway-deploy.ps1 frontend" -ForegroundColor Gray
    Write-Host "  .\railway-deploy.ps1 setup" -ForegroundColor Gray
}

# Main script logic
switch ($Service) {
    "all" {
        Deploy-All
    }
    "frontend" {
        Deploy-Frontend
    }
    "backend-js" {
        Deploy-BackendJS
    }
    "backend-python" {
        Deploy-BackendPython
    }
    "setup" {
        Setup-Railway
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "❌ Unknown service: $Service" -ForegroundColor Red
        Show-Help
        exit 1
    }
} 