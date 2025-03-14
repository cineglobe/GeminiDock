-- Create a table for storing user chats
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for storing user settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chats_user_id_idx ON chats (user_id);

-- Set up Row Level Security (RLS) policies
-- This ensures users can only access their own data
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policy for selecting chats (users can only see their own chats)
CREATE POLICY select_own_chats ON chats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting chats (users can only insert their own chats)
CREATE POLICY insert_own_chats ON chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating chats (users can only update their own chats)
CREATE POLICY update_own_chats ON chats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for deleting chats (users can only delete their own chats)
CREATE POLICY delete_own_chats ON chats
  FOR DELETE
  USING (auth.uid() = user_id);

-- Set up Row Level Security (RLS) policies for user settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for selecting settings (users can only see their own settings)
CREATE POLICY select_own_settings ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting settings (users can only insert their own settings)
CREATE POLICY insert_own_settings ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating settings (users can only update their own settings)
CREATE POLICY update_own_settings ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for deleting settings (users can only delete their own settings)
CREATE POLICY delete_own_settings ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 