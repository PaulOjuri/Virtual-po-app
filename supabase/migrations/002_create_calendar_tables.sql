-- Calendar and SAFe Ceremony Tables
-- This migration creates tables for the SAFe calendar system

-- Create program increments table
CREATE TABLE IF NOT EXISTS program_increments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
  objectives TEXT[] DEFAULT '{}',
  teams TEXT[] DEFAULT '{}',
  art_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ceremony_type TEXT CHECK (ceremony_type IN (
    'sprint_planning', 'daily_standup', 'sprint_review', 'sprint_retrospective',
    'backlog_refinement', 'pi_planning', 'system_demo', 'inspect_adapt',
    'art_sync', 'po_sync', 'scrum_of_scrums', 'solution_demo',
    'pre_post_pi_planning', 'innovation_planning'
  )) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link TEXT,
  attendees TEXT[] DEFAULT '{}',
  organizer TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  recurring_interval INTEGER DEFAULT 1,
  recurring_days_of_week INTEGER[] DEFAULT '{}',
  recurring_day_of_month INTEGER,
  recurring_end_date DATE,
  recurring_occurrences INTEGER,
  reminder_minutes INTEGER[] DEFAULT ARRAY[15],
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  pi_id UUID REFERENCES program_increments(id) ON DELETE SET NULL,
  sprint_id TEXT,
  art_id TEXT,
  team_id TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ceremony templates table
CREATE TABLE IF NOT EXISTS ceremony_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ceremony_type TEXT CHECK (ceremony_type IN (
    'sprint_planning', 'daily_standup', 'sprint_review', 'sprint_retrospective',
    'backlog_refinement', 'pi_planning', 'system_demo', 'inspect_adapt',
    'art_sync', 'po_sync', 'scrum_of_scrums', 'solution_demo',
    'pre_post_pi_planning', 'innovation_planning'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  default_attendees TEXT[] DEFAULT '{}',
  agenda_template TEXT,
  preparation_checklist TEXT[] DEFAULT '{}',
  default_reminder_minutes INTEGER[] DEFAULT ARRAY[15],
  level TEXT CHECK (level IN ('team', 'program', 'solution', 'portfolio')) NOT NULL,
  purpose TEXT,
  inputs TEXT[] DEFAULT '{}',
  outputs TEXT[] DEFAULT '{}',
  tips TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification rules table
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ceremony_type TEXT CHECK (ceremony_type IN (
    'sprint_planning', 'daily_standup', 'sprint_review', 'sprint_retrospective',
    'backlog_refinement', 'pi_planning', 'system_demo', 'inspect_adapt',
    'art_sync', 'po_sync', 'scrum_of_scrums', 'solution_demo',
    'pre_post_pi_planning', 'innovation_planning'
  )) NOT NULL,
  reminder_minutes INTEGER[] DEFAULT ARRAY[15],
  enabled BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT ARRAY['email', 'browser'],
  custom_message TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ceremony_type, user_id)
);

-- Create calendar integrations table for external calendar sync
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('google', 'outlook', 'apple')) NOT NULL,
  provider_calendar_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_calendar_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_program_increments_user_id ON program_increments(user_id);
CREATE INDEX IF NOT EXISTS idx_program_increments_status ON program_increments(status);
CREATE INDEX IF NOT EXISTS idx_program_increments_dates ON program_increments(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_ceremony_type ON calendar_events(ceremony_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_pi_id ON calendar_events(pi_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_id ON calendar_events(team_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_art_id ON calendar_events(art_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_tags ON calendar_events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_calendar_events_attendees ON calendar_events USING GIN(attendees);

CREATE INDEX IF NOT EXISTS idx_ceremony_templates_ceremony_type ON ceremony_templates(ceremony_type);
CREATE INDEX IF NOT EXISTS idx_ceremony_templates_level ON ceremony_templates(level);
CREATE INDEX IF NOT EXISTS idx_ceremony_templates_user_id ON ceremony_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_rules_ceremony_type ON notification_rules(ceremony_type);
CREATE INDEX IF NOT EXISTS idx_notification_rules_user_id ON notification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_rules_enabled ON notification_rules(enabled);

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_provider ON calendar_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_is_active ON calendar_integrations(is_active);

-- Enable Row Level Security
ALTER TABLE program_increments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremony_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for program_increments
CREATE POLICY "Users can view their own program increments" ON program_increments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own program increments" ON program_increments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own program increments" ON program_increments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own program increments" ON program_increments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events or events they attend" ON calendar_events FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = created_by OR 
  auth.uid()::text = ANY(attendees)
);
CREATE POLICY "Users can insert their own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar events" ON calendar_events FOR UPDATE USING (
  auth.uid() = user_id OR auth.uid() = created_by
);
CREATE POLICY "Users can delete their own calendar events" ON calendar_events FOR DELETE USING (
  auth.uid() = user_id OR auth.uid() = created_by
);

-- Create RLS policies for ceremony_templates
CREATE POLICY "Users can view all ceremony templates" ON ceremony_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own ceremony templates" ON ceremony_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ceremony templates" ON ceremony_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ceremony templates" ON ceremony_templates FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notification_rules
CREATE POLICY "Users can view their own notification rules" ON notification_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification rules" ON notification_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification rules" ON notification_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notification rules" ON notification_rules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for calendar_integrations
CREATE POLICY "Users can view their own calendar integrations" ON calendar_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar integrations" ON calendar_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar integrations" ON calendar_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar integrations" ON calendar_integrations FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_program_increments_updated_at BEFORE UPDATE ON program_increments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ceremony_templates_updated_at BEFORE UPDATE ON ceremony_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_rules_updated_at BEFORE UPDATE ON notification_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint from reminders to calendar_events (update the previous migration)
ALTER TABLE reminders ADD CONSTRAINT fk_reminders_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id) ON DELETE CASCADE;