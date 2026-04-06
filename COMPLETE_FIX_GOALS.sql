-- Complete fix for goals table issues
-- Run this in Supabase SQL Editor

-- Step 1: Check if public.users table exists and has the current user
SELECT 
  'Checking public.users table' as step,
  COUNT(*) as user_count
FROM public.users;

-- Step 2: Ensure current auth user exists in public.users
-- This should be handled by the trigger, but let's verify
SELECT 
  'Auth users not in public.users' as issue,
  au.id,
  au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Step 3: Check goals table structure
SELECT 
  'Goals table structure' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'goals'
ORDER BY ordinal_position;

-- Step 4: Add missing columns to goals table
DO $$ 
BEGIN
  -- Add target_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'target_date'
  ) THEN
    ALTER TABLE goals ADD COLUMN target_date TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added target_date column';
  END IF;

  -- Add notes if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'notes'
  ) THEN
    ALTER TABLE goals ADD COLUMN notes JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added notes column';
  END IF;
END $$;

-- Step 5: Check foreign key constraint
SELECT 
  'Foreign key constraints' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'goals' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Step 6: Check RLS policies
SELECT 
  'RLS Policies for goals' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'goals';

-- Step 7: Verify you can select from goals
SELECT 
  'Can select from goals?' as test,
  COUNT(*) as goal_count
FROM goals;
