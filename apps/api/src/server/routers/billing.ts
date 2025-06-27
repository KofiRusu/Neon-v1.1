import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { prisma } from '@neon/data-model';
import { AgentType } from '@prisma/client';

// Agent cost mapping (cost per 1K tokens)
export const AGENT_COST_PER_1K_TOKENS = {
  CONTENT: 0.04,
  SEO: 0.03,
  EMAIL_MARKETING: 0.05,
  SOCIAL_POSTING: 0.03,
  CUSTOMER_SUPPORT: 0.04,
  AD: 0.06,
  OUTREACH: 0.04,
  TREND: 0.03,
  INSIGHT: 0.05,
  DESIGN: 0.07,
  BRAND_VOICE: 0.04,
  GOAL_PLANNER: 0.05,
  PATTERN_MINER: 0.04,
  SEGMENT_ANALYZER: 0.05,
} as const;

export const billingRouter = createTRPCRouter({
  // Log agent execution cost
  logAgentCost: publicProcedure
    .input(
      z.object({
        agentType: z.nativeEnum(AgentType),
        campaignId: z.string().optional(),
        tokens: z.number().min(0),
        task: z.string().optional(),
        executionId: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { agentType, campaignId, tokens, task, executionId, metadata } = input;

      // Calculate cost based on agent type and tokens
      const costPer1K = AGENT_COST_PER_1K_TOKENS[agentType] || 0.04;
      const cost = (tokens / 1000) * costPer1K;

      // Log the billing entry
      const billingLog = await prisma.billingLog.create({
        data: {
          agentType,
          campaignId,
          tokens,
          cost,
          task,
          executionId,
          metadata,
        },
      });

      // Update campaign cost if campaign is specified
      if (campaignId) {
        const currentMonth = new Date().toISOString().substring(0, 7); // Format: "2024-01"

        await prisma.campaignCost.upsert({
          where: {
            campaignId,
          },
          update: {
            totalCost: {
              increment: cost,
            },
            currentMonth,
          },
          create: {
            campaignId,
            totalCost: cost,
            currentMonth,
          },
        });
      }

      // Update monthly budget
      const currentMonth = new Date().toISOString().substring(0, 7);
      await prisma.monthlyBudget.upsert({
        where: {
          month: currentMonth,
        },
        update: {
          totalSpent: {
            increment: cost,
          },
        },
        create: {
          month: currentMonth,
          totalSpent: cost,
        },
      });

      return billingLog;
    }),

  // Get campaign spend data
  getCampaignSpend: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        month: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { campaignId, month } = input;
      const currentMonth = month || new Date().toISOString().substring(0, 7);

      // Get campaign cost summary
      const campaignCost = await prisma.campaignCost.findUnique({
        where: { campaignId },
        include: { campaign: true },
      });

      // Get detailed billing logs for the campaign
      const billingLogs = await prisma.billingLog.findMany({
        where: {
          campaignId,
          timestamp: {
            gte: new Date(`${currentMonth}-01`),
            lt: new Date(`${currentMonth}-31T23:59:59`),
          },
        },
        orderBy: { timestamp: 'desc' },
      });

      // Group by agent type
      const agentCosts = billingLogs.reduce(
        (acc, log) => {
          const agentType = log.agentType;
          if (!acc[agentType]) {
            acc[agentType] = {
              totalCost: 0,
              totalTokens: 0,
              executions: 0,
            };
          }
          acc[agentType].totalCost += log.cost;
          acc[agentType].totalTokens += log.tokens;
          acc[agentType].executions++;
          return acc;
        },
        {} as Record<string, { totalCost: number; totalTokens: number; executions: number }>
      );

      return {
        campaignCost,
        agentCosts,
        billingLogs,
        totalSpent: billingLogs.reduce((sum, log) => sum + log.cost, 0),
      };
    }),

  // Get agent cost breakdown
  getAgentCosts: publicProcedure
    .input(
      z.object({
        month: z.string().optional(),
        agentType: z.nativeEnum(AgentType).optional(),
      })
    )
    .query(async ({ input }) => {
      const { month, agentType } = input;
      const currentMonth = month || new Date().toISOString().substring(0, 7);

      const whereClause = {
        timestamp: {
          gte: new Date(`${currentMonth}-01`),
          lt: new Date(`${currentMonth}-31T23:59:59`),
        },
        ...(agentType && { agentType }),
      };

      const billingLogs = await prisma.billingLog.findMany({
        where: whereClause,
        include: { campaign: true },
        orderBy: { timestamp: 'desc' },
      });

      // Group by agent type
      const agentSummary = billingLogs.reduce(
        (acc, log) => {
          const type = log.agentType;
          if (!acc[type]) {
            acc[type] = {
              totalCost: 0,
              totalTokens: 0,
              executions: 0,
              campaigns: new Set(),
            };
          }
          acc[type].totalCost += log.cost;
          acc[type].totalTokens += log.tokens;
          acc[type].executions++;
          if (log.campaignId) {
            acc[type].campaigns.add(log.campaignId);
          }
          return acc;
        },
        {} as Record<
          string,
          { totalCost: number; totalTokens: number; executions: number; campaigns: Set<string> }
        >
      );

      // Convert sets to arrays for JSON serialization
      const agentSummaryFormatted = Object.entries(agentSummary).map(([agentType, data]) => ({
        agentType,
        totalCost: data.totalCost,
        totalTokens: data.totalTokens,
        executions: data.executions,
        campaignCount: data.campaigns.size,
        averageCostPerExecution: data.executions > 0 ? data.totalCost / data.executions : 0,
      }));

      return {
        agentSummary: agentSummaryFormatted,
        billingLogs,
        totalSpent: billingLogs.reduce((sum, log) => sum + log.cost, 0),
      };
    }),

  // Get monthly budget summary
  getMonthlySummary: publicProcedure
    .input(
      z.object({
        month: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { month } = input;
      const currentMonth = month || new Date().toISOString().substring(0, 7);

      // Get monthly budget
      const monthlyBudget = await prisma.monthlyBudget.findUnique({
        where: { month: currentMonth },
      });

      // Get all campaigns with costs this month
      const campaignCosts = await prisma.campaignCost.findMany({
        where: { currentMonth },
        include: { campaign: true },
        orderBy: { totalCost: 'desc' },
      });

      // Get billing logs for detailed breakdown
      const billingLogs = await prisma.billingLog.findMany({
        where: {
          timestamp: {
            gte: new Date(`${currentMonth}-01`),
            lt: new Date(`${currentMonth}-31T23:59:59`),
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 50, // Recent 50 transactions
      });

      // Calculate projections
      const currentDate = new Date();
      const monthStart = new Date(`${currentMonth}-01`);
      const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      const daysPassed = Math.max(1, currentDate.getDate() - monthStart.getDate());
      const dailySpendRate = (monthlyBudget?.totalSpent || 0) / daysPassed;
      const projectedSpend = dailySpendRate * daysInMonth;

      return {
        monthlyBudget: monthlyBudget || {
          month: currentMonth,
          totalBudget: 1000,
          totalSpent: 0,
          alertThreshold: 0.8,
          isAlertSent: false,
        },
        campaignCosts,
        billingLogs,
        projectedSpend,
        budgetUtilization: monthlyBudget
          ? (monthlyBudget.totalSpent / monthlyBudget.totalBudget) * 100
          : 0,
        isOverBudget: monthlyBudget ? monthlyBudget.totalSpent > monthlyBudget.totalBudget : false,
        isNearBudget: monthlyBudget
          ? monthlyBudget.totalSpent / monthlyBudget.totalBudget >= monthlyBudget.alertThreshold
          : false,
      };
    }),

  // Update monthly budget
  updateMonthlyBudget: publicProcedure
    .input(
      z.object({
        month: z.string(),
        totalBudget: z.number().min(0),
        alertThreshold: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { month, totalBudget, alertThreshold } = input;

      const updatedBudget = await prisma.monthlyBudget.upsert({
        where: { month },
        update: {
          totalBudget,
          ...(alertThreshold && { alertThreshold }),
        },
        create: {
          month,
          totalBudget,
          alertThreshold: alertThreshold || 0.8,
        },
      });

      return updatedBudget;
    }),

  // Set campaign budget
  setCampaignBudget: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        monthlyBudget: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const { campaignId, monthlyBudget } = input;
      const currentMonth = new Date().toISOString().substring(0, 7);

      const updatedCampaign = await prisma.campaignCost.upsert({
        where: { campaignId },
        update: {
          monthlyBudget,
          currentMonth,
        },
        create: {
          campaignId,
          monthlyBudget,
          currentMonth,
        },
      });

      return updatedCampaign;
    }),

  // Get cost constants
  getCostConstants: publicProcedure.query(async () => {
    return {
      agentCosts: AGENT_COST_PER_1K_TOKENS,
      lastUpdated: new Date().toISOString(),
    };
  }),
});
