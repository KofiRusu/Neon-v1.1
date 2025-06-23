import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentManager } from '@neonhub/core-agents';

const agentManager = new AgentManager();

export const emailRouter = createTRPCRouter({
  // Send email campaign
  sendCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        emailTemplate: z.object({
          subject: z.string().min(1).max(200),
          htmlContent: z.string().min(1),
          textContent: z.string().optional(),
          fromName: z.string().min(1).max(100),
          fromEmail: z.string().email(),
        }),
        recipients: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
          metadata: z.record(z.any()).optional(),
        })).min(1).max(1000),
        scheduleAt: z.date().optional(),
        testMode: z.boolean().default(false),
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

        const result = await agentManager.executeAgent('email-agent', {
          task: 'send_campaign',
          context: {
            template: input.emailTemplate,
            recipients: input.recipients,
            scheduleAt: input.scheduleAt,
            testMode: input.testMode,
            campaignId: input.campaignId,
          },
          priority: 'high',
          metadata: { userId: ctx.session.user.id },
        });

        // Record analytics
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            campaignId: input.campaignId,
            type: 'PERFORMANCE',
            data: {
              type: 'email_campaign',
              recipientCount: input.recipients.length,
              subject: input.emailTemplate.subject,
              scheduled: input.scheduleAt ? true : false,
              testMode: input.testMode,
              result: result.data,
            },
          },
        });

        ctx.logger.info('Email campaign sent', {
          campaignId: input.campaignId,
          recipientCount: input.recipients.length,
          testMode: input.testMode,
          userId: ctx.session.user.id,
        });

        return {
          success: result.success,
          campaignId: input.campaignId,
          sentCount: result.data?.sentCount || 0,
          failedCount: result.data?.failedCount || 0,
          scheduledFor: input.scheduleAt,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to send email campaign', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email campaign',
        });
      }
    }),

  // Generate email template
  generateTemplate: protectedProcedure
    .input(
      z.object({
        type: z.enum(['newsletter', 'promotional', 'welcome', 'follow-up', 'reminder', 'announcement']),
        brand: z.object({
          name: z.string().min(1).max(100),
          logo: z.string().url().optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
        }),
        content: z.object({
          headline: z.string().min(1).max(200),
          message: z.string().min(1),
          ctaText: z.string().min(1).max(50),
          ctaUrl: z.string().url(),
          footerText: z.string().optional(),
        }),
        personalization: z.boolean().default(true),
        mobileOptimized: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('email-agent', {
          task: 'generate_template',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          htmlTemplate: result.data?.htmlTemplate || '',
          textTemplate: result.data?.textTemplate || '',
          subject: result.data?.subject || input.content.headline,
          previewText: result.data?.previewText || '',
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate email template', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate email template',
        });
      }
    }),

  // Create email sequence
  createSequence: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        trigger: z.enum(['signup', 'purchase', 'abandon_cart', 'birthday', 'custom']),
        emails: z.array(z.object({
          delay: z.number().min(0), // Days after trigger
          subject: z.string().min(1).max(200),
          content: z.string().min(1),
          conditions: z.record(z.any()).optional(),
        })).min(1).max(10),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('email-agent', {
          task: 'create_sequence',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Store sequence configuration
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            campaignId: input.campaignId,
            type: 'PERFORMANCE',
            data: {
              type: 'email_sequence',
              name: input.name,
              trigger: input.trigger,
              emailCount: input.emails.length,
              configuration: input.emails,
              result: result.data,
            },
          },
        });

        return {
          sequenceId: result.data?.sequenceId || '',
          emailCount: input.emails.length,
          trigger: input.trigger,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to create email sequence', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create email sequence',
        });
      }
    }),

  // Track email performance
  trackPerformance: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().optional(),
        emailId: z.string().optional(),
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
          date: { gte: startDate },
          data: {
            path: ['type'],
            equals: 'email_performance',
          },
        };

        if (input.campaignId) {
          where.campaignId = input.campaignId;
        }

        const analytics = await ctx.prisma.analytics.findMany({
          where,
          orderBy: { date: 'desc' },
        });

        // Aggregate performance metrics
        const performance = analytics.reduce((acc, analytic) => {
          const data = analytic.data as any;
          acc.sent += data.sent || 0;
          acc.delivered += data.delivered || 0;
          acc.opened += data.opened || 0;
          acc.clicked += data.clicked || 0;
          acc.bounced += data.bounced || 0;
          acc.unsubscribed += data.unsubscribed || 0;
          return acc;
        }, {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
        });

        // Calculate rates
        const deliveryRate = performance.sent > 0 ? (performance.delivered / performance.sent) * 100 : 0;
        const openRate = performance.delivered > 0 ? (performance.opened / performance.delivered) * 100 : 0;
        const clickRate = performance.delivered > 0 ? (performance.clicked / performance.delivered) * 100 : 0;
        const bounceRate = performance.sent > 0 ? (performance.bounced / performance.sent) * 100 : 0;
        const unsubscribeRate = performance.delivered > 0 ? (performance.unsubscribed / performance.delivered) * 100 : 0;

        return {
          timeRange: input.timeRange,
          performance,
          rates: {
            delivery: Math.round(deliveryRate * 100) / 100,
            open: Math.round(openRate * 100) / 100,
            click: Math.round(clickRate * 100) / 100,
            bounce: Math.round(bounceRate * 100) / 100,
            unsubscribe: Math.round(unsubscribeRate * 100) / 100,
          },
          trends: analytics.map(a => ({
            date: a.date,
            data: a.data,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to track email performance', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to track email performance',
        });
      }
    }),

  // Manage email lists
  manageLists: protectedProcedure
    .input(
      z.object({
        action: z.enum(['create', 'update', 'delete', 'add_contacts', 'remove_contacts']),
        listId: z.string().optional(),
        listName: z.string().optional(),
        contacts: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
          metadata: z.record(z.any()).optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('email-agent', {
          task: 'manage_lists',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        ctx.logger.info('Email list managed', {
          action: input.action,
          listId: input.listId,
          contactCount: input.contacts?.length || 0,
          userId: ctx.session.user.id,
        });

        return {
          success: result.success,
          listId: result.data?.listId || input.listId,
          contactCount: result.data?.contactCount || 0,
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to manage email lists', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to manage email lists',
        });
      }
    }),
});