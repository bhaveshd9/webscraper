# Railway Deployment Guide

## Overview

This guide will help you deploy your web scraper application (frontend + both backends) to Railway.

## Prerequisites

- Railway account (free at [railway.app](https://railway.app))
- Git repository with your code
- Node.js and npm installed locally

## Quick Start

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Deploy All Services
```bash
# Windows
.\railway-deploy.ps1 all

# Linux/macOS
./railway-deploy.sh all
```

## Manual Deployment Steps

### Step 1: Deploy Frontend

1. **Create Railway project for frontend:**
   ```bash
   railway init --name webscraper-frontend
   ```

2. **Set environment variables:**
   ```bash
   railway variables set VITE_API_URL=https://your-js-backend-url.railway.app
   railway variables set VITE_CAR_API_URL=https://your-python-backend-url.railway.app
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Step 2: Deploy JavaScript Backend

1. **Create Railway project for JS backend:**
   ```bash
   railway init --name webscraper-backend-js
   ```

2. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set CORS_ORIGIN=https://your-frontend-url.railway.app
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Step 3: Deploy Python Backend

1. **Create Railway project for Python backend:**
   ```bash
   railway init --name webscraper-backend-python
   ```

2. **Set environment variables:**
   ```bash
   railway variables set FLASK_ENV=production
   railway variables set PORT=5000
   railway variables set CORS_ORIGIN=https://your-frontend-url.railway.app
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=https://your-js-backend-url.railway.app
VITE_CAR_API_URL=https://your-python-backend-url.railway.app
```

### JavaScript Backend
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-url.railway.app
```

### Python Backend
```bash
FLASK_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-url.railway.app
```

## Railway Configuration Files

### railway.json (Main)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### railway-frontend.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### railway-python.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python car_scraper_app.py",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Deployment Scripts

### Windows PowerShell
```powershell
# Deploy all services
.\railway-deploy.ps1 all

# Deploy individual services
.\railway-deploy.ps1 frontend
.\railway-deploy.ps1 backend-js
.\railway-deploy.ps1 backend-python

# Setup Railway
.\railway-deploy.ps1 setup
```

### Linux/macOS Bash
```bash
# Deploy all services
./railway-deploy.sh all

# Deploy individual services
./railway-deploy.sh frontend
./railway-deploy.sh backend-js
./railway-deploy.sh backend-python

# Setup Railway
./railway-deploy.sh setup
```

## Post-Deployment Steps

### 1. Get Your URLs
After deployment, Railway will provide URLs for each service:
- Frontend: `https://your-app-name-frontend.railway.app`
- JavaScript Backend: `https://your-app-name-backend-js.railway.app`
- Python Backend: `https://your-app-name-backend-python.railway.app`

### 2. Update Environment Variables
Update the environment variables in each Railway project with the correct URLs.

### 3. Test Your Application
- Visit your frontend URL
- Test the general web scraper
- Test the car data scraper
- Check health endpoints

### 4. Set Custom Domains (Optional)
In each Railway project dashboard:
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records

## Monitoring and Logs

### View Logs
```bash
# View logs for a specific service
railway logs

# Follow logs in real-time
railway logs --follow
```

### Monitor Performance
- Railway dashboard shows CPU, memory, and network usage
- Set up alerts for resource usage
- Monitor error rates and response times

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check if all dependencies are in package.json/requirements.txt
   - Verify Node.js/Python versions
   - Check build logs in Railway dashboard

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify URLs are correct

3. **CORS Issues**
   - Make sure CORS_ORIGIN is set correctly
   - Check that frontend URL is allowed in backend CORS settings

4. **Port Issues**
   - Railway automatically assigns ports
   - Use `process.env.PORT` in your code
   - Don't hardcode port numbers

### Debug Commands
```bash
# Check Railway status
railway status

# View service details
railway service

# Connect to service shell
railway shell

# View environment variables
railway variables
```

## Scaling

### Automatic Scaling
Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

### Manual Scaling
In Railway dashboard:
1. Go to your service
2. Click on Settings → Scaling
3. Adjust instance count and resources

## Cost Optimization

### Free Tier
- $5 credit monthly
- Perfect for development and small projects

### Pay-as-you-go
- Only pay for actual usage
- Automatic scaling saves costs
- Monitor usage in dashboard

### Tips
- Use sleep mode for development projects
- Monitor resource usage
- Set up usage alerts

## Security

### Environment Variables
- Never commit secrets to Git
- Use Railway's encrypted environment variables
- Rotate secrets regularly

### HTTPS
- Railway provides automatic HTTPS
- Custom domains get SSL certificates
- No additional configuration needed

### Access Control
- Use Railway's team features
- Set up proper permissions
- Monitor access logs

## Support

### Railway Documentation
- [Railway Docs](https://docs.railway.app)
- [Deployment Guide](https://docs.railway.app/deploy/deployments)
- [Environment Variables](https://docs.railway.app/deploy/environment-variables)

### Community
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](https://github.com/railwayapp/railway)

### Getting Help
1. Check Railway documentation
2. Search existing issues
3. Ask in Discord community
4. Contact Railway support 