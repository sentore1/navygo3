-- Add missing landing page sections to the database
-- Run this in Supabase SQL Editor

INSERT INTO public.landing_sections (section_key, section_name, display_order, is_enabled) VALUES
  ('features', 'Track Your Progress Section', 5, true),
  ('features_8', 'Features Grid Section', 6, true),
  ('ranks', 'Ranks Section', 7, true),
  ('integrations', 'Integrations Section', 8, true)
ON CONFLICT (section_key) DO NOTHING;

-- Verify all sections
SELECT 
  section_key,
  section_name,
  is_enabled,
  display_order
FROM public.landing_sections
ORDER BY display_order;
