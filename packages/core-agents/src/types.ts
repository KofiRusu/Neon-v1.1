// Agent execution context and result types
export interface AgentContext {
  [key: string]: unknown;
}

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