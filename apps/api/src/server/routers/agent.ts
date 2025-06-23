import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentManager } from '@neonhub/core-agents';

const agentManager = new AgentManager();

export const agentRouter = createTRPCRouter({
  // Get all available agents
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const agents = await ctx.prisma.agent.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return agents;
    } catch (error) {
      ctx.logger.error('Failed to fetch agents:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch agents',
      });
    }
  }),

  // Get agent by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const agent = await ctx.prisma.agent.findUnique({
          where: { id: input.id },
          include: {
            executions: {
              orderBy: { startedAt: 'desc' },
              take: 10,
            },
          },
        });

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          });
        }

        return agent;
      } catch (error) {
        ctx.logger.error('Failed to fetch agent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch agent',
        });
      }
    }),

  // Execute agent task
  execute: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        task: z.string(),
        payload: z.record(z.any()).optional(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create execution record
        const execution = await ctx.prisma.agentExecution.create({
          data: {
            agentId: input.agentId,
            campaignId: input.campaignId,
            userId: ctx.session.user.id,
            task: input.task,
            payload: input.payload || {},
            status: 'RUNNING',
          },
        });

        // Execute the agent
        const agent = agentManager.getAgent(input.agentId);
        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          });
        }

        const result = await agent.execute({
          task: input.task,
          context: input.payload || {},
          priority: 'medium',
          metadata: { executionId: execution.id },
        });

        // Update execution with result
        const updatedExecution = await ctx.prisma.agentExecution.update({
          where: { id: execution.id },
          data: {
            result: result.data,
            status: result.success ? 'COMPLETED' : 'FAILED',
            error: result.success ? null : result.error,
            performance: result.performance,
            completedAt: new Date(),
          },
        });

        ctx.logger.info(`Agent ${input.agentId} executed task ${input.task}`, {
          executionId: execution.id,
          success: result.success,
        });

        return {
          execution: updatedExecution,
          result: result.data,
          success: result.success,
        };
      } catch (error) {
        ctx.logger.error('Failed to execute agent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute agent',
        });
      }
    }),

  // Get agent execution history
  getExecutions: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        campaignId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {};
        if (input.agentId) where.agentId = input.agentId;
        if (input.campaignId) where.campaignId = input.campaignId;
        where.userId = ctx.session.user.id;

        const executions = await ctx.prisma.agentExecution.findMany({
          where,
          include: {
            agent: true,
            campaign: true,
          },
          orderBy: { startedAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        });

        const total = await ctx.prisma.agentExecution.count({ where });

        return {
          executions,
          total,
          hasMore: total > input.offset + input.limit,
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch executions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch executions',
        });
      }
    }),

  // Get agent performance metrics
  getMetrics: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
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

        const executions = await ctx.prisma.agentExecution.findMany({
          where: {
            agentId: input.agentId,
            userId: ctx.session.user.id,
            startedAt: {
              gte: startDate,
            },
          },
          select: {
            status: true,
            performance: true,
            startedAt: true,
            completedAt: true,
          },
        });

        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter(e => e.status === 'COMPLETED').length;
        const failedExecutions = executions.filter(e => e.status === 'FAILED').length;
        const avgPerformance = executions
          .filter((e): e is typeof e & { performance: number } => e.performance !== null)
          .reduce((acc: number, e) => acc + e.performance, 0) / totalExecutions || 0;

        const avgExecutionTime = executions
          .filter((e): e is typeof e & { completedAt: Date } => e.completedAt !== null)
          .reduce((acc: number, e) => {
            const duration = e.completedAt.getTime() - e.startedAt.getTime();
            return acc + duration;
          }, 0) / totalExecutions || 0;

        return {
          totalExecutions,
          successfulExecutions,
          failedExecutions,
          successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
          avgPerformance,
          avgExecutionTime: Math.round(avgExecutionTime / 1000), // Convert to seconds
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch agent metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch agent metrics',
        });
      }
    }),
});