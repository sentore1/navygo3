-- This migration fixes the issue with polar_subscriptions already being in the supabase_realtime publication

-- First, check if the has_trial_access column exists in the users table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'has_trial_access') THEN
        ALTER TABLE users ADD COLUMN has_trial_access BOOLEAN DEFAULT true;
    END IF;
END$$;

-- We don't need to add polar_subscriptions to the publication again since it's already there
-- The following commented code shows what we would do if we needed to add it conditionally
/*
DO $$
DECLARE
    publication_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'polar_subscriptions'
    ) INTO publication_exists;
    
    IF NOT publication_exists THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE polar_subscriptions';
    END IF;
END$$;
*/
