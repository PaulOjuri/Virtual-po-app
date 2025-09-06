import { supabase } from '../lib/supabase';

export interface Meeting {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  location?: string;
  meeting_type: 'general' | 'sprint-planning' | 'retrospective' | 'standup' | 'review' | 'stakeholder' | 'one-on-one';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  agenda?: string;
  meeting_url?: string;
  recurring: boolean;
  recurring_pattern?: string;
  meeting_notes?: string;
  action_items: ActionItem[];
  decisions: Decision[];
  tags: string[];
  attendees?: MeetingAttendee[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface MeetingAttendee {
  id?: string;
  meeting_id?: string;
  attendee_name: string;
  attendee_email?: string;
  attendance_status: 'invited' | 'accepted' | 'declined' | 'tentative' | 'attended' | 'absent';
  is_organizer: boolean;
  is_required: boolean;
  user_id?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  due_date?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Decision {
  id: string;
  description: string;
  decision_maker?: string;
  date: string;
  impact: 'low' | 'medium' | 'high';
}

export interface MeetingTemplate {
  id?: string;
  name: string;
  description?: string;
  meeting_type: Meeting['meeting_type'];
  duration: number;
  agenda_template?: string;
  attendee_roles: string[];
  tags: string[];
  usage_count: number;
  user_id?: string;
}

export class MeetingService {
  // Meeting CRUD operations
  static async getAllMeetings(filters?: {
    status?: Meeting['status'];
    date_from?: string;
    date_to?: string;
    meeting_type?: Meeting['meeting_type'];
  }): Promise<Meeting[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('meetings')
        .select(`
          *,
          meeting_attendees(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }

      if (filters?.meeting_type) {
        query = query.eq('meeting_type', filters.meeting_type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((meeting: any) => ({
        ...meeting,
        attendees: meeting.meeting_attendees || []
      }));
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  static async createMeeting(meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Meeting> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { attendees, ...meeting } = meetingData;

      // Insert meeting
      const { data: meetingResult, error: meetingError } = await supabase
        .from('meetings')
        .insert([{ ...meeting, user_id: user.id }])
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Insert attendees if provided
      if (attendees && attendees.length > 0) {
        const attendeesData = attendees.map(attendee => ({
          ...attendee,
          meeting_id: meetingResult.id,
          user_id: user.id
        }));

        const { error: attendeesError } = await supabase
          .from('meeting_attendees')
          .insert(attendeesData);

        if (attendeesError) {
          console.warn('Error inserting attendees:', attendeesError);
          // Don't throw error for attendees, meeting creation is more important
        }
      }

      // Fetch the complete meeting with attendees
      const { data: completeData, error: fetchError } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_attendees(*)
        `)
        .eq('id', meetingResult.id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...completeData,
        attendees: completeData.meeting_attendees || []
      };
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  static async updateMeeting(id: string, meetingData: Partial<Meeting>): Promise<Meeting> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { attendees, ...meeting } = meetingData;

      const { data, error } = await supabase
        .from('meetings')
        .update(meeting)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update attendees if provided
      if (attendees !== undefined) {
        // Delete existing attendees
        await supabase
          .from('meeting_attendees')
          .delete()
          .eq('meeting_id', id)
          .eq('user_id', user.id);

        // Insert new attendees
        if (attendees.length > 0) {
          const attendeesData = attendees.map(attendee => ({
            ...attendee,
            meeting_id: id,
            user_id: user.id
          }));

          await supabase
            .from('meeting_attendees')
            .insert(attendeesData);
        }
      }

      // Fetch updated meeting with attendees
      const { data: updatedData, error: fetchError } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_attendees(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...updatedData,
        attendees: updatedData.meeting_attendees || []
      };
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  static async deleteMeeting(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete attendees first (cascade should handle this, but being explicit)
      await supabase
        .from('meeting_attendees')
        .delete()
        .eq('meeting_id', id)
        .eq('user_id', user.id);

      // Delete meeting
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Meeting status updates
  static async updateMeetingStatus(id: string, status: Meeting['status']): Promise<Meeting> {
    return this.updateMeeting(id, { status });
  }

  static async markMeetingCompleted(id: string, notes?: string, actionItems?: ActionItem[], decisions?: Decision[]): Promise<Meeting> {
    const updateData: Partial<Meeting> = {
      status: 'completed',
      meeting_notes: notes,
      action_items: actionItems || [],
      decisions: decisions || []
    };

    return this.updateMeeting(id, updateData);
  }

  // Attendee management
  static async addAttendee(meetingId: string, attendee: Omit<MeetingAttendee, 'id' | 'meeting_id' | 'user_id'>): Promise<MeetingAttendee> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meeting_attendees')
        .insert([{
          ...attendee,
          meeting_id: meetingId,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  }

  static async updateAttendeeStatus(attendeeId: string, status: MeetingAttendee['attendance_status']): Promise<MeetingAttendee> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meeting_attendees')
        .update({ attendance_status: status })
        .eq('id', attendeeId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating attendee status:', error);
      throw error;
    }
  }

  // Analytics and insights
  static async getMeetingAnalytics(dateFrom?: string, dateTo?: string): Promise<{
    totalMeetings: number;
    completedMeetings: number;
    averageDuration: number;
    meetingsByType: { [key: string]: number };
    attendanceRate: number;
    upcomingMeetings: number;
    actionItemsCreated: number;
    decisionsRecorded: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id);

      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);

      const { data: meetings, error } = await query;
      if (error) throw error;

      const totalMeetings = meetings?.length || 0;
      const completedMeetings = meetings?.filter(m => m.status === 'completed').length || 0;
      const upcomingMeetings = meetings?.filter(m => {
        const meetingDate = new Date(m.date + 'T' + m.time);
        return meetingDate > new Date() && m.status === 'scheduled';
      }).length || 0;

      const averageDuration = totalMeetings > 0 
        ? Math.round((meetings?.reduce((sum, m) => sum + (m.duration || 60), 0) || 0) / totalMeetings)
        : 0;

      const meetingsByType = (meetings || []).reduce((acc: any, meeting) => {
        acc[meeting.meeting_type] = (acc[meeting.meeting_type] || 0) + 1;
        return acc;
      }, {});

      const actionItemsCreated = (meetings || []).reduce((sum, m) => sum + (m.action_items?.length || 0), 0);
      const decisionsRecorded = (meetings || []).reduce((sum, m) => sum + (m.decisions?.length || 0), 0);

      // Calculate attendance rate (simplified)
      const attendanceRate = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0;

      return {
        totalMeetings,
        completedMeetings,
        averageDuration,
        meetingsByType,
        attendanceRate,
        upcomingMeetings,
        actionItemsCreated,
        decisionsRecorded
      };
    } catch (error) {
      console.error('Error fetching meeting analytics:', error);
      throw error;
    }
  }

  // Meeting Templates
  static async getMeetingTemplates(): Promise<MeetingTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meeting_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meeting templates:', error);
      throw error;
    }
  }

  static async createMeetingTemplate(template: Omit<MeetingTemplate, 'id' | 'usage_count' | 'user_id'>): Promise<MeetingTemplate> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meeting_templates')
        .insert([{ ...template, usage_count: 0, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating meeting template:', error);
      throw error;
    }
  }

  static async useMeetingTemplate(id: string): Promise<MeetingTemplate> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meeting_templates')
        .update({ usage_count: supabase.sql`usage_count + 1` })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error using meeting template:', error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkUpdateStatus(meetingIds: string[], status: Meeting['status']): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meetings')
        .update({ status })
        .in('id', meetingIds)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk updating meeting status:', error);
      throw error;
    }
  }

  static async bulkDelete(meetingIds: string[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meetings')
        .delete()
        .in('id', meetingIds)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting meetings:', error);
      throw error;
    }
  }

  // Search and filtering
  static async searchMeetings(query: string): Promise<Meeting[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_attendees(*)
        `)
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,agenda.ilike.%${query}%`)
        .order('date', { ascending: true });

      if (error) throw error;

      return (data || []).map((meeting: any) => ({
        ...meeting,
        attendees: meeting.meeting_attendees || []
      }));
    } catch (error) {
      console.error('Error searching meetings:', error);
      throw error;
    }
  }
}