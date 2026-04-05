-- Add testimonials section content to make title and description editable
-- Run this in Supabase SQL Editor

-- First, ensure the testimonials section exists
INSERT INTO public.landing_sections (section_key, section_name, display_order, is_enabled) VALUES
  ('testimonials', 'Testimonials', 2, true)
ON CONFLICT (section_key) DO NOTHING;

-- Get the testimonials section ID
DO $$
DECLARE
  testimonials_section_id UUID;
BEGIN
  SELECT id INTO testimonials_section_id 
  FROM public.landing_sections 
  WHERE section_key = 'testimonials';

  -- Insert section content for title and description
  INSERT INTO public.section_content (section_id, content_key, content_type, content_value, display_order) VALUES
    (testimonials_section_id, 'testimonials_title', 'text', 'Success Stories', 1),
    (testimonials_section_id, 'testimonials_description', 'text', 'Real stories from people who use and love our product every day', 2)
  ON CONFLICT (section_id, content_key) DO UPDATE
    SET content_value = EXCLUDED.content_value;
END $$;

-- Verify the content was added
SELECT 
  ls.section_name,
  sc.content_key,
  sc.content_value
FROM public.section_content sc
JOIN public.landing_sections ls ON ls.id = sc.section_id
WHERE ls.section_key = 'testimonials'
ORDER BY sc.display_order;
