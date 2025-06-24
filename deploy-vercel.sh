#!/bin/bash

# NeonHub Vercel Deployment Script
# This script handles the complete deployment process to Vercel

set -e

echo "🚀 Starting NeonHub deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel@latest
fi

# Check if user is logged in to Vercel
echo -e "${BLUE}🔍 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel. Please log in:${NC}"
    vercel login
fi

# Build check
echo -e "${BLUE}🔨 Running pre-deployment build check...${NC}"
npm run build --workspace=apps/dashboard --if-present || {
    echo -e "${RED}❌ Dashboard build failed. Please fix build errors before deploying.${NC}"
    exit 1
}

# Environment variables check
echo -e "${BLUE}🔍 Checking required environment variables...${NC}"

required_vars=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "OPENAI_API_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if ! vercel env ls | grep -q "$var"; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables in Vercel:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo -e "${YELLOW}Please add these environment variables using:${NC}"
    echo "   vercel env add <VARIABLE_NAME>"
    
    read -p "Do you want to continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled.${NC}"
        exit 1
    fi
fi

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

if [ "$1" == "--production" ] || [ "$1" == "-p" ]; then
    echo -e "${GREEN}📦 Deploying to PRODUCTION...${NC}"
    vercel --prod --yes
else
    echo -e "${YELLOW}🔧 Deploying to PREVIEW...${NC}"
    vercel --yes
fi

deployment_url=$(vercel ls | head -2 | tail -1 | awk '{print $2}')

echo -e "${GREEN}✅ Deployment completed!${NC}"

# Health check
if [ -n "$deployment_url" ]; then
    echo -e "${BLUE}🏥 Running health check...${NC}"
    
    # Wait a moment for deployment to be ready
    sleep 10
    
    if curl -f -s "https://$deployment_url/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        echo -e "${GREEN}🌐 Your app is live at: https://$deployment_url${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed. Please check the deployment manually.${NC}"
        echo -e "${BLUE}🌐 Deployment URL: https://$deployment_url${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine deployment URL. Please check Vercel dashboard.${NC}"
fi

# Post-deployment instructions
echo -e "${BLUE}📋 Post-deployment checklist:${NC}"
echo "   1. Verify all environment variables are set correctly"
echo "   2. Test all major features (AI agents, external services)"
echo "   3. Check error logging and monitoring"
echo "   4. Update DNS records if using custom domain"
echo "   5. Set up monitoring and alerts"

echo -e "${GREEN}🎉 Deployment process completed!${NC}" 