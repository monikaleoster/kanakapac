-- The "images" bucket (Article cover images) must be public so cover image
-- URLs (src/lib/storage.ts getPublicUrl) are fetchable by social-media link
-- scrapers (e.g. Facebook) without auth. This was previously only set via a
-- manual, unversioned dashboard click; codify it here so it can't drift.
--
-- storage.buckets only exists on a real Supabase project (not the plain
-- postgres container CI's migration-smoke-test runs against), so guard it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('images', 'images', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  END IF;
END $$;
