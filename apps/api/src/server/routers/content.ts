import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentManager } from '@neonhub/core-agents';

const agentManager = new AgentManager();

export const contentRouter = createTRPCRouter({
  // Generate social media posts
  generatePost: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN']),
        topic: z.string().min(1).max(200),
        tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'promotional']).default('professional'),
        length: z.enum(['short', 'medium', 'long']).default('medium'),
        includeHashtags: z.boolean().default(true),
        targetAudience: z.string().optional(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Execute content agent
        const result = await agentManager.executeAgent('content-agent', {
          task: 'generate_posts',
          context: {
            platform: input.platform,
            topic: input.topic,
            tone: input.tone,
            length: input.length,
            includeHashtags: input.includeHashtags,
            targetAudience: input.targetAudience,
          },
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Save generated content to database
        const content = await ctx.prisma.content.create({
          data: {
            title: `Generated Post - ${input.topic}`,
            type: 'POST',
            platform: input.platform,
            content: result.data,
            status: 'DRAFT',
            metadata: {
              generatedBy: 'content-agent',
              prompt: input,
              performance: result.performance,
            },
          },
        });

        ctx.logger.info('Content generated successfully', {
          contentId: content.id,
          platform: input.platform,
          userId: ctx.session.user.id,
        });

        return {
          content,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate content', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate content',
        });
      }
    }),

  // Generate email content
  generateEmail: protectedProcedure
    .input(
      z.object({
        type: z.enum(['newsletter', 'promotional', 'welcome', 'follow-up']),
        subject: z.string().optional(),
        audience: z.string().min(1).max(200),
        tone: z.enum(['professional', 'casual', 'friendly', 'urgent']).default('professional'),
        includeCtaButton: z.boolean().default(true),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('content-agent', {
          task: 'write_emails',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        const content = await ctx.prisma.content.create({
          data: {
            title: input.subject || `Generated Email - ${input.type}`,
            type: 'EMAIL',
            platform: 'EMAIL',
            content: result.data,
            status: 'DRAFT',
            metadata: {
              generatedBy: 'content-agent',
              prompt: input,
              performance: result.performance,
            },
          },
        });

        return {
          content,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate email content', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate email content',
        });
      }
    }),

  // Optimize existing content
  optimizeContent: protectedProcedure
    .input(
      z.object({
        contentId: z.string(),
        optimizationGoal: z.enum(['engagement', 'conversions', 'reach', 'clicks']),
        additionalInstructions: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get existing content
        const existingContent = await ctx.prisma.content.findUnique({
          where: { id: input.contentId },
        });

        if (!existingContent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Content not found',
          });
        }

        const result = await agentManager.executeAgent('content-agent', {
          task: 'optimize_content',
          context: {
            originalContent: existingContent.content,
            goal: input.optimizationGoal,
            platform: existingContent.platform,
            instructions: input.additionalInstructions,
          },
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Create optimized version
        const optimizedContent = await ctx.prisma.content.create({
          data: {
            title: `${existingContent.title} (Optimized)`,
            type: existingContent.type,
            platform: existingContent.platform,
            content: result.data,
            status: 'DRAFT',
            metadata: {
              originalContentId: existingContent.id,
              optimizedFor: input.optimizationGoal,
              generatedBy: 'content-agent',
              performance: result.performance,
            },
          },
        });

        return {
          originalContent: existingContent,
          optimizedContent,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to optimize content', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to optimize content',
        });
      }
    }),

  // Get all content
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN', 'YOUTUBE', 'EMAIL', 'WEBSITE']).optional(),
        type: z.enum(['POST', 'STORY', 'REEL', 'VIDEO', 'EMAIL', 'AD', 'BLOG', 'PRODUCT']).optional(),
        status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {};
        if (input.platform) where.platform = input.platform;
        if (input.type) where.type = input.type;
        if (input.status) where.status = input.status;

        const content = await ctx.prisma.content.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        });

        const total = await ctx.prisma.content.count({ where });

        return {
          content,
          total,
          hasMore: total > input.offset + input.limit,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to fetch content', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch content',
        });
      }
    }),

  // Get content by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const content = await ctx.prisma.content.findUnique({
          where: { id: input.id },
        });

        if (!content) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Content not found',
          });
        }

        return content;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to fetch content by ID', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch content',
        });
      }
    }),

  // Update content status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const content = await ctx.prisma.content.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        ctx.logger.info('Content status updated', {
          contentId: input.id,
          newStatus: input.status,
          userId: ctx.session.user.id,
        });

        return content;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to update content status', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update content status',
        });
      }
    }),
});