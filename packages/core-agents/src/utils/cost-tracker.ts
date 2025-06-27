import { AgentType } from '@prisma/client';

// Define LLM task interface
export interface LLMTaskConfig {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: any;
}

export interface LLMTaskResult {
  response: string;
  tokens: number;
  cost: number;
  metadata?: any;
}

export interface CostTrackingConfig {
  agentType: AgentType;
  campaignId?: string;
  task?: string;
  executionId?: string;
  trackCosts?: boolean;
}

// Agent cost mapping (cost per 1K tokens) - matches billing router
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

// Simple OpenAI API wrapper for cost tracking
class OpenAIWrapper {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async createCompletion(config: LLMTaskConfig): Promise<{ response: string; tokens: number }> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: config.prompt,
            },
          ],
          max_tokens: config.maxTokens || 1000,
          temperature: config.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const tokens = data.usage?.total_tokens || 0;

      return {
        response: content,
        tokens,
      };
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      // Return mock data for development/testing
      return {
        response: 'Mock AI response for cost tracking demonstration',
        tokens: Math.floor(Math.random() * 500) + 100, // Random tokens between 100-600
      };
    }
  }
}

// Cost tracking utility class
export class CostTracker {
  private openai: OpenAIWrapper;
  private billingAPIUrl: string;

  constructor(openaiApiKey?: string, billingAPIUrl?: string) {
    this.openai = new OpenAIWrapper(openaiApiKey);
    this.billingAPIUrl =
      billingAPIUrl || process.env.BILLING_API_URL || 'http://localhost:3001/api/trpc';
  }

  // Main method: run LLM task with cost tracking
  async runLLMTask(
    taskConfig: LLMTaskConfig,
    costConfig: CostTrackingConfig
  ): Promise<LLMTaskResult> {
    const startTime = Date.now();

    try {
      // Execute the LLM task
      const { response, tokens } = await this.openai.createCompletion(taskConfig);

      // Calculate cost
      const costPer1K = AGENT_COST_PER_1K_TOKENS[costConfig.agentType] || 0.04;
      const cost = (tokens / 1000) * costPer1K;

      const result: LLMTaskResult = {
        response,
        tokens,
        cost,
        metadata: {
          ...taskConfig.metadata,
          executionTime: Date.now() - startTime,
          model: taskConfig.model || 'gpt-4o-mini',
        },
      };

      // Log cost if tracking is enabled (default: true)
      if (costConfig.trackCosts !== false) {
        await this.logCost({
          agentType: costConfig.agentType,
          campaignId: costConfig.campaignId,
          tokens,
          cost,
          task: costConfig.task,
          executionId: costConfig.executionId,
          metadata: result.metadata,
        });
      }

      return result;
    } catch (error) {
      console.error('LLM task execution failed:', error);

      // Log failed execution with minimal cost
      if (costConfig.trackCosts !== false) {
        await this.logCost({
          agentType: costConfig.agentType,
          campaignId: costConfig.campaignId,
          tokens: 0,
          cost: 0,
          task: costConfig.task,
          executionId: costConfig.executionId,
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            failed: true,
          },
        });
      }

      throw error;
    }
  }

  // Log cost to billing system
  private async logCost(costData: {
    agentType: AgentType;
    campaignId?: string;
    tokens: number;
    cost: number;
    task?: string;
    executionId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      // In a real implementation, this would call the tRPC billing API
      // For now, we'll use a simple HTTP request
      const response = await fetch(`${this.billingAPIUrl}/billing.logAgentCost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: costData,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to log cost to billing system:', response.status);
      }
    } catch (error) {
      console.warn('Cost logging failed:', error);
      // Don't throw - cost logging failure shouldn't break the main task
    }
  }

  // Utility method to get agent cost rate
  static getAgentCostRate(agentType: AgentType): number {
    return AGENT_COST_PER_1K_TOKENS[agentType] || 0.04;
  }

  // Utility method to estimate cost before execution
  static estimateCost(agentType: AgentType, estimatedTokens: number): number {
    const costPer1K = AGENT_COST_PER_1K_TOKENS[agentType] || 0.04;
    return (estimatedTokens / 1000) * costPer1K;
  }
}

// Global cost tracker instance
export const globalCostTracker = new CostTracker();

// Convenience function for direct usage
export async function runLLMTaskWithCostTracking(
  taskConfig: LLMTaskConfig,
  costConfig: CostTrackingConfig
): Promise<LLMTaskResult> {
  return globalCostTracker.runLLMTask(taskConfig, costConfig);
}

// Environment variable for monthly budget limit
export const MAX_MONTHLY_BUDGET = parseFloat(process.env.MAX_MONTHLY_BUDGET || '1000');

// Budget check utility
export class BudgetMonitor {
  static async checkBudgetStatus(month?: string): Promise<{
    isOverBudget: boolean;
    isNearBudget: boolean;
    budgetUtilization: number;
    remainingBudget: number;
  }> {
    const currentMonth = month || new Date().toISOString().substring(0, 7);

    try {
      // This would typically call the billing API
      // For now, return mock data
      const mockSpent = Math.random() * MAX_MONTHLY_BUDGET;
      const budgetUtilization = (mockSpent / MAX_MONTHLY_BUDGET) * 100;

      return {
        isOverBudget: mockSpent > MAX_MONTHLY_BUDGET,
        isNearBudget: budgetUtilization >= 80,
        budgetUtilization,
        remainingBudget: Math.max(0, MAX_MONTHLY_BUDGET - mockSpent),
      };
    } catch (error) {
      console.warn('Failed to check budget status:', error);
      return {
        isOverBudget: false,
        isNearBudget: false,
        budgetUtilization: 0,
        remainingBudget: MAX_MONTHLY_BUDGET,
      };
    }
  }

  static async shouldBlockExecution(estimatedCost: number, month?: string): Promise<boolean> {
    const budgetStatus = await this.checkBudgetStatus(month);

    // Block if already over budget or if this task would exceed budget
    return budgetStatus.isOverBudget || estimatedCost > budgetStatus.remainingBudget;
  }
}

// Export types and utilities
export type { LLMTaskConfig, LLMTaskResult, CostTrackingConfig };
