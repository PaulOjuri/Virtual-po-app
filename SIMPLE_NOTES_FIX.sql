-- Simple notes database fix - handles existing structures safely
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables only if they don't exist
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

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create indexes (safe to run multiple times due to IF NOT EXISTS)
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

-- Insert default data for current user (run this part manually after logging in)
INSERT INTO notebooks (name, description, is_default, user_id) 
VALUES ('General', 'Default notebook for notes', true, auth.uid())
ON CONFLICT (name, user_id) DO UPDATE SET is_default = true;

INSERT INTO sections (notebook_id, name, order_index, user_id) 
VALUES (
  (SELECT id FROM notebooks WHERE name = 'General' AND user_id = auth.uid()),
  'Notes',
  0,
  auth.uid()
)
ON CONFLICT (name, notebook_id) DO UPDATE SET order_index = 0;