#!/bin/bash

# Web Scraper Deployment Script
# This script helps deploy the web scraper application

set -e

echo "🚀 Web Scraper Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to deploy with Docker Compose
deploy_docker() {
    echo "🐳 Deploying with Docker Compose..."
    
    # Build and start services
    docker-compose up --build -d
    
    echo "✅ Services started successfully!"
    echo "📱 Frontend: http://localhost"
    echo "🔧 JavaScript Backend: http://localhost:3000"
    echo "🐍 Python Backend: http://localhost:5000"
}

# Function to deploy locally
deploy_local() {
    echo "💻 Deploying locally..."
    
    # Install dependencies
    echo "📦 Installing JavaScript dependencies..."
    npm install
    
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Install Playwright browsers
    echo "🌐 Installing Playwright browsers..."
    playwright install chromium
    
    echo "✅ Dependencies installed!"
    echo ""
    echo "🚀 To start the services:"
    echo "1. JavaScript Backend: npm run server"
    echo "2. Python Backend: python car_scraper_app.py"
    echo "3. Frontend: npm run client"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "☁️ Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    
    echo "📝 Please follow the manual Heroku deployment steps in the README."
    echo "🔗 JavaScript Backend: Use the main Procfile"
    echo "🔗 Python Backend: Use Procfile.python"
}

# Function to show help
show_help() {
    echo "Usage: ./deploy.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  docker    Deploy using Docker Compose (recommended)"
    echo "  local     Deploy locally (development)"
    echo "  heroku    Show Heroku deployment instructions"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh docker"
    echo "  ./deploy.sh local"
}

# Main script logic
case "${1:-docker}" in
    "docker")
        deploy_docker
        ;;
    "local")
        deploy_local
        ;;
    "heroku")
        deploy_heroku
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_help
        exit 1
        ;;
esac 