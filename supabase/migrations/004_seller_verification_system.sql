-- Seller verification MVP

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verified_member BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_type TEXT CHECK (verification_type IN ('tradie', 'business'));

UPDATE profiles
SET verified_member = TRUE
WHERE verified = TRUE
  AND COALESCE(verified_member, FALSE) = FALSE
  AND verification_type IS NULL;

CREATE TABLE IF NOT EXISTS verification_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('tradie', 'business')),
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL DEFAULT '',
  trade TEXT NOT NULL,
  abn TEXT NOT NULL,
  licence_number TEXT NOT NULL,
  state TEXT NOT NULL,
  website TEXT,
  notes TEXT NOT NULL DEFAULT '',
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS verification_applications_status_idx
  ON verification_applications(status, created_at DESC);

CREATE INDEX IF NOT EXISTS verification_applications_user_idx
  ON verification_applications(user_id, created_at DESC);

ALTER TABLE verification_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verification_applications_select_own_or_admin" ON verification_applications;
DROP POLICY IF EXISTS "verification_applications_insert_own" ON verification_applications;
DROP POLICY IF EXISTS "verification_applications_update_admin" ON verification_applications;

CREATE POLICY "verification_applications_select_own_or_admin"
  ON verification_applications FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "verification_applications_insert_own"
  ON verification_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verification_applications_update_admin"
  ON verification_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  TRUE,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "verification_documents_read" ON storage.objects;
DROP POLICY IF EXISTS "verification_documents_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "verification_documents_replace_own" ON storage.objects;
DROP POLICY IF EXISTS "verification_documents_delete_own" ON storage.objects;

CREATE POLICY "verification_documents_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification-documents');

CREATE POLICY "verification_documents_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "verification_documents_replace_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "verification_documents_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
