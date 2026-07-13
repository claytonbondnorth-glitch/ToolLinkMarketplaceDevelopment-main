-- ToolLink Finance waitlist table and RLS policies

CREATE TABLE IF NOT EXISTS public.finance_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'homepage_finance_section',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS finance_waitlist_email_unique_idx
  ON public.finance_waitlist (email);

CREATE UNIQUE INDEX IF NOT EXISTS finance_waitlist_user_unique_idx
  ON public.finance_waitlist (user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.finance_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finance_waitlist_insert_anon" ON public.finance_waitlist;
DROP POLICY IF EXISTS "finance_waitlist_insert_auth" ON public.finance_waitlist;
DROP POLICY IF EXISTS "finance_waitlist_select_own" ON public.finance_waitlist;

CREATE POLICY "finance_waitlist_insert_anon"
  ON public.finance_waitlist
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "finance_waitlist_insert_auth"
  ON public.finance_waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "finance_waitlist_select_own"
  ON public.finance_waitlist
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
