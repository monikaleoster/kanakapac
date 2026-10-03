-- Minutes entries are now backed by an uploaded document (file_url) instead
-- of typed Markdown. The app has stopped reading/writing the content column
-- as of the "Replace Minutes Markdown content with uploaded documents"
-- change, so drop the now-dead column. No NOT NULL constraint is added to
-- file_url here -- enforcement stays at the application/form layer only, so
-- pre-existing rows without a file_url yet aren't broken by this migration.
ALTER TABLE minutes DROP COLUMN IF EXISTS content;
