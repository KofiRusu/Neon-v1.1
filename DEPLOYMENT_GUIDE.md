# NeonHub Production Deployment Guide

## 🚀 Deploying to Vercel

This guide walks you through deploying NeonHub to Vercel for production use.

---

## 📋 Prerequisites

### 1. Vercel Account Setup
```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login to Vercel
vercel login
```

### 2. Required Services
Before deploying, ensure you have accounts and API keys for:
- **Database:** PlanetScale, Supabase, or PostgreSQL provider
- **OpenAI:** API key for AI functionality
- **Twilio:** Account SID, Auth Token, WhatsApp number
- **SendGrid:** API key for email services
- **Meta:** Facebook App ID, Secret, Access Token

---

## 🔧 Environment Variables Setup

### Required Environment Variables

Set these in your Vercel project dashboard or using CLI:

```bash
# Core Application
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_API_URL

# AI Services
vercel env add OPENAI_API_KEY
vercel env add OPENAI_ORGANIZATION  # Optional

# Communication Services
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_WHATSAPP_NUMBER

# Email Services
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL

# Social Media Services
vercel env add FACEBOOK_APP_ID
vercel env add FACEBOOK_APP_SECRET
vercel env add FB_ACCESS_TOKEN

# Optional Services
vercel env add REDIS_URL
vercel env add ENCRYPTION_KEY
vercel env add WEBHOOK_SECRET
```

### Environment Variable Values

```env
# Example values (replace with your actual credentials)
DATABASE_URL="postgresql://user:pass@host:5432/neonhub_prod"
NEXTAUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app"

OPENAI_API_KEY="sk-your-openai-api-key"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FB_ACCESS_TOKEN="your-facebook-access-token"
```

---

## 🚀 Deployment Steps

### Method 1: Automated Script (Recommended)

```bash
# Deploy to preview
npm run deploy:vercel

# Deploy to production
npm run deploy:vercel:prod
```

### Method 2: Manual Deployment

```bash
# 1. Build and test locally
npm run build

# 2. Deploy to preview environment
vercel

# 3. Deploy to production
vercel --prod
```

---

## 🔍 Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-XX...",
  "services": {
    "database": "connected",
    "ai": "available"
  }
}
```

### 2. Feature Testing
- ✅ AI Agent responses
- ✅ Email sending (SendGrid)
- ✅ WhatsApp messaging (Twilio)
- ✅ Social media posting (Meta)
- ✅ Database connectivity

### 3. Logging Verification
Check Vercel Function logs for:
- AI fallback events in `/logs/ai-fallback.log`
- Service integration logs
- Error handling logs

---

## 🛠️ Configuration Files

### vercel.json
The deployment uses these key configurations:
- **Monorepo support** for apps/dashboard and apps/api
- **Environment variables** for all external services
- **Function configuration** for API routes
- **Redirect rules** for proper routing

### next.config.js
Optimized for production with:
- **Package transpilation** for monorepo
- **External packages** configuration
- **CORS headers** for API routes
- **Webpack optimizations**

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build locally first
npm run build:dashboard
npm run build:api

# Common fixes:
npm run type-check  # Fix TypeScript errors
npm run lint        # Fix linting issues
```

#### 2. Environment Variable Issues
```bash
# List current env vars
vercel env ls

# Update environment variable
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

#### 3. Database Connection Issues
- Ensure DATABASE_URL includes SSL parameters for production
- Check database provider's connection limits
- Verify IP whitelist includes Vercel's IPs

#### 4. External Service Issues
```bash
# Test individual services
curl -X POST https://your-domain.vercel.app/api/trpc/support.classifyMessage
curl -X POST https://your-domain.vercel.app/api/trpc/email.generateSequence
```

### Debug Mode
Enable debug logging by setting:
```bash
vercel env add DEBUG "neonhub:*"
vercel env add LOG_LEVEL "debug"
```

---

## 📊 Monitoring & Maintenance

### 1. Vercel Analytics
- Enable Web Analytics in Vercel dashboard
- Monitor Core Web Vitals and performance

### 2. Function Monitoring
- Check function execution times
- Monitor cold start performance
- Review error rates

### 3. External Service Monitoring
- Set up alerting for API rate limits
- Monitor service availability
- Track usage costs

### 4. Database Monitoring
- Monitor connection pool usage
- Track query performance
- Set up backup schedules

---

## 🔐 Security Checklist

- ✅ All environment variables are secured in Vercel
- ✅ API keys are not exposed in client-side code
- ✅ CORS headers are properly configured
- ✅ Rate limiting is enabled for API routes
- ✅ Input validation is implemented
- ✅ Error messages don't expose sensitive information

---

## 🎯 Performance Optimization

### 1. Vercel Edge Functions
Consider migrating performance-critical APIs to Edge Functions:
```javascript
// api/edge/classify.js
export const config = { runtime: 'edge' }
```

### 2. Caching Strategy
- Enable Vercel's static file caching
- Implement API response caching for stable data
- Use Redis for session and temporary data

### 3. Bundle Optimization
- Minimize package imports in client components
- Use dynamic imports for heavy libraries
- Optimize images and assets

---

## 🆘 Support & Resources

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

### NeonHub Resources
- Check `/logs/` directory for detailed error logs
- Review `PHASE_4_COMPLETION_REPORT.md` for service integration details
- Use health check endpoint for service status

### Getting Help
1. Check Vercel Function logs in dashboard
2. Review error logs in `/logs/` directory
3. Test individual service integrations
4. Verify environment variable configuration

---

**Deployment Status:** ✅ Ready for Production  
**Last Updated:** December 2024  
**Next Review:** After first production deployment 