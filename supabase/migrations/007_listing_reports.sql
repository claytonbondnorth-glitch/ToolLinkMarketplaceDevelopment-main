-- Listing reports for moderation workflow

CREATE TABLE IF NOT EXISTS listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'Scam or suspicious listing',
    'Incorrect details',
    'Inappropriate content',
    'Duplicate listing',
    'Other'
  )),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT,
  CONSTRAINT listing_reports_no_self_report CHECK (seller_user_id IS NULL OR reporter_user_id <> seller_user_id)
);

ALTER TABLE listing_reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE listing_reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE listing_reports ADD COLUMN IF NOT EXISTS details TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS listing_reports_listing_reporter_uniq
  ON listing_reports (listing_id, reporter_user_id);

DO $$
DECLARE
  reporter_fk_target TEXT;
  seller_fk_target TEXT;
BEGIN
  SELECT ns.nspname || '.' || cls.relname
  INTO reporter_fk_target
  FROM pg_constraint c
  JOIN pg_class cls ON cls.oid = c.confrelid
  JOIN pg_namespace ns ON ns.oid = cls.relnamespace
  WHERE c.conrelid = 'public.listing_reports'::regclass
    AND c.conname = 'listing_reports_reporter_user_id_fkey';

  IF reporter_fk_target IS NULL THEN
    ALTER TABLE listing_reports
      ADD CONSTRAINT listing_reports_reporter_user_id_fkey
      FOREIGN KEY (reporter_user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  ELSIF reporter_fk_target <> 'auth.users' THEN
    ALTER TABLE listing_reports DROP CONSTRAINT listing_reports_reporter_user_id_fkey;
    ALTER TABLE listing_reports
      ADD CONSTRAINT listing_reports_reporter_user_id_fkey
      FOREIGN KEY (reporter_user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;

  SELECT ns.nspname || '.' || cls.relname
  INTO seller_fk_target
  FROM pg_constraint c
  JOIN pg_class cls ON cls.oid = c.confrelid
  JOIN pg_namespace ns ON ns.oid = cls.relnamespace
  WHERE c.conrelid = 'public.listing_reports'::regclass
    AND c.conname = 'listing_reports_seller_user_id_fkey';

  IF seller_fk_target IS NULL THEN
    ALTER TABLE listing_reports
      ADD CONSTRAINT listing_reports_seller_user_id_fkey
      FOREIGN KEY (seller_user_id)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  ELSIF seller_fk_target <> 'auth.users' THEN
    ALTER TABLE listing_reports DROP CONSTRAINT listing_reports_seller_user_id_fkey;
    ALTER TABLE listing_reports
      ADD CONSTRAINT listing_reports_seller_user_id_fkey
      FOREIGN KEY (seller_user_id)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_value BOOLEAN := FALSE;
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF to_regclass('public.profiles') IS NULL THEN
    RETURN FALSE;
  END IF;

  BEGIN
    EXECUTE 'SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = $1 LIMIT 1'
      INTO is_admin_value
      USING check_user_id;
  EXCEPTION
    WHEN undefined_table OR undefined_column THEN
      RETURN FALSE;
  END;

  RETURN COALESCE(is_admin_value, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_id ON listing_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON listing_reports(status);

ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_reports_insert_own" ON listing_reports;
DROP POLICY IF EXISTS "listing_reports_select_scope" ON listing_reports;
DROP POLICY IF EXISTS "listing_reports_select_own_or_admin" ON listing_reports;
DROP POLICY IF EXISTS "listing_reports_admin_update" ON listing_reports;

CREATE POLICY "listing_reports_insert_own"
  ON listing_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_user_id
    AND auth.uid() IS NOT NULL
    AND (
      seller_user_id IS NULL
      OR auth.uid() <> seller_user_id
    )
  );

CREATE POLICY "listing_reports_select_scope"
  ON listing_reports FOR SELECT
  USING (
    auth.uid() = reporter_user_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "listing_reports_admin_update"
  ON listing_reports FOR UPDATE
  USING (
    public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    public.is_admin_user(auth.uid())
  );
