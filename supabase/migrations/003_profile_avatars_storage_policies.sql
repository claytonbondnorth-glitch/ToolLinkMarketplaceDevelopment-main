-- Storage policies for profile avatars only

DROP POLICY IF EXISTS "profile_avatars_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_avatars_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_avatars_replace" ON storage.objects;
DROP POLICY IF EXISTS "profile_avatars_delete" ON storage.objects;

CREATE POLICY "profile_avatars_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');

CREATE POLICY "profile_avatars_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_avatars_replace"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_avatars_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
