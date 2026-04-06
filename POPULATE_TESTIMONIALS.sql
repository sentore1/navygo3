-- Populate testimonials table with sample data
-- Run this in Supabase SQL Editor

INSERT INTO public.testimonials (name, designation, company, testimonial, avatar_url, rating, is_featured, display_order, is_enabled) VALUES
  (
    'Sarah Johnson',
    'Product Manager',
    'TechCorp',
    'NavyGoal has completely transformed how I track my personal and professional goals. The visual progress tracking keeps me motivated every single day!',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    5,
    true,
    1,
    true
  ),
  (
    'Michael Chen',
    'Entrepreneur',
    'StartupHub',
    'The rank system is genius! It gamifies goal achievement in a way that actually works. I''ve completed more goals in 3 months than I did all last year.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    5,
    true,
    2,
    true
  ),
  (
    'Emily Rodriguez',
    'Fitness Coach',
    'FitLife Studio',
    'I recommend NavyGoal to all my clients. The milestone tracking and streak features help them stay consistent with their fitness goals.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    5,
    true,
    3,
    true
  ),
  (
    'David Park',
    'Software Engineer',
    'DevCo',
    'Clean interface, powerful features. The leaderboard adds a fun competitive element that pushes me to do better.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    5,
    false,
    4,
    true
  ),
  (
    'Jessica Williams',
    'Marketing Director',
    'BrandWorks',
    'Finally, a goal tracker that doesn''t feel like work! The visual charts make it easy to see my progress at a glance.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    5,
    false,
    5,
    true
  ),
  (
    'Alex Thompson',
    'Student',
    'University',
    'As a student juggling multiple goals, NavyGoal helps me stay organized and motivated. The rank system is addictive in the best way!',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    5,
    false,
    6,
    true
  )
ON CONFLICT DO NOTHING;

-- Verify testimonials were added
SELECT 
  name,
  company,
  rating,
  is_featured,
  is_enabled,
  display_order
FROM public.testimonials
ORDER BY display_order;

-- Count total testimonials
SELECT COUNT(*) as total_testimonials FROM public.testimonials;
