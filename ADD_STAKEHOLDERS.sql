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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stakeholders' AND policyname = 'Users can view their own stakeholders') THEN
    ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own stakeholders" ON stakeholders FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own stakeholders" ON stakeholders FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own stakeholders" ON stakeholders FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own stakeholders" ON stakeholders FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_stakeholders_updated_at') THEN
    CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;