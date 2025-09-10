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

  // AI Chat Integration - Search functionality
  static async searchStakeholders(query: string): Promise<Stakeholder[]> {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .or(`name.ilike.%${query}%,role.ilike.%${query}%,department.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching stakeholders:', error);
        // Fallback to mock data for development
        return this.getMockStakeholders().filter(stakeholder => 
          stakeholder.name.toLowerCase().includes(query.toLowerCase()) ||
          stakeholder.role.toLowerCase().includes(query.toLowerCase()) ||
          stakeholder.department.toLowerCase().includes(query.toLowerCase()) ||
          (stakeholder.notes && stakeholder.notes.toLowerCase().includes(query.toLowerCase()))
        );
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchStakeholders:', error);
      // Fallback to mock search
      return this.getMockStakeholders().filter(stakeholder => 
        stakeholder.name.toLowerCase().includes(query.toLowerCase()) ||
        stakeholder.role.toLowerCase().includes(query.toLowerCase()) ||
        stakeholder.department.toLowerCase().includes(query.toLowerCase()) ||
        (stakeholder.notes && stakeholder.notes.toLowerCase().includes(query.toLowerCase()))
      );
    }
  }

  // Mock data for development/fallback
  private static getMockStakeholders(): Stakeholder[] {
    return [
      {
        id: 'stakeholder-1',
        name: 'Sarah Johnson',
        role: 'Product Marketing Manager',
        department: 'Marketing',
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0123',
        influence_level: 'high',
        interest_level: 'high',
        communication_preference: 'email',
        notes: 'Key stakeholder for go-to-market strategy. Prefers detailed reports and regular updates on feature progress.',
        last_contact: '2024-01-15T14:30:00Z',
        next_scheduled_contact: '2024-01-22T10:00:00Z',
        tags: ['marketing', 'product-strategy', 'go-to-market'],
        projects_involved: ['mobile-app-v2', 'user-onboarding'],
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        user_id: 'current-user'
      },
      {
        id: 'stakeholder-2',
        name: 'Mike Chen',
        role: 'Engineering Director',
        department: 'Engineering',
        email: 'mike.chen@company.com',
        phone: '+1-555-0124',
        influence_level: 'high',
        interest_level: 'medium',
        communication_preference: 'meeting',
        notes: 'Technical stakeholder focused on architecture and scalability. Needs technical specifications and performance metrics.',
        last_contact: '2024-01-14T16:00:00Z',
        next_scheduled_contact: '2024-01-21T15:00:00Z',
        tags: ['engineering', 'architecture', 'technical'],
        projects_involved: ['api-redesign', 'performance-optimization'],
        created_at: '2024-01-08T11:00:00Z',
        updated_at: '2024-01-14T16:00:00Z',
        user_id: 'current-user'
      },
      {
        id: 'stakeholder-3',
        name: 'Lisa Park',
        role: 'Customer Success Manager',
        department: 'Customer Success',
        email: 'lisa.park@company.com',
        phone: '+1-555-0125',
        influence_level: 'medium',
        interest_level: 'high',
        communication_preference: 'slack',
        notes: 'Represents customer voice in product decisions. Provides valuable feedback on user experience and feature requests.',
        last_contact: '2024-01-13T10:30:00Z',
        next_scheduled_contact: '2024-01-20T14:00:00Z',
        tags: ['customer-success', 'ux-feedback', 'customer-voice'],
        projects_involved: ['user-experience-improvements', 'support-features'],
        created_at: '2024-01-05T14:00:00Z',
        updated_at: '2024-01-13T10:30:00Z',
        user_id: 'current-user'
      }
    ];
  }
}