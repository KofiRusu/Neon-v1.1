import { useState } from 'react';
import { trpc } from '../trpc';

export interface SEOOptimizationParams {
  content: string;
  targetKeywords: string[];
  contentType: 'blog' | 'page' | 'product' | 'article';
  focusKeyword?: string;
  title?: string;
  description?: string;
  url?: string;
}

export interface SEOAnalysisResult {
  seoScore: number;
  optimizedContent: string;
  suggestions: SEOSuggestion[];
  keywords: KeywordAnalysis[];
  meta: {
    optimizedTitle: string;
    optimizedDescription: string;
    suggestedUrl?: string;
  };
}

export interface SEOSuggestion {
  type: 'title' | 'meta' | 'content' | 'keywords' | 'structure' | 'url';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface KeywordAnalysis {
  keyword: string;
  density: number;
  frequency: number;
  prominence: number;
  recommendations: string[];
}

export const useSEOOptimizer = (): {
  optimizeContent: (params: SEOOptimizationParams) => Promise<void>;
  analyzeContent: (_content: string, _keywords: string[]) => Promise<void>;
  generateMetaTags: (params: SEOOptimizationParams) => Promise<void>;
  clearResults: () => void;
  isOptimizing: boolean;
  isAnalyzing: boolean;
  optimizationResult: SEOAnalysisResult | null;
  analysisResult: SEOAnalysisResult | null;
  error: string | null;
} => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<SEOAnalysisResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // tRPC mutations and queries
  const optimizeKeywordsMutation = trpc.seo.optimizeKeywords.useMutation({
    onSuccess: (_data) => {
      // setOptimizationResult(data.data as SEOAnalysisResult);
      setIsOptimizing(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsOptimizing(false);
    },
  });

  const generateMetaTagsMutation = trpc.seo.generateMetaTags.useMutation({
    onSuccess: (_data) => {
      setIsOptimizing(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsOptimizing(false);
    },
  });

  const optimizeContent = async (params: SEOOptimizationParams): Promise<void> => {
    setIsOptimizing(true);
    setError(null);

    try {
      await optimizeKeywordsMutation.mutateAsync(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize content');
      setIsOptimizing(false);
    }
  };

  const analyzeContent = async (_content: string, _keywords: string[]): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Note: This would need to be implemented as a query in the actual hook usage
      // For now, we'll structure it to work with the tRPC query pattern
      setIsAnalyzing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze content');
      setIsAnalyzing(false);
    }
  };

  const generateMetaTags = async (params: SEOOptimizationParams): Promise<void> => {
    setIsOptimizing(true);
    setError(null);

    try {
      await generateMetaTagsMutation.mutateAsync(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meta tags');
      setIsOptimizing(false);
    }
  };

  const clearResults = (): void => {
    setOptimizationResult(null);
    setAnalysisResult(null);
    setError(null);
  };

  return {
    optimizeContent,
    analyzeContent,
    generateMetaTags,
    clearResults,
    isOptimizing,
    isAnalyzing,
    optimizationResult,
    analysisResult,
    error,
  };
}; 