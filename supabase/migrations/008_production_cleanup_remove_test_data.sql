-- Production cleanup: remove development/testing content.
-- Safe to run multiple times.

DO $$
DECLARE
  test_user_ids UUID[];
  test_listing_ids UUID[];
BEGIN
  -- Identify temporary/test users by profile/email markers.
  SELECT ARRAY(
    SELECT p.id
    FROM public.profiles p
    WHERE (
      COALESCE(p.name, '') ~* '(^|[^a-z])(test|demo|dummy|sample|qa|placeholder)([^a-z]|$)'
      OR COALESCE(p.bio, '') ~* '(^|[^a-z])(test|demo|dummy|sample|qa|placeholder)([^a-z]|$)'
      OR COALESCE(p.email, '') ~* '(^|[^a-z])(test|demo|dummy|sample|qa|placeholder)([^a-z]|$)'
      OR COALESCE(p.email, '') ILIKE '%+test%'
      OR COALESCE(p.email, '') ILIKE 'test%@%'
      OR COALESCE(p.email, '') ILIKE '%@example.com%'
      OR COALESCE(p.email, '') ILIKE '%@example.org%'
      OR COALESCE(p.email, '') ILIKE '%@example.net%'
    )
  ) INTO test_user_ids;

  -- Identify test listings by title/description markers.
  SELECT ARRAY(
    SELECT l.id
    FROM public.listings l
    WHERE (
      COALESCE(l.title, '') ~* '(^\s*\[\s*test\s*\])|\b(test listing|test|demo|dummy|sample|qa|placeholder)\b'
      OR COALESCE(l.description, '') ~* '\b(test listing|dummy listing|sample listing|qa listing|placeholder)\b'
    )
  ) INTO test_listing_ids;

  -- Saved listings tied to test users/test listings.
  DELETE FROM public.saved_listings s
  WHERE (
    (test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 AND s.user_id = ANY(test_user_ids))
    OR (test_listing_ids IS NOT NULL AND array_length(test_listing_ids, 1) > 0 AND s.listing_id = ANY(test_listing_ids))
  );

  -- Reviews tied to test users/test listings or explicitly fake copy.
  DELETE FROM public.reviews r
  WHERE (
    (test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 AND (r.reviewer_id = ANY(test_user_ids) OR r.reviewed_user_id = ANY(test_user_ids)))
    OR (test_listing_ids IS NOT NULL AND array_length(test_listing_ids, 1) > 0 AND r.listing_id = ANY(test_listing_ids))
    OR COALESCE(r.comment, '') ~* '\b(test|demo|dummy|sample|qa|placeholder|fake)\b'
  );

  -- Messages with fake markers or tied to test users/listings.
  DELETE FROM public.messages m
  USING public.conversations c
  WHERE m.conversation_id = c.id
    AND (
      (test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 AND (c.buyer_id = ANY(test_user_ids) OR c.seller_id = ANY(test_user_ids)))
      OR (test_listing_ids IS NOT NULL AND array_length(test_listing_ids, 1) > 0 AND c.listing_id = ANY(test_listing_ids))
      OR COALESCE(m.text, '') ~* '\b(test|demo|dummy|sample|qa|placeholder|fake)\b'
    );

  -- Conversations tied to test users/listings.
  DELETE FROM public.conversations c
  WHERE (
    (test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 AND (c.buyer_id = ANY(test_user_ids) OR c.seller_id = ANY(test_user_ids)))
    OR (test_listing_ids IS NOT NULL AND array_length(test_listing_ids, 1) > 0 AND c.listing_id = ANY(test_listing_ids))
  );

  -- Listing reports tied to test users/listings or fake markers.
  IF to_regclass('public.listing_reports') IS NOT NULL THEN
    DELETE FROM public.listing_reports lr
    WHERE (
      (test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 AND (lr.reporter_user_id = ANY(test_user_ids) OR lr.seller_user_id = ANY(test_user_ids)))
      OR (test_listing_ids IS NOT NULL AND array_length(test_listing_ids, 1) > 0 AND lr.listing_id = ANY(test_listing_ids))
      OR COALESCE(lr.details, '') ~* '\b(test|demo|dummy|sample|qa|placeholder|fake)\b'
      OR COALESCE(lr.reason, '') ~* '\b(test|demo|dummy|sample|qa|placeholder|fake)\b'
    );
  END IF;

  -- Optional notifications table cleanup (if present).
  IF to_regclass('public.notifications') IS NOT NULL THEN
    DELETE FROM public.notifications n
    WHERE to_jsonb(n)::text ~* '\b(test|demo|dummy|sample|qa|placeholder|fake)\b';
  END IF;

  -- Remove test listings.
  DELETE FROM public.listings l
  WHERE (
    (test_listing_ids IS NOT NULL AND array_length(test_listing_ids, 1) > 0 AND l.id = ANY(test_listing_ids))
    OR (test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 AND l.seller_id = ANY(test_user_ids))
  );

  -- Remove test users from auth (cascades to profiles).
  IF test_user_ids IS NOT NULL AND array_length(test_user_ids, 1) > 0 THEN
    DELETE FROM auth.users u
    WHERE u.id = ANY(test_user_ids);
  END IF;
END;
$$;
