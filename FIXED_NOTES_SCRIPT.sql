-- Complete fix for notes functionality - CORRECTED VERSION
-- Run this in Supabase SQL Editor to fix all note-related database issues

-- First, enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or update notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Create or update sections table  
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, notebook_id)
);

-- Create or update notes table with correct column names
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  linked_knowledge_base TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  collaborators TEXT[] DEFAULT '{}',
  last_edited_by UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or update todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_time TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or update reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  calendar_event_id TEXT,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('todo', 'note', 'calendar', 'ceremony')),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly')),
  recurring_interval INTEGER DEFAULT 1,
  recurring_end_date TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or update notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  browser_enabled BOOLEAN DEFAULT TRUE,
  before_time_minutes INTEGER DEFAULT 15,
  categories TEXT[] DEFAULT '{"todos", "ceremonies", "meetings", "deadlines"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop notebook policies
  DROP POLICY IF EXISTS "Users can view their own notebooks" ON notebooks;
  DROP POLICY IF EXISTS "Users can insert their own notebooks" ON notebooks;
  DROP POLICY IF EXISTS "Users can update their own notebooks" ON notebooks;
  DROP POLICY IF EXISTS "Users can delete their own notebooks" ON notebooks;
  DROP POLICY IF EXISTS "Allow notebook access" ON notebooks;

  -- Drop section policies
  DROP POLICY IF EXISTS "Users can view their own sections" ON sections;
  DROP POLICY IF EXISTS "Users can insert their own sections" ON sections;
  DROP POLICY IF EXISTS "Users can update their own sections" ON sections;
  DROP POLICY IF EXISTS "Users can delete their own sections" ON sections;
  DROP POLICY IF EXISTS "Allow section access" ON sections;

  -- Drop note policies
  DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
  DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
  DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
  DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
  DROP POLICY IF EXISTS "Allow note access" ON notes;

  -- Drop todo policies
  DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
  DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
  DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
  DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;

  -- Drop reminder policies
  DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
  DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
  DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
  DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

  -- Drop notification preference policies
  DROP POLICY IF EXISTS "Users can view their own notification preferences" ON notification_preferences;
  DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON notification_preferences;
  DROP POLICY IF EXISTS "Users can update their own notification preferences" ON notification_preferences;
  DROP POLICY IF EXISTS "Users can delete their own notification preferences" ON notification_preferences;
END $$;

-- Create comprehensive RLS policies for notebooks
CREATE POLICY "Users can manage their own notebooks" ON notebooks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for sections
CREATE POLICY "Users can manage their own sections" ON sections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for notes
CREATE POLICY "Users can manage their own notes" ON notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for todos
CREATE POLICY "Users can manage their own todos" ON todos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for reminders
CREATE POLICY "Users can manage their own reminders" ON reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_notebook_id ON sections(notebook_id);
CREATE INDEX IF NOT EXISTS idx_sections_user_id ON sections(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_section_id ON notes(section_id);
CREATE INDEX IF NOT EXISTS idx_todos_note_id ON todos(note_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_note_id ON reminders(note_id);
CREATE INDEX IF NOT EXISTS idx_reminders_todo_id ON reminders(todo_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();