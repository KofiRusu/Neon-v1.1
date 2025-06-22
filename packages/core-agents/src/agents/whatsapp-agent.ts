import { AbstractAgent } from '../base-agent';
import type { AgentResult, AgentPayload } from '../base-agent';

export interface SupportTicketContext {
  ticketId?: string;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    customerId?: string;
  };
  channel: 'whatsapp' | 'email' | 'chat' | 'phone' | 'social';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  metadata?: Record<string, any>;
}

export interface WhatsAppMessageContext {
  recipient: string; // Phone number
  message: {
    type: 'text' | 'image' | 'document' | 'template';
    content: string;
    media?: {
      url: string;
      caption?: string;
      filename?: string;
    };
    template?: {
      name: string;
      language: string;
      parameters?: string[];
    };
  };
  settings: {
    businessId?: string;
    accessToken?: string;
    webhookUrl?: string;
  };
}

export interface SupportAnalyticsResult {
  ticketId: string;
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  responseTime: number; // in minutes
  resolutionTime?: number; // in minutes
  satisfactionScore?: number; // 1-5 rating
  channel: string;
  category: string;
  agentAssigned?: string;
  messages: Array<{
    sender: 'customer' | 'agent' | 'system';
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'document' | 'template';
  }>;
}

export interface AutomationRuleContext {
  name: string;
  trigger: {
    type: 'keyword' | 'sentiment' | 'priority' | 'channel' | 'time_based';
    conditions: Record<string, any>;
  };
  action: {
    type: 'auto_reply' | 'escalate' | 'assign_agent' | 'set_priority' | 'tag';
    parameters: Record<string, any>;
  };
  isActive: boolean;
}

export class CustomerSupportAgent extends AbstractAgent {
  constructor() {
    super('customer-support-agent', 'CustomerSupportAgent', 'customer_support', [
      'send_whatsapp',
      'create_ticket',
      'update_ticket',
      'auto_respond',
      'escalate_ticket',
      'analyze_sentiment',
      'generate_summary',
      'manage_knowledge_base'
    ]);
  }

  async execute(payload: AgentPayload): Promise<AgentResult> {
    return this.executeWithErrorHandling(payload, async () => {
      const { task, context } = payload;

      switch (task) {
        case 'send_whatsapp':
          return await this.sendWhatsAppMessage(context as WhatsAppMessageContext);
        case 'create_ticket':
          return await this.createSupportTicket(context as SupportTicketContext);
        case 'update_ticket':
          return await this.updateSupportTicket(context);
        case 'auto_respond':
          return await this.generateAutoResponse(context);
        case 'escalate_ticket':
          return await this.escalateTicket(context);
        case 'analyze_sentiment':
          return await this.analyzeSentiment(context);
        case 'generate_summary':
          return await this.generateTicketSummary(context.ticketId as string);
        case 'manage_knowledge_base':
          return await this.manageKnowledgeBase(context);
        default:
          throw new Error(`Unknown task: ${task}`);
      }
    });
  }

  private async sendWhatsAppMessage(context: WhatsAppMessageContext): Promise<{ messageId: string; status: string; deliveredAt?: Date }> {
    // Validate WhatsApp message format
    this.validateWhatsAppMessage(context);
    
    // Format message for WhatsApp API
    const formattedMessage = this.formatWhatsAppMessage(context);
    
    // Send message via WhatsApp Business API (simulated)
    const sendResult = await this.sendViaWhatsAppAPI(formattedMessage, context.settings);
    
    // Store message data
    await this.storeMessageData(sendResult, context);
    
    return {
      messageId: sendResult.messageId,
      status: 'sent',
      deliveredAt: new Date(),
    };
  }

  private async createSupportTicket(context: SupportTicketContext): Promise<SupportAnalyticsResult> {
    // Generate unique ticket ID
    const ticketId = context.ticketId || this.generateTicketId();
    
    // Analyze initial message sentiment
    const sentiment = await this.analyzeSentiment({ message: context.message });
    
    // Determine priority based on content and sentiment
    const priority = this.calculatePriority(context, sentiment);
    
    // Check for automation rules
    const automationAction = await this.checkAutomationRules(context);
    
    // Create ticket in database
    const ticket = await this.storeTicketData(ticketId, context, priority, sentiment);
    
    // Execute automation if applicable
    if (automationAction) {
      await this.executeAutomation(ticketId, automationAction);
    }
    
    return {
      ticketId,
      status: 'open',
      responseTime: 0,
      channel: context.channel,
      category: context.category || 'general',
      messages: [
        {
          sender: 'customer',
          content: context.message,
          timestamp: new Date(),
          type: 'text',
        },
      ],
    };
  }

  private async updateSupportTicket(context: any): Promise<{ ticketId: string; status: string; updatedAt: Date }> {
    const { ticketId, update, agentId } = context;
    
    // Validate update
    this.validateTicketUpdate(update);
    
    // Update ticket in database
    await this.updateTicketInDatabase(ticketId, update, agentId);
    
    // Check if ticket should be auto-closed
    const shouldAutoClose = this.shouldAutoClose(update);
    
    return {
      ticketId,
      status: update.status || 'updated',
      updatedAt: new Date(),
    };
  }

  private async generateAutoResponse(context: any): Promise<{ response: string; confidence: number; shouldEscalate: boolean }> {
    const { message, customer, ticketHistory } = context;
    
    // Analyze message intent
    const intent = await this.analyzeIntent(message);
    
    // Search knowledge base
    const kbResults = await this.searchKnowledgeBase(intent, message);
    
    // Generate contextual response
    const response = await this.generateContextualResponse(intent, kbResults, ticketHistory);
    
    // Calculate confidence score
    const confidence = this.calculateResponseConfidence(intent, kbResults, response);
    
    // Determine if escalation is needed
    const shouldEscalate = confidence < 0.7 || intent.complexity === 'high';
    
    return {
      response: response.content,
      confidence,
      shouldEscalate,
    };
  }

  private async escalateTicket(context: any): Promise<{ escalationId: string; assignedTo: string; escalatedAt: Date }> {
    const { ticketId, reason, priority } = context;
    
    // Find available agent based on skills and workload
    const assignedAgent = await this.findBestAgent(context);
    
    // Update ticket priority if needed
    const newPriority = this.escalatePriority(priority);
    
    // Create escalation record
    const escalationId = this.generateEscalationId();
    await this.storeEscalationData(escalationId, ticketId, assignedAgent, reason);
    
    // Notify assigned agent
    await this.notifyAgent(assignedAgent, ticketId, escalationId);
    
    return {
      escalationId,
      assignedTo: assignedAgent.id,
      escalatedAt: new Date(),
    };
  }

  private async analyzeSentiment(context: any): Promise<{ sentiment: string; confidence: number; emotions: Record<string, number> }> {
    const { message } = context;
    
    // Simple sentiment analysis (in production, would use ML service)
    const sentiment = this.performSentimentAnalysis(message);
    
    return {
      sentiment: sentiment.label, // positive, negative, neutral
      confidence: sentiment.confidence,
      emotions: sentiment.emotions,
    };
  }

  private async generateTicketSummary(ticketId: string): Promise<{ summary: string; keyPoints: string[]; resolution: string }> {
    // Fetch ticket data
    const ticketData = await this.fetchTicketData(ticketId);
    
    // Extract key information
    const keyPoints = this.extractKeyPoints(ticketData.messages);
    
    // Generate summary
    const summary = this.generateSummaryText(ticketData, keyPoints);
    
    // Extract resolution if ticket is closed
    const resolution = ticketData.status === 'closed' ? this.extractResolution(ticketData) : '';
    
    return {
      summary,
      keyPoints,
      resolution,
    };
  }

  private async manageKnowledgeBase(context: any): Promise<{ action: string; result: any }> {
    const { action, data } = context;
    
    switch (action) {
      case 'add_article':
        return { action: 'add_article', result: await this.addKnowledgeBaseArticle(data) };
      case 'update_article':
        return { action: 'update_article', result: await this.updateKnowledgeBaseArticle(data) };
      case 'search_articles':
        return { action: 'search_articles', result: await this.searchKnowledgeBase(data.query, data.context) };
      case 'get_suggestions':
        return { action: 'get_suggestions', result: await this.getKnowledgeBaseSuggestions(data) };
      default:
        throw new Error(`Unknown knowledge base action: ${action}`);
    }
  }

  // Helper methods
  private validateWhatsAppMessage(context: WhatsAppMessageContext): void {
    if (!context.recipient) {
      throw new Error('WhatsApp recipient phone number is required');
    }
    
    if (!context.message.content && !context.message.media) {
      throw new Error('WhatsApp message must have content or media');
    }
    
    if (context.message.type === 'template' && !context.message.template) {
      throw new Error('Template message requires template configuration');
    }
  }

  private formatWhatsAppMessage(context: WhatsAppMessageContext): any {
    const { message, recipient } = context;
    
    const baseMessage = {
      to: recipient,
      type: message.type,
    };
    
    switch (message.type) {
      case 'text':
        return { ...baseMessage, text: { body: message.content } };
      case 'image':
        return {
          ...baseMessage,
          image: {
            link: message.media?.url,
            caption: message.media?.caption,
          },
        };
      case 'document':
        return {
          ...baseMessage,
          document: {
            link: message.media?.url,
            filename: message.media?.filename,
          },
        };
      case 'template':
        return {
          ...baseMessage,
          template: {
            name: message.template?.name,
            language: { code: message.template?.language || 'en' },
            components: this.buildTemplateComponents(message.template?.parameters || []),
          },
        };
      default:
        return baseMessage;
    }
  }

  private buildTemplateComponents(parameters: string[]): any[] {
    return [
      {
        type: 'body',
        parameters: parameters.map(param => ({ type: 'text', text: param })),
      },
    ];
  }

  private async sendViaWhatsAppAPI(message: any, settings: WhatsAppMessageContext['settings']): Promise<any> {
    // Simulate WhatsApp Business API call
    // In production, this would integrate with Twilio, 360dialog, or WhatsApp Cloud API
    
    return {
      messageId: this.generateMessageId(),
      status: 'sent',
      timestamp: new Date(),
    };
  }

  private calculatePriority(context: SupportTicketContext, sentiment: any): string {
    // Calculate priority based on multiple factors
    let priorityScore = 0;
    
    // Sentiment weight
    if (sentiment.sentiment === 'negative') priorityScore += 2;
    if (sentiment.sentiment === 'positive') priorityScore -= 1;
    
    // Channel weight
    if (context.channel === 'phone') priorityScore += 1;
    if (context.channel === 'chat') priorityScore += 1;
    
    // Keywords weight
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'critical', 'broken', 'down'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      context.message.toLowerCase().includes(keyword)
    );
    if (hasUrgentKeywords) priorityScore += 2;
    
    // Determine final priority
    if (priorityScore >= 4) return 'critical';
    if (priorityScore >= 2) return 'high';
    if (priorityScore >= 0) return 'medium';
    return 'low';
  }

  private async checkAutomationRules(context: SupportTicketContext): Promise<any> {
    // Check if any automation rules apply
    // This would fetch rules from database and evaluate conditions
    return null; // Simplified for now
  }

  private async executeAutomation(ticketId: string, automation: any): Promise<void> {
    // Execute automation action
    console.log('Executing automation:', { ticketId, automation });
  }

  private performSentimentAnalysis(message: string): any {
    // Simple sentiment analysis (would use ML service in production)
    const negativeWords = ['angry', 'frustrated', 'terrible', 'awful', 'hate', 'worst'];
    const positiveWords = ['great', 'excellent', 'love', 'amazing', 'wonderful', 'best'];
    
    const messageWords = message.toLowerCase().split(' ');
    const negativeCount = negativeWords.filter(word => messageWords.includes(word)).length;
    const positiveCount = positiveWords.filter(word => messageWords.includes(word)).length;
    
    if (negativeCount > positiveCount) {
      return { label: 'negative', confidence: 0.8, emotions: { anger: 0.6, frustration: 0.4 } };
    } else if (positiveCount > negativeCount) {
      return { label: 'positive', confidence: 0.8, emotions: { joy: 0.7, satisfaction: 0.3 } };
    } else {
      return { label: 'neutral', confidence: 0.9, emotions: { neutral: 1.0 } };
    }
  }

  private async analyzeIntent(message: string): Promise<any> {
    // Analyze customer intent
    return {
      intent: 'general_inquiry',
      confidence: 0.75,
      complexity: 'medium',
      entities: [],
    };
  }

  private async searchKnowledgeBase(intent: any, message: string): Promise<any[]> {
    // Search knowledge base for relevant articles
    return [
      {
        title: 'How to reset your password',
        content: 'To reset your password, click on...',
        relevance: 0.85,
      },
    ];
  }

  private async generateContextualResponse(intent: any, kbResults: any[], ticketHistory: any): Promise<any> {
    // Generate contextual response based on intent and KB
    return {
      content: 'Thank you for contacting us. I can help you with that.',
      type: 'auto_response',
    };
  }

  private calculateResponseConfidence(intent: any, kbResults: any[], response: any): number {
    // Calculate confidence in auto-response
    return 0.8;
  }

  private async findBestAgent(context: any): Promise<any> {
    // Find best available agent based on skills and workload
    return {
      id: 'agent_123',
      name: 'Sarah Johnson',
      skills: ['technical', 'billing'],
      currentWorkload: 5,
    };
  }

  private escalatePriority(currentPriority: string): string {
    const priorityLevels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = priorityLevels.indexOf(currentPriority);
    return priorityLevels[Math.min(currentIndex + 1, priorityLevels.length - 1)];
  }

  private async notifyAgent(agent: any, ticketId: string, escalationId: string): Promise<void> {
    // Notify agent about escalated ticket
    console.log('Notifying agent:', { agent: agent.id, ticketId, escalationId });
  }

  private extractKeyPoints(messages: any[]): string[] {
    // Extract key points from conversation
    return ['Customer issue with login', 'Password reset required', 'Account verification needed'];
  }

  private generateSummaryText(ticketData: any, keyPoints: string[]): string {
    // Generate summary text
    return `Customer contacted via ${ticketData.channel} regarding ${keyPoints.join(', ')}.`;
  }

  private extractResolution(ticketData: any): string {
    // Extract resolution from closed ticket
    return 'Issue resolved by password reset and account verification.';
  }

  private async addKnowledgeBaseArticle(data: any): Promise<any> {
    // Add new KB article
    return { articleId: this.generateArticleId(), status: 'created' };
  }

  private async updateKnowledgeBaseArticle(data: any): Promise<any> {
    // Update existing KB article
    return { articleId: data.articleId, status: 'updated' };
  }

  private async getKnowledgeBaseSuggestions(data: any): Promise<any[]> {
    // Get KB article suggestions
    return [];
  }

  private validateTicketUpdate(update: any): void {
    // Validate ticket update data
    if (!update || typeof update !== 'object') {
      throw new Error('Invalid ticket update data');
    }
  }

  private shouldAutoClose(update: any): boolean {
    // Check if ticket should be auto-closed
    return update.status === 'resolved' && update.customerConfirmed === true;
  }

  // Data storage methods (would integrate with database)
  private async storeMessageData(result: any, context: WhatsAppMessageContext): Promise<void> {
    console.log('Storing message data:', { result, context });
  }

  private async storeTicketData(ticketId: string, context: SupportTicketContext, priority: string, sentiment: any): Promise<any> {
    console.log('Storing ticket data:', { ticketId, context, priority, sentiment });
    return { ticketId, status: 'open' };
  }

  private async updateTicketInDatabase(ticketId: string, update: any, agentId: string): Promise<void> {
    console.log('Updating ticket:', { ticketId, update, agentId });
  }

  private async storeEscalationData(escalationId: string, ticketId: string, agent: any, reason: string): Promise<void> {
    console.log('Storing escalation:', { escalationId, ticketId, agent, reason });
  }

  private async fetchTicketData(ticketId: string): Promise<any> {
    // Fetch ticket data from database
    return {
      ticketId,
      status: 'open',
      messages: [],
      channel: 'whatsapp',
    };
  }

  // ID generators
  private generateTicketId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEscalationId(): string {
    return `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateArticleId(): string {
    return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for Phase 2 integration
  async sendMessage(context: WhatsAppMessageContext): Promise<AgentResult> {
    return this.execute({
      task: 'send_whatsapp',
      context,
      priority: 'high'
    });
  }

  async createTicket(context: SupportTicketContext): Promise<AgentResult> {
    return this.execute({
      task: 'create_ticket',
      context,
      priority: 'medium'
    });
  }

  async respondToTicket(ticketId: string, message: string): Promise<AgentResult> {
    return this.execute({
      task: 'auto_respond',
      context: { ticketId, message },
      priority: 'high'
    });
  }
} 