import { supabase } from '../lib/supabase';

export interface Stakeholder {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  company?: string;
  influence: number;
  interest: number;
  relationship_health: number; // ✅ snake_case to match database
  last_contact?: string; // ✅ snake_case to match database  
  communication_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'; // ✅ snake_case
  preferred_channel: 'email' | 'slack' | 'meeting' | 'phone'; // ✅ snake_case
  tags: string[];
  notes?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CommunicationLog {
  id?: string;
  stakeholder_id: string;
  type: 'email' | 'meeting' | 'call' | 'slack' | 'other';
  subject: string;
  summary?: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at?: string;
  user_id?: string;
}

export class StakeholderService {
  static async getAllStakeholders(): Promise<Stakeholder[]> {
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stakeholders:', error);
      throw new Error(`Failed to fetch stakeholders: ${error.message}`);
    }

    return data || [];
  }

  static async getStakeholderById(id: string): Promise<Stakeholder | null> {
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching stakeholder:', error);
      return null;
    }

    return data;
  }

  static async createStakeholder(stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>): Promise<Stakeholder> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stakeholders')
      .insert([{ ...stakeholder, user_id: user.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating stakeholder:', error);
      throw new Error(`Failed to create stakeholder: ${error.message}`);
    }

    return data;
  }

  static async updateStakeholder(id: string, updates: Partial<Stakeholder>): Promise<Stakeholder> {
    const { data, error } = await supabase
      .from('stakeholders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating stakeholder:', error);
      throw new Error(`Failed to update stakeholder: ${error.message}`);
    }

    return data;
  }

  static async deleteStakeholder(id: string): Promise<void> {
    const { error } = await supabase
      .from('stakeholders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting stakeholder:', error);
      throw new Error(`Failed to delete stakeholder: ${error.message}`);
    }
  }

  static async getCommunicationHistory(stakeholderId: string): Promise<CommunicationLog[]> {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('stakeholder_id', stakeholderId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching communication history:', error);
      throw new Error(`Failed to fetch communication history: ${error.message}`);
    }

    return data || [];
  }

  static async addCommunication(communication: Omit<CommunicationLog, 'id' | 'created_at'>): Promise<CommunicationLog> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('communication_logs')
      .insert([{ ...communication, user_id: user.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding communication:', error);
      throw new Error(`Failed to add communication: ${error.message}`);
    }

    return data;
  }
}