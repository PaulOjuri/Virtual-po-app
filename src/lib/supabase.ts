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
      notebooks: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          user_id: string | null
          is_shared: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          user_id?: string | null
          is_shared?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          user_id?: string | null
          is_shared?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          name: string
          notebook_id: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          notebook_id?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          notebook_id?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string | null
          notebook_id: string | null
          section_id: string | null
          tags: string[] | null
          linked_knowledge_base: string[] | null
          is_archived: boolean | null
          is_favorite: boolean | null
          collaborators: string[] | null
          last_edited_by: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          notebook_id?: string | null
          section_id?: string | null
          tags?: string[] | null
          linked_knowledge_base?: string[] | null
          is_archived?: boolean | null
          is_favorite?: boolean | null
          collaborators?: string[] | null
          last_edited_by?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          notebook_id?: string | null
          section_id?: string | null
          tags?: string[] | null
          linked_knowledge_base?: string[] | null
          is_archived?: boolean | null
          is_favorite?: boolean | null
          collaborators?: string[] | null
          last_edited_by?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          text: string
          completed: boolean | null
          note_id: string | null
          due_date: string | null
          reminder_time: string | null
          priority: string | null
          assigned_to: string | null
          tags: string[] | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text: string
          completed?: boolean | null
          note_id?: string | null
          due_date?: string | null
          reminder_time?: string | null
          priority?: string | null
          assigned_to?: string | null
          tags?: string[] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text?: string
          completed?: boolean | null
          note_id?: string | null
          due_date?: string | null
          reminder_time?: string | null
          priority?: string | null
          assigned_to?: string | null
          tags?: string[] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          note_id: string | null
          todo_id: string | null
          calendar_event_id: string | null
          reminder_time: string
          type: string
          message: string
          is_active: boolean | null
          recurring_frequency: string | null
          recurring_interval: number | null
          recurring_end_date: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          note_id?: string | null
          todo_id?: string | null
          calendar_event_id?: string | null
          reminder_time: string
          type: string
          message: string
          is_active?: boolean | null
          recurring_frequency?: string | null
          recurring_interval?: number | null
          recurring_end_date?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          note_id?: string | null
          todo_id?: string | null
          calendar_event_id?: string | null
          reminder_time?: string
          type?: string
          message?: string
          is_active?: boolean | null
          recurring_frequency?: string | null
          recurring_interval?: number | null
          recurring_end_date?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          ceremony_type: string
          start_time: string
          end_time: string
          location: string | null
          is_virtual: boolean | null
          meeting_link: string | null
          attendees: string[] | null
          organizer: string | null
          is_recurring: boolean | null
          recurring_frequency: string | null
          recurring_interval: number | null
          recurring_days_of_week: number[] | null
          recurring_day_of_month: number | null
          recurring_end_date: string | null
          recurring_occurrences: number | null
          reminder_minutes: number[] | null
          status: string | null
          pi_id: string | null
          sprint_id: string | null
          art_id: string | null
          team_id: string | null
          tags: string[] | null
          notes: string | null
          user_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ceremony_type: string
          start_time: string
          end_time: string
          location?: string | null
          is_virtual?: boolean | null
          meeting_link?: string | null
          attendees?: string[] | null
          organizer?: string | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          recurring_interval?: number | null
          recurring_days_of_week?: number[] | null
          recurring_day_of_month?: number | null
          recurring_end_date?: string | null
          recurring_occurrences?: number | null
          reminder_minutes?: number[] | null
          status?: string | null
          pi_id?: string | null
          sprint_id?: string | null
          art_id?: string | null
          team_id?: string | null
          tags?: string[] | null
          notes?: string | null
          user_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ceremony_type?: string
          start_time?: string
          end_time?: string
          location?: string | null
          is_virtual?: boolean | null
          meeting_link?: string | null
          attendees?: string[] | null
          organizer?: string | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          recurring_interval?: number | null
          recurring_days_of_week?: number[] | null
          recurring_day_of_month?: number | null
          recurring_end_date?: string | null
          recurring_occurrences?: number | null
          reminder_minutes?: number[] | null
          status?: string | null
          pi_id?: string | null
          sprint_id?: string | null
          art_id?: string | null
          team_id?: string | null
          tags?: string | null
          notes?: string | null
          user_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ceremony_templates: {
        Row: {
          id: string
          ceremony_type: string
          title: string
          description: string | null
          duration_minutes: number
          default_attendees: string[] | null
          agenda_template: string | null
          preparation_checklist: string[] | null
          default_reminder_minutes: number[] | null
          level: string
          purpose: string | null
          inputs: string[] | null
          outputs: string[] | null
          tips: string[] | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ceremony_type: string
          title: string
          description?: string | null
          duration_minutes: number
          default_attendees?: string[] | null
          agenda_template?: string | null
          preparation_checklist?: string[] | null
          default_reminder_minutes?: number[] | null
          level: string
          purpose?: string | null
          inputs?: string[] | null
          outputs?: string[] | null
          tips?: string[] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ceremony_type?: string
          title?: string
          description?: string | null
          duration_minutes?: number
          default_attendees?: string[] | null
          agenda_template?: string | null
          preparation_checklist?: string[] | null
          default_reminder_minutes?: number[] | null
          level?: string
          purpose?: string | null
          inputs?: string[] | null
          outputs?: string[] | null
          tips?: string[] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
