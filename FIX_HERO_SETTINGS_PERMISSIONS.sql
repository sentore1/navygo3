-- Fix Hero Settings Permissions and Data
-- Run this if hero settings aren't saving properly

-- 1. Check if hero_settings table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'hero_settings'
) as table_exists;

-- 2. Check current data
SELECT * FROM hero_settings;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hero_settings';

-- 4. Drop and recreate policies with correct permissions
DROP POLICY IF EXISTS "Anyone can view hero settings" ON public.hero_settings;
DROP POLICY IF EXISTS "Admins can manage hero settings" ON public.hero_settings;

-- Allow anyone to view
CREATE POLICY "Anyone can view hero settings" 
  ON public.hero_settings 
  FOR SELECT 
  USING (true);

-- Allow admins to insert
CREATE POLICY "Admins can insert hero settings" 
  ON public.hero_settings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow admins to update
CREATE POLICY "Admins can update hero settings" 
  ON public.hero_settings 
  FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow admins to delete
CREATE POLICY "Admins can delete hero settings" 
  ON public.hero_settings 
  FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Ensure there's exactly one row (delete extras if any)
DELETE FROM hero_settings 
WHERE id NOT IN (
  SELECT id FROM hero_settings ORDER BY created_at LIMIT 1
);

-- 6. Insert default if no data exists
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
WHERE NOT EXISTS (SELECT 1 FROM hero_settings);

-- 7. Verify the fix
SELECT 
  'Hero settings fixed!' as status,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'hero_settings') as policy_count
FROM hero_settings;

-- 8. Show current settings
SELECT * FROM hero_settings;
