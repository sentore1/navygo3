-- Landing Page CMS System
-- This allows admins to control all landing page content through the database

-- 1. Landing Page Sections Table
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL, -- e.g., 'hero', 'features', 'testimonials', 'cta', 'pricing'
  section_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Section Content Table (for text, images, buttons)
CREATE TABLE IF NOT EXISTS public.section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.landing_sections(id) ON DELETE CASCADE,
  content_key TEXT NOT NULL, -- e.g., 'hero_title', 'hero_subtitle', 'hero_image'
  content_type TEXT NOT NULL, -- 'text', 'image', 'button', 'html', 'video'
  content_value TEXT,
  content_metadata JSONB DEFAULT '{}', -- For additional properties like button link, image alt text, etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, content_key)
);

-- 3. Header/Navigation Settings
CREATE TABLE IF NOT EXISTS public.header_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  logo_text TEXT DEFAULT 'NavyGoal',
  show_logo_icon BOOLEAN DEFAULT true,
  navigation_items JSONB DEFAULT '[]', -- Array of {name, href, order}
  cta_button_text TEXT DEFAULT 'Get Started',
  cta_button_link TEXT DEFAULT '/sign-up',
  show_cta_button BOOLEAN DEFAULT true,
  background_style TEXT DEFAULT 'transparent', -- 'transparent', 'solid', 'blur'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Footer Settings
CREATE TABLE IF NOT EXISTS public.footer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'NavyGoal',
  tagline TEXT,
  show_large_text BOOLEAN DEFAULT true,
  large_text TEXT DEFAULT 'NAVYGOAL',
  footer_links JSONB DEFAULT '[]', -- Array of {name, href, order}
  social_links JSONB DEFAULT '{}', -- {instagram: 'url', twitter: 'url', etc.}
  copyright_text TEXT,
  show_newsletter BOOLEAN DEFAULT false,
  newsletter_title TEXT,
  newsletter_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Testimonials (Dynamic)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT,
  company TEXT,
  testimonial TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Features (Dynamic)
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- Lucide icon name
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  feature_type TEXT DEFAULT 'standard', -- 'standard', 'highlighted', 'integration'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Call-to-Action Sections
CREATE TABLE IF NOT EXISTS public.cta_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  show_email_form BOOLEAN DEFAULT false,
  email_placeholder TEXT DEFAULT 'Your email address',
  background_color TEXT,
  text_color TEXT,
  show_stars BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Images/Media Library
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'icon'
  alt_text TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  file_size INTEGER,
  dimensions JSONB, -- {width: 1920, height: 1080}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_landing_sections_order ON public.landing_sections(display_order);
CREATE INDEX idx_section_content_section ON public.section_content(section_id);
CREATE INDEX idx_testimonials_order ON public.testimonials(display_order) WHERE is_enabled = true;
CREATE INDEX idx_features_order ON public.features(display_order) WHERE is_enabled = true;
CREATE INDEX idx_media_library_type ON public.media_library(file_type);

-- Enable RLS
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.header_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read, only admins can write
CREATE POLICY "Anyone can view landing sections" ON public.landing_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage landing sections" ON public.landing_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view section content" ON public.section_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage section content" ON public.section_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view header settings" ON public.header_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage header settings" ON public.header_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view footer settings" ON public.footer_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage footer settings" ON public.footer_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage features" ON public.features FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view CTA sections" ON public.cta_sections FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage CTA sections" ON public.cta_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view media library" ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Admins can manage media library" ON public.media_library FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default data
INSERT INTO public.landing_sections (section_key, section_name, display_order, is_enabled) VALUES
  ('hero', 'Hero Section', 1, true),
  ('testimonials', 'Testimonials', 2, true),
  ('leaderboard', 'Leaderboard', 3, true),
  ('cta', 'Call to Action', 4, true)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default header settings
INSERT INTO public.header_settings (
  logo_text, 
  show_logo_icon, 
  navigation_items, 
  cta_button_text, 
  cta_button_link,
  show_cta_button
) VALUES (
  'NavyGoal',
  true,
  '[{"name": "Features", "href": "#features", "order": 1}, {"name": "Pricing", "href": "/pricing", "order": 2}]'::jsonb,
  'Get Started',
  '/sign-up',
  true
) ON CONFLICT DO NOTHING;

-- Insert default footer settings
INSERT INTO public.footer_settings (
  company_name,
  show_large_text,
  large_text,
  footer_links,
  social_links,
  copyright_text
) VALUES (
  'NavyGoal',
  true,
  'NAVYGOAL',
  '[{"name": "Contact", "href": "/contact", "order": 1}, {"name": "Privacy", "href": "/privacy", "order": 2}, {"name": "Terms", "href": "/terms", "order": 3}, {"name": "Pricing", "href": "/pricing", "order": 4}]'::jsonb,
  '{"instagram": "https://instagram.com/navygoal"}'::jsonb,
  '© 2024 NavyGoal. All rights reserved.'
) ON CONFLICT DO NOTHING;

-- Insert default CTA section
INSERT INTO public.cta_sections (
  section_key,
  title,
  description,
  button_text,
  button_link,
  show_email_form,
  show_stars,
  display_order
) VALUES (
  'main_cta',
  'Ready to Achieve Your Goals?',
  'Join thousands of goal-setters who are visualizing their progress and celebrating their achievements.',
  'Get Started',
  '/sign-up',
  true,
  true,
  1
) ON CONFLICT (section_key) DO NOTHING;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_landing_sections_updated_at BEFORE UPDATE ON public.landing_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_content_updated_at BEFORE UPDATE ON public.section_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_header_settings_updated_at BEFORE UPDATE ON public.header_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_settings_updated_at BEFORE UPDATE ON public.footer_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON public.features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cta_sections_updated_at BEFORE UPDATE ON public.cta_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.landing_sections IS 'Controls which sections appear on the landing page and their order';
COMMENT ON TABLE public.section_content IS 'Stores all content for each landing page section';
COMMENT ON TABLE public.header_settings IS 'Controls header/navigation appearance and content';
COMMENT ON TABLE public.footer_settings IS 'Controls footer appearance and content';
COMMENT ON TABLE public.testimonials IS 'Customer testimonials displayed on landing page';
COMMENT ON TABLE public.features IS 'Product features displayed on landing page';
COMMENT ON TABLE public.cta_sections IS 'Call-to-action sections throughout the site';
COMMENT ON TABLE public.media_library IS 'Centralized media storage for images and videos';
