#!/bin/bash

# ==========================================
# NeonHub v2.2 - Vercel Environment Setup
# ==========================================
# This script helps you set up environment variables in Vercel
# for your NeonHub deployment.

set -e

echo "🚀 NeonHub v2.2 - Vercel Environment Variables Setup"
echo "=================================================="
echo ""

# Color codes for output
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

echo -e "${BLUE}ℹ️  This script will help you set environment variables for:${NC}"
echo "   • Dashboard (apps/dashboard)"
echo "   • API (apps/api)"
echo ""

# Check if projects are linked
if [ ! -f "apps/dashboard/.vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Dashboard project not linked. Please run:${NC}"
    echo "   vercel link --root apps/dashboard"
    echo ""
fi

if [ ! -f "apps/api/.vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  API project not linked. Please run:${NC}"
    echo "   vercel link --root apps/api"
    echo ""
fi

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local description=$2
    local example=$3
    local is_secret=${4:-true}
    
    echo -e "${BLUE}Setting: ${var_name}${NC}"
    echo "  Description: $description"
    if [ -n "$example" ]; then
        echo "  Example: $example"
    fi
    
    read -p "  Enter value (or press Enter to skip): " var_value
    
    if [ -n "$var_value" ]; then
        if [ "$is_secret" = true ]; then
            # Set for both dashboard and API
            echo "  Setting for dashboard..."
            cd apps/dashboard && vercel env add "$var_name" production <<< "$var_value" && cd ../..
            echo "  Setting for API..."
            cd apps/api && vercel env add "$var_name" production <<< "$var_value" && cd ../..
        else
            # Set for both dashboard and API
            echo "  Setting for dashboard..."
            cd apps/dashboard && vercel env add "$var_name" production <<< "$var_value" && cd ../..
            echo "  Setting for API..."
            cd apps/api && vercel env add "$var_name" production <<< "$var_value" && cd ../..
        fi
        echo -e "  ${GREEN}✅ Set successfully${NC}"
    else
        echo -e "  ${YELLOW}⏭️  Skipped${NC}"
    fi
    echo ""
}

echo -e "${GREEN}🔧 Starting environment variable setup...${NC}"
echo ""

# Core Variables
echo -e "${BLUE}=== CORE CONFIGURATION ===${NC}"
set_env_var "DATABASE_URL" "PostgreSQL connection string" "postgresql://user:pass@host:5432/db"
set_env_var "NEXTAUTH_SECRET" "NextAuth.js secret (min 32 characters)" "your-32-char-secret-here"
set_env_var "NEXTAUTH_URL" "Production URL for NextAuth" "https://yourdomain.com"

# AI Services
echo -e "${BLUE}=== AI SERVICES ===${NC}"
set_env_var "OPENAI_API_KEY" "OpenAI API key for AI agents" "sk-..."
set_env_var "ANTHROPIC_API_KEY" "Anthropic API key (optional)" "sk-ant-..."

# Social Media
echo -e "${BLUE}=== SOCIAL MEDIA INTEGRATIONS ===${NC}"
set_env_var "INSTAGRAM_CLIENT_ID" "Instagram API client ID" ""
set_env_var "INSTAGRAM_CLIENT_SECRET" "Instagram API client secret" ""
set_env_var "TIKTOK_CLIENT_ID" "TikTok API client ID" ""
set_env_var "TIKTOK_CLIENT_SECRET" "TikTok API client secret" ""
set_env_var "META_APP_ID" "Meta/Facebook app ID" ""
set_env_var "META_APP_SECRET" "Meta/Facebook app secret" ""

# Email Services
echo -e "${BLUE}=== EMAIL SERVICES ===${NC}"
set_env_var "SENDGRID_API_KEY" "SendGrid API key" "SG...."
set_env_var "SENDGRID_FROM_EMAIL" "From email address" "noreply@yourdomain.com"

# WhatsApp
echo -e "${BLUE}=== WHATSAPP (TWILIO) ===${NC}"
set_env_var "TWILIO_ACCOUNT_SID" "Twilio Account SID" ""
set_env_var "TWILIO_AUTH_TOKEN" "Twilio Auth Token" ""
set_env_var "TWILIO_WHATSAPP_NUMBER" "WhatsApp Business number" "+1415..."

# E-commerce
echo -e "${BLUE}=== E-COMMERCE ===${NC}"
set_env_var "SHOPIFY_API_KEY" "Shopify API key" ""
set_env_var "SHOPIFY_API_SECRET" "Shopify API secret" ""
set_env_var "SHOPIFY_STORE_URL" "Shopify store URL" "your-store.myshopify.com"

# Caching
echo -e "${BLUE}=== CACHING & STORAGE ===${NC}"
set_env_var "REDIS_URL" "Redis connection string" "redis://localhost:6379"

# Development Settings
echo -e "${BLUE}=== DEVELOPMENT ===${NC}"
set_env_var "NODE_ENV" "Environment" "production" false
set_env_var "NEXT_PUBLIC_APP_URL" "Public app URL" "https://yourdomain.com" false
set_env_var "NEXT_PUBLIC_API_URL" "Public API URL" "https://api.yourdomain.com" false

# Feature Flags
echo -e "${BLUE}=== FEATURE FLAGS ===${NC}"
set_env_var "ENABLE_ANALYTICS" "Enable analytics" "true" false
set_env_var "ENABLE_BUDGET_TRACKING" "Enable budget tracking" "true" false
set_env_var "ENABLE_WHATSAPP_AGENT" "Enable WhatsApp agent" "true" false
set_env_var "ENABLE_SOCIAL_AGENTS" "Enable social media agents" "true" false
set_env_var "ENABLE_EMAIL_CAMPAIGNS" "Enable email campaigns" "true" false

echo -e "${GREEN}🎉 Environment variable setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Deploy your applications:"
echo "   vercel --prod"
echo ""
echo "2. Check your environment variables:"
echo "   cd apps/dashboard && vercel env ls"
echo "   cd apps/api && vercel env ls"
echo ""
echo "3. Test your deployment:"
echo "   Visit your production URLs to verify everything works"
echo ""
echo -e "${GREEN}🚀 Your NeonHub v2.2 is ready for production!${NC}" 