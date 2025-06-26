import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

// Performance monitoring types
interface QueryMetrics {
  operation: string;
  model: string;
  duration: number;
  timestamp: Date;
  cached: boolean;
  recordCount?: number;
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Enhanced Prisma client with performance monitoring and caching
export class OptimizedPrismaClient {
  private client: PrismaClient;
  private queryMetrics: QueryMetrics[] = [];
  private queryCache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_METRICS_HISTORY = 1000;

  constructor() {
    this.client = new PrismaClient();

    // Set up query logging and performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring(): void {
    // Performance monitoring will be enabled when Prisma is properly configured
    // For now, we'll use manual tracking in the executeWithCache method
  }

  // Helper methods for query analysis (will be used when needed)
  // private extractOperation(query: string): string {
  //   const match = query.match(/^(SELECT|INSERT|UPDATE|DELETE)/i);
  //   return match && match[1] ? match[1].toUpperCase() : 'UNKNOWN';
  // }

  // private extractModel(query: string): string {
  //   const match = query.match(/FROM\s+"([^"]+)"/i) || query.match(/INTO\s+"([^"]+)"/i);
  //   return match && match[1] ? match[1] : 'unknown';
  // }

  private addMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric);
    
    // Keep only recent metrics
    if (this.queryMetrics.length > this.MAX_METRICS_HISTORY) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS_HISTORY);
    }
  }

  private generateCacheKey(operation: string, args: unknown): string {
    return `${operation}:${JSON.stringify(args)}`;
  }

  private isValidCacheEntry(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private async executeWithCache<T>(
    operation: string,
    args: unknown,
    executor: () => Promise<T>,
    cacheTTL: number = this.DEFAULT_CACHE_TTL
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(operation, args);
    const cachedEntry = this.queryCache.get(cacheKey);

    // Return cached result if valid
    if (cachedEntry && this.isValidCacheEntry(cachedEntry)) {
      const metric: QueryMetrics = {
        operation,
        model: 'cached',
        duration: 0,
        timestamp: new Date(),
        cached: true
      };
      this.addMetric(metric);
      return cachedEntry.data;
    }

    // Execute query and cache result
    const startTime = performance.now();
    const result = await executor();
    const duration = performance.now() - startTime;

    // Cache the result
    this.queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: cacheTTL
    });

    // Record metrics
    const metric: QueryMetrics = {
      operation,
      model: 'executed',
      duration,
      timestamp: new Date(),
      cached: false,
      recordCount: Array.isArray(result) ? result.length : 1
    };
    this.addMetric(metric);

    return result;
  }

  // Optimized campaign queries using new indexes
  async getCampaignsByUserAndStatus(
    userId: string, 
    status?: string, 
    limit: number = 50
  ): Promise<unknown> {
    return this.executeWithCache(
      'getCampaignsByUserAndStatus',
      { userId, status, limit },
      () => this.client.campaign.findMany({
        where: {
          userId,
          ...(status && { status })
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          analytics: {
            take: 1,
            orderBy: { date: 'desc' }
          }
        }
      })
    );
  }

  // Optimized agent execution queries using new indexes
  async getAgentPerformanceMetrics(
    agentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<unknown> {
    return this.executeWithCache(
      'getAgentPerformanceMetrics',
      { agentId, startDate, endDate },
      () => this.client.agentExecution.findMany({
        where: {
          agentId,
          ...(startDate && { startedAt: { gte: startDate } }),
          ...(endDate && { startedAt: { lte: endDate } }),
          status: 'COMPLETED'
        },
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          task: true,
          performance: true,
          startedAt: true,
          completedAt: true
        }
      }),
      600000 // 10 minute cache for performance data
    );
  }

  // Optimized analytics queries using new indexes
  async getCampaignAnalytics(
    campaignId: string,
    type?: string,
    period?: string,
    limit: number = 100
  ): Promise<unknown> {
    return this.executeWithCache(
      'getCampaignAnalytics',
      { campaignId, type, period, limit },
      () => this.client.analytics.findMany({
        where: {
          campaignId,
          ...(type && { type }),
          ...(period && { period })
        },
        orderBy: { date: 'desc' },
        take: limit
      }),
      300000 // 5 minute cache for analytics
    );
  }

  // Optimized lead queries using new indexes
  async getHighValueLeads(minScore: number = 7.0, limit: number = 50): Promise<unknown> {
    return this.executeWithCache(
      'getHighValueLeads',
      { minScore, limit },
      () => this.client.lead.findMany({
        where: {
          score: { gte: minScore }
        },
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      }),
      900000 // 15 minute cache for leads
    );
  }

  // Optimized trend queries using new indexes
  async getTrendingKeywords(
    platform?: string,
    minScore: number = 5.0,
    limit: number = 20
  ): Promise<unknown> {
    return this.executeWithCache(
      'getTrendingKeywords',
      { platform, minScore, limit },
      () => this.client.trend.findMany({
        where: {
          ...(platform && { platform }),
          score: { gte: minScore }
        },
        orderBy: [
          { score: 'desc' },
          { detectedAt: 'desc' }
        ],
        take: limit
      }),
      180000 // 3 minute cache for trends
    );
  }

  // Content optimization queries
  async getContentByPlatformAndStatus(
    platform: string,
    status?: string,
    limit: number = 50
  ): Promise<unknown> {
    return this.executeWithCache(
      'getContentByPlatformAndStatus',
      { platform, status, limit },
      () => this.client.content.findMany({
        where: {
          platform,
          ...(status && { status })
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    );
  }

  // Batch operations for better performance
  async createCampaignWithAnalytics(
    campaignData: Record<string, unknown>,
    initialAnalytics?: Record<string, unknown>[]
  ): Promise<unknown> {
    return this.client.$transaction(async (tx: PrismaClient) => {
      const campaign = await tx.campaign.create({
        data: campaignData
      });

      if (initialAnalytics && initialAnalytics.length > 0) {
        await tx.analytics.createMany({
          data: initialAnalytics.map((analytics: Record<string, unknown>) => ({
            ...analytics,
            campaignId: campaign.id
          }))
        });
      }

      return campaign;
    });
  }

  // Performance monitoring methods
  getQueryMetrics(): {
    totalQueries: number;
    avgDuration: number;
    cacheHitRate: number;
    slowQueries: QueryMetrics[];
    recentActivity: QueryMetrics[];
  } {
    const totalQueries = this.queryMetrics.length;
    const cachedQueries = this.queryMetrics.filter(m => m.cached).length;
    const executedQueries = this.queryMetrics.filter(m => !m.cached);
    
    const avgDuration = executedQueries.length > 0 
      ? executedQueries.reduce((sum, m) => sum + m.duration, 0) / executedQueries.length
      : 0;

    const cacheHitRate = totalQueries > 0 ? cachedQueries / totalQueries : 0;

    const slowQueries = executedQueries
      .filter(m => m.duration > 100) // Queries taking more than 100ms
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const recentActivity = this.queryMetrics
      .slice(-20)
      .reverse();

    return {
      totalQueries,
      avgDuration,
      cacheHitRate,
      slowQueries,
      recentActivity
    };
  }

  clearCache(): void {
    this.queryCache.clear();
  }

  clearMetrics(): void {
    this.queryMetrics = [];
  }

  // Connection management
  async connect(): Promise<void> {
    await this.client.$connect();
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  // Direct client access for advanced operations
  get prisma(): PrismaClient {
    return this.client;
  }
}

// Export singleton instance
export const optimizedDb = new OptimizedPrismaClient();

// Export types for use in applications
export type { QueryMetrics };