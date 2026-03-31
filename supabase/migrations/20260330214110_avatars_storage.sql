-- -- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- -- Create storage policy for authenticated users to upload their own avatars
-- CREATE POLICY "Users can upload their own avatar"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- -- Create storage policy for authenticated users to update their own avatars
-- CREATE POLICY "Users can update their own avatar"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- -- Create storage policy for authenticated users to delete their own avatars
-- CREATE POLICY "Users can delete their own avatar"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- -- Create storage policy for public read access
-- CREATE POLICY "Anyone can view avatars"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'avatars');
