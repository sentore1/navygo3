-- Create visitor tracking table with geolocation
CREATE TABLE IF NOT EXISTS public.visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  -- Geolocation data
  ip_address TEXT,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  -- Timing data
  time_on_page INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_user ON public.visitor_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_page ON public.visitor_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_country ON public.visitor_analytics(country);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_created ON public.visitor_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_device ON public.visitor_analytics(device_type);

-- Create unique visitors view (by session)
CREATE OR REPLACE VIEW public.unique_visitors_view AS
SELECT 
  DATE(created_at) as visit_date,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as total_page_views,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_users
FROM public.visitor_analytics
GROUP BY DATE(created_at)
ORDER BY visit_date DESC;

-- Create visitors by country view
CREATE OR REPLACE VIEW public.visitors_by_country_view AS
SELECT 
  country,
  country_code,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as page_views,
  ROUND(AVG(time_on_page), 2) as avg_time_on_page
FROM public.visitor_analytics
WHERE country IS NOT NULL
GROUP BY country, country_code
ORDER BY unique_visitors DESC;

-- Create popular pages view
CREATE OR REPLACE VIEW public.popular_pages_view AS
SELECT 
  page_url,
  page_title,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors,
  ROUND(AVG(time_on_page), 2) as avg_time_on_page
FROM public.visitor_analytics
GROUP BY page_url, page_title
ORDER BY views DESC
LIMIT 50;

-- Create device analytics view
CREATE OR REPLACE VIEW public.device_analytics_view AS
SELECT 
  device_type,
  browser,
  os,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as page_views
FROM public.visitor_analytics
WHERE device_type IS NOT NULL
GROUP BY device_type, browser, os
ORDER BY unique_visitors DESC;

-- Enable RLS
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert (for tracking)
DROP POLICY IF EXISTS "Anyone can track visits" ON public.visitor_analytics;
CREATE POLICY "Anyone can track visits"
  ON public.visitor_analytics
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only admins can view analytics
DROP POLICY IF EXISTS "Admins can view analytics" ON public.visitor_analytics;
CREATE POLICY "Admins can view analytics"
  ON public.visitor_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant access to views for admins
GRANT SELECT ON public.unique_visitors_view TO authenticated;
GRANT SELECT ON public.visitors_by_country_view TO authenticated;
GRANT SELECT ON public.popular_pages_view TO authenticated;
GRANT SELECT ON public.device_analytics_view TO authenticated;

-- Function to clean old analytics data (optional - run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.visitor_analytics
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.cleanup_old_analytics TO authenticated;
