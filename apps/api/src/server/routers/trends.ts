/**
 * Trends Router - Market Pulse & Trend Analysis
 * Handles trend signals, region scores, and market intelligence
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { SocialApiClient } from '@neon/utils/social-api-client';

const socialClient = new SocialApiClient();

export const trendsRouter = createTRPCRouter({
  // Get all trending data across platforms
  getAllTrends: publicProcedure
    .query(async () => {
      try {
        const trends = await socialClient.getAllTrends();
        return {
          success: true,
          data: trends,
          updatedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Failed to fetch trends:', error);
        return {
          success: false,
          data: [],
          error: 'Failed to fetch trend data',
        };
      }
    }),

  // Get trends by platform
  getTrendsByPlatform: publicProcedure
    .input(z.object({
      platform: z.enum(['tiktok', 'instagram', 'twitter']),
    }))
    .query(async ({ input }) => {
      try {
        let trends;
        switch (input.platform) {
          case 'tiktok':
            trends = await socialClient.fetchTrendingTikTok();
            break;
          case 'instagram':
            trends = await socialClient.fetchTrendingInstagram();
            break;
          case 'twitter':
            trends = await socialClient.fetchTrendingTwitter();
            break;
        }

        return {
          success: true,
          platform: input.platform,
          data: trends,
        };
      } catch (_error) {
        return {
          success: false,
          platform: input.platform,
          data: [],
          error: `Failed to fetch ${input.platform} trends`,
        };
      }
    }),

  // Get region scores
  getRegionScores: publicProcedure
    .input(z.object({
      region: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const scores = await socialClient.getRegionScores(input.region);
        return {
          success: true,
          data: scores,
        };
      } catch (error) {
        return {
          success: false,
          data: null,
          error: 'Failed to fetch region scores',
        };
      }
    }),

  // Analyze market pulse for specific keyword
  analyzeKeyword: publicProcedure
    .input(z.object({
      keyword: z.string(),
      platforms: z.array(z.enum(['tiktok', 'instagram', 'twitter'])).optional(),
    }))
    .query(async ({ input }) => {
      const { keyword, platforms = ['tiktok', 'instagram', 'twitter'] } = input;
      
      try {
        const allTrends = await socialClient.getAllTrends();
        const keywordTrends = allTrends.filter(trend => 
          trend.keyword.toLowerCase().includes(keyword.toLowerCase()) &&
          platforms.includes(trend.platform as any)
        );

        const analysis = {
          keyword,
          totalSignals: keywordTrends.length,
          averageScore: keywordTrends.reduce((sum, t) => sum + t.score, 0) / keywordTrends.length || 0,
          platforms: keywordTrends.reduce((acc, trend) => {
            acc[trend.platform] = (acc[trend.platform] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          topSignals: keywordTrends
            .sort((a, b) => b.score - a.score)
            .slice(0, 5),
        };

        return {
          success: true,
          data: analysis,
        };
      } catch (error) {
        return {
          success: false,
          data: null,
          error: 'Failed to analyze keyword trends',
        };
      }
    }),

  // Get trend predictions
  getPredictions: publicProcedure
    .input(z.object({
      industry: z.string().optional(),
      timeframe: z.enum(['1d', '7d', '30d']).default('7d'),
    }))
    .query(async ({ input }) => {
      // Mock prediction data - in production, this would use ML models
      const predictions = [
        {
          keyword: 'neon signs',
          currentScore: 0.85,
          predictedScore: 0.92,
          trend: 'rising',
          confidence: 0.78,
          timeframe: input.timeframe,
        },
        {
          keyword: 'led lighting',
          currentScore: 0.76,
          predictedScore: 0.82,
          trend: 'rising',
          confidence: 0.65,
          timeframe: input.timeframe,
        },
        {
          keyword: 'custom signage',
          currentScore: 0.68,
          predictedScore: 0.71,
          trend: 'stable',
          confidence: 0.82,
          timeframe: input.timeframe,
        },
      ];

      return {
        success: true,
        data: predictions,
        generatedAt: new Date().toISOString(),
      };
    }),
}); 