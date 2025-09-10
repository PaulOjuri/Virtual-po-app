import { supabase } from '../lib/supabase';

export type CeremonyType = 
  | 'sprint_planning'
  | 'daily_standup'
  | 'sprint_review'
  | 'sprint_retrospective'
  | 'backlog_refinement'
  | 'pi_planning'
  | 'system_demo'
  | 'inspect_adapt'
  | 'art_sync'
  | 'po_sync'
  | 'scrum_of_scrums'
  | 'solution_demo'
  | 'pre_post_pi_planning'
  | 'innovation_planning';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CeremonyType;
  startTime: Date;
  endTime: Date;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  attendees: string[];
  organizer: string;
  isRecurring: boolean;
  recurrence?: RecurrencePattern;
  reminderMinutes: number[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  piId?: string; // Reference to Program Increment
  sprintId?: string; // Reference to Sprint
  artId?: string; // Reference to Agile Release Train
  teamId?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  interval: number; // Every N frequency (e.g., every 2 weeks)
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // For monthly recurrence
  endDate?: string;
  occurrences?: number; // End after N occurrences
}

export interface SAFeCeremony {
  type: CeremonyType;
  name: string;
  description: string;
  duration: number; // minutes
  participants: string[];
  cadence: string;
  level: 'team' | 'program' | 'solution' | 'portfolio';
  purpose: string;
  inputs: string[];
  outputs: string[];
  tips: string[];
}

export interface PIEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  objectives: string[];
  teams: string[];
  artId: string;
  events: CalendarEvent[];
}

export interface GetEventsFilter {
  startDate?: Date;
  endDate?: Date;
  ceremonyType?: CeremonyType;
  teamId?: string;
  artId?: string;
  piId?: string;
  status?: string;
  includeCompleted?: boolean;
}

export interface NotificationRule {
  id: string;
  ceremonyType: CeremonyType;
  reminderMinutes: number[];
  enabled: boolean;
  channels: ('email' | 'browser' | 'slack' | 'teams')[];
  customMessage?: string;
}

export interface CeremonyTemplate {
  id: string;
  type: CeremonyType;
  title: string;
  description: string;
  duration: number;
  defaultAttendees: string[];
  agendaTemplate: string;
  preparationChecklist: string[];
  reminderMinutes: number[];
}

class CalendarServiceClass {
  // Helper method to transform database row to CalendarEvent interface
  private transformEventFromDB(dbEvent: any): CalendarEvent {
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      type: dbEvent.ceremony_type as CeremonyType,
      startTime: new Date(dbEvent.start_time),
      endTime: new Date(dbEvent.end_time),
      location: dbEvent.location,
      isVirtual: dbEvent.is_virtual || false,
      meetingLink: dbEvent.meeting_link,
      attendees: dbEvent.attendees || [],
      organizer: dbEvent.organizer,
      isRecurring: dbEvent.is_recurring || false,
      recurrence: dbEvent.recurring_frequency ? {
        frequency: dbEvent.recurring_frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly',
        interval: dbEvent.recurring_interval || 1,
        daysOfWeek: dbEvent.recurring_days_of_week || [],
        dayOfMonth: dbEvent.recurring_day_of_month,
        endDate: dbEvent.recurring_end_date,
        occurrences: dbEvent.recurring_occurrences
      } : undefined,
      reminderMinutes: dbEvent.reminder_minutes || [15],
      status: dbEvent.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
      piId: dbEvent.pi_id,
      sprintId: dbEvent.sprint_id,
      artId: dbEvent.art_id,
      teamId: dbEvent.team_id,
      tags: dbEvent.tags || [],
      notes: dbEvent.notes,
      createdAt: dbEvent.created_at,
      updatedAt: dbEvent.updated_at,
      createdBy: dbEvent.created_by
    };
  }

  // Event CRUD operations
  async getEvents(filters?: GetEventsFilter): Promise<CalendarEvent[]> {
    try {
      let query = supabase.from('calendar_events').select('*');

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate.toISOString());
      }

      if (filters?.ceremonyType) {
        query = query.eq('ceremony_type', filters.ceremonyType);
      }

      if (filters?.teamId) {
        query = query.eq('team_id', filters.teamId);
      }

      if (filters?.artId) {
        query = query.eq('art_id', filters.artId);
      }

      if (filters?.piId) {
        query = query.eq('pi_id', filters.piId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (!filters?.includeCompleted) {
        query = query.neq('status', 'completed');
      }

      const { data: events, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;

      return events.map(event => this.transformEventFromDB(event));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to mock data for development
      return this.getMockEvents(filters);
    }
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    try {
      const { data: event, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!event) throw new Error('Event not found');

      return this.transformEventFromDB(event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      throw new Error('Event not found');
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data: newEvent, error } = await supabase
        .from('calendar_events')
        .insert({
          title: event.title,
          description: event.description,
          ceremony_type: event.type,
          start_time: event.startTime.toISOString(),
          end_time: event.endTime.toISOString(),
          location: event.location,
          is_virtual: event.isVirtual,
          meeting_link: event.meetingLink,
          attendees: event.attendees,
          organizer: event.organizer,
          is_recurring: event.isRecurring,
          recurring_frequency: event.recurrence?.frequency,
          recurring_interval: event.recurrence?.interval,
          recurring_days_of_week: event.recurrence?.daysOfWeek,
          recurring_day_of_month: event.recurrence?.dayOfMonth,
          recurring_end_date: event.recurrence?.endDate,
          recurring_occurrences: event.recurrence?.occurrences,
          reminder_minutes: event.reminderMinutes,
          status: event.status,
          pi_id: event.piId,
          sprint_id: event.sprintId,
          art_id: event.artId,
          team_id: event.teamId,
          tags: event.tags,
          notes: event.notes,
          user_id: user.user.id,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformEventFromDB(newEvent);
    } catch (error) {
      console.error('Failed to create event:', error);
      // Mock creation for development
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newEvent;
    }
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const updateData: any = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.type !== undefined) updateData.ceremony_type = updates.type;
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime.toISOString();
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime.toISOString();
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.isVirtual !== undefined) updateData.is_virtual = updates.isVirtual;
      if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
      if (updates.attendees !== undefined) updateData.attendees = updates.attendees;
      if (updates.organizer !== undefined) updateData.organizer = updates.organizer;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      if (updates.recurrence !== undefined) {
        updateData.recurring_frequency = updates.recurrence?.frequency;
        updateData.recurring_interval = updates.recurrence?.interval;
        updateData.recurring_days_of_week = updates.recurrence?.daysOfWeek;
        updateData.recurring_day_of_month = updates.recurrence?.dayOfMonth;
        updateData.recurring_end_date = updates.recurrence?.endDate;
        updateData.recurring_occurrences = updates.recurrence?.occurrences;
      }

      const { data: updatedEvent, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.transformEventFromDB(updatedEvent);
    } catch (error) {
      console.error('Failed to update event:', error);
      throw new Error('Failed to update event');
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete event:', error);
      console.log('Event deleted (mock)');
    }
  }

  // SAFe Ceremony information
  async getSAFeCeremonies(): Promise<SAFeCeremony[]> {
    try {
      // SAFe ceremonies are static data, return mock for now
      return this.getMockSAFeCeremonies();
    } catch (error) {
      console.error('Failed to fetch SAFe ceremonies:', error);
      return this.getMockSAFeCeremonies();
    }
  }

  // PI Events
  async getPIEvents(): Promise<PIEvent[]> {
    try {
      // For now, use mock data since program_increments table doesn't exist
      console.log('Using mock PI events data');
      return this.getMockPIEvents();
    } catch (error) {
      console.error('Failed to fetch PI events:', error);
      return this.getMockPIEvents();
    }
  }

  async createPIEvent(piEvent: Omit<PIEvent, 'id'>): Promise<PIEvent> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data: newPI, error } = await supabase
        .from('program_increments')
        .insert({
          name: piEvent.name,
          start_date: piEvent.startDate,
          end_date: piEvent.endDate,
          status: piEvent.status,
          objectives: piEvent.objectives,
          teams: piEvent.teams,
          art_id: piEvent.artId,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: newPI.id,
        name: newPI.name,
        startDate: newPI.start_date,
        endDate: newPI.end_date,
        status: newPI.status,
        objectives: newPI.objectives || [],
        teams: newPI.teams || [],
        artId: newPI.art_id || '',
        events: []
      };
    } catch (error) {
      console.error('Failed to create PI event:', error);
      throw new Error('Failed to create PI event');
    }
  }

  // Ceremony templates
  async getCeremonyTemplates(): Promise<CeremonyTemplate[]> {
    try {
      const { data: templates, error } = await supabase
        .from('ceremony_templates')
        .select('*')
        .order('ceremony_type');

      if (error) throw error;

      return templates.map(template => ({
        id: template.id,
        type: template.ceremony_type as CeremonyType,
        title: template.title,
        description: template.description || '',
        duration: template.duration_minutes,
        defaultAttendees: template.default_attendees || [],
        agendaTemplate: template.agenda_template || '',
        preparationChecklist: template.preparation_checklist || [],
        reminderMinutes: template.default_reminder_minutes || [15]
      }));
    } catch (error) {
      console.error('Failed to fetch ceremony templates:', error);
      return this.getMockCeremonyTemplates();
    }
  }

  async createEventFromTemplate(templateId: string, overrides: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/events/from-template/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(overrides)
      });

      if (!response.ok) throw new Error('Failed to create event from template');
      
      const event = await response.json();
      return {
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime)
      };
    } catch (error) {
      throw new Error('Failed to create event from template');
    }
  }

  // Recurring events
  async createRecurringEvents(baseEvent: CalendarEvent, pattern: RecurrencePattern): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/events/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          baseEvent: {
            ...baseEvent,
            startTime: baseEvent.startTime.toISOString(),
            endTime: baseEvent.endTime.toISOString()
          },
          pattern: {
            ...pattern,
            endDate: pattern.endDate
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create recurring events');
      
      const events = await response.json();
      return events.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime)
      }));
    } catch (error) {
      throw new Error('Failed to create recurring events');
    }
  }

  // Notification rules
  async getNotificationRules(): Promise<NotificationRule[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/notification-rules`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch notification rules');
      return response.json();
    } catch (error) {
      return this.getMockNotificationRules();
    }
  }

  async updateNotificationRule(ruleId: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/notification-rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update notification rule');
      return response.json();
    } catch (error) {
      throw new Error('Failed to update notification rule');
    }
  }

  // Calendar integration
  async exportToICal(eventIds: string[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/export/ical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ eventIds })
      });

      if (!response.ok) throw new Error('Failed to export calendar');
      return response.text();
    } catch (error) {
      throw new Error('Failed to export calendar');
    }
  }

  async syncWithExternalCalendar(calendarType: 'outlook' | 'google' | 'apple'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/sync/${calendarType}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to sync with external calendar');
    } catch (error) {
      throw new Error('Failed to sync with external calendar');
    }
  }

  // Analytics and reporting
  async getCeremonyMetrics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch ceremony metrics');
      return response.json();
    } catch (error) {
      return {
        totalCeremonies: 45,
        completedCeremonies: 42,
        upcomingCeremonies: 8,
        averageDuration: 67,
        attendanceRate: 0.89,
        ceremoniesByType: {
          sprint_planning: 4,
          daily_standup: 20,
          sprint_review: 3,
          sprint_retrospective: 3,
          pi_planning: 1
        }
      };
    }
  }

  // Mock data for development
  private getMockEvents(filters?: GetEventsFilter): CalendarEvent[] {
    const baseEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Sprint 23 Planning',
        description: 'Planning session for Sprint 23 - User Authentication Features',
        type: 'sprint_planning',
        startTime: new Date('2024-01-16T09:00:00Z'),
        endTime: new Date('2024-01-16T13:00:00Z'),
        location: 'Conference Room A',
        isVirtual: false,
        meetingLink: undefined,
        attendees: ['john.doe@example.com', 'jane.smith@example.com', 'bob.wilson@example.com'],
        organizer: 'scrum.master@example.com',
        isRecurring: true,
        recurrence: {
          frequency: 'weekly',
          interval: 2,
          daysOfWeek: [2], // Tuesday
          endDate: '2024-06-30T00:00:00Z'
        },
        reminderMinutes: [15, 60],
        status: 'scheduled',
        sprintId: 'sprint-23',
        teamId: 'team-alpha',
        tags: ['sprint', 'planning', 'team-alpha'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'scrum.master@example.com'
      },
      {
        id: 'event-2',
        title: 'Daily Standup',
        description: 'Daily team synchronization meeting',
        type: 'daily_standup',
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T10:15:00Z'),
        isVirtual: true,
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
        attendees: ['john.doe@example.com', 'jane.smith@example.com', 'bob.wilson@example.com'],
        organizer: 'scrum.master@example.com',
        isRecurring: true,
        recurrence: {
          frequency: 'daily',
          interval: 1,
          daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
          endDate: '2024-12-31T00:00:00Z'
        },
        reminderMinutes: [5],
        status: 'scheduled',
        teamId: 'team-alpha',
        tags: ['daily', 'standup', 'team-alpha'],
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
        createdBy: 'scrum.master@example.com'
      },
      {
        id: 'event-3',
        title: 'PI 2024.1 Planning',
        description: 'Program Increment Planning for Q1 2024',
        type: 'pi_planning',
        startTime: new Date('2024-01-20T08:00:00Z'),
        endTime: new Date('2024-01-21T17:00:00Z'),
        location: 'Main Auditorium',
        isVirtual: false,
        attendees: ['po1@example.com', 'po2@example.com', 'rte@example.com', 'pm@example.com'],
        organizer: 'rte@example.com',
        isRecurring: false,
        reminderMinutes: [60, 1440], // 1 hour and 1 day
        status: 'scheduled',
        piId: 'pi-2024-1',
        artId: 'art-main',
        tags: ['pi-planning', 'safe', 'quarterly'],
        notes: 'All teams must prepare their team PI objectives. Business context presentation at 8:30 AM.',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        createdBy: 'rte@example.com'
      },
      {
        id: 'event-4',
        title: 'Sprint 22 Review',
        description: 'Demonstration of completed work from Sprint 22',
        type: 'sprint_review',
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T15:30:00Z'),
        isVirtual: true,
        meetingLink: 'https://zoom.us/j/123456789',
        attendees: ['john.doe@example.com', 'jane.smith@example.com', 'stakeholder1@example.com'],
        organizer: 'product.owner@example.com',
        isRecurring: false,
        reminderMinutes: [30],
        status: 'completed',
        sprintId: 'sprint-22',
        teamId: 'team-alpha',
        tags: ['sprint', 'review', 'demo'],
        createdAt: '2024-01-10T11:00:00Z',
        updatedAt: '2024-01-15T16:00:00Z',
        createdBy: 'product.owner@example.com'
      },
      {
        id: 'event-5',
        title: 'Backlog Refinement',
        description: 'Refine and estimate upcoming user stories',
        type: 'backlog_refinement',
        startTime: new Date('2024-01-17T15:00:00Z'),
        endTime: new Date('2024-01-17T16:30:00Z'),
        isVirtual: true,
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
        attendees: ['john.doe@example.com', 'jane.smith@example.com', 'product.owner@example.com'],
        organizer: 'product.owner@example.com',
        isRecurring: true,
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: [3], // Wednesday
          endDate: '2024-06-30T00:00:00Z'
        },
        reminderMinutes: [15],
        status: 'scheduled',
        teamId: 'team-alpha',
        tags: ['backlog', 'refinement', 'estimation'],
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
        createdBy: 'product.owner@example.com'
      },
      {
        id: 'event-6',
        title: 'System Demo',
        description: 'Integrated system demonstration for stakeholders',
        type: 'system_demo',
        startTime: new Date('2024-01-25T13:00:00Z'),
        endTime: new Date('2024-01-25T14:30:00Z'),
        location: 'Executive Conference Room',
        isVirtual: false,
        attendees: ['rte@example.com', 'po1@example.com', 'po2@example.com', 'executive@example.com'],
        organizer: 'rte@example.com',
        isRecurring: false,
        reminderMinutes: [60, 1440],
        status: 'scheduled',
        piId: 'pi-2024-1',
        artId: 'art-main',
        tags: ['system', 'demo', 'stakeholders'],
        createdAt: '2024-01-18T10:00:00Z',
        updatedAt: '2024-01-18T10:00:00Z',
        createdBy: 'rte@example.com'
      }
    ];

    if (!filters) return baseEvents;

    return baseEvents.filter(event => {
      if (filters.startDate && event.startTime < filters.startDate) return false;
      if (filters.endDate && event.startTime > filters.endDate) return false;
      if (filters.ceremonyType && event.type !== filters.ceremonyType) return false;
      if (filters.teamId && event.teamId !== filters.teamId) return false;
      if (filters.artId && event.artId !== filters.artId) return false;
      if (filters.piId && event.piId !== filters.piId) return false;
      if (filters.status && event.status !== filters.status) return false;
      if (!filters.includeCompleted && event.status === 'completed') return false;
      
      return true;
    });
  }

  private getMockSAFeCeremonies(): SAFeCeremony[] {
    return [
      {
        type: 'sprint_planning',
        name: 'Sprint Planning',
        description: 'Team selects work from the Program Backlog and defines Sprint Goal',
        duration: 480, // 8 hours for 2-week sprint
        participants: ['Product Owner', 'Scrum Master', 'Development Team'],
        cadence: 'Every sprint (typically 2 weeks)',
        level: 'team',
        purpose: 'Plan the work for the upcoming Sprint',
        inputs: ['Program Backlog', 'Team Velocity', 'Definition of Done'],
        outputs: ['Sprint Backlog', 'Sprint Goal', 'Sprint Plan'],
        tips: [
          'Ensure all team members understand the Sprint Goal',
          'Break down large stories into smaller tasks',
          'Consider team capacity and planned time off',
          'Review Definition of Done for all stories'
        ]
      },
      {
        type: 'daily_standup',
        name: 'Daily Standup',
        description: 'Daily team synchronization to inspect progress and adapt',
        duration: 15,
        participants: ['Development Team', 'Scrum Master', 'Product Owner (optional)'],
        cadence: 'Daily during Sprint',
        level: 'team',
        purpose: 'Synchronize activities and create plan for next 24 hours',
        inputs: ['Sprint Backlog', 'Sprint Burndown', 'Current Sprint Goal'],
        outputs: ['Updated Sprint plan', 'Impediments identified', 'Team synchronization'],
        tips: [
          'Keep it time-boxed to 15 minutes',
          'Focus on what was done, what will be done, and impediments',
          'Take detailed discussions offline',
          'Ensure everyone participates'
        ]
      },
      {
        type: 'sprint_review',
        name: 'Sprint Review',
        description: 'Team demonstrates completed work to stakeholders',
        duration: 120, // 2 hours for 2-week sprint
        participants: ['Development Team', 'Product Owner', 'Scrum Master', 'Stakeholders'],
        cadence: 'End of each Sprint',
        level: 'team',
        purpose: 'Inspect the increment and adapt Product Backlog',
        inputs: ['Sprint Increment', 'Sprint Backlog', 'Definition of Done'],
        outputs: ['Feedback from stakeholders', 'Updated Product Backlog', 'Input for retrospective'],
        tips: [
          'Demonstrate working software, not presentations',
          'Encourage stakeholder feedback and questions',
          'Review what went well and what could be improved',
          'Update Product Backlog based on feedback'
        ]
      },
      {
        type: 'pi_planning',
        name: 'PI Planning',
        description: 'Face-to-face event where teams plan work for next Program Increment',
        duration: 1440, // 2 days
        participants: ['All ART members', 'Business Owners', 'Product Management', 'System Architect'],
        cadence: 'Every 8-12 weeks',
        level: 'program',
        purpose: 'Align teams to shared mission and vision for PI',
        inputs: ['Vision', 'Roadmap', 'Features', 'Architectural guidance'],
        outputs: ['Team PI Objectives', 'Program Board', 'Risks and dependencies'],
        tips: [
          'Prepare vision and context presentation in advance',
          'Ensure all teams have Product Owner and Scrum Master',
          'Identify and address risks and dependencies',
          'Get business owner commitment on objectives'
        ]
      },
      {
        type: 'inspect_adapt',
        name: 'Inspect & Adapt',
        description: 'Problem-solving workshop held at end of each PI',
        duration: 480, // 8 hours
        participants: ['All ART members', 'Stakeholders', 'Management'],
        cadence: 'End of each PI',
        level: 'program',
        purpose: 'Reflect on PI and identify improvement backlog items',
        inputs: ['PI metrics', 'Quantitative and qualitative data', 'ART assessment'],
        outputs: ['Improvement backlog items', 'Process improvements', 'PI retrospective insights'],
        tips: [
          'Use data to drive improvement discussions',
          'Focus on systemic issues, not individual blame',
          'Create actionable improvement items',
          'Celebrate successes and learning'
        ]
      }
    ];
  }

  private getMockPIEvents(): PIEvent[] {
    return [
      {
        id: 'pi-2024-1',
        name: 'PI 2024.1 - User Experience Enhancement',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2024-03-15T00:00:00Z',
        status: 'active',
        objectives: [
          'Improve user authentication experience',
          'Implement responsive design',
          'Enhance API performance',
          'Deliver mobile app MVP'
        ],
        teams: ['team-alpha', 'team-beta', 'team-gamma'],
        artId: 'art-main',
        events: [] // Would contain all PI-related events
      },
      {
        id: 'pi-2024-2',
        name: 'PI 2024.2 - Integration & Automation',
        startDate: '2024-03-16T00:00:00Z',
        endDate: '2024-05-15T00:00:00Z',
        status: 'planning',
        objectives: [
          'Implement CI/CD pipeline',
          'Integrate with third-party services',
          'Automated testing framework',
          'Performance monitoring'
        ],
        teams: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
        artId: 'art-main',
        events: []
      }
    ];
  }

  private getMockCeremonyTemplates(): CeremonyTemplate[] {
    return [
      {
        id: 'template-sprint-planning',
        type: 'sprint_planning',
        title: 'Sprint Planning - Team {TEAM_NAME}',
        description: 'Sprint planning session for Sprint {SPRINT_NUMBER}',
        duration: 480,
        defaultAttendees: ['product.owner@example.com', 'scrum.master@example.com'],
        agendaTemplate: `
1. Review Sprint Goal (15 min)
2. Review Product Backlog items (60 min)
3. Break down stories into tasks (120 min)
4. Capacity planning (30 min)
5. Finalize Sprint Backlog (15 min)
`,
        preparationChecklist: [
          'Product Backlog is refined and prioritized',
          'Team velocity is calculated',
          'Definition of Done is reviewed',
          'Team capacity is assessed'
        ],
        reminderMinutes: [60, 1440]
      },
      {
        id: 'template-pi-planning',
        type: 'pi_planning',
        title: 'PI {PI_NUMBER} Planning',
        description: 'Program Increment Planning for PI {PI_NUMBER}',
        duration: 1440,
        defaultAttendees: ['rte@example.com', 'product.management@example.com'],
        agendaTemplate: `
Day 1:
- Business Context (30 min)
- Product/Solution Vision (45 min)
- Architecture Vision (45 min)
- Planning Context (15 min)
- Team Breakouts #1 (4 hours)
- Draft Plan Review (60 min)

Day 2:
- Planning Adjustments (30 min)
- Team Breakouts #2 (4 hours)
- Final Plan Review (90 min)
- PI Confidence Vote (30 min)
- Plan Rework (if needed) (60 min)
- Planning Retrospective (30 min)
`,
        preparationChecklist: [
          'Vision and roadmap are prepared',
          'Features are defined and prioritized',
          'Architecture runway is identified',
          'Capacity planning is complete',
          'Facilities and logistics are arranged'
        ],
        reminderMinutes: [1440, 10080] // 1 day and 1 week
      }
    ];
  }

  private getMockNotificationRules(): NotificationRule[] {
    return [
      {
        id: 'rule-sprint-planning',
        ceremonyType: 'sprint_planning',
        reminderMinutes: [60, 1440],
        enabled: true,
        channels: ['email', 'browser'],
        customMessage: 'Sprint Planning session starting soon. Please ensure you have reviewed the backlog.'
      },
      {
        id: 'rule-pi-planning',
        ceremonyType: 'pi_planning',
        reminderMinutes: [1440, 10080],
        enabled: true,
        channels: ['email', 'slack'],
        customMessage: 'PI Planning event approaching. Please complete your preparation checklist.'
      },
      {
        id: 'rule-daily-standup',
        ceremonyType: 'daily_standup',
        reminderMinutes: [5],
        enabled: true,
        channels: ['browser'],
        customMessage: undefined
      }
    ];
  }
}

export const CalendarService = new CalendarServiceClass();