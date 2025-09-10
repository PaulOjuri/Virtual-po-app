-- CONSOLIDATED MIGRATION SCRIPT
-- Run this entire script in your Supabase SQL Editor to create all necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- MIGRATION 001: Create notes tables
-- ==========================================

-- Create notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_default BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  calendar_event_id UUID, -- Will reference calendar_events table
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT CHECK (type IN ('todo', 'note', 'calendar', 'ceremony')) NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly')),
  recurring_interval INTEGER DEFAULT 1,
  recurring_end_date TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_notebook_id ON sections(notebook_id);
CREATE INDEX IF NOT EXISTS idx_sections_user_id ON sections(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_section_id ON notes(section_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_todos_note_id ON todos(note_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_is_active ON reminders(is_active);

-- Enable Row Level Security
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notebooks
CREATE POLICY "Users can view their own notebooks" ON notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notebooks" ON notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notebooks" ON notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebooks" ON notebooks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sections
CREATE POLICY "Users can view their own sections" ON sections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sections" ON sections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sections" ON sections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sections" ON sections FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for todos
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reminders
CREATE POLICY "Users can view their own reminders" ON reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminders" ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON reminders FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- MIGRATION 002: Create calendar tables
-- ==========================================

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  event_type TEXT CHECK (event_type IN ('meeting', 'ceremony', 'personal', 'team_event', 'planning', 'review', 'demo', 'training', 'one_on_one')) DEFAULT 'meeting',
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  meeting_url TEXT,
  meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'teams', 'meet', 'webex', 'in_person', 'other')) DEFAULT 'zoom',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  recurring_interval INTEGER DEFAULT 1,
  recurring_end_date TIMESTAMP WITH TIME ZONE,
  safe_ceremony_type TEXT CHECK (safe_ceremony_type IN ('sprint_planning', 'daily_standup', 'sprint_review', 'sprint_retrospective', 'backlog_refinement', 'pi_planning', 'system_demo', 'inspect_and_adapt', 'art_sync', 'po_sync', 'coach_sync', 'scrum_of_scrums')),
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safe_ceremonies table for SAFe-specific ceremonies
CREATE TABLE IF NOT EXISTS safe_ceremonies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('sprint_planning', 'daily_standup', 'sprint_review', 'sprint_retrospective', 'backlog_refinement', 'pi_planning', 'system_demo', 'inspect_and_adapt', 'art_sync', 'po_sync', 'coach_sync', 'scrum_of_scrums')) NOT NULL,
  description TEXT,
  typical_duration INTEGER, -- in minutes
  participants TEXT[] DEFAULT '{}',
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'per_sprint', 'per_pi')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);

-- Enable Row Level Security for calendar events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_ceremonies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar events" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for safe_ceremonies (public read access for templates)
CREATE POLICY "Anyone can view safe ceremonies" ON safe_ceremonies FOR SELECT TO authenticated USING (true);

-- Create triggers for updating timestamps
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safe_ceremonies_updated_at BEFORE UPDATE ON safe_ceremonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint from reminders to calendar_events
ALTER TABLE reminders ADD CONSTRAINT fk_reminders_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id) ON DELETE CASCADE;

-- ==========================================
-- MIGRATION 003: Create additional tables
-- ==========================================

-- Create stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL,
  department TEXT,
  influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  communication_preference TEXT CHECK (communication_preference IN ('email', 'slack', 'teams', 'in_person', 'phone')) DEFAULT 'email',
  preferred_meeting_frequency TEXT CHECK (preferred_meeting_frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'as_needed')) DEFAULT 'weekly',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  contact_info JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- in minutes
  location TEXT,
  meeting_url TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('standup', 'planning', 'review', 'retrospective', 'one_on_one', 'team_meeting', 'stakeholder_meeting', 'demo', 'training')) DEFAULT 'team_meeting',
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  agenda JSONB DEFAULT '[]',
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  decisions JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create priorities table
CREATE TABLE IF NOT EXISTS priorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('user_story', 'bug', 'task', 'epic', 'feature', 'spike', 'technical_debt')) DEFAULT 'user_story',
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('backlog', 'ready', 'in_progress', 'in_review', 'done', 'blocked')) DEFAULT 'backlog',
  story_points INTEGER,
  business_value INTEGER CHECK (business_value BETWEEN 1 AND 10),
  effort_estimate INTEGER, -- in hours
  acceptance_criteria TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  assignee TEXT,
  reporter TEXT,
  sprint_id TEXT,
  epic_id UUID,
  dependencies JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_intelligence table
CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('article', 'report', 'survey', 'news', 'research', 'competitor_analysis', 'trend_analysis', 'user_feedback')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  key_insights TEXT[] DEFAULT '{}',
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10) DEFAULT 5,
  impact_assessment TEXT CHECK (impact_assessment IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  category TEXT[] DEFAULT '{}',
  date_published TIMESTAMP WITH TIME ZONE,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  tags TEXT[] DEFAULT '{}',
  is_actionable BOOLEAN DEFAULT false,
  action_items JSONB DEFAULT '[]',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  status TEXT CHECK (status IN ('draft', 'review', 'published', 'archived')) DEFAULT 'draft',
  visibility TEXT CHECK (visibility IN ('private', 'team', 'organization', 'public')) DEFAULT 'private',
  version INTEGER DEFAULT 1,
  parent_article_id UUID REFERENCES knowledge_articles(id),
  attachments JSONB DEFAULT '[]',
  related_articles UUID[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stakeholders_user_id ON stakeholders(user_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_role ON stakeholders(role);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_priorities_user_id ON priorities(user_id);
CREATE INDEX IF NOT EXISTS idx_priorities_status ON priorities(status);
CREATE INDEX IF NOT EXISTS idx_priorities_priority_level ON priorities(priority_level);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_user_id ON market_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_category ON market_intelligence USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_user_id ON knowledge_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_status ON knowledge_articles(status);

-- Enable Row Level Security
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stakeholders
CREATE POLICY "Users can view their own stakeholders" ON stakeholders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stakeholders" ON stakeholders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stakeholders" ON stakeholders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stakeholders" ON stakeholders FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meetings
CREATE POLICY "Users can view their own meetings" ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON meetings FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for priorities
CREATE POLICY "Users can view their own priorities" ON priorities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own priorities" ON priorities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own priorities" ON priorities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own priorities" ON priorities FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for market_intelligence
CREATE POLICY "Users can view their own market intelligence" ON market_intelligence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own market intelligence" ON market_intelligence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own market intelligence" ON market_intelligence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own market intelligence" ON market_intelligence FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for knowledge_articles
CREATE POLICY "Users can view their own knowledge articles" ON knowledge_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own knowledge articles" ON knowledge_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own knowledge articles" ON knowledge_articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own knowledge articles" ON knowledge_articles FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_priorities_updated_at BEFORE UPDATE ON priorities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_intelligence_updated_at BEFORE UPDATE ON market_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- MIGRATION 005: Add missing tables
-- ==========================================

-- Create daily_plans table (if not already exists)
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_estimated_time INTEGER DEFAULT 0, -- in minutes
  actual_time_spent INTEGER DEFAULT 0, -- in minutes
  focus_areas TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  next_day_prep TEXT[] DEFAULT '{}',
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 5) DEFAULT 3,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_date, user_id)
);

-- Create meeting_attendees table (if not already exists)
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendance_status TEXT CHECK (attendance_status IN ('invited', 'accepted', 'declined', 'tentative', 'attended', 'absent')) DEFAULT 'invited',
  is_organizer BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_plans_plan_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_email ON meeting_attendees(attendee_email);

-- Enable Row Level Security
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_plans
CREATE POLICY "Users can view their own daily plans" ON daily_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily plans" ON daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily plans" ON daily_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily plans" ON daily_plans FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meeting_attendees
CREATE POLICY "Users can view attendees for their meetings" ON meeting_attendees FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can insert attendees for their meetings" ON meeting_attendees FOR INSERT WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can update attendees for their meetings" ON meeting_attendees FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can delete attendees for their meetings" ON meeting_attendees FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);

-- Create triggers for updating timestamps
CREATE TRIGGER update_daily_plans_updated_at BEFORE UPDATE ON daily_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_attendees_updated_at BEFORE UPDATE ON meeting_attendees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- MIGRATION 006: Create chat messages table
-- ==========================================

-- Create chat_messages table for AI chatbot conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  platform_context TEXT, -- which platform segment (notes, calendar, etc.)
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_content ON chat_messages USING gin(to_tsvector('english', content));

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view their own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chat messages" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chat messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- MIGRATION 004: Insert default data
-- ==========================================

-- Insert default SAFe ceremonies
INSERT INTO safe_ceremonies (name, type, description, typical_duration, participants, frequency) VALUES
('Sprint Planning', 'sprint_planning', 'Plan the work for the upcoming sprint', 240, ARRAY['Product Owner', 'Scrum Master', 'Development Team'], 'per_sprint'),
('Daily Standup', 'daily_standup', 'Daily sync to discuss progress and impediments', 15, ARRAY['Scrum Master', 'Development Team'], 'daily'),
('Sprint Review', 'sprint_review', 'Demo completed work and gather feedback', 120, ARRAY['Product Owner', 'Scrum Master', 'Development Team', 'Stakeholders'], 'per_sprint'),
('Sprint Retrospective', 'sprint_retrospective', 'Reflect on the sprint and identify improvements', 90, ARRAY['Scrum Master', 'Development Team'], 'per_sprint'),
('Backlog Refinement', 'backlog_refinement', 'Refine and estimate backlog items', 60, ARRAY['Product Owner', 'Development Team'], 'weekly'),
('PI Planning', 'pi_planning', 'Plan features and capabilities for the Program Increment', 480, ARRAY['Product Manager', 'Product Owner', 'System Architect', 'Release Train Engineer', 'Development Teams'], 'quarterly'),
('System Demo', 'system_demo', 'Demonstrate integrated solution to stakeholders', 90, ARRAY['Product Manager', 'System Team', 'Stakeholders'], 'bi_weekly'),
('Inspect and Adapt', 'inspect_and_adapt', 'Demonstrate solution, quantitative and qualitative measurement, and retrospective', 240, ARRAY['Release Train Engineer', 'Product Manager', 'System Team', 'Agile Teams'], 'quarterly'),
('ART Sync', 'art_sync', 'Coordination meeting for the Agile Release Train', 60, ARRAY['Release Train Engineer', 'Product Manager', 'System Architect', 'Scrum Masters'], 'weekly'),
('PO Sync', 'po_sync', 'Product Owner coordination and alignment', 45, ARRAY['Product Manager', 'Product Owners'], 'weekly'),
('Coach Sync', 'coach_sync', 'Scrum Master and Coach coordination', 45, ARRAY['Release Train Engineer', 'Scrum Masters', 'Coaches'], 'weekly'),
('Scrum of Scrums', 'scrum_of_scrums', 'Inter-team coordination and dependency management', 30, ARRAY['Scrum Masters', 'Team Representatives'], 'daily')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'All database tables created successfully! You can now use the application.' AS status;