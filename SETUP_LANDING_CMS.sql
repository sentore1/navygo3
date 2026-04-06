-- Quick Setup for Landing Page CMS
-- Run this in your Supabase SQL Editor

-- This script will:
-- 1. Create all necessary tables for the CMS
-- 2. Set up permissions
-- 3. Insert default data

-- Execute the migration
\i supabase/migrations/20260404000005_create_landing_page_cms.sql

-- Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'landing_sections',
    'section_content',
    'header_settings',
    'footer_settings',
    'testimonials',
    'features',
    'cta_sections',
    'media_library'
  )
ORDER BY table_name;

-- Insert sample testimonials (optional)
INSERT INTO public.testimonials (name, designation, company, testimonial, avatar_url, rating, is_enabled, display_order) VALUES
  ('Sarah Chen', 'Entrepreneur', 'StartupLife', 'NavyGoal helped me achieve my fitness goals in just 3 months! The visual progress tracking kept me motivated every day.', 'https://randomuser.me/api/portraits/women/1.jpg', 5, true, 1),
  ('Marcus Thompson', 'Student', 'University', 'Finally graduated with honors thanks to NavyGoal''s milestone tracking. It made studying feel like a game!', 'https://randomuser.me/api/portraits/men/6.jpg', 5, true, 2),
  ('Lisa Rodriguez', 'Writer', 'Freelance', 'Completed my first novel using NavyGoal''s daily progress system. The streak feature kept me writing every single day.', 'https://randomuser.me/api/portraits/women/3.jpg', 5, true, 3),
  ('David Park', 'Manager', 'TechStart', 'Lost 30 pounds and built a morning routine that stuck. NavyGoal''s visual journey map made all the difference.', 'https://randomuser.me/api/portraits/men/4.jpg', 5, true, 4),
  ('Emma Wilson', 'Designer', 'Creative Studio', 'Launched my design business after tracking my progress with NavyGoal. The milestone celebrations kept me going!', 'https://randomuser.me/api/portraits/women/5.jpg', 5, true, 5)
ON CONFLICT DO NOTHING;

-- Insert sample features (optional)
INSERT INTO public.features (title, description, icon_name, display_order, is_enabled, feature_type) VALUES
  ('Visual Progress Tracking', 'See your journey unfold with beautiful visual representations of your progress', 'TrendingUp', 1, true, 'standard'),
  ('Milestone Celebrations', 'Celebrate every achievement with our gamified milestone system', 'Award', 2, true, 'standard'),
  ('Daily Streaks', 'Build consistency with streak tracking that motivates you to keep going', 'Zap', 3, true, 'standard'),
  ('Goal Analytics', 'Deep insights into your progress with detailed analytics and reports', 'LineChart', 4, true, 'standard')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 
  'Landing Page CMS setup complete! 🎉' as status,
  'Visit /admin/landing-page to start customizing your landing page' as next_step,
  (SELECT COUNT(*) FROM public.landing_sections) as sections_count,
  (SELECT COUNT(*) FROM public.testimonials) as testimonials_count,
  (SELECT COUNT(*) FROM public.features) as features_count;
