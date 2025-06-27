import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { getRegisteredAgentTypes, executeAgentCommand } from '@neon/core-agents';

// Agent metadata schema
const AgentMetadata = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['content', 'marketing', 'analytics', 'automation', 'support']),
  description: z.string(),
  capabilities: z.array(z.string()),
  version: z.string(),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

// Agent health schema
const AgentHealth = z.object({
  id: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'offline']),
  responseTime: z.number(), // in milliseconds
  lastHealthCheck: z.date(),
  lastRun: z.date().nullable(),
  uptime: z.number(), // percentage
  errorRate: z.number(), // percentage
  performance: z.object({
    avgResponseTime: z.number(),
    successRate: z.number(),
    totalExecutions: z.number(),
    lastExecutionDuration: z.number().nullable(),
  }),
});

// Agent execution log schema
const ExecutionLog = z.object({
  id: z.string(),
  agentId: z.string(),
  action: z.string(),
  startTime: z.date(),
  endTime: z.date().nullable(),
  status: z.enum(['running', 'completed', 'failed', 'cancelled']),
  duration: z.number().nullable(),
  parameters: z.record(z.any()).nullable(),
  result: z.record(z.any()).nullable(),
  error: z.string().nullable(),
});

// Mock data generator for development
function generateMockAgentMetadata(): Array<z.infer<typeof AgentMetadata>> {
  const agentTypes = getRegisteredAgentTypes();

  const agentConfigs = {
    content: {
      name: 'Content Generator',
      category: 'content' as const,
      capabilities: ['generate_content', 'generate_blog', 'generate_caption'],
    },
    seo: {
      name: 'SEO Optimizer',
      category: 'marketing' as const,
      capabilities: ['analyze_seo', 'optimize_content', 'keyword_research'],
    },
    ad: {
      name: 'Ad Campaign Manager',
      category: 'marketing' as const,
      capabilities: ['create_ad', 'optimize_campaign', 'budget_allocation'],
    },
    outreach: {
      name: 'Outreach Coordinator',
      category: 'marketing' as const,
      capabilities: ['send_emails', 'follow_up', 'lead_qualification'],
    },
    trend: {
      name: 'Trend Analyzer',
      category: 'analytics' as const,
      capabilities: ['analyze_trends', 'predict_performance', 'market_insights'],
    },
    insight: {
      name: 'Insight Generator',
      category: 'analytics' as const,
      capabilities: ['analyze_metrics', 'generate_insights', 'performance_reports'],
    },
    design: {
      name: 'Design Assistant',
      category: 'content' as const,
      capabilities: ['generate_visuals', 'optimize_layout', 'brand_consistency'],
    },
    email: {
      name: 'Email Marketing',
      category: 'marketing' as const,
      capabilities: ['create_campaigns', 'segment_audience', 'a_b_testing'],
    },
    support: {
      name: 'Customer Support',
      category: 'support' as const,
      capabilities: ['handle_tickets', 'live_chat', 'knowledge_base'],
    },
    'error-sentinel': {
      name: 'Error Sentinel',
      category: 'automation' as const,
      capabilities: ['monitor_errors', 'auto_recovery', 'alert_management'],
    },
    campaign: {
      name: 'Campaign Manager',
      category: 'automation' as const,
      capabilities: ['plan_campaign', 'execute_campaign', 'analyze_results'],
    },
    'llm-copilot': {
      name: 'AI Copilot',
      category: 'automation' as const,
      capabilities: ['process_message', 'intelligent_assistance', 'context_awareness'],
    },
    boardroom: {
      name: 'Boardroom Reports',
      category: 'analytics' as const,
      capabilities: ['generate_report', 'executive_summary', 'data_visualization'],
    },
    executive: {
      name: 'Executive Compiler',
      category: 'analytics' as const,
      capabilities: ['compile_reports', 'strategic_insights', 'performance_tracking'],
    },
    'boardroom-scheduler': {
      name: 'Report Scheduler',
      category: 'automation' as const,
      capabilities: ['schedule_reports', 'automated_delivery', 'recurring_tasks'],
    },
    'brand-voice': {
      name: 'Brand Voice',
      category: 'content' as const,
      capabilities: ['voice_analysis', 'brand_alignment', 'consistency_check'],
    },
    'social-media': {
      name: 'Social Media',
      category: 'marketing' as const,
      capabilities: ['post_content', 'engagement_tracking', 'audience_analysis'],
    },
  };

  return agentTypes.map(type => {
    const config = agentConfigs[type as keyof typeof agentConfigs] || {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      category: 'automation' as const,
      capabilities: ['generic_action'],
    };

    return {
      id: type,
      name: config.name,
      category: config.category,
      description: `AI-powered ${config.name.toLowerCase()} with advanced automation capabilities`,
      capabilities: config.capabilities,
      version: '2.1.0',
      status: 'active' as const,
    };
  });
}

function generateMockHealthData(
  agents: Array<z.infer<typeof AgentMetadata>>
): Array<z.infer<typeof AgentHealth>> {
  return agents.map(agent => {
    const now = new Date();
    const isHealthy = Math.random() > 0.15; // 85% healthy
    const isDegraded = !isHealthy && Math.random() > 0.3; // 70% of unhealthy are degraded

    let status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    if (Math.random() > 0.95) status = 'offline';
    else if (isHealthy) status = 'healthy';
    else if (isDegraded) status = 'degraded';
    else status = 'unhealthy';

    const baseResponseTime = status === 'healthy' ? 150 : status === 'degraded' ? 400 : 800;
    const responseTime = baseResponseTime + Math.random() * 200;

    return {
      id: agent.id,
      status,
      responseTime: Math.round(responseTime),
      lastHealthCheck: new Date(now.getTime() - Math.random() * 60000), // Last minute
      lastRun: Math.random() > 0.1 ? new Date(now.getTime() - Math.random() * 3600000) : null, // Last hour or null
      uptime: status === 'offline' ? 0 : Math.round((0.85 + Math.random() * 0.14) * 100),
      errorRate:
        status === 'healthy'
          ? Math.random() * 2
          : status === 'degraded'
            ? 2 + Math.random() * 8
            : 10 + Math.random() * 20,
      performance: {
        avgResponseTime: Math.round(responseTime * (0.8 + Math.random() * 0.4)),
        successRate:
          status === 'healthy'
            ? 95 + Math.random() * 5
            : status === 'degraded'
              ? 80 + Math.random() * 15
              : 60 + Math.random() * 20,
        totalExecutions: Math.round(100 + Math.random() * 500),
        lastExecutionDuration: Math.random() > 0.2 ? Math.round(100 + Math.random() * 300) : null,
      },
    };
  });
}

function generateMockExecutionLogs(agentId: string): Array<z.infer<typeof ExecutionLog>> {
  const actions = {
    content: ['generate_content', 'generate_blog', 'generate_caption'],
    seo: ['analyze_seo', 'optimize_content', 'keyword_research'],
    ad: ['create_ad', 'optimize_campaign', 'budget_allocation'],
    trend: ['analyze_trends', 'predict_performance'],
    insight: ['analyze_metrics', 'generate_insights'],
  };

  const agentActions = actions[agentId as keyof typeof actions] || [
    'execute',
    'analyze',
    'process',
  ];
  const logs: Array<z.infer<typeof ExecutionLog>> = [];

  for (let i = 0; i < 5; i++) {
    const startTime = new Date(Date.now() - Math.random() * 86400000); // Last 24 hours
    const duration = 1000 + Math.random() * 5000;
    const endTime = new Date(startTime.getTime() + duration);
    const status = Math.random() > 0.1 ? 'completed' : Math.random() > 0.5 ? 'failed' : 'running';

    logs.push({
      id: `exec_${agentId}_${i}`,
      agentId,
      action: agentActions[Math.floor(Math.random() * agentActions.length)],
      startTime,
      endTime: status === 'running' ? null : endTime,
      status: status as any,
      duration: status === 'running' ? null : Math.round(duration),
      parameters: { input: 'sample parameters' },
      result: status === 'completed' ? { output: 'sample result', confidence: 0.85 } : null,
      error: status === 'failed' ? 'Sample error message' : null,
    });
  }

  return logs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

export const agentRouter = createTRPCRouter({
  // Get all registered agents metadata
  getAllAgents: publicProcedure.query(async () => {
    try {
      const agents = generateMockAgentMetadata();
      return {
        success: true,
        data: agents,
        count: agents.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch agents: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }),

  // Get health status for a specific agent
  getAgentHealth: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const agents = generateMockAgentMetadata();
      const agent = agents.find(a => a.id === input.id);

      if (!agent) {
        throw new Error(`Agent with id ${input.id} not found`);
      }

      const healthData = generateMockHealthData([agent])[0];
      return {
        success: true,
        data: healthData,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch agent health: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }),

  // Get health status for all agents
  getAllAgentHealth: publicProcedure.query(async () => {
    try {
      const agents = generateMockAgentMetadata();
      const healthData = generateMockHealthData(agents);

      return {
        success: true,
        data: healthData,
        summary: {
          total: healthData.length,
          healthy: healthData.filter(h => h.status === 'healthy').length,
          degraded: healthData.filter(h => h.status === 'degraded').length,
          unhealthy: healthData.filter(h => h.status === 'unhealthy').length,
          offline: healthData.filter(h => h.status === 'offline').length,
          avgResponseTime: Math.round(
            healthData.reduce((sum, h) => sum + h.responseTime, 0) / healthData.length
          ),
          avgUptime: Math.round(
            healthData.reduce((sum, h) => sum + h.uptime, 0) / healthData.length
          ),
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch agent health data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }),

  // Get execution logs for a specific agent
  getAgentLogs: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().optional().default(10),
        status: z.enum(['running', 'completed', 'failed', 'cancelled']).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let logs = generateMockExecutionLogs(input.id);

        if (input.status) {
          logs = logs.filter(log => log.status === input.status);
        }

        logs = logs.slice(0, input.limit);

        return {
          success: true,
          data: logs,
          count: logs.length,
        };
      } catch (error) {
        throw new Error(
          `Failed to fetch agent logs: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  // Execute a health check on a specific agent
  performHealthCheck: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const startTime = Date.now();

        // Simulate health check execution
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const responseTime = Date.now() - startTime;
        const isHealthy = Math.random() > 0.2; // 80% success rate

        return {
          success: true,
          data: {
            agentId: input.id,
            status: isHealthy ? 'healthy' : 'degraded',
            responseTime,
            timestamp: new Date(),
            details: {
              memoryUsage: Math.round(Math.random() * 100),
              cpuUsage: Math.round(Math.random() * 50),
              activeConnections: Math.round(Math.random() * 10),
            },
          },
        };
      } catch (error) {
        throw new Error(
          `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  // Execute a command on a specific agent (for testing)
  executeCommand: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        action: z.string(),
        parameters: z.record(z.any()).optional().default({}),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await executeAgentCommand(input.agentId, input.action, input.parameters, {
          userId: 'dashboard-user',
          sessionId: 'dashboard-session',
          permissions: ['execute'],
          environment: 'development',
        });

        return {
          success: result.success,
          data: result.data,
          duration: result.duration,
          error: result.error,
        };
      } catch (error) {
        throw new Error(
          `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),
});

export type AgentRouter = typeof agentRouter;
