import { useState } from 'react';
import { trpc } from '../trpc';

export interface ContentGenerationParams {
  type: 'blog' | 'social_post' | 'email' | 'caption' | 'copy';
  topic: string;
  audience: string;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  keywords?: string[];
  platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'email';
}

export interface ContentGenerationResult {
  content: string;
  suggestedTitle?: string;
  hashtags?: string[];
  readingTime?: number;
  seoScore?: number;
}

export const useContentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // tRPC mutations
  const generatePostMutation = trpc.content.generatePost.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.data as ContentGenerationResult);
      setIsGenerating(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsGenerating(false);
    },
  });

  const generateBlogMutation = trpc.content.generateBlog.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.data as ContentGenerationResult);
      setIsGenerating(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsGenerating(false);
    },
  });

  const generateCaptionMutation = trpc.content.generateCaption.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.data as ContentGenerationResult);
      setIsGenerating(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsGenerating(false);
    },
  });

  const generateContent = async (params: ContentGenerationParams) => {
    setIsGenerating(true);
    setError(null);

    try {
      switch (params.type) {
        case 'blog':
          await generateBlogMutation.mutateAsync(params);
          break;
        case 'caption':
          await generateCaptionMutation.mutateAsync(params);
          break;
        default:
          await generatePostMutation.mutateAsync(params);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      setIsGenerating(false);
    }
  };

  const clearContent = () => {
    setGeneratedContent(null);
    setError(null);
  };

  const editContent = (newContent: string) => {
    if (generatedContent) {
      setGeneratedContent({
        ...generatedContent,
        content: newContent,
      });
    }
  };

  return {
    generateContent,
    clearContent,
    editContent,
    isGenerating,
    generatedContent,
    error,
  };
}; 