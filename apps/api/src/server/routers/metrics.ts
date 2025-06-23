import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const metricsRouter = createTRPCRouter({
  // Get dashboard overview metrics
  getDashboardOverview: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
        campaignId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const daysAgo = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          '1y': 365,
        }[input.timeRange];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const where: any = {
          userId: ctx.session.user.id,
          date: { gte: startDate },
        };
        
        if (input.campaignId) {
          where.campaignId = input.campaignId;
        }

        // Get analytics data
        const analytics = await ctx.prisma.analytics.findMany({
          where,
          orderBy: { date: 'desc' },
        });

        // Get campaign counts
        const [totalCampaigns, activeCampaigns] = await Promise.all([
          ctx.prisma.campaign.count({
            where: { userId: ctx.session.user.id },
          }),
          ctx.prisma.campaign.count({
            where: { 
              userId: ctx.session.user.id,
              status: 'ACTIVE',
            },
          }),
        ]);

        // Calculate metrics
        const engagementData = analytics.filter(a => a.type === 'ENGAGEMENT');
        const reachData = analytics.filter(a => a.type === 'REACH');
        const conversionData = analytics.filter(a => a.type === 'CONVERSION');
        const revenueData = analytics.filter(a => a.type === 'REVENUE');

        const totalEngagement = engagementData.reduce((sum, a) => {
          const data = a.data as any;
          return sum + (data.engagement || 0);
        }, 0);

        const totalReach = reachData.reduce((sum, a) => {
          const data = a.data as any;
          return sum + (data.reach || 0);
        }, 0);

        const totalConversions = conversionData.reduce((sum, a) => {
          const data = a.data as any;
          return sum + (data.conversions || 0);
        }, 0);

        const totalRevenue = revenueData.reduce((sum, a) => {
          const data = a.data as any;
          return sum + (data.revenue || 0);
        }, 0);

        return {
          overview: {
            totalCampaigns,
            activeCampaigns,
            totalEngagement,
            totalReach,
            totalConversions,
            totalRevenue,
            timeRange: input.timeRange,
          },
          trends: {
            engagement: this.calculateTrend(engagementData),
            reach: this.calculateTrend(reachData),
            conversions: this.calculateTrend(conversionData),
            revenue: this.calculateTrend(revenueData),
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to fetch dashboard overview', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard overview',
        });
      }
    }),

  // Get campaign performance metrics
  getCampaignMetrics: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
        metrics: z.array(z.enum(['engagement', 'reach', 'conversions', 'revenue', 'clicks', 'impressions'])).optional(),
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

        // Get analytics data
        const analytics = await ctx.prisma.analytics.findMany({
          where: {
            campaignId: input.campaignId,
            date: { gte: startDate },
          },
          orderBy: { date: 'asc' },
        });

        // Process metrics by type
        const metricsByType = analytics.reduce((acc, analytic) => {
          const type = analytic.type.toLowerCase();
          if (!acc[type]) acc[type] = [];
          acc[type].push({
            date: analytic.date,
            data: analytic.data,
          });
          return acc;
        }, {} as Record<string, any[]>);

        // Calculate totals and trends
        const metrics = Object.keys(metricsByType).reduce((acc, type) => {
          const data = metricsByType[type];
          const total = data.reduce((sum, item) => {
            const itemData = item.data as any;
            return sum + (itemData[type] || 0);
          }, 0);

          acc[type] = {
            total,
            data: data.map(item => ({
              date: item.date,
              value: (item.data as any)[type] || 0,
            })),
            trend: this.calculateTrendFromData(data.map(item => (item.data as any)[type] || 0)),
          };
          return acc;
        }, {} as Record<string, any>);

        return {
          campaignId: input.campaignId,
          timeRange: input.timeRange,
          metrics,
          summary: {
            totalEngagement: metrics.engagement?.total || 0,
            totalReach: metrics.reach?.total || 0,
            totalConversions: metrics.conversion?.total || 0,
            totalRevenue: metrics.revenue?.total || 0,
            engagementRate: this.calculateEngagementRate(metrics.engagement?.total || 0, metrics.reach?.total || 0),
            conversionRate: this.calculateConversionRate(metrics.conversion?.total || 0, metrics.clicks?.total || 0),
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to fetch campaign metrics', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch campaign metrics',
        });
      }
    }),

  // Record analytics event
  recordEvent: protectedProcedure
    .input(
      z.object({
        type: z.enum(['ENGAGEMENT', 'REACH', 'CONVERSION', 'REVENUE', 'CLICKS', 'IMPRESSIONS', 'SENTIMENT', 'PERFORMANCE']),
        campaignId: z.string().optional(),
        data: z.record(z.any()),
        period: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const analytics = await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            campaignId: input.campaignId,
            type: input.type,
            data: input.data,
            period: input.period,
            date: new Date(),
          },
        });

        ctx.logger.info('Analytics event recorded', {
          analyticsId: analytics.id,
          type: input.type,
          campaignId: input.campaignId,
          userId: ctx.session.user.id,
        });

        return analytics;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to record analytics event', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record analytics event',
        });
      }
    }),

  // Get agent performance metrics
  getAgentMetrics: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
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
          startedAt: { gte: startDate },
        };

        if (input.agentId) {
          where.agentId = input.agentId;
        }

        const executions = await ctx.prisma.agentExecution.findMany({
          where,
          include: { agent: true },
          orderBy: { startedAt: 'desc' },
        });

        // Group by agent
        const agentMetrics = executions.reduce((acc, execution) => {
          const agentId = execution.agentId;
          if (!acc[agentId]) {
            acc[agentId] = {
              agent: execution.agent,
              totalExecutions: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              avgPerformance: 0,
              avgExecutionTime: 0,
              executions: [],
            };
          }

          acc[agentId].totalExecutions++;
          acc[agentId].executions.push(execution);

          if (execution.status === 'COMPLETED') {
            acc[agentId].successfulExecutions++;
          } else if (execution.status === 'FAILED') {
            acc[agentId].failedExecutions++;
          }

          return acc;
        }, {} as Record<string, any>);

        // Calculate averages
        Object.keys(agentMetrics).forEach(agentId => {
          const metrics = agentMetrics[agentId];
          const validPerformances = metrics.executions.filter((e: any) => e.performance !== null);
          const validExecutionTimes = metrics.executions.filter((e: any) => e.completedAt !== null);

          if (validPerformances.length > 0) {
            metrics.avgPerformance = validPerformances.reduce((sum: number, e: any) => sum + e.performance, 0) / validPerformances.length;
          }

          if (validExecutionTimes.length > 0) {
            metrics.avgExecutionTime = validExecutionTimes.reduce((sum: number, e: any) => {
              return sum + (e.completedAt.getTime() - e.startedAt.getTime());
            }, 0) / validExecutionTimes.length / 1000; // Convert to seconds
          }

          metrics.successRate = metrics.totalExecutions > 0 ? (metrics.successfulExecutions / metrics.totalExecutions) * 100 : 0;
          
          // Remove executions array to reduce response size
          delete metrics.executions;
        });

        return {
          timeRange: input.timeRange,
          agents: agentMetrics,
          summary: {
            totalAgents: Object.keys(agentMetrics).length,
            totalExecutions: Object.values(agentMetrics).reduce((sum: number, metrics: any) => sum + metrics.totalExecutions, 0),
            overallSuccessRate: this.calculateOverallSuccessRate(Object.values(agentMetrics)),
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to fetch agent metrics', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch agent metrics',
        });
      }
    }),

  // Helper methods (these would typically be in a separate service)
  calculateTrend: (data: any[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7); // Last 7 data points
    const older = data.slice(-14, -7); // Previous 7 data points
    
    const recentAvg = recent.reduce((sum, item) => sum + ((item.data as any).value || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + ((item.data as any).value || 0), 0) / older.length;
    
    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  },

  calculateTrendFromData: (values: number[]) => {
    if (values.length < 2) return 0;
    const half = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, half);
    const secondHalf = values.slice(half);
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  },

  calculateEngagementRate: (engagement: number, reach: number) => {
    return reach > 0 ? (engagement / reach) * 100 : 0;
  },

  calculateConversionRate: (conversions: number, clicks: number) => {
    return clicks > 0 ? (conversions / clicks) * 100 : 0;
  },

  calculateOverallSuccessRate: (agentMetrics: any[]) => {
    const totals = agentMetrics.reduce((acc, metrics) => {
      acc.successful += metrics.successfulExecutions;
      acc.total += metrics.totalExecutions;
      return acc;
    }, { successful: 0, total: 0 });
    
    return totals.total > 0 ? (totals.successful / totals.total) * 100 : 0;
  },
});