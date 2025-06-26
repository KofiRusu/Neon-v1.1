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
import { EmailMarketingAgent } from './agents/email-agent';
import { CustomerSupportAgent } from './agents/support-agent';

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
  AgentFactory.registerAgent('email', EmailMarketingAgent);
  AgentFactory.registerAgent('support', CustomerSupportAgent);

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
 * Create an Email Marketing agent instance
 */
export function createEmailMarketingAgent(): EmailMarketingAgent {
  return new EmailMarketingAgent();
}

/**
 * Create a Customer Support agent instance
 */
export function createCustomerSupportAgent(): CustomerSupportAgent {
  return new CustomerSupportAgent();
}

/**
 * Agent capabilities mapping for frontend
 */
export const AGENT_CAPABILITIES = {
  content: ['generate_content', 'generate_blog', 'generate_caption', 'generate_post'],
  seo: [
    'optimize_keywords',
    'analyze_content',
    'generate_meta_tags',
    'analyze_competitors',
    'recommend_keywords',
    'generate_schema',
    'audit_technical_seo',
  ],
  ad: ['create_campaign', 'optimize_budget', 'analyze_performance'],
  outreach: ['send_email', 'manage_followup', 'personalize_message'],
  trend: ['detect_trends', 'analyze_engagement', 'predict_viral_content'],
  insight: ['analyze_metrics', 'generate_insights', 'recommend_strategies'],
  design: ['create_visual', 'optimize_design', 'generate_mockup'],
  email: [
    'generate_email_sequence',
    'personalize_email',
    'analyze_performance',
    'create_ab_test',
    'send_campaign',
    'manage_templates',
    'segment_audience',
    'optimize_send_times',
    'generate_subject_lines',
    'create_newsletter',
  ],
  support: [
    'classify_message',
    'generate_reply',
    'analyze_sentiment',
    'escalate_ticket',
    'create_ticket',
    'update_ticket',
    'send_whatsapp_message',
    'auto_respond',
    'manage_knowledge_base',
    'generate_summary',
    'track_satisfaction',
    'manage_queue',
  ],
} as const;
