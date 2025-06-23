import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentManager } from '@neonhub/core-agents';

const agentManager = new AgentManager();

export const supportRouter = createTRPCRouter({
  // Handle customer support ticket
  handleTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        customerInfo: z.object({
          name: z.string().min(1).max(100),
          email: z.string().email(),
          phone: z.string().optional(),
          priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        }),
        issue: z.object({
          category: z.enum(['technical', 'billing', 'general', 'complaint', 'feature_request']),
          subject: z.string().min(1).max(200),
          description: z.string().min(1),
          attachments: z.array(z.string().url()).optional(),
        }),
        context: z.object({
          previousTickets: z.number().default(0),
          accountType: z.enum(['free', 'premium', 'enterprise']).optional(),
          lastInteraction: z.date().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('support-agent', {
          task: 'handle_ticket',
          context: {
            ticket: input,
            userId: ctx.session.user.id,
          },
          priority: input.customerInfo.priority as any,
          metadata: { userId: ctx.session.user.id },
        });

        // Record support analytics
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            type: 'PERFORMANCE',
            data: {
              type: 'support_ticket',
              ticketId: input.ticketId,
              category: input.issue.category,
              priority: input.customerInfo.priority,
              customerEmail: input.customerInfo.email,
              resolved: result.data?.resolved || false,
              responseTime: result.performance || 0,
              result: result.data,
            },
          },
        });

        ctx.logger.info('Support ticket handled', {
          ticketId: input.ticketId,
          category: input.issue.category,
          priority: input.customerInfo.priority,
          resolved: result.data?.resolved || false,
          userId: ctx.session.user.id,
        });

        return {
          ticketId: input.ticketId,
          response: result.data?.response || '',
          status: result.data?.status || 'open',
          estimatedResolutionTime: result.data?.estimatedResolutionTime || null,
          nextSteps: result.data?.nextSteps || [],
          escalated: result.data?.escalated || false,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to handle support ticket', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to handle support ticket',
        });
      }
    }),

  // Generate FAQ responses
  generateFAQ: protectedProcedure
    .input(
      z.object({
        category: z.enum(['technical', 'billing', 'general', 'product']),
        questions: z.array(z.string()).min(1).max(20),
        tone: z.enum(['formal', 'friendly', 'concise', 'detailed']).default('friendly'),
        includeLinks: z.boolean().default(true),
        brandGuidelines: z.object({
          companyName: z.string(),
          values: z.array(z.string()).optional(),
          prohibitedWords: z.array(z.string()).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('support-agent', {
          task: 'generate_faq',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          faqs: result.data?.faqs || [],
          category: input.category,
          generatedCount: result.data?.faqs?.length || 0,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate FAQ', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate FAQ',
        });
      }
    }),

  // Create chatbot responses
  createChatbotFlow: protectedProcedure
    .input(
      z.object({
        flowName: z.string().min(1).max(100),
        triggers: z.array(z.string()).min(1).max(20),
        responses: z.array(z.object({
          condition: z.string(),
          message: z.string(),
          actions: z.array(z.string()).optional(),
          followUpQuestions: z.array(z.string()).optional(),
        })).min(1).max(50),
        fallbackMessage: z.string(),
        escalationTriggers: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('support-agent', {
          task: 'create_chatbot_flow',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Store chatbot flow configuration
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            type: 'PERFORMANCE',
            data: {
              type: 'chatbot_flow',
              flowName: input.flowName,
              triggerCount: input.triggers.length,
              responseCount: input.responses.length,
              configuration: input,
              result: result.data,
            },
          },
        });

        return {
          flowId: result.data?.flowId || '',
          flowName: input.flowName,
          status: result.data?.status || 'active',
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to create chatbot flow', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create chatbot flow',
        });
      }
    }),

  // Analyze support sentiment
  analyzeSentiment: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
        category: z.enum(['technical', 'billing', 'general', 'complaint', 'feature_request']).optional(),
        includeResolutionData: z.boolean().default(true),
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
            equals: 'support_sentiment',
          },
        };

        if (input.category) {
          where.data.path = ['category'];
          where.data.equals = input.category;
        }

        const analytics = await ctx.prisma.analytics.findMany({
          where,
          orderBy: { date: 'desc' },
        });

        // Aggregate sentiment data
        const sentimentData = analytics.reduce((acc: any, analytic) => {
          const data = analytic.data as any;
          acc.positive += data.positive || 0;
          acc.neutral += data.neutral || 0;
          acc.negative += data.negative || 0;
          acc.total += data.total || 0;
          
          if (data.resolved !== undefined) {
            acc.resolved += data.resolved ? 1 : 0;
            acc.resolutionCount += 1;
          }

          return acc;
        }, {
          positive: 0,
          neutral: 0,
          negative: 0,
          total: 0,
          resolved: 0,
          resolutionCount: 0,
        });

        // Calculate percentages
        const positiveRate = sentimentData.total > 0 ? (sentimentData.positive / sentimentData.total) * 100 : 0;
        const neutralRate = sentimentData.total > 0 ? (sentimentData.neutral / sentimentData.total) * 100 : 0;
        const negativeRate = sentimentData.total > 0 ? (sentimentData.negative / sentimentData.total) * 100 : 0;
        const resolutionRate = sentimentData.resolutionCount > 0 ? (sentimentData.resolved / sentimentData.resolutionCount) * 100 : 0;

        return {
          timeRange: input.timeRange,
          category: input.category,
          sentiment: {
            positive: {
              count: sentimentData.positive,
              percentage: Math.round(positiveRate * 100) / 100,
            },
            neutral: {
              count: sentimentData.neutral,
              percentage: Math.round(neutralRate * 100) / 100,
            },
            negative: {
              count: sentimentData.negative,
              percentage: Math.round(negativeRate * 100) / 100,
            },
          },
          resolution: input.includeResolutionData ? {
            resolved: sentimentData.resolved,
            total: sentimentData.resolutionCount,
            rate: Math.round(resolutionRate * 100) / 100,
          } : undefined,
          trends: analytics.map(a => ({
            date: a.date,
            sentiment: a.data,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to analyze support sentiment', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze support sentiment',
        });
      }
    }),

  // WhatsApp integration
  sendWhatsAppMessage: protectedProcedure
    .input(
      z.object({
        recipient: z.string().min(1),
        message: z.object({
          text: z.string().min(1).max(1600),
          mediaUrl: z.string().url().optional(),
          mediaType: z.enum(['image', 'document', 'audio', 'video']).optional(),
        }),
        templateId: z.string().optional(),
        variables: z.record(z.string()).optional(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('support-agent', {
          task: 'send_whatsapp',
          context: {
            recipient: input.recipient,
            message: input.message,
            templateId: input.templateId,
            variables: input.variables,
            campaignId: input.campaignId,
          },
          priority: 'high',
          metadata: { userId: ctx.session.user.id },
        });

        // Record WhatsApp analytics
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            campaignId: input.campaignId,
            type: 'PERFORMANCE',
            data: {
              type: 'whatsapp_message',
              recipient: input.recipient,
              messageLength: input.message.text.length,
              hasMedia: !!input.message.mediaUrl,
              templateUsed: !!input.templateId,
              result: result.data,
            },
          },
        });

        return {
          success: result.success,
          messageId: result.data?.messageId || '',
          status: result.data?.status || 'sent',
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to send WhatsApp message', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send WhatsApp message',
        });
      }
    }),

  // Get support performance metrics
  getPerformanceMetrics: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
        category: z.enum(['technical', 'billing', 'general', 'complaint', 'feature_request']).optional(),
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
            equals: 'support_ticket',
          },
        };

        if (input.category) {
          where.data.path = ['category'];
          where.data.equals = input.category;
        }

        const analytics = await ctx.prisma.analytics.findMany({
          where,
          orderBy: { date: 'desc' },
        });

        // Calculate performance metrics
        const metrics = analytics.reduce((acc: any, analytic) => {
          const data = analytic.data as any;
          acc.totalTickets += 1;
          acc.resolvedTickets += data.resolved ? 1 : 0;
          acc.totalResponseTime += data.responseTime || 0;
          acc.escalatedTickets += data.escalated ? 1 : 0;

          // Count by priority
          acc.priorityBreakdown[data.priority] = (acc.priorityBreakdown[data.priority] || 0) + 1;
          
          // Count by category
          acc.categoryBreakdown[data.category] = (acc.categoryBreakdown[data.category] || 0) + 1;

          return acc;
        }, {
          totalTickets: 0,
          resolvedTickets: 0,
          totalResponseTime: 0,
          escalatedTickets: 0,
          priorityBreakdown: {},
          categoryBreakdown: {},
        });

        const avgResponseTime = metrics.totalTickets > 0 ? metrics.totalResponseTime / metrics.totalTickets : 0;
        const resolutionRate = metrics.totalTickets > 0 ? (metrics.resolvedTickets / metrics.totalTickets) * 100 : 0;
        const escalationRate = metrics.totalTickets > 0 ? (metrics.escalatedTickets / metrics.totalTickets) * 100 : 0;

        return {
          timeRange: input.timeRange,
          category: input.category,
          summary: {
            totalTickets: metrics.totalTickets,
            resolvedTickets: metrics.resolvedTickets,
            resolutionRate: Math.round(resolutionRate * 100) / 100,
            avgResponseTime: Math.round(avgResponseTime * 100) / 100,
            escalationRate: Math.round(escalationRate * 100) / 100,
          },
          breakdown: {
            priority: metrics.priorityBreakdown,
            category: metrics.categoryBreakdown,
          },
          trends: analytics.map(a => ({
            date: a.date,
            data: a.data,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to get support performance metrics', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get support performance metrics',
        });
      }
    }),
});