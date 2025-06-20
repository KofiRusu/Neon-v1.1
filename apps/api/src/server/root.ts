import { createTRPCRouter } from './trpc'
import { userRouter } from './routers/user'
import { campaignRouter } from './routers/campaign'
import { metricsRouter } from './routers/metrics'
import { agentRouter } from './routers/agent'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  campaign: campaignRouter,
  metrics: metricsRouter,
  agent: agentRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter 