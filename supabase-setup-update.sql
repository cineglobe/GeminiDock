-- Create a table for storing user settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) policies for user settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Policy for selecting settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'select_own_settings'
    ) THEN
        CREATE POLICY select_own_settings ON user_settings
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    -- Policy for inserting settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'insert_own_settings'
    ) THEN
        CREATE POLICY insert_own_settings ON user_settings
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy for updating settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'update_own_settings'
    ) THEN
        CREATE POLICY update_own_settings ON user_settings
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;

    -- Policy for deleting settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'delete_own_settings'
    ) THEN
        CREATE POLICY delete_own_settings ON user_settings
        FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create a function to update the updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_user_settings_updated_at
        BEFORE UPDATE ON user_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$; 