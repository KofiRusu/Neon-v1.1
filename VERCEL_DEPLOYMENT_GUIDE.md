# NeonHub Vercel Deployment Guide

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KofiRusu/Neon-v1.1.git)

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- PostgreSQL database (Neon, Supabase, or Railway recommended)
- API keys for integrations (OpenAI, Twilio, SendGrid, etc.)

## 🏗️ Project Structure

This is a monorepo with the following structure:

```
├── apps/
│   ├── dashboard/          # Next.js frontend application
│   └── api/               # Next.js API routes and tRPC server
├── packages/
│   ├── core-agents/       # AI agents library
│   ├── data-model/        # Prisma database schema
│   ├── reasoning-engine/  # AI reasoning logic
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Shared utilities
└── vercel.json           # Vercel deployment configuration
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Core Configuration

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://username:password@host:port/database
```

### Authentication

```bash
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### AI Services

```bash
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key-optional
```

### Communication Services

```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Social Media APIs

```bash
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FB_ACCESS_TOKEN=your-facebook-access-token
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
```

### Additional Services

```bash
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=your-32-character-encryption-key
WEBHOOK_SECRET=your-webhook-secret
```

## 🚀 Deployment Steps

### 1. Fork/Clone Repository

```bash
git clone https://github.com/KofiRusu/Neon-v1.1.git
cd Neon-v1.1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Optional: Run migrations if you have them
npm run db:migrate
```

### 4. Build and Test Locally

```bash
# Build all packages
npm run build

# Test locally
npm run dev
```

### 5. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NODE_ENV production
vercel env add DATABASE_URL your-database-url
# ... add all other environment variables
```

#### Option B: Vercel Dashboard

1. Import your GitHub repository
2. Set up environment variables in the dashboard
3. Deploy

### 6. Post-Deployment Setup

1. **Database Migration**: Ensure your database is migrated
2. **Domain Configuration**: Set up your custom domain
3. **Environment Variables**: Verify all environment variables are set
4. **API Testing**: Test API endpoints at `/api/health`

## 🔍 Verification Steps

After deployment, verify these endpoints:

- `https://your-app.vercel.app/` - Dashboard homepage
- `https://your-app.vercel.app/api/health` - API health check
- `https://your-app.vercel.app/api/trpc/health` - tRPC health check

## 🎯 Key Features Deployed

### AI Agents

- **Content Agent**: Generates blog posts, social media content, and marketing
  copy
- **SEO Agent**: Optimizes content for search engines and keyword targeting
- **Email Agent**: Creates email campaigns and newsletter templates
- **Social Agent**: Manages social media posts across platforms
- **Brand Voice Agent**: Maintains consistent brand voice across content
- **Support Agent**: Handles customer support with AI-powered responses
- **Trend Agent**: Analyzes market trends and content opportunities
- **Insight Agent**: Provides analytics and performance insights

### Platforms Supported

- **Social Media**: Facebook, Instagram, TikTok, Twitter, LinkedIn
- **Email Marketing**: SendGrid integration
- **WhatsApp Business**: Customer support and marketing
- **E-commerce**: Shopify integration ready

### Analytics & Insights

- Real-time performance tracking
- Cross-platform analytics
- Predictive trend analysis
- ROI optimization
- A/B testing capabilities

## 🛠️ Build Configuration

The project is configured with:

- **TypeScript**: Type-safe development with error tolerance for deployment
- **ESLint**: Code quality with warning-level rules for deployment
- **Next.js**: Full-stack React framework with API routes
- **tRPC**: End-to-end typesafe APIs
- **Prisma**: Type-safe database access
- **TailwindCSS**: Utility-first CSS framework
- **Vercel**: Optimized for serverless deployment

## 🔧 Troubleshooting

### Build Issues

If you encounter build issues:

1. **TypeScript Errors**: Build configuration ignores TypeScript errors for
   deployment
2. **Missing Dependencies**: Run `npm install` to ensure all dependencies are
   installed
3. **Environment Variables**: Ensure all required environment variables are set

### Runtime Issues

1. **Database Connection**: Verify DATABASE_URL is correct
2. **API Keys**: Check all API keys are valid and have proper permissions
3. **CORS Issues**: Ensure NEXT_PUBLIC_APP_URL is set correctly

### Performance Optimization

1. **Images**: Use Next.js Image component for optimization
2. **Fonts**: Leverage Next.js font optimization
3. **Static Assets**: Store large files in cloud storage (S3, Cloudinary)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🎉 Success!

Your NeonHub platform is now deployed and ready to revolutionize your marketing
automation with AI-powered agents!

Visit your deployment at: `https://your-app.vercel.app`

## 🚨 Security Notes

- Keep your `.env.local` file secure and never commit it to version control
- Regularly rotate API keys and secrets
- Monitor usage and set up alerts for unusual activity
- Enable Vercel's security features like DDoS protection
