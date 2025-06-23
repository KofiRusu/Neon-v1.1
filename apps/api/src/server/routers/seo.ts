import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentManager } from '@neonhub/core-agents';

const agentManager = new AgentManager();

export const seoRouter = createTRPCRouter({
  // Analyze keywords for SEO optimization
  analyzeKeywords: protectedProcedure
    .input(
      z.object({
        keywords: z.array(z.string()).min(1).max(20),
        website: z.string().url().optional(),
        industry: z.string().min(1).max(100),
        targetLocation: z.string().optional(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'analyze_keywords',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        ctx.logger.info('Keywords analyzed successfully', {
          keywordCount: input.keywords.length,
          industry: input.industry,
          userId: ctx.session.user.id,
        });

        return {
          analysis: result.data,
          recommendations: result.data?.recommendations || [],
          difficulty: result.data?.difficulty || {},
          volume: result.data?.volume || {},
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to analyze keywords', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze keywords',
        });
      }
    }),

  // Optimize content for SEO
  optimizeContent: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        targetKeywords: z.array(z.string()).min(1).max(10),
        contentType: z.enum(['blog', 'product', 'landing-page', 'social-post']),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        focusKeyword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'optimize_content',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          optimizedContent: result.data?.optimizedContent || input.content,
          seoScore: result.data?.seoScore || 0,
          suggestions: result.data?.suggestions || [],
          metaData: {
            title: result.data?.metaTitle || input.metaTitle,
            description: result.data?.metaDescription || input.metaDescription,
            keywords: input.targetKeywords,
          },
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to optimize content for SEO', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to optimize content for SEO',
        });
      }
    }),

  // Generate SEO-friendly titles
  generateTitles: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(200),
        keywords: z.array(z.string()).min(1).max(5),
        contentType: z.enum(['blog', 'product', 'landing-page', 'news']),
        tone: z.enum(['professional', 'casual', 'urgent', 'friendly']).default('professional'),
        maxLength: z.number().min(30).max(80).default(60),
        count: z.number().min(1).max(10).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'generate_titles',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          titles: result.data?.titles || [],
          seoScores: result.data?.seoScores || {},
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate SEO titles', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate SEO titles',
        });
      }
    }),

  // Generate meta descriptions
  generateMetaDescriptions: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        keywords: z.array(z.string()).min(1).max(5),
        maxLength: z.number().min(120).max(160).default(155),
        count: z.number().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'generate_meta_descriptions',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          descriptions: result.data?.descriptions || [],
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to generate meta descriptions', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate meta descriptions',
        });
      }
    }),

  // Audit website SEO
  auditWebsite: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        focusKeywords: z.array(z.string()).optional(),
        checkMobile: z.boolean().default(true),
        checkSpeed: z.boolean().default(true),
        checkAccessibility: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'audit_website',
          context: input,
          priority: 'high',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          overallScore: result.data?.overallScore || 0,
          technicalSEO: result.data?.technicalSEO || {},
          onPageSEO: result.data?.onPageSEO || {},
          contentAnalysis: result.data?.contentAnalysis || {},
          recommendations: result.data?.recommendations || [],
          criticalIssues: result.data?.criticalIssues || [],
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to audit website', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to audit website',
        });
      }
    }),

  // Track keyword rankings
  trackKeywords: protectedProcedure
    .input(
      z.object({
        website: z.string().url(),
        keywords: z.array(z.string()).min(1).max(50),
        location: z.string().optional(),
        device: z.enum(['desktop', 'mobile']).default('desktop'),
        searchEngine: z.enum(['google', 'bing', 'yahoo']).default('google'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'track_keywords',
          context: input,
          priority: 'medium',
          metadata: { userId: ctx.session.user.id },
        });

        // Store tracking data
        await ctx.prisma.analytics.create({
          data: {
            userId: ctx.session.user.id,
            type: 'PERFORMANCE',
            data: {
              type: 'keyword_tracking',
              website: input.website,
              keywords: input.keywords,
              rankings: result.data?.rankings || {},
              timestamp: new Date().toISOString(),
            },
          },
        });

        return {
          rankings: result.data?.rankings || {},
          changes: result.data?.changes || {},
          insights: result.data?.insights || [],
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to track keywords', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to track keywords',
        });
      }
    }),

  // Get competitor analysis
  analyzeCompetitors: protectedProcedure
    .input(
      z.object({
        website: z.string().url(),
        competitors: z.array(z.string().url()).min(1).max(5),
        keywords: z.array(z.string()).min(1).max(20),
        analysisType: z.enum(['keywords', 'content', 'backlinks', 'full']).default('full'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await agentManager.executeAgent('seo-agent', {
          task: 'analyze_competitors',
          context: input,
          priority: 'high',
          metadata: { userId: ctx.session.user.id },
        });

        return {
          competitorData: result.data?.competitors || {},
          keywordGaps: result.data?.keywordGaps || [],
          contentGaps: result.data?.contentGaps || [],
          opportunities: result.data?.opportunities || [],
          agentResult: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.logger.error('Failed to analyze competitors', { error: errorMessage });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze competitors',
        });
      }
    }),
});