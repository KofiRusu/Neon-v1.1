import { createTRPCRouter } from './trpc';
import { userRouter } from './routers/user';
import { campaignRouter } from './routers/campaign';
import { agentRouter } from './routers/agent';
import { metricsRouter } from './routers/metrics';
import { contentRouter } from './routers/content';
import { seoRouter } from './routers/seo';
import { emailRouter } from './routers/email';
import { socialRouter } from './routers/social';
import { supportRouter } from './routers/support';
import { outreachRouter } from './routers/outreach';
import { trendsRouter } from './routers/trends';
import { brandVoiceRouter } from './routers/brand-voice';
import { fallbackRouter } from './routers/index';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Core routers
  user: userRouter,
  campaign: campaignRouter,
  agent: agentRouter,
  metrics: metricsRouter,
  
  // Feature routers
  content: contentRouter,
  seo: seoRouter,
  email: emailRouter,
  social: socialRouter,
  support: supportRouter,
  outreach: outreachRouter,
  trends: trendsRouter,
  brandVoice: brandVoiceRouter,
  
  // Health check and fallbacks
  health: fallbackRouter.health,
});

// export type definition of API
export type AppRouter = typeof appRouter;
