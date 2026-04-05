-- Populate test analytics data for the admin dashboard
-- Run this in Supabase SQL Editor to see analytics working

-- Insert sample visitor analytics data (last 30 days)
INSERT INTO visitor_analytics (
  session_id,
  page_url,
  page_title,
  referrer,
  user_agent,
  device_type,
  browser,
  os,
  ip_address,
  country,
  country_code,
  region,
  city,
  time_on_page,
  created_at
)
SELECT
  'session_' || generate_series || '_' || floor(random() * 1000)::text,
  CASE floor(random() * 5)
    WHEN 0 THEN '/'
    WHEN 1 THEN '/pricing'
    WHEN 2 THEN '/dashboard'
    WHEN 3 THEN '/leaderboard'
    ELSE '/achievements'
  END,
  CASE floor(random() * 5)
    WHEN 0 THEN 'Home - Navy Goal'
    WHEN 1 THEN 'Pricing - Navy Goal'
    WHEN 2 THEN 'Dashboard - Navy Goal'
    WHEN 3 THEN 'Leaderboard - Navy Goal'
    ELSE 'Achievements - Navy Goal'
  END,
  CASE floor(random() * 3)
    WHEN 0 THEN 'https://google.com'
    WHEN 1 THEN 'https://twitter.com'
    ELSE NULL
  END,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  CASE floor(random() * 3)
    WHEN 0 THEN 'desktop'
    WHEN 1 THEN 'mobile'
    ELSE 'tablet'
  END,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Chrome'
    WHEN 1 THEN 'Firefox'
    ELSE 'Safari'
  END,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Windows'
    WHEN 1 THEN 'macOS'
    ELSE 'iOS'
  END,
  '192.168.' || floor(random() * 255)::text || '.' || floor(random() * 255)::text,
  CASE floor(random() * 5)
    WHEN 0 THEN 'United States'
    WHEN 1 THEN 'United Kingdom'
    WHEN 2 THEN 'Canada'
    WHEN 3 THEN 'Rwanda'
    ELSE 'Germany'
  END,
  CASE floor(random() * 5)
    WHEN 0 THEN 'US'
    WHEN 1 THEN 'GB'
    WHEN 2 THEN 'CA'
    WHEN 3 THEN 'RW'
    ELSE 'DE'
  END,
  'Region',
  'City',
  floor(random() * 300 + 30)::integer, -- 30-330 seconds
  NOW() - (floor(random() * 30)::text || ' days')::interval - (floor(random() * 24)::text || ' hours')::interval
FROM generate_series(1, 500);

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT page_url) as unique_pages
FROM visitor_analytics;

-- Check the views
SELECT * FROM popular_pages_view LIMIT 5;
SELECT * FROM visitors_by_country_view LIMIT 5;
SELECT * FROM unique_visitors_view LIMIT 7;

-- Check analytics by date range (last 7 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as page_views,
  COUNT(DISTINCT session_id) as unique_visitors
FROM visitor_analytics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
