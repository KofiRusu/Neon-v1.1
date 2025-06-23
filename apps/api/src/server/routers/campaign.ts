import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const campaignRouter = createTRPCRouter({
  // Get all campaigns
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: z.enum(['SOCIAL_MEDIA', 'EMAIL', 'ADS', 'CONTENT', 'INFLUENCER', 'EVENT', 'PRODUCT_LAUNCH']).optional(),
        status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: any = { userId: ctx.session.user.id };
        if (input.type) where.type = input.type;
        if (input.status) where.status = input.status;

        const campaigns = await ctx.prisma.campaign.findMany({
          where,
          include: {
            agentExecutions: {
              orderBy: { startedAt: 'desc' },
              take: 5,
            },
            analytics: {
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        });

        const total = await ctx.prisma.campaign.count({ where });

        return {
          campaigns,
          total,
          hasMore: total > input.offset + input.limit,
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch campaigns:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch campaigns',
        });
      }
    }),

  // Get campaign by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const campaign = await ctx.prisma.campaign.findFirst({
          where: { 
            id: input.id,
            userId: ctx.session.user.id,
          },
          include: {
            agentExecutions: {
              include: { agent: true },
              orderBy: { startedAt: 'desc' },
            },
            analytics: {
              orderBy: { date: 'desc' },
            },
            abTests: true,
          },
        });

        if (!campaign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Campaign not found',
          });
        }

        return campaign;
      } catch (error) {
        ctx.logger.error('Failed to fetch campaign:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch campaign',
        });
      }
    }),

  // Create new campaign
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        type: z.enum(['SOCIAL_MEDIA', 'EMAIL', 'ADS', 'CONTENT', 'INFLUENCER', 'EVENT', 'PRODUCT_LAUNCH']),
        budget: z.number().positive().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        targetAudience: z.record(z.any()).optional(),
        platforms: z.array(z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN', 'YOUTUBE', 'EMAIL', 'WEBSITE', 'SHOPIFY', 'GOOGLE_ADS', 'META_ADS'])).optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const campaign = await ctx.prisma.campaign.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            status: 'DRAFT',
          },
        });

        ctx.logger.info(`Campaign created: ${campaign.name}`, {
          campaignId: campaign.id,
          userId: ctx.session.user.id,
        });

        return campaign;
      } catch (error) {
        ctx.logger.error('Failed to create campaign:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create campaign',
        });
      }
    }),

  // Update campaign
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        budget: z.number().positive().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        targetAudience: z.record(z.any()).optional(),
        platforms: z.array(z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN', 'YOUTUBE', 'EMAIL', 'WEBSITE', 'SHOPIFY', 'GOOGLE_ADS', 'META_ADS'])).optional(),
        settings: z.record(z.any()).optional(),
        status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const campaign = await ctx.prisma.campaign.updateMany({
          where: { 
            id,
            userId: ctx.session.user.id,
          },
          data: updateData,
        });

        if (campaign.count === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Campaign not found',
          });
        }

        const updatedCampaign = await ctx.prisma.campaign.findUnique({
          where: { id },
        });

        ctx.logger.info(`Campaign updated: ${id}`, {
          campaignId: id,
          userId: ctx.session.user.id,
        });

        return updatedCampaign;
      } catch (error) {
        ctx.logger.error('Failed to update campaign:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update campaign',
        });
      }
    }),

  // Delete campaign
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const campaign = await ctx.prisma.campaign.deleteMany({
          where: { 
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (campaign.count === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Campaign not found',
          });
        }

        ctx.logger.info(`Campaign deleted: ${input.id}`, {
          campaignId: input.id,
          userId: ctx.session.user.id,
        });

        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete campaign:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete campaign',
        });
      }
    }),
});