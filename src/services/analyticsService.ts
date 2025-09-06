// src/services/analyticsService.ts
import { supabase } from '../lib/supabase';

// Types for analytics data
export interface AnalyticsOverview {
  total_priorities: number;
  completed_priorities: number;
  critical_priorities: number;
  urgent_priorities: number;
  total_meetings: number;
  completed_meetings: number;
  upcoming_meetings: number;
  avg_meeting_duration: number;
  total_emails: number;
  unread_emails: number;
  high_priority_emails: number;
  positive_emails: number;
  total_stakeholders: number;
  key_stakeholders: number;
  avg_relationship_health: number;
  total_documents: number;
  starred_documents: number;
  total_folders: number;
  total_tasks: number;
  completed_tasks: number;
  total_plans: number;
}

export interface PriorityAnalytics {
  priority_level: string;
  status: string;
  count: number;
  avg_urgency: number;
  avg_impact: number;
  avg_progress: number;
}

export interface MeetingAnalytics {
  meeting_type: string;
  status: string;
  count: number;
  avg_duration: number;
  week_start: string;
}

export interface StakeholderMatrix {
  quadrant: 'manage_closely' | 'keep_satisfied' | 'keep_informed' | 'monitor';
  count: number;
  avg_health: number;
}

export interface ActivityTimeline {
  activity_date: string;
  activity_type: 'priority' | 'meeting' | 'email' | 'stakeholder' | 'task';
  total_count: number;
}

export interface EmailSentimentAnalytics {
  week_start: string;
  sentiment: string;
  count: number;
  avg_score: number;
}

export interface PriorityAging {
  age_group: string;
  count: number;
  avg_urgency: number;
  avg_progress: number;
}

export interface CommunicationAnalytics {
  communication_frequency: string;
  stakeholder_count: number;
  avg_health: number;
  total_communications: number;
  last_communication: string;
}

export interface KnowledgeBaseAnalytics {
  file_type: string;
  count: number;
  avg_size: number;
  starred_count: number;
}

export interface PerformanceTrends {
  week_start: string;
  completed_priorities: number;
  total_priorities: number;
  avg_urgency: number;
  avg_impact: number;
  completed_meetings: number;
  total_meetings: number;
  avg_duration: number;
  completed_tasks: number;
  total_tasks: number;
  priority_completion_rate: number;
  meeting_completion_rate: number;
  task_completion_rate: number;
}

export interface AIInsight {
  insight_type: string;
  insight_title: string;
  insight_description: string;
  priority_level: 'high' | 'medium' | 'low';
  data_source: string;
}

class AnalyticsService {
  // Get overview analytics
  async getOverview(): Promise<AnalyticsOverview | null> {
    try {
      const { data, error } = await supabase
        .from('analytics_overview')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching analytics overview:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOverview:', error);
      return null;
    }
  }

  // Get priority analytics
  async getPriorityAnalytics(): Promise<PriorityAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('priority_analytics')
        .select('*')
        .order('priority_level', { ascending: false });

      if (error) {
        console.error('Error fetching priority analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPriorityAnalytics:', error);
      return [];
    }
  }

  // Get meeting analytics
  async getMeetingAnalytics(): Promise<MeetingAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('meeting_analytics')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching meeting analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMeetingAnalytics:', error);
      return [];
    }
  }

  // Get stakeholder matrix
  async getStakeholderMatrix(): Promise<StakeholderMatrix[]> {
    try {
      const { data, error } = await supabase
        .from('stakeholder_matrix')
        .select('*');

      if (error) {
        console.error('Error fetching stakeholder matrix:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStakeholderMatrix:', error);
      return [];
    }
  }

  // Get activity timeline
  async getActivityTimeline(): Promise<ActivityTimeline[]> {
    try {
      const { data, error } = await supabase
        .from('activity_timeline')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching activity timeline:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActivityTimeline:', error);
      return [];
    }
  }

  // Get email sentiment analytics
  async getEmailSentimentAnalytics(): Promise<EmailSentimentAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('email_sentiment_analytics')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching email sentiment analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEmailSentimentAnalytics:', error);
      return [];
    }
  }

  // Get priority aging analysis
  async getPriorityAging(): Promise<PriorityAging[]> {
    try {
      const { data, error } = await supabase
        .from('priority_aging')
        .select('*');

      if (error) {
        console.error('Error fetching priority aging:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPriorityAging:', error);
      return [];
    }
  }

  // Get communication analytics
  async getCommunicationAnalytics(): Promise<CommunicationAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('communication_analytics')
        .select('*');

      if (error) {
        console.error('Error fetching communication analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCommunicationAnalytics:', error);
      return [];
    }
  }

  // Get knowledge base analytics
  async getKnowledgeBaseAnalytics(): Promise<KnowledgeBaseAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('kb_analytics')
        .select('*')
        .order('count', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge base analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getKnowledgeBaseAnalytics:', error);
      return [];
    }
  }

  // Get performance trends
  async getPerformanceTrends(): Promise<PerformanceTrends[]> {
    try {
      const { data, error } = await supabase
        .from('performance_trends')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching performance trends:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPerformanceTrends:', error);
      return [];
    }
  }

  // Get AI insights
  async getAIInsights(): Promise<AIInsight[]> {
    try {
      const { data, error } = await supabase.rpc('get_ai_insights');

      if (error) {
        console.error('Error fetching AI insights:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAIInsights:', error);
      return [];
    }
  }

  // Subscribe to analytics updates
  subscribeToAnalyticsUpdates(callback: () => void) {
    const channels = [
      supabase.channel('priorities-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'priorities' },
        callback
      ),
      supabase.channel('meetings-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meetings' },
        callback
      ),
      supabase.channel('emails-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emails' },
        callback
      ),
      supabase.channel('stakeholders-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stakeholders' },
        callback
      ),
      supabase.channel('daily-tasks-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_tasks' },
        callback
      ),
      supabase.channel('kb-documents-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kb_documents' },
        callback
      )
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }

  // Calculate productivity score based on completion rates
  calculateProductivityScore(overview: AnalyticsOverview): number {
    const priorityRate = overview.total_priorities > 0 
      ? (overview.completed_priorities / overview.total_priorities) * 100 
      : 0;
    
    const meetingRate = overview.total_meetings > 0 
      ? (overview.completed_meetings / overview.total_meetings) * 100 
      : 0;
    
    const taskRate = overview.total_tasks > 0 
      ? (overview.completed_tasks / overview.total_tasks) * 100 
      : 0;

    // Weighted average: priorities 40%, meetings 30%, tasks 30%
    return Math.round((priorityRate * 0.4) + (meetingRate * 0.3) + (taskRate * 0.3));
  }

  // Get formatted metrics for dashboard
  async getDashboardMetrics() {
    const overview = await this.getOverview();
    if (!overview) return null;

    const productivityScore = this.calculateProductivityScore(overview);
    
    return {
      overview,
      productivityScore,
      priorityCompletionRate: overview.total_priorities > 0 
        ? Math.round((overview.completed_priorities / overview.total_priorities) * 100)
        : 0,
      meetingEfficiency: overview.total_meetings > 0 
        ? Math.round((overview.completed_meetings / overview.total_meetings) * 100)
        : 0,
      stakeholderHealthScore: Math.round(overview.avg_relationship_health * 20), // Convert to percentage
      taskCompletionRate: overview.total_tasks > 0 
        ? Math.round((overview.completed_tasks / overview.total_tasks) * 100)
        : 0
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;