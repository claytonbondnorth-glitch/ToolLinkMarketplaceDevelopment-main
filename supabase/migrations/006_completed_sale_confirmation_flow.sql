ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE listings
  DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_status_check
  CHECK (status IN ('active', 'sold', 'pending', 'flagged', 'pending_completion'));

DROP POLICY IF EXISTS "listings_read_active" ON listings;

CREATE POLICY "listings_read_active"
  ON listings FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = seller_id
    OR auth.uid() = sold_to_user_id
  );

DROP POLICY IF EXISTS "listings_complete_sale_buyer" ON listings;

CREATE POLICY "listings_complete_sale_buyer"
  ON listings FOR UPDATE
  USING (
    sold_to_user_id = auth.uid()
    AND status = 'pending_completion'
  )
  WITH CHECK (
    sold_to_user_id = auth.uid()
    AND status = 'sold'
  );
