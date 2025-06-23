/**
 * NeonHub Centralized Data Service
 * 
 * This service provides a unified interface for accessing all business data,
 * metrics, and configurations from the centralized data directory.
 * 
 * In production, replace the JSON file reads with database queries
 * or API calls to live data sources.
 */

import fs from 'fs';
import path from 'path';

// Type definitions for our data structures
export interface BusinessProfile {
  company: {
    name: string;
    industry: string;
    description: string;
    website: string;
  };
  brand: {
    voice: string;
    tone: string;
    personality: string[];
    values: string[];
  };
  targetAudience: {
    primary: {
      demographic: string;
      psychographic: string;
      painPoints: string[];
      goals: string[];
    };
  };
  marketingObjectives: {
    primary: string;
    secondary: string;
    metrics: Record<string, any>;
  };
}

export interface CampaignData {
  campaigns: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    budget: number;
    spent: number;
    roi: number;
    impressions: number;
    clicks: number;
    conversions: number;
    startDate: string;
    endDate: string;
    targetAudience: string;
    agentsAssigned: string[];
    performance?: any;
  }>;
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
    totalRevenue: number;
    overallROI: number;
  };
}

export interface AgentMetrics {
  agents: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    performance: {
      score: number;
      trend: number;
      successRate: number;
      avgResponseTime: number;
      totalExecutions: number;
    };
    capabilities: string[];
    lastActivity: string;
  }>;
  summary: {
    totalAgents: number;
    activeAgents: number;
    averagePerformanceScore: number;
    overallUptime: number;
    systemHealth: string;
  };
}

export interface AnalyticsData {
  totalRevenue: number;
  totalCampaigns: number;
  activeAgents: number;
  conversionRate: number;
  leadQuality: number;
  agentPerformance: Array<{
    name: string;
    score: number;
    trend: number;
  }>;
  campaignMetrics: Array<{
    name: string;
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
    status: string;
  }>;
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    leads: number;
    conversions: number;
  }>;
}

/**
 * Centralized Data Service Class
 */
class DataService {
  private static instance: DataService;
  private dataPath: string;
  private cache: Map<string, any> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // In development, use local data directory
    // In production, this would connect to live databases
    this.dataPath = process.env.NODE_ENV === 'production' 
      ? process.env.DATA_PATH || '/app/data'
      : path.join(process.cwd(), 'data');
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Generic method to read JSON data with caching
   */
  private async readDataFile<T>(filePath: string): Promise<T> {
    const cacheKey = filePath;
    const now = Date.now();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const timestamp = this.cacheTimestamps.get(cacheKey) || 0;
      if (now - timestamp < this.CACHE_DURATION) {
        return this.cache.get(cacheKey);
      }
    }

    try {
      const fullPath = path.join(this.dataPath, filePath);
      const fileContent = await fs.promises.readFile(fullPath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // Update cache
      this.cache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, now);
      
      return data;
    } catch (error) {
      console.error(`Error reading data file ${filePath}:`, error);
      throw new Error(`Failed to load data from ${filePath}`);
    }
  }

  /**
   * Business Profile Data
   */
  public async getBusinessProfile(): Promise<BusinessProfile> {
    return this.readDataFile<BusinessProfile>('config/business-profile.json');
  }

  /**
   * Campaign Performance Data
   */
  public async getCampaignData(): Promise<CampaignData> {
    return this.readDataFile<CampaignData>('metrics/campaigns.json');
  }

  /**
   * Agent Performance Metrics
   */
  public async getAgentMetrics(): Promise<AgentMetrics> {
    return this.readDataFile<AgentMetrics>('metrics/agents.json');
  }

  /**
   * Analytics Dashboard Data
   */
  public async getAnalyticsData(): Promise<AnalyticsData> {
    const [campaigns, agents] = await Promise.all([
      this.getCampaignData(),
      this.getAgentMetrics()
    ]);

    // Transform data for analytics dashboard
    return {
      totalRevenue: campaigns.summary.totalRevenue,
      totalCampaigns: campaigns.summary.totalCampaigns,
      activeAgents: agents.summary.activeAgents,
      conversionRate: 3.4, // Calculate from campaigns
      leadQuality: 87.5, // Calculate from leads data
      agentPerformance: agents.agents.map(agent => ({
        name: agent.name,
        score: agent.performance.score,
        trend: agent.performance.trend
      })),
      campaignMetrics: campaigns.campaigns.map(campaign => ({
        name: campaign.name,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        conversions: campaign.conversions,
        roi: campaign.roi,
        status: campaign.status
      })),
      timeSeriesData: this.generateTimeSeriesData()
    };
  }

  /**
   * Support Data
   */
  public async getSupportData() {
    // Mock support data - in production this would come from support system
    return {
      threads: [
        {
          id: '1',
          customer: { name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
          subject: 'Issue with AI Content Generator',
          lastMessage: 'I see the issue. For more personalized content, try providing...',
          lastMessageTime: new Date('2024-01-16T09:07:00Z'),
          status: 'open',
          priority: 'medium',
          channel: 'whatsapp',
          unreadCount: 2,
          isAiHandled: true,
        }
      ],
      contacts: [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0123',
          lastContact: new Date('2024-01-16T09:07:00Z'),
          totalTickets: 3,
          status: 'active',
          tags: ['premium', 'restaurant'],
        }
      ]
    };
  }

  /**
   * Content Performance Data
   */
  public async getContentAnalytics(platform: string = 'all', timeRange: string = '30d') {
    const businessProfile = await this.getBusinessProfile();
    
    // Mock content analytics based on business profile
    return {
      analytics: [
        {
          platform: 'instagram',
          metrics: {
            totalPosts: 45,
            avgEngagement: '7.8%',
            totalReach: 45000,
            topPerformingPost: {
              id: 'post_instagram_top',
              content: `${businessProfile.company.name} behind-the-scenes content...`,
              engagementRate: '12.8%',
              reach: 8500
            }
          }
        }
      ],
      summary: {
        totalContent: 156,
        avgEngagementAcrossPlatforms: '7.2%',
        totalReachAcrossPlatforms: 125000,
        timeRange
      }
    };
  }

  /**
   * Agent Status Data
   */
  public async getAgentStatus(agentId?: string) {
    const agentMetrics = await this.getAgentMetrics();
    
    if (agentId) {
      const agent = agentMetrics.agents.find(a => a.id === agentId);
      return agent || null;
    }
    
    return agentMetrics.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      type: agent.type,
      uptime: '99.8%',
      totalExecutions: agent.performance.totalExecutions,
      successRate: `${agent.performance.successRate}%`,
      avgResponseTime: `${agent.performance.avgResponseTime}ms`,
      lastActivity: agent.lastActivity
    }));
  }

  /**
   * Generate time series data for charts
   */
  private generateTimeSeriesData(days: number = 30) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 15000,
        leads: Math.floor(Math.random() * 100) + 50,
        conversions: Math.floor(Math.random() * 50) + 20,
      });
    }

    return data;
  }

  /**
   * Log agent activity (writes to logs directory)
   */
  public async logAgentActivity(agentId: string, activity: any) {
    try {
      const logPath = path.join(this.dataPath, 'logs', 'agent-executions');
      const logFile = path.join(logPath, `${agentId}-${new Date().toISOString().split('T')[0]}.json`);
      
      // Ensure directory exists
      await fs.promises.mkdir(logPath, { recursive: true });
      
      // Read existing logs or create new
      let logs = [];
      try {
        const existingLogs = await fs.promises.readFile(logFile, 'utf-8');
        logs = JSON.parse(existingLogs);
      } catch {
        // File doesn't exist, start with empty array
      }
      
      // Add new activity
      logs.push({
        timestamp: new Date().toISOString(),
        ...activity
      });
      
      // Write back to file
      await fs.promises.writeFile(logFile, JSON.stringify(logs, null, 2));
      
    } catch (error) {
      console.error('Error logging agent activity:', error);
    }
  }

  /**
   * Clear cache (useful for development or when data is updated)
   */
  public clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

// Export individual data access functions for convenience
export const getBusinessProfile = () => dataService.getBusinessProfile();
export const getCampaignData = () => dataService.getCampaignData();
export const getAgentMetrics = () => dataService.getAgentMetrics();
export const getAnalyticsData = () => dataService.getAnalyticsData();
export const getSupportData = () => dataService.getSupportData();
export const getContentAnalytics = (platform?: string, timeRange?: string) => 
  dataService.getContentAnalytics(platform, timeRange);
export const getAgentStatus = (agentId?: string) => dataService.getAgentStatus(agentId);
export const logAgentActivity = (agentId: string, activity: any) => 
  dataService.logAgentActivity(agentId, activity); 