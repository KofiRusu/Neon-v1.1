import { EmailMarketingAgent } from "@neon/core-agents";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const emailRouter = createTRPCRouter({
  sendCampaign: publicProcedure
    .input(z.object({
      name: z.string(),
      subject: z.string(),
      content: z.object({
        html: z.string().optional(),
        text: z.string(),
        template: z.string().optional(),
      }),
      recipients: z.object({
        emails: z.array(z.string()),
        segments: z.array(z.string()).optional(),
        excludeList: z.array(z.string()).optional(),
      }),
      scheduling: z.object({
        sendImmediately: z.boolean().optional(),
        scheduledAt: z.date().optional(),
        timezone: z.string().optional(),
      }),
      settings: z.object({
        trackOpens: z.boolean().optional(),
        trackClicks: z.boolean().optional(),
        replyTo: z.string().optional(),
        fromName: z.string().optional(),
        fromEmail: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const emailAgent = new EmailMarketingAgent();
      return await emailAgent.sendCampaign(input);
    }),

  createSequence: publicProcedure
    .input(z.object({
      name: z.string(),
      trigger: z.enum(['signup', 'purchase', 'abandon_cart', 'manual']),
      emails: z.array(z.object({
        subject: z.string(),
        content: z.object({
          html: z.string().optional(),
          text: z.string(),
          template: z.string().optional(),
        }),
        delayDays: z.number(),
        conditions: z.record(z.any()).optional(),
      })),
      settings: z.object({
        trackOpens: z.boolean().optional(),
        trackClicks: z.boolean().optional(),
        replyTo: z.string().optional(),
        fromName: z.string().optional(),
        fromEmail: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const emailAgent = new EmailMarketingAgent();
      return await emailAgent.createSequence(input);
    }),

  getAnalytics: publicProcedure
    .input(z.object({
      campaignId: z.string(),
    }))
    .query(async ({ input }) => {
      const emailAgent = new EmailMarketingAgent();
      return await emailAgent.getAnalytics(input.campaignId);
    }),

  manageList: publicProcedure
    .input(z.object({
      action: z.enum(['create_list', 'add_subscribers', 'remove_subscribers', 'clean_list']),
      listId: z.string().optional(),
      listName: z.string().optional(),
      emails: z.array(z.string()).optional(),
      totalCount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const emailAgent = new EmailMarketingAgent();
      return await emailAgent.execute({
        task: 'manage_lists',
        context: input,
        priority: 'medium'
      });
    }),

  runABTest: publicProcedure
    .input(z.object({
      variants: z.array(z.object({
        name: z.string(),
        subject: z.string(),
        content: z.any(),
      })),
      splitRatio: z.array(z.number()),
      testDuration: z.number(),
    }))
    .mutation(async ({ input }) => {
      const emailAgent = new EmailMarketingAgent();
      return await emailAgent.execute({
        task: 'a_b_testing',
        context: input,
        priority: 'medium'
      });
    }),

  getEmailTemplates: publicProcedure
    .query(async () => {
      // Return predefined email templates
      return {
        data: [
          {
            id: 'welcome',
            name: 'Welcome Email',
            subject: 'Welcome to {{company_name}}!',
            content: {
              html: '<h1>Welcome {{first_name}}!</h1><p>Thank you for joining us.</p>',
              text: 'Welcome {{first_name}}! Thank you for joining us.',
            },
            variables: ['company_name', 'first_name'],
          },
          {
            id: 'newsletter',
            name: 'Newsletter Template',
            subject: '{{company_name}} Weekly Newsletter',
            content: {
              html: '<h1>This Week at {{company_name}}</h1><div>{{newsletter_content}}</div>',
              text: 'This Week at {{company_name}}\n\n{{newsletter_content}}',
            },
            variables: ['company_name', 'newsletter_content'],
          },
          {
            id: 'abandoned_cart',
            name: 'Abandoned Cart Recovery',
            subject: 'You left something in your cart',
            content: {
              html: '<h2>Don\'t miss out!</h2><p>Complete your purchase for {{product_name}}</p>',
              text: 'Don\'t miss out! Complete your purchase for {{product_name}}',
            },
            variables: ['product_name'],
          },
        ],
      };
    }),
}); 