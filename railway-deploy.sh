#!/bin/bash

# Railway Deployment Script for Web Scraper
# Deploys frontend, JavaScript backend, and Python backend to Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Default service
SERVICE=${1:-all}

echo -e "${GREEN}🚂 Railway Deployment Script${NC}"
echo -e "${GREEN}=============================${NC}"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}❌ Railway CLI is not installed. Installing now...${NC}"
    npm install -g @railway/cli
fi

# Function to setup Railway
setup_railway() {
    echo -e "${YELLOW}🔧 Setting up Railway...${NC}"
    
    # Login to Railway
    echo -e "${YELLOW}🔐 Logging into Railway...${NC}"
    railway login
    
    echo -e "${GREEN}✅ Railway setup complete!${NC}"
    echo -e "${CYAN}📝 Next steps:${NC}"
    echo -e "${WHITE}1. Create 3 Railway projects (frontend, backend-js, backend-python)${NC}"
    echo -e "${WHITE}2. Set environment variables for each project${NC}"
    echo -e "${WHITE}3. Deploy each service${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}🎨 Deploying Frontend to Railway...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found. Make sure you're in the project root.${NC}"
        exit 1
    fi
    
    # Build the frontend
    echo -e "${YELLOW}📦 Building frontend...${NC}"
    npm run build
    
    # Deploy to Railway
    echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
    railway up
    
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    echo -e "${CYAN}🌐 Your frontend URL will be shown above${NC}"
}

# Function to deploy JavaScript backend
deploy_backend_js() {
    echo -e "${YELLOW}🔧 Deploying JavaScript Backend to Railway...${NC}"
    
    # Check if server files exist
    if [ ! -f "server.js" ] && [ ! -f "server-simple.js" ]; then
        echo -e "${RED}❌ Server files not found. Make sure you're in the project root.${NC}"
        exit 1
    fi
    
    # Deploy to Railway
    echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
    railway up
    
    echo -e "${GREEN}✅ JavaScript Backend deployed successfully!${NC}"
    echo -e "${CYAN}🔗 Your backend URL will be shown above${NC}"
}

# Function to deploy Python backend
deploy_backend_python() {
    echo -e "${YELLOW}🐍 Deploying Python Backend to Railway...${NC}"
    
    # Check if Python files exist
    if [ ! -f "car_scraper_app.py" ]; then
        echo -e "${RED}❌ car_scraper_app.py not found. Make sure you're in the project root.${NC}"
        exit 1
    fi
    
    # Deploy to Railway
    echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
    railway up
    
    echo -e "${GREEN}✅ Python Backend deployed successfully!${NC}"
    echo -e "${CYAN}🔗 Your backend URL will be shown above${NC}"
}

# Function to deploy all services
deploy_all() {
    echo -e "${YELLOW}🚀 Deploying all services to Railway...${NC}"
    echo ""
    echo -e "${CYAN}📋 This will create 3 separate Railway projects:${NC}"
    echo -e "${WHITE}1. Frontend (React app)${NC}"
    echo -e "${WHITE}2. JavaScript Backend (Node.js)${NC}"
    echo -e "${WHITE}3. Python Backend (Flask)${NC}"
    echo ""
    
    read -p "Do you want to continue? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo -e "${RED}❌ Deployment cancelled.${NC}"
        exit 0
    fi
    
    # Deploy frontend
    echo ""
    echo -e "${GREEN}🎨 Step 1: Deploying Frontend...${NC}"
    deploy_frontend
    
    # Deploy JavaScript backend
    echo ""
    echo -e "${GREEN}🔧 Step 2: Deploying JavaScript Backend...${NC}"
    deploy_backend_js
    
    # Deploy Python backend
    echo ""
    echo -e "${GREEN}🐍 Step 3: Deploying Python Backend...${NC}"
    deploy_backend_python
    
    echo ""
    echo -e "${GREEN}🎉 All services deployed successfully!${NC}"
    echo ""
    echo -e "${CYAN}📝 Next steps:${NC}"
    echo -e "${WHITE}1. Set environment variables in each Railway project${NC}"
    echo -e "${WHITE}2. Configure custom domains (optional)${NC}"
    echo -e "${WHITE}3. Test your deployed application${NC}"
}

# Function to show help
show_help() {
    echo -e "${WHITE}Usage: ./railway-deploy.sh [SERVICE]${NC}"
    echo ""
    echo -e "${WHITE}Services:${NC}"
    echo -e "${CYAN}  all           Deploy all services (frontend + both backends)${NC}"
    echo -e "${CYAN}  frontend      Deploy only the React frontend${NC}"
    echo -e "${CYAN}  backend-js    Deploy only the JavaScript backend${NC}"
    echo -e "${CYAN}  backend-python Deploy only the Python backend${NC}"
    echo -e "${CYAN}  setup         Setup Railway CLI and login${NC}"
    echo -e "${CYAN}  help          Show this help message${NC}"
    echo ""
    echo -e "${WHITE}Examples:${NC}"
    echo -e "${GRAY}  ./railway-deploy.sh all${NC}"
    echo -e "${GRAY}  ./railway-deploy.sh frontend${NC}"
    echo -e "${GRAY}  ./railway-deploy.sh setup${NC}"
}

# Main script logic
case $SERVICE in
    "all")
        deploy_all
        ;;
    "frontend")
        deploy_frontend
        ;;
    "backend-js")
        deploy_backend_js
        ;;
    "backend-python")
        deploy_backend_python
        ;;
    "setup")
        setup_railway
        ;;
    "help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown service: $SERVICE${NC}"
        show_help
        exit 1
        ;;
esac 