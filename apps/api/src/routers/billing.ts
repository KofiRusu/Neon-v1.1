import { z } from 'zod';
import { router, publicProcedure } from '../trpc/trpc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility function to calculate cost from tokens
const calculateCost = (tokensUsed: number, agentType: string): number => {
  const costPerToken = {
    CONTENT: 0.002,
    SEO: 0.001,
    EMAIL_MARKETING: 0.0015,
    SOCIAL_POSTING: 0.0015,
    CUSTOMER_SUPPORT: 0.001,
    AD: 0.003,
    OUTREACH: 0.002,
    TREND: 0.0025,
    INSIGHT: 0.003,
    DESIGN: 0.004,
    BRAND_VOICE: 0.002,
  };

  return (costPerToken[agentType as keyof typeof costPerToken] || 0.002) * tokensUsed;
};

export const billingRouter = router({
  // Log agent cost usage
  logAgentCost: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        agentType: z.string(),
        tokensUsed: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const cost = calculateCost(input.tokensUsed, input.agentType);

      const billingLog = await prisma.billingLog.create({
        data: {
          campaignId: input.campaignId,
          agentType: input.agentType,
          tokensUsed: input.tokensUsed,
          cost,
          metadata: {
            costPerToken: cost / input.tokensUsed,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Update monthly budget spent amount
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      await prisma.monthlyBudget.upsert({
        where: { month: currentMonth },
        update: {
          spent: {
            increment: cost,
          },
        },
        create: {
          month: currentMonth,
          amount: 1000.0, // Default budget
          spent: cost,
        },
      });

      return billingLog;
    }),

  // Get campaign spend summary
  getCampaignSpend: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where = {
        campaignId: input.campaignId,
        ...(input.startDate &&
          input.endDate && {
            timestamp: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const logs = await prisma.billingLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        include: {
          campaign: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      const totalCost = logs.reduce((sum: number, log: any) => sum + log.cost, 0);
      const totalTokens = logs.reduce((sum: number, log: any) => sum + log.tokensUsed, 0);

      const agentBreakdown = logs.reduce(
        (acc: Record<string, { cost: number; tokens: number; executions: number }>, log: any) => {
          if (!acc[log.agentType]) {
            acc[log.agentType] = { cost: 0, tokens: 0, executions: 0 };
          }
          acc[log.agentType].cost += log.cost;
          acc[log.agentType].tokens += log.tokensUsed;
          acc[log.agentType].executions += 1;
          return acc;
        },
        {} as Record<string, { cost: number; tokens: number; executions: number }>
      );

      return {
        campaignId: input.campaignId,
        campaignName: logs[0]?.campaign?.name || 'Unknown',
        totalCost,
        totalTokens,
        executionCount: logs.length,
        agentBreakdown,
        logs,
      };
    }),

  // Get monthly spend summary
  getMonthlySpendSummary: publicProcedure
    .input(
      z.object({
        month: z.string().optional(), // YYYY-MM format
      })
    )
    .query(async ({ input }) => {
      const targetMonth = input.month || new Date().toISOString().slice(0, 7);

      const monthlyBudget = await prisma.monthlyBudget.findUnique({
        where: { month: targetMonth },
      });

      const logs = await prisma.billingLog.findMany({
        where: {
          timestamp: {
            gte: new Date(`${targetMonth}-01`),
            lt: new Date(`${targetMonth}-31T23:59:59.999Z`),
          },
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      });

      const totalSpent = logs.reduce((sum: number, log: any) => sum + log.cost, 0);
      const budgetAmount = monthlyBudget?.amount || 1000.0;
      const utilizationPercentage = (totalSpent / budgetAmount) * 100;

      const campaignBreakdown = logs.reduce(
        (acc: Record<string, any>, log: any) => {
          const campaignId = log.campaignId;
          if (!acc[campaignId]) {
            acc[campaignId] = {
              id: campaignId,
              name: log.campaign?.name || 'Unknown',
              type: log.campaign?.type || 'UNKNOWN',
              cost: 0,
              tokens: 0,
              executions: 0,
              agents: {},
            };
          }
          acc[campaignId].cost += log.cost;
          acc[campaignId].tokens += log.tokensUsed;
          acc[campaignId].executions += 1;

          if (!acc[campaignId].agents[log.agentType]) {
            acc[campaignId].agents[log.agentType] = { cost: 0, tokens: 0, executions: 0 };
          }
          acc[campaignId].agents[log.agentType].cost += log.cost;
          acc[campaignId].agents[log.agentType].tokens += log.tokensUsed;
          acc[campaignId].agents[log.agentType].executions += 1;

          return acc;
        },
        {} as Record<string, any>
      );

      return {
        month: targetMonth,
        budgetAmount,
        totalSpent,
        remainingBudget: budgetAmount - totalSpent,
        utilizationPercentage,
        isOverBudget: totalSpent > budgetAmount,
        isNearBudget: utilizationPercentage >= 90,
        campaignBreakdown: Object.values(campaignBreakdown),
        totalExecutions: logs.length,
      };
    }),

  // Set monthly budget cap
  setMonthlyBudgetCap: publicProcedure
    .input(
      z.object({
        month: z.string(), // YYYY-MM format
        amount: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const monthlyBudget = await prisma.monthlyBudget.upsert({
        where: { month: input.month },
        update: {
          amount: input.amount,
        },
        create: {
          month: input.month,
          amount: input.amount,
          spent: 0,
        },
      });

      return monthlyBudget;
    }),

  // Get all campaigns with their spend
  getAllCampaignsSpend: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where = {
        ...(input.startDate &&
          input.endDate && {
            timestamp: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const campaigns = await prisma.campaign.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          budget: true,
          createdAt: true,
          billingLogs: {
            where: {
              ...(input.startDate &&
                input.endDate && {
                  timestamp: {
                    gte: input.startDate,
                    lte: input.endDate,
                  },
                }),
            },
            select: {
              cost: true,
              tokensUsed: true,
              agentType: true,
              timestamp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return campaigns.map(campaign => {
        const totalCost = campaign.billingLogs.reduce((sum, log) => sum + log.cost, 0);
        const totalTokens = campaign.billingLogs.reduce((sum, log) => sum + log.tokensUsed, 0);
        const budgetUtilization = campaign.budget ? (totalCost / campaign.budget) * 100 : 0;

        return {
          ...campaign,
          totalCost,
          totalTokens,
          executionCount: campaign.billingLogs.length,
          budgetUtilization,
          isOverBudget: campaign.budget ? totalCost > campaign.budget : false,
        };
      });
    }),
});
