-- Notes and Knowledge Base Tables
-- This migration creates tables for the OneNote-style notes app

-- Create notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, notebook_id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  linked_knowledge_base TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  collaborators TEXT[] DEFAULT '{}',
  last_edited_by UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_time TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
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

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  browser_enabled BOOLEAN DEFAULT true,
  before_time_minutes INTEGER DEFAULT 15,
  categories TEXT[] DEFAULT ARRAY['todos', 'ceremonies', 'meetings', 'deadlines'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_notebook_id ON sections(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_section_id ON notes(section_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_todos_note_id ON todos(note_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_is_active ON reminders(is_active);

-- Enable Row Level Security
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notebooks
CREATE POLICY "Users can view their own notebooks" ON notebooks FOR SELECT USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Users can insert their own notebooks" ON notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notebooks" ON notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebooks" ON notebooks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sections
CREATE POLICY "Users can view sections in their notebooks" ON sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM notebooks WHERE notebooks.id = sections.notebook_id AND (notebooks.user_id = auth.uid() OR notebooks.is_shared = true))
);
CREATE POLICY "Users can insert sections in their notebooks" ON sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM notebooks WHERE notebooks.id = sections.notebook_id AND notebooks.user_id = auth.uid())
);
CREATE POLICY "Users can update sections in their notebooks" ON sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM notebooks WHERE notebooks.id = sections.notebook_id AND notebooks.user_id = auth.uid())
);
CREATE POLICY "Users can delete sections in their notebooks" ON sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM notebooks WHERE notebooks.id = sections.notebook_id AND notebooks.user_id = auth.uid())
);

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes or shared notes" ON notes FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(collaborators));
CREATE POLICY "Users can insert their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes or collaborative notes" ON notes FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = ANY(collaborators));
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

-- Create RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notification preferences" ON notification_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();