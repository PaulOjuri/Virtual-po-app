-- Add missing daily_plans table and meeting_attendees table for complete functionality

-- Create daily_plans table (if not already exists)
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_estimated_time INTEGER DEFAULT 0, -- in minutes
  actual_time_spent INTEGER DEFAULT 0, -- in minutes
  focus_areas TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  next_day_prep TEXT[] DEFAULT '{}',
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 5) DEFAULT 3,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_date, user_id)
);

-- Create meeting_attendees table (if not already exists)
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendance_status TEXT CHECK (attendance_status IN ('invited', 'accepted', 'declined', 'tentative', 'attended', 'absent')) DEFAULT 'invited',
  is_organizer BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_plans_plan_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_id ON daily_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_email ON meeting_attendees(attendee_email);

-- Enable Row Level Security
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_plans
CREATE POLICY "Users can view their own daily plans" ON daily_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily plans" ON daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily plans" ON daily_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily plans" ON daily_plans FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meeting_attendees
CREATE POLICY "Users can view attendees for their meetings" ON meeting_attendees FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can insert attendees for their meetings" ON meeting_attendees FOR INSERT WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can update attendees for their meetings" ON meeting_attendees FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY "Users can delete attendees for their meetings" ON meeting_attendees FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_attendees.meeting_id AND meetings.user_id = auth.uid())
);

-- Create triggers for updating timestamps
CREATE TRIGGER update_daily_plans_updated_at BEFORE UPDATE ON daily_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_attendees_updated_at BEFORE UPDATE ON meeting_attendees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();