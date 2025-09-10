-- Debug script to check current database state
-- Run this to see what tables exist and their structure

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notebooks', 'sections', 'notes', 'todos', 'reminders')
ORDER BY table_name;

-- Check notebooks table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notebooks'
ORDER BY ordinal_position;

-- Check sections table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'sections'
ORDER BY ordinal_position;

-- Check notes table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
ORDER BY ordinal_position;

-- Check current user's data
SELECT 'notebooks' as table_name, count(*) as count FROM notebooks WHERE user_id = auth.uid()
UNION ALL
SELECT 'sections' as table_name, count(*) as count FROM sections WHERE user_id = auth.uid()
UNION ALL
SELECT 'notes' as table_name, count(*) as count FROM notes WHERE user_id = auth.uid();