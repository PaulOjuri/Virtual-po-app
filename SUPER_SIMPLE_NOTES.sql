-- Super simple notes fix - minimal syntax
-- Run this in Supabase SQL Editor

-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the simplest possible notes table
CREATE TABLE IF NOT EXISTS simple_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  notebook_name TEXT DEFAULT 'General',
  section_name TEXT DEFAULT 'Notes',
  tags TEXT DEFAULT '[]',
  user_id UUID DEFAULT auth.uid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Make it completely open for testing (no RLS)
ALTER TABLE simple_notes DISABLE ROW LEVEL SECURITY;

-- Give everyone full access for testing
GRANT ALL ON simple_notes TO PUBLIC;