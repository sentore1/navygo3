-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE,
  CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create progress_logs table to track daily progress
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for goals table
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
CREATE POLICY "Users can insert their own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;
CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for milestones table
DROP POLICY IF EXISTS "Users can view milestones for their goals" ON milestones;
CREATE POLICY "Users can view milestones for their goals"
  ON milestones FOR SELECT
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert milestones for their goals" ON milestones;
CREATE POLICY "Users can insert milestones for their goals"
  ON milestones FOR INSERT
  WITH CHECK (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update milestones for their goals" ON milestones;
CREATE POLICY "Users can update milestones for their goals"
  ON milestones FOR UPDATE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete milestones for their goals" ON milestones;
CREATE POLICY "Users can delete milestones for their goals"
  ON milestones FOR DELETE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

-- Create policies for progress_logs table
DROP POLICY IF EXISTS "Users can view their own progress logs" ON progress_logs;
CREATE POLICY "Users can view their own progress logs"
  ON progress_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress logs" ON progress_logs;
CREATE POLICY "Users can insert their own progress logs"
  ON progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table goals;
alter publication supabase_realtime add table milestones;
alter publication supabase_realtime add table progress_logs;