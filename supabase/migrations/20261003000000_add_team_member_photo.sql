-- Optional headshot for executive team members
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS photo_url TEXT;
