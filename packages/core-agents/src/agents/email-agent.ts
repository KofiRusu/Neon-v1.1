import { AbstractAgent, AgentPayload, AgentResult } from '../base-agent';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'welcome' | 'nurture' | 'promotion' | 'retention' | 'follow_up';
}

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  emails: Array<{
    templateId: string;
    delayDays: number;
    condition?: string;
  }>;
  triggerType: 'signup' | 'purchase' | 'abandonment' | 'manual';
}

interface EmailRecipient {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  customFields?: Record<string, any>;
  segmentTags?: string[];
}

export class EmailAgent extends AbstractAgent {
  private templates: Map<string, EmailTemplate> = new Map();
  private sequences: Map<string, EmailSequence> = new Map();
  
  constructor(id: string, name: string) {
    super(id, name, 'email', [
      'send_email',
      'create_sequence',
      'schedule_campaign',
      'segment_audience',
      'track_performance',
      'a_b_test_emails',
      'manage_templates'
    ]);
    
    this.initializeDefaultTemplates();
    this.initializeDefaultSequences();
  }

  async execute(payload: AgentPayload): Promise<AgentResult> {
    return this.executeWithErrorHandling(payload, async () => {
      const { task, context } = payload;
      
      switch (task) {
        case 'send_email':
          return await this.sendEmail(context);
        case 'create_sequence':
          return await this.createEmailSequence(context);
        case 'schedule_campaign':
          return await this.scheduleCampaign(context);
        case 'segment_audience':
          return await this.segmentAudience(context);
        case 'track_performance':
          return await this.trackPerformance(context);
        case 'a_b_test_emails':
          return await this.abTestEmails(context);
        case 'manage_templates':
          return await this.manageTemplates(context);
        default:
          throw new Error(`Unknown task: ${task}`);
      }
    });
  }

  private async sendEmail(context: any): Promise<any> {
    const { 
      recipients, 
      templateId, 
      subject, 
      customContent, 
      variables = {},
      scheduleTime,
      priority = 'normal'
    } = context;

    // Validate recipients
    const validatedRecipients = await this.validateRecipients(recipients);
    
    // Get or create template
    let template: EmailTemplate;
    if (templateId) {
      const foundTemplate = this.templates.get(templateId);
      if (!foundTemplate) {
        throw new Error(`Template ${templateId} not found`);
      }
      template = foundTemplate;
    } else {
      template = {
        id: `custom_${Date.now()}`,
        name: 'Custom Email',
        subject: subject || 'Important Message from NeonHub',
        content: customContent || 'Custom email content',
        variables: Object.keys(variables),
        type: 'follow_up'
      };
    }

    // Process email content with variables
    const processedEmails = validatedRecipients.map(recipient => ({
      recipientId: recipient.email,
      recipient,
      subject: this.processTemplate(template.subject, { ...variables, ...recipient }),
      content: this.processTemplate(template.content, { ...variables, ...recipient }),
      templateId: template.id,
      scheduledFor: scheduleTime ? new Date(scheduleTime) : new Date(),
      priority,
      status: 'queued'
    }));

    // Simulate sending (in real implementation, this would integrate with email provider)
    const results = processedEmails.map(email => ({
      ...email,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.05 ? 'sent' : 'failed', // 95% success rate
      sentAt: new Date(),
      estimatedDeliveryTime: new Date(Date.now() + Math.random() * 300000) // 0-5 minutes
    }));

    const successCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return {
      campaignId: `email_campaign_${Date.now()}`,
      totalEmails: results.length,
      successful: successCount,
      failed: failedCount,
      successRate: (successCount / results.length * 100).toFixed(2) + '%',
      results,
      estimatedDeliveryTimeRange: '0-5 minutes',
      metadata: {
        templateId: template.id,
        variables: Object.keys(variables),
        priority,
        timestamp: new Date().toISOString()
      }
    };
  }

  private async createEmailSequence(context: any): Promise<any> {
    const {
      name,
      description,
      triggerType,
      emails,
      targetSegment
    } = context;

    // Validate email sequence structure
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('Email sequence must contain at least one email');
    }

    // Create sequence
    const sequence: EmailSequence = {
      id: `seq_${Date.now()}`,
      name: name || 'Untitled Sequence',
      description: description || 'Email sequence created by EmailAgent',
      emails: emails.map((email, index) => ({
        templateId: email.templateId || this.getDefaultTemplateId('nurture'),
        delayDays: email.delayDays || index * 3, // Default 3-day intervals
        condition: email.condition
      })),
      triggerType: triggerType || 'manual'
    };

    this.sequences.set(sequence.id, sequence);

    // Estimate sequence performance
    const estimatedOpen = (Math.random() * 15 + 20).toFixed(1); // 20-35%
    const estimatedClick = (Math.random() * 8 + 5).toFixed(1); // 5-13%
    const estimatedConversion = (Math.random() * 3 + 2).toFixed(1); // 2-5%

    return {
      sequenceId: sequence.id,
      sequence,
      status: 'active',
      estimatedPerformance: {
        openRate: estimatedOpen + '%',
        clickRate: estimatedClick + '%',
        conversionRate: estimatedConversion + '%'
      },
      duration: `${Math.max(...sequence.emails.map(e => e.delayDays))} days`,
      targetSegment: targetSegment || 'all_subscribers',
      metadata: {
        createdAt: new Date().toISOString(),
        emailCount: sequence.emails.length,
        triggerType: sequence.triggerType
      }
    };
  }

  private async scheduleCampaign(context: any): Promise<any> {
    const {
      name,
      templateId,
      recipients,
      scheduleTime,
      timezone = 'UTC',
      frequency = 'once',
      segmentRules
    } = context;

    // Apply segment rules if provided
    let targetRecipients = recipients;
    if (segmentRules) {
      targetRecipients = await this.applySegmentRules(recipients, segmentRules);
    }

    const campaign = {
      campaignId: `campaign_${Date.now()}`,
      name: name || 'Untitled Campaign',
      templateId,
      targetCount: targetRecipients.length,
      scheduleTime: new Date(scheduleTime || Date.now()),
      timezone,
      frequency,
      status: 'scheduled',
      estimatedDelivery: new Date(Date.now() + 3600000), // 1 hour from now
      performance: {
        estimatedOpenRate: (Math.random() * 10 + 25).toFixed(1) + '%',
        estimatedClickRate: (Math.random() * 5 + 8).toFixed(1) + '%',
        estimatedConversions: Math.floor(targetRecipients.length * (Math.random() * 0.05 + 0.02))
      }
    };

    return {
      campaign,
      message: `Campaign "${campaign.name}" scheduled successfully`,
      deliveryWindow: this.calculateDeliveryWindow(scheduleTime, timezone),
      previewUrl: `https://preview.neonhub.com/email/${campaign.campaignId}`,
      metadata: {
        timestamp: new Date().toISOString(),
        agentId: this.id
      }
    };
  }

  private async segmentAudience(context: any): Promise<any> {
    const {
      audienceList,
      segmentRules,
      segmentName
    } = context;

    // Apply segmentation logic
    const segments: Record<string, any[]> = {
      high_value: audienceList.filter((contact: any) => 
        (contact.totalPurchases || 0) > 5 || (contact.totalSpent || 0) > 1000
      ),
      new_subscribers: audienceList.filter((contact: any) => {
        const daysSince = (Date.now() - new Date(contact.subscribedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      }),
      engaged: audienceList.filter((contact: any) => 
        (contact.lastOpenDays || 999) <= 14 || (contact.lastClickDays || 999) <= 30
      ),
      at_risk: audienceList.filter((contact: any) => 
        (contact.lastOpenDays || 0) > 60 && (contact.lastOpenDays || 0) <= 120
      ),
      inactive: audienceList.filter((contact: any) => 
        (contact.lastOpenDays || 0) > 120
      )
    };

    // Apply custom rules if provided
    if (segmentRules) {
      const customSegment = this.applyCustomSegmentRules(audienceList, segmentRules);
      segments[segmentName || 'custom'] = customSegment;
    }

    return {
      totalContacts: audienceList.length,
      segments: Object.keys(segments).map(key => {
        const segment = segments[key] || [];
        return {
          name: key,
          count: segment.length,
          percentage: (segment.length / audienceList.length * 100).toFixed(1) + '%',
          contacts: segment.slice(0, 10) // Preview first 10
        };
      }),
      recommendations: [
        'Send welcome series to new_subscribers',
        'Re-engagement campaign for at_risk segment',
        'Exclusive offers for high_value customers',
        'Win-back campaign for inactive users'
      ],
      metadata: {
        segmentedAt: new Date().toISOString(),
        rulesApplied: segmentRules ? Object.keys(segmentRules).length : 0
      }
    };
  }

  private async trackPerformance(context: any): Promise<any> {
    const {
      campaignId,
      timeRange = '30d',
      metrics: _metrics = ['opens', 'clicks', 'conversions', 'unsubscribes']
    } = context;

    // Generate realistic performance data
    const baseOpen = Math.random() * 15 + 20; // 20-35%
    const baseClick = Math.random() * 8 + 5; // 5-13%
    const baseConversion = Math.random() * 3 + 2; // 2-5%

    const performance = {
      campaignId: campaignId || 'all_campaigns',
      timeRange,
      metrics: {
        sent: Math.floor(Math.random() * 5000 + 1000),
        delivered: 0,
        opens: 0,
        clicks: 0,
        conversions: 0,
        unsubscribes: 0,
        bounces: 0
      },
      rates: {
        deliveryRate: '97.8%',
        openRate: baseOpen.toFixed(1) + '%',
        clickRate: baseClick.toFixed(1) + '%',
        conversionRate: baseConversion.toFixed(1) + '%',
        unsubscribeRate: (Math.random() * 0.5 + 0.1).toFixed(2) + '%',
        bounceRate: (Math.random() * 2 + 1).toFixed(1) + '%'
      },
      trends: {
        openRate: Math.random() > 0.5 ? 'up' : 'down',
        clickRate: Math.random() > 0.5 ? 'up' : 'down',
        conversionRate: Math.random() > 0.5 ? 'up' : 'down'
      },
      topPerforming: [
        { subject: 'Transform Your Space with Custom Neon', openRate: '42.3%', clickRate: '18.7%' },
        { subject: 'Limited Time: 30% Off All Neon Signs', openRate: '38.9%', clickRate: '16.2%' },
        { subject: 'See What Others Are Creating', openRate: '35.1%', clickRate: '14.8%' }
      ]
    };

    // Calculate derived metrics
    performance.metrics.delivered = Math.floor(performance.metrics.sent * 0.978);
    performance.metrics.opens = Math.floor(performance.metrics.delivered * (baseOpen / 100));
    performance.metrics.clicks = Math.floor(performance.metrics.opens * (baseClick / baseOpen));
    performance.metrics.conversions = Math.floor(performance.metrics.clicks * (baseConversion / baseClick));
    performance.metrics.unsubscribes = Math.floor(performance.metrics.delivered * 0.002);
    performance.metrics.bounces = performance.metrics.sent - performance.metrics.delivered;

    return {
      performance,
      insights: [
        'Open rates are 15% above industry average',
        'Mobile opens account for 68% of all opens',
        'Tuesday sends perform best (32% higher engagement)',
        'Subject lines with emojis increase open rates by 12%'
      ],
      recommendations: [
        'Optimize for mobile-first design',
        'Test sending on Tuesday afternoons',
        'Include relevant emojis in subject lines',
        'Segment audience for personalized content'
      ],
      metadata: {
        retrievedAt: new Date().toISOString(),
        dataRange: timeRange
      }
    };
  }

  private async abTestEmails(context: any): Promise<any> {
    const {
      variants,
      testMetric = 'open_rate',
      sampleSize: _sampleSize = 0.2,
      duration = 24
    } = context;

    if (!variants || variants.length < 2) {
      throw new Error('A/B test requires at least 2 variants');
    }

    const test = {
      testId: `ab_test_${Date.now()}`,
      variants: variants.map((variant: any, index: number) => ({
        id: `variant_${String.fromCharCode(65 + index)}`, // A, B, C...
        name: variant.name || `Variant ${String.fromCharCode(65 + index)}`,
        subject: variant.subject,
        content: variant.content,
        templateId: variant.templateId,
        allocation: 1 / variants.length // Equal split
      })),
      testMetric,
      sampleSize: _sampleSize,
      duration: `${duration} hours`,
      status: 'running',
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 3600000),
      estimatedResults: variants.map((_variant: any, index: number) => {
        const baseRate = testMetric === 'open_rate' ? Math.random() * 15 + 20 : Math.random() * 8 + 5;
        return {
          variantId: `variant_${String.fromCharCode(65 + index)}`,
          [testMetric]: baseRate.toFixed(1) + '%',
          confidence: Math.random() * 30 + 70 // 70-100%
        };
      })
    };

    return {
      test,
      message: `A/B test created with ${variants.length} variants`,
      expectedCompletion: test.endTime,
      statisticalSignificance: 'Results available after minimum sample size reached',
      metadata: {
        createdAt: new Date().toISOString(),
        agentId: this.id
      }
    };
  }

  private async manageTemplates(context: any): Promise<any> {
    const { action, templateData } = context;

    switch (action) {
      case 'create':
        return this.createTemplate(templateData);
      case 'update':
        return this.updateTemplate(templateData);
      case 'delete':
        return this.deleteTemplate(templateData.id);
      case 'list':
        return this.listTemplates();
      case 'duplicate':
        return this.duplicateTemplate(templateData.id);
      default:
        throw new Error(`Unknown template action: ${action}`);
    }
  }

  // Helper methods
  private initializeDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome_basic',
        name: 'Welcome Email - Basic',
        subject: 'Welcome to NeonHub, {{firstName}}!',
        content: 'Hi {{firstName}},\n\nWelcome to NeonHub! We\'re excited to help you create amazing neon signs...',
        variables: ['firstName', 'company'],
        type: 'welcome'
      },
      {
        id: 'nurture_tips',
        name: 'Design Tips - Nurture',
        subject: '5 Pro Tips for Stunning Neon Sign Design',
        content: 'Want to create neon signs that truly stand out? Here are our top 5 design tips...',
        variables: ['firstName'],
        type: 'nurture'
      },
      {
        id: 'promotion_sale',
        name: 'Sale Promotion',
        subject: 'Limited Time: {{discount}}% Off All Custom Neon Signs',
        content: 'Don\'t miss out! Get {{discount}}% off all custom neon signs...',
        variables: ['firstName', 'discount', 'expiryDate'],
        type: 'promotion'
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeDefaultSequences(): void {
    const welcomeSequence: EmailSequence = {
      id: 'welcome_series',
      name: 'Welcome Email Series',
      description: 'Onboard new subscribers with valuable content',
      emails: [
        { templateId: 'welcome_basic', delayDays: 0 },
        { templateId: 'nurture_tips', delayDays: 3 },
        { templateId: 'promotion_sale', delayDays: 7 }
      ],
      triggerType: 'signup'
    };

    this.sequences.set(welcomeSequence.id, welcomeSequence);
  }

  private async validateRecipients(recipients: any[]): Promise<EmailRecipient[]> {
    return recipients.filter(recipient => {
      return recipient.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email);
    });
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, variables[key] || '');
    });
    return processed;
  }

  private getDefaultTemplateId(type: string): string {
    for (const [id, template] of this.templates) {
      if (template.type === type) return id;
    }
    return 'welcome_basic';
  }

  private async applySegmentRules(recipients: any[], rules: any): Promise<any[]> {
    // Simplified segmentation logic
    return recipients.filter(recipient => {
      if (rules.minPurchases && (recipient.totalPurchases || 0) < rules.minPurchases) return false;
      if (rules.location && recipient.location !== rules.location) return false;
      if (rules.subscriptionDate) {
        const daysSince = (Date.now() - new Date(recipient.subscribedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > rules.subscriptionDate) return false;
      }
      return true;
    });
  }

  private applyCustomSegmentRules(audienceList: any[], _rules: any): any[] {
    return audienceList.filter(_contact => {
      // Implement custom segmentation logic based on rules
      return true; // Simplified for now
    });
  }

  private calculateDeliveryWindow(scheduleTime: string, timezone: string): string {
    const scheduled = new Date(scheduleTime);
    const start = new Date(scheduled.getTime() - 300000); // 5 minutes before
    const end = new Date(scheduled.getTime() + 300000); // 5 minutes after
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()} ${timezone}`;
  }

  private createTemplate(templateData: any): any {
    const template: EmailTemplate = {
      id: `template_${Date.now()}`,
      name: templateData.name || 'Untitled Template',
      subject: templateData.subject || 'Subject Line',
      content: templateData.content || 'Email content here...',
      variables: templateData.variables || [],
      type: templateData.type || 'follow_up'
    };

    this.templates.set(template.id, template);

    return {
      template,
      message: 'Template created successfully',
      templateId: template.id
    };
  }

  private updateTemplate(templateData: any): any {
    const template = this.templates.get(templateData.id);
    if (!template) {
      throw new Error(`Template ${templateData.id} not found`);
    }

    Object.assign(template, templateData);
    this.templates.set(template.id, template);

    return {
      template,
      message: 'Template updated successfully'
    };
  }

  private deleteTemplate(templateId: string): any {
    if (!this.templates.has(templateId)) {
      throw new Error(`Template ${templateId} not found`);
    }

    this.templates.delete(templateId);

    return {
      message: 'Template deleted successfully',
      deletedTemplateId: templateId
    };
  }

  private listTemplates(): any {
    return {
      templates: Array.from(this.templates.values()),
      totalCount: this.templates.size,
      categories: {
        welcome: Array.from(this.templates.values()).filter(t => t.type === 'welcome').length,
        nurture: Array.from(this.templates.values()).filter(t => t.type === 'nurture').length,
        promotion: Array.from(this.templates.values()).filter(t => t.type === 'promotion').length,
        retention: Array.from(this.templates.values()).filter(t => t.type === 'retention').length,
        follow_up: Array.from(this.templates.values()).filter(t => t.type === 'follow_up').length
      }
    };
  }

  private duplicateTemplate(templateId: string): any {
    const originalTemplate = this.templates.get(templateId);
    if (!originalTemplate) {
      throw new Error(`Template ${templateId} not found`);
    }

    const duplicatedTemplate: EmailTemplate = {
      ...originalTemplate,
      id: `template_${Date.now()}`,
      name: `${originalTemplate.name} (Copy)`
    };

    this.templates.set(duplicatedTemplate.id, duplicatedTemplate);

    return {
      template: duplicatedTemplate,
      message: 'Template duplicated successfully',
      originalTemplateId: templateId,
      newTemplateId: duplicatedTemplate.id
    };
  }

  // Public API methods for tRPC compatibility
  async sendCampaign(input: any): Promise<any> {
    return await this.execute({
      task: 'send_email',
      context: {
        recipients: input.recipients.emails.map((email: string) => ({ email })),
        subject: input.subject,
        customContent: input.content.text,
        scheduleTime: input.scheduling?.scheduledAt,
        priority: 'normal'
      },
      priority: 'high'
    });
  }

  async createSequence(input: any): Promise<any> {
    return await this.execute({
      task: 'create_sequence',
      context: {
        name: input.name,
        triggerType: input.trigger,
        emails: input.emails.map((email: any) => ({
          templateId: email.template || 'welcome_basic',
          delayDays: email.delayDays,
          condition: email.conditions
        }))
      },
      priority: 'medium'
    });
  }

  async getAnalytics(campaignId: string): Promise<any> {
    return await this.execute({
      task: 'track_performance',
      context: {
        campaignId,
        timeRange: '30d',
        metrics: ['opens', 'clicks', 'conversions', 'unsubscribes']
      },
      priority: 'low'
    });
  }
}