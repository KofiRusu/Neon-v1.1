import { createTRPCRouter, publicProcedure } from '../trpc';
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
import { z } from 'zod';

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

export const fallbackRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'NeonHub API is running',
    };
  }),

  // Fallback procedures for missing routers
  campaign: createTRPCRouter({
    getStats: publicProcedure.query(() => {
      return {
        active: 12,
        completed: 8,
        total: 20,
      };
    }),
  }),

  agent: createTRPCRouter({
    getRecentActions: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(({ input }) => {
        return Array.from({ length: input.limit }, (_, i) => ({
          id: `action-${i}`,
          agent: `Agent${i + 1}`,
          action: `Completed task ${i + 1}`,
          createdAt: new Date(Date.now() - i * 60000).toISOString(),
        }));
      }),
  }),
});
