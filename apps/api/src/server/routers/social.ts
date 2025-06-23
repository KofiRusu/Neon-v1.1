import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentManager } from '@neonhub/core-agents';

const agentManager = new AgentManager();

export const socialRouter = createTRPCRouter({
  // Post to social media platforms
  publishPost: protectedProcedure
    .input(
      z.object({
        platforms: z.array(z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN'])).min(1),
        content: z.object({
          text: z.string().min(1).max(2000),
          images: z.array(z.string().url()).optional(),
          video: z.string().url().optional(),
          link: z.string().url().optional(),
        }),
        scheduling: z.object({
          publishNow: z.boolean().default(true),
          scheduledTime: z.date().optional(),
          timezone: z.string().default('UTC'),
        }),
        campaignId: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('social-agent', {
          task: 'publish_post',
          context: {
            platforms: input.platforms,
            content: input.content,
            scheduling: input.scheduling,
            hashtags: input.hashtags,
            campaignId: input.campaignId,
          },
          priority: input.scheduling.publishNow ? 'high' : 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Record analytics for each platform
        for (const platform of input.platforms) {
          await ctx.prisma.analytics.create({
            data: {
              userId: ctx.session.user.id,
              campaignId: input.campaignId,
              type: 'PERFORMANCE',
              data: {
                type: 'social_post',
                platform,
                contentLength: input.content.text.length,
                hasImages: (input.content.images?.length || 0) > 0,
                hasVideo: !!input.content.video,
                scheduled: !input.scheduling.publishNow,
                result: result.data?.[platform] || {},
              },
            },
          });
        }

        ctx.logger.info('Social post published', {
          platforms: input.platforms,
          campaignId: input.campaignId,
          scheduled: !input.scheduling.publishNow,
          userId: ctx.session.user.id,
        });

        return {
          success: result.success,
          platforms: input.platforms,
          postIds: result.data?.postIds || {},
          scheduledFor: input.scheduling.scheduledTime,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to publish social post', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to publish social post',
        });
      }
    }),

  // Generate social media content
  generateContent: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN']),
        contentType: z.enum(['post', 'story', 'reel', 'thread']),
        topic: z.string().min(1).max(200),
        tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'promotional']).default('professional'),
        targetAudience: z.string().optional(),
        includeHashtags: z.boolean().default(true),
        includeEmojis: z.boolean().default(true),
        maxLength: z.number().optional(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('social-agent', {
          task: 'generate_content',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Save generated content
        const content = await ctx.prisma.content.create({
          data: {
            title: `Generated ${input.contentType} - ${input.topic}`,
            type: input.contentType.toUpperCase() as any,
            platform: input.platform,
            content: result.data,
            status: 'DRAFT',
            metadata: {
              generatedBy: 'social-agent',
              prompt: input,
              performance: result.performance,
            },
          },
        });

        return {
          content,
          generatedText: result.data?.text || '',
          hashtags: result.data?.hashtags || [],
          suggestions: result.data?.suggestions || [],
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate social content', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate social content',
        });
      }
    }),

  // Schedule content calendar
  scheduleCalendar: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        calendar: z.array(z.object({
          date: z.date(),
          platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN']),
          contentId: z.string().optional(),
          content: z.object({
            text: z.string(),
            images: z.array(z.string().url()).optional(),
            video: z.string().url().optional(),
          }).optional(),
          timezone: z.string().default('UTC'),
        })).min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify campaign ownership
        const campaign = await ctx.prisma.campaign.findFirst({
          where: {
            id: input.campaignId,
            userId: ctx.session.user.id,
          },
        });

        if (!campaign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Campaign not found',
          });
        }

        const result = await agentManager.executeAgent('social-agent', {
          task: 'schedule_calendar',
          context: {
            campaignId: input.campaignId,
            calendar: input.calendar,
          },
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Record calendar analytics
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            campaignId: input.campaignId,
            type: 'PERFORMANCE',
            data: {
              type: 'social_calendar',
              postCount: input.calendar.length,
              platforms: [...new Set(input.calendar.map(item => item.platform))],
              dateRange: {
                start: Math.min(...input.calendar.map(item => item.date.getTime())),
                end: Math.max(...input.calendar.map(item => item.date.getTime())),
              },
              result: result.data,
            },
          },
        });

        return {
          success: result.success,
          scheduledCount: input.calendar.length,
          platforms: [...new Set(input.calendar.map(item => item.platform))],
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to schedule social calendar', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule social calendar',
        });
      }
    }),

  // Get social media analytics
  getAnalytics: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN']).optional(),
        campaignId: z.string().optional(),
        timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
        metrics: z.array(z.enum(['reach', 'engagement', 'clicks', 'shares', 'comments', 'likes'])).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const daysAgo = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
        }[input.timeRange];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const where: any = {
          userId: ctx.session.user.id,
          date: { gte: startDate },
          data: {
            path: ['type'],
            equals: 'social_analytics',
          },
        };

        if (input.campaignId) {
          where.campaignId = input.campaignId;
        }

        if (input.platform) {
          where.data.path = ['platform'];
          where.data.equals = input.platform;
        }

        const analytics = await ctx.prisma.analytics.findMany({
          where,
          orderBy: { date: 'desc' },
        });

        // Aggregate metrics by platform
        const platformMetrics = analytics.reduce((acc: any, analytic) => {
          const data = analytic.data as any;
          const platform = data.platform;
          
          if (!acc[platform]) {
            acc[platform] = {
              reach: 0,
              engagement: 0,
              clicks: 0,
              shares: 0,
              comments: 0,
              likes: 0,
              posts: 0,
            };
          }

          acc[platform].reach += data.reach || 0;
          acc[platform].engagement += data.engagement || 0;
          acc[platform].clicks += data.clicks || 0;
          acc[platform].shares += data.shares || 0;
          acc[platform].comments += data.comments || 0;
          acc[platform].likes += data.likes || 0;
          acc[platform].posts += 1;

          return acc;
        }, {});

        // Calculate engagement rates
        Object.keys(platformMetrics).forEach(platform => {
          const metrics = platformMetrics[platform];
          metrics.engagementRate = metrics.reach > 0 ? (metrics.engagement / metrics.reach) * 100 : 0;
          metrics.clickThroughRate = metrics.reach > 0 ? (metrics.clicks / metrics.reach) * 100 : 0;
        });

        return {
          timeRange: input.timeRange,
          platforms: platformMetrics,
          summary: {
            totalReach: Object.values(platformMetrics).reduce((sum: number, metrics: any) => sum + metrics.reach, 0),
            totalEngagement: Object.values(platformMetrics).reduce((sum: number, metrics: any) => sum + metrics.engagement, 0),
            totalPosts: Object.values(platformMetrics).reduce((sum: number, metrics: any) => sum + metrics.posts, 0),
            avgEngagementRate: this.calculateAverageEngagementRate(Object.values(platformMetrics)),
          },
          trends: analytics.map(a => ({
            date: a.date,
            platform: (a.data as any).platform,
            metrics: a.data,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to get social analytics', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get social analytics',
        });
      }
    }),

  // Manage social media accounts
  manageAccounts: protectedProcedure
    .input(
      z.object({
        action: z.enum(['connect', 'disconnect', 'refresh', 'list']),
        platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN']).optional(),
        credentials: z.object({
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          accountId: z.string().optional(),
          expiresAt: z.date().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('social-agent', {
          task: 'manage_accounts',
          context: input,
          priority: 'high',
          metadata: { userId: ctx.session.user.id },
        });

        ctx.logger.info('Social account managed', {
          action: input.action,
          platform: input.platform,
          userId: ctx.session.user.id,
        });

        return {
          success: result.success,
          accounts: result.data?.accounts || [],
          status: result.data?.status || {},
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to manage social accounts', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to manage social accounts',
        });
      }
    }),

  // Helper method
  calculateAverageEngagementRate: (platformMetrics: any[]) => {
    if (platformMetrics.length === 0) return 0;
    const totalRate = platformMetrics.reduce((sum: number, metrics: any) => sum + (metrics.engagementRate || 0), 0);
    return totalRate / platformMetrics.length;
  },
});