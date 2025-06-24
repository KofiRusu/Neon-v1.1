import { createTRPCRouter } from '../trpc';
import { agentRouter } from './agent';
import { campaignRouter } from './campaign';
import { contentRouter } from './content';
import { emailRouter } from './email';
import { metricsRouter } from './metrics';
import { seoRouter } from './seo';
import { socialRouter } from './social';
import { supportRouter } from './support';
import { userRouter } from './user';
import { brandVoiceRouter } from './brand-voice';
import { trendsRouter } from './trends';
import { outreachRouter } from './outreach';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  agent: agentRouter,
  brandVoice: brandVoiceRouter,
  campaign: campaignRouter,
  content: contentRouter,
  email: emailRouter,
  metrics: metricsRouter,
  seo: seoRouter,
  social: socialRouter,
  support: supportRouter,
  user: userRouter,
  trends: trendsRouter,
  outreach: outreachRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;