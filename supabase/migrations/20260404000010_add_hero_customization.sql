-- Add hero section customization fields
-- This allows admins to customize the hero title text, font size, and font family

-- Create hero_settings table for hero section customization
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Navy Goal',
  subtitle TEXT DEFAULT 'Set meaningful goals, track daily progress, and celebrate milestones with our visual goal tracking platform.',
  title_font_family TEXT DEFAULT 'Georgia Pro, Georgia, serif',
  title_font_size TEXT DEFAULT 'clamp(3rem, 12vw, 10rem)', -- Responsive font size
  subtitle_font_size TEXT DEFAULT 'text-base sm:text-lg',
  show_avatars BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  rating_value DECIMAL(2,1) DEFAULT 4.9,
  rating_count INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view hero settings" ON public.hero_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero settings" ON public.hero_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default hero settings
INSERT INTO public.hero_settings (
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
) ON CONFLICT DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_hero_settings_updated_at BEFORE UPDATE ON public.hero_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.hero_settings IS 'Customization settings for the hero section including title, fonts, and display options';
