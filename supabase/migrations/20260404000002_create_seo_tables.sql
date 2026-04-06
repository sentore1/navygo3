-- Create SEO settings table
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  robots TEXT DEFAULT 'index, follow',
  canonical_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  page_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target ON public.admin_activity_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON public.admin_activity_log(created_at);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_settings (admin only)
DROP POLICY IF EXISTS "Admins can manage SEO settings" ON public.seo_settings;
CREATE POLICY "Admins can manage SEO settings"
  ON public.seo_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for analytics_events (admin read, system write)
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;
CREATE POLICY "Admins can view analytics"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert analytics" ON public.analytics_events;
CREATE POLICY "System can insert analytics"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for admin_activity_log (admin only)
DROP POLICY IF EXISTS "Admins can view activity log" ON public.admin_activity_log;
CREATE POLICY "Admins can view activity log"
  ON public.admin_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_action_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_log (
    admin_id,
    target_user_id,
    action_type,
    action_data
  ) VALUES (
    auth.uid(),
    p_target_user_id,
    p_action_type,
    p_action_data
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;

-- Insert some default SEO settings
INSERT INTO public.seo_settings (page_path, title, description, keywords, robots)
VALUES 
  ('/', 'NavyGoal - Achieve Your Goals with AI-Powered Tracking', 'Track your goals, visualize progress, and achieve success with our AI-powered goal tracking platform. Join thousands of users reaching their milestones.', ARRAY['goal tracking', 'productivity', 'ai', 'achievement', 'progress tracking'], 'index, follow'),
  ('/pricing', 'Pricing - NavyGoal', 'Choose the perfect plan for your goal tracking needs. Flexible pricing with powerful features to help you succeed.', ARRAY['pricing', 'plans', 'subscription'], 'index, follow'),
  ('/dashboard', 'Dashboard - NavyGoal', 'Your personal goal tracking dashboard. Monitor progress, track milestones, and celebrate achievements.', ARRAY['dashboard', 'goals', 'progress'], 'noindex, nofollow'),
  ('/achievements', 'Achievements - NavyGoal', 'View your achievements and rank progression. See how far you''ve come on your journey.', ARRAY['achievements', 'ranks', 'milestones'], 'noindex, nofollow')
ON CONFLICT (page_path) DO NOTHING;
