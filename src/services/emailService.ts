// src/services/emailService.ts
import { supabase } from '../lib/supabase';

export interface Email {
  id?: string;
  from_address: string;
  from_name?: string;
  to_address: string;
  subject: string;
  content: string;
  preview?: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read' | 'replied' | 'forwarded' | 'archived';
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  tags?: string[];
  starred?: boolean;
  ai_summary?: string;
  suggested_response?: string;
  thread_id?: string;
  original_email_id?: string;
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject_template: string;
  content_template: string;
  category?: string;
  tags?: string[];
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export class EmailService {
  // ==================== EMAIL OPERATIONS ====================
  
  static async getAllEmails(filters?: {
    status?: Email['status'];
    priority?: Email['priority'];
    sentiment?: Email['sentiment'];
    starred?: boolean;
    search?: string;
    limit?: number;
  }): Promise<Email[]> {
    let query = supabase
      .from('emails')
      .select('*')
      .order('timestamp', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.sentiment) {
        query = query.eq('sentiment', filters.sentiment);
      }
      if (filters.starred !== undefined) {
        query = query.eq('starred', filters.starred);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%,from_address.ilike.%${filters.search}%`);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails');
    }

    return data || [];
  }

  static async getEmailById(id: string): Promise<Email | null> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching email:', error);
      throw new Error('Failed to fetch email');
    }

    return data;
  }

  static async createEmail(email: Omit<Email, 'id' | 'created_at' | 'updated_at'>): Promise<Email> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Ensure required fields
    const emailData = {
      ...email,
      user_id: user.user.id,
      timestamp: email.timestamp || new Date().toISOString(),
      preview: email.preview || email.content.substring(0, 300),
      sentiment_score: email.sentiment_score ?? (
        email.sentiment === 'positive' ? 0.8 : 
        email.sentiment === 'negative' ? -0.6 : 0.1
      ),
      starred: email.starred ?? false,
      tags: email.tags ?? [],
      attachments: email.attachments ?? []
    };

    const { data, error } = await supabase
      .from('emails')
      .insert([emailData])
      .select()
      .single();

    if (error) {
      console.error('Error creating email:', error);
      throw new Error('Failed to create email');
    }

    return data;
  }

  static async updateEmail(id: string, updates: Partial<Email>): Promise<Email> {
    // Remove read-only fields
    const { id: _, created_at, updated_at, user_id, ...updateData } = updates;

    const { data, error } = await supabase
      .from('emails')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email:', error);
      throw new Error('Failed to update email');
    }

    return data;
  }

  static async deleteEmail(id: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting email:', error);
      throw new Error('Failed to delete email');
    }
  }

  static async markAsRead(id: string): Promise<Email> {
    return this.updateEmail(id, { status: 'read' });
  }

  static async markAsUnread(id: string): Promise<Email> {
    return this.updateEmail(id, { status: 'unread' });
  }

  static async toggleStarred(id: string): Promise<Email> {
    const email = await this.getEmailById(id);
    if (!email) throw new Error('Email not found');
    
    return this.updateEmail(id, { starred: !email.starred });
  }

  static async archiveEmail(id: string): Promise<Email> {
    return this.updateEmail(id, { status: 'archived' });
  }

  static async bulkUpdateStatus(emailIds: string[], status: Email['status']): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .update({ status })
      .in('id', emailIds);

    if (error) {
      console.error('Error bulk updating emails:', error);
      throw new Error('Failed to update emails');
    }
  }

  static async bulkDelete(emailIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .delete()
      .in('id', emailIds);

    if (error) {
      console.error('Error bulk deleting emails:', error);
      throw new Error('Failed to delete emails');
    }
  }

  // ==================== SEARCH & ANALYTICS ====================

  static async searchEmails(query: string, filters?: {
    status?: Email['status'];
    priority?: Email['priority'];
    sentiment?: Email['sentiment'];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Email[]> {
    let dbQuery = supabase
      .from('emails')
      .select('*')
      .or(`subject.ilike.%${query}%,content.ilike.%${query}%,from_address.ilike.%${query}%,from_name.ilike.%${query}%`)
      .order('timestamp', { ascending: false });

    if (filters) {
      if (filters.status) {
        dbQuery = dbQuery.eq('status', filters.status);
      }
      if (filters.priority) {
        dbQuery = dbQuery.eq('priority', filters.priority);
      }
      if (filters.sentiment) {
        dbQuery = dbQuery.eq('sentiment', filters.sentiment);
      }
      if (filters.dateFrom) {
        dbQuery = dbQuery.gte('timestamp', filters.dateFrom);
      }
      if (filters.dateTo) {
        dbQuery = dbQuery.lte('timestamp', filters.dateTo);
      }
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching emails:', error);
      throw new Error('Failed to search emails');
    }

    return data || [];
  }

  static async getEmailAnalytics(): Promise<{
    total: number;
    unread: number;
    byPriority: Record<string, number>;
    bySentiment: Record<string, number>;
    byStatus: Record<string, number>;
    recentCount: number;
    averageSentiment: number;
  }> {
    const { data: emails, error } = await supabase
      .from('emails')
      .select('priority, sentiment, status, timestamp, sentiment_score');

    if (error) {
      console.error('Error fetching email analytics:', error);
      throw new Error('Failed to fetch analytics');
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const analytics = {
      total: emails?.length || 0,
      unread: emails?.filter(e => e.status === 'unread').length || 0,
      byPriority: {} as Record<string, number>,
      bySentiment: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      recentCount: emails?.filter(e => new Date(e.timestamp) >= sevenDaysAgo).length || 0,
      averageSentiment: 0
    };

    if (emails && emails.length > 0) {
      // Count by priority
      emails.forEach(email => {
        analytics.byPriority[email.priority] = (analytics.byPriority[email.priority] || 0) + 1;
        analytics.bySentiment[email.sentiment] = (analytics.bySentiment[email.sentiment] || 0) + 1;
        analytics.byStatus[email.status] = (analytics.byStatus[email.status] || 0) + 1;
      });

      // Calculate average sentiment
      const validScores = emails.filter(e => e.sentiment_score !== null).map(e => e.sentiment_score || 0);
      if (validScores.length > 0) {
        analytics.averageSentiment = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
      }
    }

    return analytics;
  }

  // ==================== EMAIL TEMPLATE OPERATIONS ====================

  static async getAllTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch email templates');
    }

    return data || [];
  }

  static async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      throw new Error('Failed to fetch template');
    }

    return data;
  }

  static async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<EmailTemplate> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const templateData = {
      ...template,
      user_id: user.user.id,
      usage_count: 0,
      tags: template.tags || []
    };

    const { data, error } = await supabase
      .from('email_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }

    return data;
  }

  static async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    // Remove read-only fields
    const { id: _, created_at, updated_at, user_id, ...updateData } = updates;

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }

    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  static async incrementTemplateUsage(id: string): Promise<EmailTemplate> {
    const template = await this.getTemplateById(id);
    if (!template) throw new Error('Template not found');

    const { data, error } = await supabase
      .from('email_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing template usage:', error);
      throw new Error('Failed to update template usage');
    }

    return data;
  }

  static async getPopularTemplates(limit: number = 5): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular templates:', error);
      throw new Error('Failed to fetch popular templates');
    }

    return data || [];
  }

  // ==================== AI & AUTOMATION ====================

  static async generateEmailSummary(emailId: string): Promise<string> {
    // Simulate AI email summarization
    const email = await this.getEmailById(emailId);
    if (!email) throw new Error('Email not found');

    // Simple summarization logic (in a real app, this would call an AI service)
    const sentences = email.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 2).join('. ').trim();
    
    // Update email with generated summary
    await this.updateEmail(emailId, { ai_summary: summary || 'No summary available' });
    
    return summary || 'No summary available';
  }

  static async generateSuggestedResponse(emailId: string): Promise<string> {
    // Simulate AI response generation
    const email = await this.getEmailById(emailId);
    if (!email) throw new Error('Email not found');

    let suggestedResponse = '';

    // Simple rule-based response generation (in a real app, this would use AI)
    if (email.content.toLowerCase().includes('meeting')) {
      suggestedResponse = 'Thank you for your email. I would be happy to schedule a meeting. Please let me know your availability for next week.';
    } else if (email.content.toLowerCase().includes('question')) {
      suggestedResponse = 'Thank you for your question. I will look into this and get back to you within 24 hours.';
    } else if (email.sentiment === 'negative') {
      suggestedResponse = 'I understand your concerns and appreciate you bringing this to my attention. Let me address each point and provide a resolution.';
    } else {
      suggestedResponse = 'Thank you for your email. I appreciate you reaching out and will respond to your message shortly.';
    }

    // Update email with suggested response
    await this.updateEmail(emailId, { suggested_response: suggestedResponse });
    
    return suggestedResponse;
  }

  static async analyzeEmailSentiment(content: string): Promise<{ sentiment: Email['sentiment']; score: number }> {
    // Simple sentiment analysis (in a real app, this would use AI service)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect', 'outstanding'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointed', 'frustrated', 'angry', 'upset'];
    
    const words = content.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment: Email['sentiment'] = 'neutral';
    let score = 0;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min(0.9, 0.3 + (positiveCount - negativeCount) * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = Math.max(-0.9, -0.3 - (negativeCount - positiveCount) * 0.1);
    } else {
      sentiment = 'neutral';
      score = Math.random() * 0.2 - 0.1; // Small random variation around neutral
    }
    
    return { sentiment, score };
  }

  // ==================== THREAD MANAGEMENT ====================

  static async getEmailThread(emailId: string): Promise<Email[]> {
    const email = await this.getEmailById(emailId);
    if (!email) throw new Error('Email not found');

    const threadId = email.thread_id || emailId;

    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('thread_id', threadId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching email thread:', error);
      throw new Error('Failed to fetch email thread');
    }

    return data || [];
  }

  static async createEmailReply(originalEmailId: string, replyData: {
    subject: string;
    content: string;
    to_address: string;
  }): Promise<Email> {
    const originalEmail = await this.getEmailById(originalEmailId);
    if (!originalEmail) throw new Error('Original email not found');

    const reply: Omit<Email, 'id' | 'created_at' | 'updated_at'> = {
      from_address: originalEmail.to_address,
      from_name: 'Current User',
      to_address: replyData.to_address,
      subject: replyData.subject.startsWith('Re:') ? replyData.subject : `Re: ${replyData.subject}`,
      content: replyData.content,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      status: 'read', // Outgoing emails are marked as read
      sentiment: 'neutral',
      thread_id: originalEmail.thread_id || originalEmail.id,
      original_email_id: originalEmailId
    };

    // Analyze sentiment of the reply
    const sentimentAnalysis = await this.analyzeEmailSentiment(reply.content);
    reply.sentiment = sentimentAnalysis.sentiment;
    reply.sentiment_score = sentimentAnalysis.score;

    return this.createEmail(reply);
  }
}