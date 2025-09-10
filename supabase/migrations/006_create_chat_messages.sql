-- Create chat_messages table for AI chatbot conversation history

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_sources JSONB DEFAULT '[]'::jsonb,
  ai_provider TEXT,
  response_time INTEGER, -- in milliseconds
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ai_provider ON chat_messages(ai_provider);

-- Create GIN index for full-text search on messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_message_gin ON chat_messages USING gin(to_tsvector('english', user_message));
CREATE INDEX IF NOT EXISTS idx_chat_messages_ai_response_gin ON chat_messages USING gin(to_tsvector('english', ai_response));

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view their own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chat messages" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chat messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();