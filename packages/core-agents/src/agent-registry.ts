import { AgentFactory } from './base-agent';
import { logger } from '@neon/utils';

// Import all agent classes
import { ContentAgent } from './agents/content-agent';
import { SEOAgent } from './agents/seo-agent';
import { AdAgent } from './agents/ad-agent';
import { OutreachAgent } from './agents/outreach-agent';
import { TrendAgent } from './agents/trend-agent';
import { InsightAgent } from './agents/insight-agent';
import { DesignAgent } from './agents/design-agent';

/**
 * Register all available agents with the AgentFactory
 * This function should be called during application startup
 */
export function registerAllAgents(): void {
  // Register each agent type with the factory
  AgentFactory.registerAgent('content', ContentAgent);
  AgentFactory.registerAgent('seo', SEOAgent);
  AgentFactory.registerAgent('ad', AdAgent);
  AgentFactory.registerAgent('outreach', OutreachAgent);
  AgentFactory.registerAgent('trend', TrendAgent);
  AgentFactory.registerAgent('insight', InsightAgent);
  AgentFactory.registerAgent('design', DesignAgent);

  logger.info(
    'Agent registry initialized',
    { agentTypes: AgentFactory.getAvailableTypes() },
    'AgentRegistry'
  );
}

/**
 * Get a list of all registered agent types
 */
export function getRegisteredAgentTypes(): string[] {
  return AgentFactory.getAvailableTypes();
}

/**
 * Check if an agent type is registered
 */
export function isAgentTypeRegistered(type: string): boolean {
  return AgentFactory.getAvailableTypes().includes(type);
}

/**
 * Create an SEO agent instance
 */
export function createSEOAgent(): SEOAgent {
  return new SEOAgent();
}

/**
 * Agent capabilities mapping for frontend
 */
export const AGENT_CAPABILITIES = {
  content: [
    'generate_content',
    'generate_blog', 
    'generate_caption',
    'generate_post'
  ],
  seo: [
    'optimize_keywords',
    'analyze_content',
    'generate_meta_tags',
    'analyze_competitors',
    'recommend_keywords',
    'generate_schema',
    'audit_technical_seo'
  ],
  ad: [
    'create_campaign',
    'optimize_budget',
    'analyze_performance'
  ],
  outreach: [
    'send_email',
    'manage_followup',
    'personalize_message'
  ],
  trend: [
    'detect_trends',
    'analyze_engagement',
    'predict_viral_content'
  ],
  insight: [
    'analyze_metrics',
    'generate_insights',
    'recommend_strategies'
  ],
  design: [
    'create_visual',
    'optimize_design',
    'generate_mockup'
  ]
} as const;
