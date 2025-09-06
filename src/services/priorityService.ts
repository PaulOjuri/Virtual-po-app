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
}
