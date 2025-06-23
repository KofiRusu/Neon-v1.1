import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          campaigns: {
            select: {
              id: true,
              name: true,
              status: true,
              type: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          agentExecutions: {
            select: {
              id: true,
              task: true,
              status: true,
              startedAt: true,
            },
            take: 5,
            orderBy: { startedAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      ctx.logger.error('Failed to fetch user profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user profile',
      });
    }
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: input,
        });

        ctx.logger.info(`User profile updated: ${ctx.session.user.id}`);

        return user;
      } catch (error) {
        ctx.logger.error('Failed to update user profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user profile',
        });
      }
    }),

  // Get user stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [
        totalCampaigns,
        activeCampaigns,
        totalExecutions,
        successfulExecutions,
      ] = await Promise.all([
        ctx.prisma.campaign.count({
          where: { userId: ctx.session.user.id },
        }),
        ctx.prisma.campaign.count({
          where: { 
            userId: ctx.session.user.id,
            status: 'ACTIVE',
          },
        }),
        ctx.prisma.agentExecution.count({
          where: { userId: ctx.session.user.id },
        }),
        ctx.prisma.agentExecution.count({
          where: { 
            userId: ctx.session.user.id,
            status: 'COMPLETED',
          },
        }),
      ]);

      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

      return {
        totalCampaigns,
        activeCampaigns,
        totalExecutions,
        successfulExecutions,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      ctx.logger.error('Failed to fetch user stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user stats',
      });
    }
  }),
});