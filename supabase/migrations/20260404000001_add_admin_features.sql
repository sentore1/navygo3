-- Add user blocking and analytics features

-- Add blocked status to users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'is_blocked') THEN
    ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'blocked_at') THEN
    ALTER TABLE users ADD COLUMN blocked_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'blocked_reason') THEN
    ALTER TABLE users ADD COLUMN blocked_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
    ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Create SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  structured_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default SEO settings
INSERT INTO seo_settings (page_path, title, description, keywords, robots)
VALUES 
  ('/', 'NavyGoal - Achieve Your Goals', 'Track and achieve your goals with AI-powered insights', ARRAY['goals', 'productivity', 'tracking'], 'index, follow'),
  ('/pricing', 'Pricing - NavyGoal', 'Choose the perfect plan for your goal tracking needs', ARRAY['pricing', 'plans', 'subscription'], 'index, follow'),
  ('/dashboard', 'Dashboard - NavyGoal', 'Your personal goal tracking dashboard', ARRAY['dashboard', 'goals'], 'noindex, nofollow')
ON CONFLICT (page_path) DO NOTHING;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id),
  action_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- RLS Policies for seo_settings
CREATE POLICY "Anyone can view SEO settings" ON seo_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify SEO settings" ON seo_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for admin_activity_log
CREATE POLICY "Only admins can view activity log" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert activity log" ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_action_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_log (admin_id, action_type, target_user_id, action_data)
  VALUES (auth.uid(), p_action_type, p_target_user_id, p_action_data)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(is_blocked) WHERE is_blocked = true;
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
