import { supabase } from '../lib/supabase';

export interface Priority {
  id?: string;
  title: string;
  description?: string;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  urgency: number;
  impact: number;
  assigned_to?: string;
  due_date?: string;
  tags?: string[];
  progress?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export class PriorityService {
  static async getAllPriorities(): Promise<Priority[]> {
    const { data, error } = await supabase
      .from('priorities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching priorities:', error);
      throw new Error('Failed to fetch priorities');
    }

    return data || [];
  }

  static async createPriority(priority: Omit<Priority, 'id' | 'created_at' | 'updated_at'>): Promise<Priority> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('priorities')
      .insert([{ ...priority, user_id: user.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating priority:', error);
      throw new Error('Failed to create priority');
    }

    return data;
  }

  static async updatePriority(id: string, updates: Partial<Priority>): Promise<Priority> {
    const { data, error } = await supabase
      .from('priorities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating priority:', error);
      throw new Error('Failed to update priority');
    }

    return data;
  }

  static async deletePriority(id: string): Promise<void> {
    const { error } = await supabase
      .from('priorities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting priority:', error);
      throw new Error('Failed to delete priority');
    }
  }

  static async bulkUpdateStatus(priorityIds: string[], status: Priority['status']): Promise<void> {
    const { error } = await supabase
      .from('priorities')
      .update({ status })
      .in('id', priorityIds);

    if (error) {
      console.error('Error bulk updating status:', error);
      throw new Error('Failed to update priority statuses');
    }
  }

  static async bulkDelete(priorityIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('priorities')
      .delete()
      .in('id', priorityIds);

    if (error) {
      console.error('Error bulk deleting priorities:', error);
      throw new Error('Failed to delete priorities');
    }
  }

  static async updatePriorityPosition(id: string, urgency: number, impact: number): Promise<Priority> {
    return this.updatePriority(id, { urgency, impact });
  }

  // AI Chat Integration - Search functionality
  static async searchPriorities(query: string): Promise<Priority[]> {
    try {
      const { data, error } = await supabase
        .from('priorities')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching priorities:', error);
        // Fallback to mock data for development
        return this.getMockPriorities().filter(priority => 
          priority.title.toLowerCase().includes(query.toLowerCase()) ||
          (priority.description && priority.description.toLowerCase().includes(query.toLowerCase())) ||
          priority.category.toLowerCase().includes(query.toLowerCase())
        );
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchPriorities:', error);
      // Fallback to mock search
      return this.getMockPriorities().filter(priority => 
        priority.title.toLowerCase().includes(query.toLowerCase()) ||
        (priority.description && priority.description.toLowerCase().includes(query.toLowerCase())) ||
        priority.category.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Mock data for development/fallback
  private static getMockPriorities(): Priority[] {
    return [
      {
        id: 'priority-1',
        title: 'Implement User Authentication',
        description: 'Add OAuth 2.0 authentication with multi-factor authentication support',
        category: 'Security',
        urgency: 9,
        impact: 8,
        priority_level: 'high',
        effort_estimate: 13,
        business_value: 85,
        status: 'in_progress',
        assigned_to: 'dev-team-1',
        due_date: '2024-02-15',
        tags: ['authentication', 'security', 'oauth'],
        dependencies: [],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        user_id: 'current-user'
      },
      {
        id: 'priority-2',
        title: 'Mobile App Performance Optimization',
        description: 'Optimize mobile app loading times and reduce memory usage',
        category: 'Performance',
        urgency: 7,
        impact: 9,
        priority_level: 'high',
        effort_estimate: 8,
        business_value: 75,
        status: 'todo',
        assigned_to: 'mobile-team',
        due_date: '2024-02-28',
        tags: ['mobile', 'performance', 'optimization'],
        dependencies: ['priority-1'],
        created_at: '2024-01-14T09:15:00Z',
        updated_at: '2024-01-14T16:45:00Z',
        user_id: 'current-user'
      },
      {
        id: 'priority-3',
        title: 'API Documentation Update',
        description: 'Update API documentation with new endpoints and authentication methods',
        category: 'Documentation',
        urgency: 5,
        impact: 6,
        priority_level: 'medium',
        effort_estimate: 3,
        business_value: 40,
        status: 'todo',
        assigned_to: 'doc-team',
        due_date: '2024-03-10',
        tags: ['documentation', 'api', 'endpoints'],
        dependencies: [],
        created_at: '2024-01-13T11:20:00Z',
        updated_at: '2024-01-13T15:10:00Z',
        user_id: 'current-user'
      }
    ];
  }
}
