-- Create tables for Kanaka PAC

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Minutes
CREATE TABLE IF NOT EXISTS minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  email TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (Singleton)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  school_name TEXT NOT NULL,
  pac_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  email TEXT,
  logo_url TEXT,
  meeting_time TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);


-- Public can read events
CREATE POLICY "Public read events"
  ON events FOR SELECT
                           TO anon
                           USING (true);

-- Block anon from writing
CREATE POLICY "Block anon writes"
  ON events FOR INSERT, UPDATE, DELETE
    TO anon
    USING (false);



-- ============ EVENTS ============
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events"
  ON events FOR SELECT
                           TO anon
                           USING (true);

-- ============ ANNOUNCEMENTS ============
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read announcements"
  ON announcements FOR SELECT
                                  TO anon
                                  USING (true);

-- ============ MINUTES ============
ALTER TABLE minutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read minutes"
  ON minutes FOR SELECT
                            TO anon
                            USING (true);


ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON settings FOR SELECT
                             TO anon
                             USING (true);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read policies"
  ON policies FOR SELECT
                             TO anon
                             USING (true);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subscribers"
  ON subscribers FOR SELECT
                                TO anon
                                USING (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subscribers"
  ON team_members FOR SELECT
                                 TO anon
                                 USING (true);