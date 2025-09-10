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
  ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can manage their own stakeholders" ON stakeholders;
CREATE POLICY "Users can view their own stakeholders" ON stakeholders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stakeholders" ON stakeholders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stakeholders" ON stakeholders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stakeholders" ON stakeholders FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_stakeholders_updated_at ON stakeholders;
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP POLICY IF EXISTS "Users can manage their own notebooks" ON notebooks;
CREATE POLICY "Users can view their own notebooks" ON notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notebooks" ON notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notebooks" ON notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebooks" ON notebooks FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sections" ON sections;
CREATE POLICY "Users can view their own sections" ON sections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sections" ON sections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sections" ON sections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sections" ON sections FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
CREATE POLICY "Users can view their own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own todos" ON todos;
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own reminders" ON reminders;
CREATE POLICY "Users can view their own reminders" ON reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminders" ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON reminders FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own calendar events" ON calendar_events;
CREATE POLICY "Users can view their own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar events" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own meetings" ON meetings;
CREATE POLICY "Users can view their own meetings" ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON meetings FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own priorities" ON priorities;
CREATE POLICY "Users can view their own priorities" ON priorities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own priorities" ON priorities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own priorities" ON priorities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own priorities" ON priorities FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own market intelligence" ON market_intelligence;
CREATE POLICY "Users can view their own market intelligence" ON market_intelligence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own market intelligence" ON market_intelligence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own market intelligence" ON market_intelligence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own market intelligence" ON market_intelligence FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own knowledge articles" ON knowledge_articles;
CREATE POLICY "Users can view their own knowledge articles" ON knowledge_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own knowledge articles" ON knowledge_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own knowledge articles" ON knowledge_articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own knowledge articles" ON knowledge_articles FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own daily plans" ON daily_plans;
CREATE POLICY "Users can view their own daily plans" ON daily_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily plans" ON daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily plans" ON daily_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily plans" ON daily_plans FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage meeting attendees" ON meeting_attendees;
CREATE POLICY "Users can view meeting attendees" ON meeting_attendees FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can insert meeting attendees" ON meeting_attendees FOR INSERT WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can update meeting attendees" ON meeting_attendees FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can delete meeting attendees" ON meeting_attendees FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chat messages" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chat messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);