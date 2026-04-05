-- Add show_avatar column to testimonials table
-- Run this in Supabase SQL Editor

ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS show_avatar BOOLEAN DEFAULT true;

-- Update existing testimonials to show avatars by default
UPDATE public.testimonials 
SET show_avatar = true 
WHERE show_avatar IS NULL;

-- Verify the column was added
SELECT 
  name,
  avatar_url,
  show_avatar,
  is_enabled
FROM public.testimonials
ORDER BY display_order;
