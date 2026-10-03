-- The "minutes" bucket (meeting-minutes documents, uploaded via the
-- document upload context) must be public so fileUrl links are viewable by
-- site visitors in a new tab without auth. Mirrors the same fix already
-- applied to the "images" bucket in
-- 20260922000000_set_images_bucket_public.sql — that bucket broke silently
-- when its public flag was only ever set via a manual dashboard click.
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
    VALUES ('minutes', 'minutes', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  END IF;
END $$;
