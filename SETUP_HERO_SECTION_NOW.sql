-- Quick Setup for Hero Section CMS
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Step 1: Create hero_settings table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Navy Goal',
  subtitle TEXT DEFAULT 'Set meaningful goals, track daily progress, and celebrate milestones with our visual goal tracking platform.',
  title_font_family TEXT DEFAULT 'Georgia Pro, Georgia, serif',
  title_font_size TEXT DEFAULT 'clamp(3rem, 12vw, 10rem)',
  subtitle_font_size TEXT DEFAULT 'text-base sm:text-lg',
  show_avatars BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  rating_value DECIMAL(2,1) DEFAULT 4.9,
  rating_count INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view hero settings" ON public.hero_settings;
DROP POLICY IF EXISTS "Admins can manage hero settings" ON public.hero_settings;

-- Step 4: Create RLS Policies
CREATE POLICY "Anyone can view hero settings" ON public.hero_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero settings" ON public.hero_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Step 5: Insert default hero settings (only if table is empty)
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
)
SELECT
  'Navy Goal',
  'Set meaningful goals, track daily progress, and celebrate milestones with our visual goal tracking platform.',
  'Georgia Pro, Georgia, serif',
  'clamp(3rem, 12vw, 10rem)',
  'text-base sm:text-lg',
  true,
  true,
  4.9,
  200
WHERE NOT EXISTS (SELECT 1 FROM public.hero_settings);

-- Step 6: Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_hero_settings_updated_at ON public.hero_settings;

-- Step 8: Create trigger for updated_at
CREATE TRIGGER update_hero_settings_updated_at 
  BEFORE UPDATE ON public.hero_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Verify the setup
SELECT 
  'Hero settings table created and populated!' as status,
  COUNT(*) as record_count
FROM public.hero_settings;

-- Step 10: Show the current hero settings
SELECT * FROM public.hero_settings;
