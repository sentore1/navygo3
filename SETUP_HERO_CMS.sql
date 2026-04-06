-- Setup Hero Section CMS
-- Run this in your Supabase SQL Editor to enable hero customization

-- First, run the migration if you haven't already
-- The migration file is: supabase/migrations/20260404000010_add_hero_customization.sql

-- Check if hero_settings table exists and has data
SELECT * FROM hero_settings;

-- If the table is empty, insert default settings
INSERT INTO hero_settings (
  title,
  subtitle,
  title_font_family,
  title_font_size,
  subtitle_font_size,
  show_avatars,
  show_rating,
  rating_value,
  rating_count
) VALUES (
  'Navy Goal',
  'Set meaningful goals, track daily progress, and celebrate milestones with our visual goal tracking platform.',
  'Georgia Pro, Georgia, serif',
  'clamp(3rem, 12vw, 10rem)',
  'text-base sm:text-lg',
  true,
  true,
  4.9,
  200
)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT * FROM hero_settings;

-- Example: Update hero title
-- UPDATE hero_settings 
-- SET title = 'Your New Title',
--     title_font_family = 'Montserrat, sans-serif',
--     title_font_size = 'clamp(2.5rem, 10vw, 8rem)'
-- WHERE id = (SELECT id FROM hero_settings LIMIT 1);
