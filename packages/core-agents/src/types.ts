// Agent execution context and result types
export interface AgentContext {
  [key: string]: unknown;
}

// Allow undefined context as well
export type AgentContextOrUndefined = AgentContext | undefined;

export interface AdOptimizationResult {
  optimizations: Array<{
    adId: string;
    suggestions: string[];
  }>;
}

export interface BudgetAllocationResult {
  budgetAllocation: {
    facebook: number;
    google: number;
    tiktok: number;
  };
}

export interface ABTestResult {
  testId: string;
  variants: Array<{
    id: string;
    creative: string;
    bid: number;
  }>;
}

export interface PerformanceMetrics {
  metrics: {
    ctr: number;
    cpc: number;
    roas: number;
  };
}

export interface BiddingAdjustment {
  newBids: {
    [adId: string]: number;
  };
}

export interface ContentResult {
  content: string;
  metadata: {
    wordCount: number;
    tone: string;
    keywords: string[];
  };
}

export interface DesignResult {
  design: {
    id: string;
    url: string;
    specifications: {
      width: number;
      height: number;
      format: string;
    };
  };
}

export interface InsightResult {
  insights: Array<{
    type: string;
    confidence: number;
    data: unknown;
  }>;
}

export interface OutreachResult {
  campaigns: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

export interface TrendResult {
  trends: Array<{
    keyword: string;
    volume: number;
    growth: number;
  }>;
}

// Additional types for base-agent compatibility
export interface AgentPayload {
  task: string;
  context: AgentContext;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string | undefined;
  metadata?: {
    timestamp: string;
    duration?: number;
  };
}

export interface ContentContext {
  type?: string;
  platform?: string;
  industry?: string;
  tone?: string;
  keywords?: string[];
}
