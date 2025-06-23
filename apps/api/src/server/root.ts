import { createTRPCRouter } from './trpc';
import { agentRouter } from './routers/agent';
import { campaignRouter } from './routers/campaign';
import { userRouter } from './routers/user';
import { metricsRouter } from './routers/metrics';
import { contentRouter } from './routers/content';
import { emailRouter } from './routers/email';
import { seoRouter } from './routers/seo';
import { socialRouter } from './routers/social';
import { supportRouter } from './routers/support';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  agent: agentRouter,
  campaign: campaignRouter,
  user: userRouter,
  metrics: metricsRouter,
  content: contentRouter,
  email: emailRouter,
  seo: seoRouter,
  social: socialRouter,
  support: supportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;