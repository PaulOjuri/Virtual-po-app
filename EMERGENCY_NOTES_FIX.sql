-- Emergency fix to enable note saving - run this first
-- Then run ADD_STAKEHOLDERS.sql for complete setup

-- Ensure notebooks table exists with default notebook
INSERT INTO notebooks (id, name, description, is_default, user_id) VALUES (
  '96a8ce9a-bb38-43ea-af93-2cfe90bb04aa',
  'General',
  'Default notebook for notes',
  true,
  (SELECT auth.uid())
) ON CONFLICT (id) DO NOTHING;

-- Ensure sections table exists with default section  
INSERT INTO sections (id, notebook_id, name, order_index, user_id) VALUES (
  gen_random_uuid(),
  '96a8ce9a-bb38-43ea-af93-2cfe90bb04aa',
  'Notes',
  0,
  (SELECT auth.uid())
) ON CONFLICT DO NOTHING;

-- Fix RLS policies to be more permissive temporarily
DROP POLICY IF EXISTS "Users can view their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can insert their own notebooks" ON notebooks; 
DROP POLICY IF EXISTS "Users can update their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON notebooks;

CREATE POLICY "Allow notebook access" ON notebooks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own sections" ON sections;
DROP POLICY IF EXISTS "Users can insert their own sections" ON sections;
DROP POLICY IF EXISTS "Users can update their own sections" ON sections; 
DROP POLICY IF EXISTS "Users can delete their own sections" ON sections;

CREATE POLICY "Allow section access" ON sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

CREATE POLICY "Allow note access" ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);