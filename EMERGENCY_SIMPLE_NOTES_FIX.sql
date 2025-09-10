-- Emergency simple fix - create basic tables and disable RLS temporarily
-- Run this in Supabase SQL Editor

-- Create simple notes table without complex relationships
CREATE TABLE IF NOT EXISTS simple_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  notebook_name TEXT DEFAULT 'General',
  section_name TEXT DEFAULT 'Notes',
  tags TEXT[] DEFAULT '{}',
  user_id UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily for testing
ALTER TABLE simple_notes DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON simple_notes TO authenticated;