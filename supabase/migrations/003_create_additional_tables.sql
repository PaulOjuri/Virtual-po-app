-- Additional tables for complete system functionality
-- This migration creates tables for meetings, emails, knowledge base, market intelligence, analytics, and settings

-- Create meetings table (if not already exists from meetingService)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('ceremony', 'one-on-one', 'team', 'stakeholder', 'planning', 'review', 'other')) DEFAULT 'other',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link TEXT,
  attendees TEXT[] DEFAULT '{}',
  organizer TEXT,
  agenda TEXT,
  meeting_notes TEXT,
  action_items JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  recurring_id TEXT, -- For linking recurring meetings
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emails table for email intelligence
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  email_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  key_topics TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  is_processed BOOLEAN DEFAULT false,
  thread_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge base documents table
CREATE TABLE IF NOT EXISTS kb_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('article', 'guide', 'faq', 'policy', 'template', 'reference')) DEFAULT 'article',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  search_vector TSVECTOR,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge base folders table
CREATE TABLE IF NOT EXISTS kb_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id UUID REFERENCES kb_folders(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, parent_folder_id, user_id)
);

-- Create knowledge base document-folder relationships
CREATE TABLE IF NOT EXISTS kb_document_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES kb_documents(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES kb_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, folder_id)
);

-- Create market intelligence trends table
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trend_type TEXT CHECK (trend_type IN ('technology', 'market', 'competitor', 'regulation', 'customer', 'internal')) NOT NULL,
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10) DEFAULT 5,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  time_horizon TEXT CHECK (time_horizon IN ('immediate', 'short-term', 'medium-term', 'long-term')) DEFAULT 'medium-term',
  status TEXT CHECK (status IN ('monitoring', 'investigating', 'confirmed', 'dismissed')) DEFAULT 'monitoring',
  sources TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  assigned_to TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market intelligence competitors table
CREATE TABLE IF NOT EXISTS market_competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')) DEFAULT 'medium',
  market_position TEXT CHECK (market_position IN ('leader', 'challenger', 'follower', 'niche')) DEFAULT 'follower',
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  key_products TEXT[] DEFAULT '{}',
  pricing_model TEXT,
  target_market TEXT,
  recent_moves TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market alerts table
CREATE TABLE IF NOT EXISTS market_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_name TEXT NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('keyword', 'competitor', 'trend', 'news', 'financial')) NOT NULL,
  parameters JSONB NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily planning tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('meeting', 'work', 'review', 'planning', 'communication', 'admin')) DEFAULT 'work',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')) DEFAULT 'not_started',
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  related_priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL,
  related_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles and settings table (extending existing system)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_role TEXT CHECK (current_role IN ('product_owner', 'scrum_master', 'business_analyst', 'release_train_engineer', 'product_manager', 'epic_owner')) DEFAULT 'product_owner',
  role_level TEXT CHECK (role_level IN ('team', 'program', 'solution', 'portfolio')) DEFAULT 'team',
  terminology_mapping JSONB DEFAULT '{}',
  navigation_config JSONB DEFAULT '{}',
  dashboard_config JSONB DEFAULT '{}',
  module_visibility JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role templates table
CREATE TABLE IF NOT EXISTS role_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id TEXT CHECK (role_id IN ('product_owner', 'scrum_master', 'business_analyst', 'release_train_engineer', 'product_manager', 'epic_owner')) NOT NULL,
  template_type TEXT CHECK (template_type IN ('priority', 'meeting', 'email', 'ceremony', 'document')) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT CHECK (metric_type IN ('priority', 'stakeholder', 'meeting', 'email', 'ceremony', 'team', 'productivity', 'custom')) NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4),
  metric_data JSONB DEFAULT '{}',
  time_period TEXT CHECK (time_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_type, metric_name, period_start, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_type ON meetings(meeting_type);

CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_email_date ON emails(email_date);
CREATE INDEX IF NOT EXISTS idx_emails_priority ON emails(priority);
CREATE INDEX IF NOT EXISTS idx_emails_sender_email ON emails(sender_email);
CREATE INDEX IF NOT EXISTS idx_emails_key_topics ON emails USING GIN(key_topics);

CREATE INDEX IF NOT EXISTS idx_kb_documents_user_id ON kb_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_status ON kb_documents(status);
CREATE INDEX IF NOT EXISTS idx_kb_documents_category ON kb_documents(category);
CREATE INDEX IF NOT EXISTS idx_kb_documents_search_vector ON kb_documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_kb_documents_tags ON kb_documents USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_kb_folders_user_id ON kb_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_folders_parent_folder_id ON kb_folders(parent_folder_id);

CREATE INDEX IF NOT EXISTS idx_market_trends_user_id ON market_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_market_trends_trend_type ON market_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_market_trends_status ON market_trends(status);

CREATE INDEX IF NOT EXISTS idx_market_competitors_user_id ON market_competitors(user_id);
CREATE INDEX IF NOT EXISTS idx_market_competitors_threat_level ON market_competitors(threat_level);

CREATE INDEX IF NOT EXISTS idx_market_alerts_user_id ON market_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_market_alerts_is_active ON market_alerts(is_active);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_scheduled_start ON daily_tasks(scheduled_start);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_current_role ON user_roles(current_role);

CREATE INDEX IF NOT EXISTS idx_role_templates_role_id ON role_templates(role_id);
CREATE INDEX IF NOT EXISTS idx_role_templates_template_type ON role_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_role_templates_user_id ON role_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_id ON analytics_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type_name ON analytics_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);

-- Enable Row Level Security for all tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simplified for brevity - users can access their own data)
CREATE POLICY "Users access own meetings" ON meetings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own emails" ON emails FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own kb_documents" ON kb_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own kb_folders" ON kb_folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own kb_document_folders" ON kb_document_folders FOR ALL USING (
  EXISTS (SELECT 1 FROM kb_documents WHERE id = document_id AND user_id = auth.uid())
);
CREATE POLICY "Users access own market_trends" ON market_trends FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own market_competitors" ON market_competitors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own market_alerts" ON market_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own daily_tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own user_roles" ON user_roles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own role_templates" ON role_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own analytics_metrics" ON analytics_metrics FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kb_documents_updated_at BEFORE UPDATE ON kb_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kb_folders_updated_at BEFORE UPDATE ON kb_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_trends_updated_at BEFORE UPDATE ON market_trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_competitors_updated_at BEFORE UPDATE ON market_competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_alerts_updated_at BEFORE UPDATE ON market_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON daily_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_templates_updated_at BEFORE UPDATE ON role_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update search vector for knowledge base documents
CREATE OR REPLACE FUNCTION update_kb_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, '') || ' ' || array_to_string(NEW.tags, ' '));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_document_search_vector_trigger
BEFORE INSERT OR UPDATE ON kb_documents
FOR EACH ROW EXECUTE FUNCTION update_kb_document_search_vector();