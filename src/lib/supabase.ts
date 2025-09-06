import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      priorities: {
        Row: {
          id: string
          title: string
          description: string | null
          priority_level: 'critical' | 'high' | 'medium' | 'low'
          status: 'backlog' | 'in-progress' | 'review' | 'done'
          urgency: number
          impact: number
          assigned_to: string | null
          due_date: string | null
          tags: string[] | null
          progress: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority_level: 'critical' | 'high' | 'medium' | 'low'
          status?: 'backlog' | 'in-progress' | 'review' | 'done'
          urgency: number
          impact: number
          assigned_to?: string | null
          due_date?: string | null
          tags?: string[] | null
          progress?: number
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority_level?: 'critical' | 'high' | 'medium' | 'low'
          status?: 'backlog' | 'in-progress' | 'review' | 'done'
          urgency?: number
          impact?: number
          assigned_to?: string | null
          due_date?: string | null
          tags?: string[] | null
          progress?: number
          user_id?: string
        }
      }
      stakeholders: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: string
          department: string
          company: string | null
          influence: number
          interest: number
          relationship_health: number
          last_contact: string | null
          communication_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
          preferred_channel: 'email' | 'slack' | 'meeting' | 'phone'
          tags: string[] | null
          notes: string | null
          avatar: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          role: string
          department: string
          company?: string | null
          influence: number
          interest: number
          relationship_health?: number
          last_contact?: string | null
          communication_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
          preferred_channel: 'email' | 'slack' | 'meeting' | 'phone'
          tags?: string[] | null
          notes?: string | null
          avatar?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: string
          department?: string
          company?: string | null
          influence?: number
          interest?: number
          relationship_health?: number
          last_contact?: string | null
          communication_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly'
          preferred_channel?: 'email' | 'slack' | 'meeting' | 'phone'
          tags?: string[] | null
          notes?: string | null
          avatar?: string | null
          user_id?: string
        }
      }
    }
  }
}
