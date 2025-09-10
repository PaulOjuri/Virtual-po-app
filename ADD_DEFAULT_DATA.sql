-- Add default notebook and section data for notes functionality
-- Run this AFTER running FIXED_NOTES_SCRIPT.sql

-- Insert default notebook and section for the current authenticated user
-- This will work when run by an authenticated user in Supabase SQL Editor
INSERT INTO notebooks (name, description, is_default, user_id) 
VALUES ('General', 'Default notebook for notes', true, auth.uid())
ON CONFLICT (name, user_id) DO UPDATE SET is_default = true;

-- Get the notebook ID we just created/updated
INSERT INTO sections (notebook_id, name, order_index, user_id) 
VALUES (
  (SELECT id FROM notebooks WHERE name = 'General' AND user_id = auth.uid()),
  'Notes',
  0,
  auth.uid()
)
ON CONFLICT (name, notebook_id) DO UPDATE SET order_index = 0;