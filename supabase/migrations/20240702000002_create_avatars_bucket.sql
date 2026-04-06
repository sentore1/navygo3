-- Create a storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy for the avatars bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "User Upload Access" ON storage.objects;
CREATE POLICY "User Upload Access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "User Update Access" ON storage.objects;
CREATE POLICY "User Update Access"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "User Delete Access" ON storage.objects;
CREATE POLICY "User Delete Access"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars');
