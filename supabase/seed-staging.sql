-- Kanaka PAC — staging seed data
--
-- Realistic sample content for a staging environment (no test/dummy rows).
-- Safe to run more than once: every insert is guarded so re-running this
-- script against a staging DB that already has this data will not create
-- duplicates.
--
-- Usage (run manually against the staging database):
--   psql "$DATABASE_URL" -f supabase/seed-staging.sql
--
-- Requires the schema to already be applied (supabase/schema.sql plus
-- everything under supabase/migrations/).

BEGIN;

-- Settings (singleton row)
INSERT INTO settings (id, school_name, pac_name, address, city, email, meeting_time)
VALUES (1, 'Kanaka Creek Elementary School', 'Kanaka Creek Elementary PAC', 'Kanaka Elementary School', 'Maple Ridge, BC', 'kcpacpresident@gmail.com', 'First Wednesday of each month, 7:00 PM')
ON CONFLICT (id) DO UPDATE SET
  school_name = EXCLUDED.school_name,
  pac_name = EXCLUDED.pac_name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  email = EXCLUDED.email,
  meeting_time = EXCLUDED.meeting_time;

-- Events
INSERT INTO events (title, date, time, location, description, rsvp_enabled, created_at)
SELECT * FROM (VALUES
  ('PAC Welcome Back BBQ', DATE '2026-09-18', '11:30', 'School Gymnasium', 'Join us for our annual Welcome Back BBQ! Meet other parents, learn about PAC initiatives for the year, and enjoy some great food. All families are welcome.', true, TIMESTAMPTZ '2026-08-15T10:00:00Z'),
  ('Monthly PAC Meeting', DATE '2026-10-07', '19:00', 'School Library', 'Regular monthly PAC meeting. Agenda includes budget review, upcoming fundraiser planning, and a guest speaker from the school district on new curriculum updates.', false, TIMESTAMPTZ '2026-09-01T10:00:00Z'),
  ('Fall Fundraiser Gala', DATE '2026-11-14', '18:00', 'Community Centre Hall', 'Our biggest fundraising event of the year! Silent auction, dinner, and entertainment. Tickets available through the school office. All proceeds go to playground renovation.', true, TIMESTAMPTZ '2026-09-05T10:00:00Z'),
  ('Winter Holiday Craft Fair', DATE '2026-12-05', '10:00', 'School Gymnasium', 'Local vendors, student craft tables, and a bake sale to support the PAC hot lunch program. Free admission for the whole family.', false, TIMESTAMPTZ '2026-09-10T10:00:00Z')
) AS v(title, date, time, location, description, rsvp_enabled, created_at)
WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.title = v.title);

-- Minutes
INSERT INTO minutes (title, date, content, file_url, created_at)
SELECT * FROM (VALUES
  ('September 2026 General Meeting', DATE '2026-09-02', E'## Attendance\n\nPresent: 20 parents, Principal Smith, Vice-Principal Jones\n\n## Agenda Items\n\n### 1. Treasurer''s Report\n- Current balance: $5,100\n- Hot lunch program revenue: $1,350\n- Outstanding expenses: $400 for welcome back BBQ supplies\n\n### 2. Fundraising Update\n- Fall Gala planning committee formed\n- Venue booked for November 14\n- Volunteer sign-up sheet circulated\n\n### 3. Playground Renovation\n- Quotes received from 3 contractors\n- Target budget: $16,000\n- District matching grant application submitted\n\n### 4. Next Meeting\n- October 7, 2026 at 7:00 PM in the School Library\n\nMinutes submitted by: Secretary Jane Doe', NULL, TIMESTAMPTZ '2026-09-03T10:00:00Z'),
  ('June 2026 General Meeting', DATE '2026-06-03', E'## Attendance\n\nPresent: 24 parents, Principal Smith\n\n## Agenda Items\n\n### 1. Treasurer''s Report\n- Year-end balance: $4,700\n- Approved $600 for classroom supplies request\n\n### 2. Year-End Wrap-Up\n- Thank you to all volunteers for a successful year\n- Summer maintenance schedule reviewed for the playground project\n\n### 3. Next Meeting\n- September 2, 2026 at 7:00 PM in the School Library\n\nMinutes submitted by: Secretary Jane Doe', NULL, TIMESTAMPTZ '2026-06-04T10:00:00Z')
) AS v(title, date, content, file_url, created_at)
WHERE NOT EXISTS (SELECT 1 FROM minutes m WHERE m.title = v.title);

-- Announcements
INSERT INTO announcements (title, content, priority, published_at, expires_at)
SELECT * FROM (VALUES
  ('Volunteer Opportunities Available', 'We are looking for parent volunteers to help with our upcoming Fall Gala. If you can donate a few hours of your time, please contact the PAC at pac@school.ca. We need help with setup, decorations, silent auction coordination, and cleanup.', 'normal', TIMESTAMPTZ '2026-09-01T10:00:00Z', NULL::timestamptz),
  ('Hot Lunch Program - Menu Change', 'Please note that the hot lunch menu for October has been updated. New options include vegetarian and gluten-free choices. Orders must be placed by September 28. Visit the school website to place your order.', 'normal', TIMESTAMPTZ '2026-09-08T10:00:00Z', TIMESTAMPTZ '2026-09-28T23:59:59Z'),
  ('Picture Day Reminder', 'School picture day is coming up on September 25. Order forms went home with students this week; please return them, along with payment, by September 22.', 'urgent', TIMESTAMPTZ '2026-09-12T10:00:00Z', TIMESTAMPTZ '2026-09-25T23:59:59Z')
) AS v(title, content, priority, published_at, expires_at)
WHERE NOT EXISTS (SELECT 1 FROM announcements a WHERE a.title = v.title);

-- Articles
INSERT INTO articles (title, author, excerpt, body, status, published_at, created_at)
SELECT * FROM (VALUES
  ('Playground Renovation Update: Phase One Approved', 'Jane Doe', 'The district has approved matching funds for the first phase of our playground renovation project.', E'We are thrilled to announce that the school district has approved matching funds for Phase One of the playground renovation project. Construction is expected to begin next spring, with new climbing structures and an accessible surface for all students.\n\nThank you to everyone who contributed to the fundraising effort over the past year — this milestone would not have been possible without our community''s support.', 'published', TIMESTAMPTZ '2026-09-05T09:00:00Z', TIMESTAMPTZ '2026-09-05T09:00:00Z'),
  ('Meet the 2026-2027 PAC Executive', 'Alice Wonder', 'Introducing this year''s PAC executive team and what they''re looking forward to.', E'We''re excited to introduce the PAC executive team for the 2026-2027 school year. This year''s team brings a mix of returning members and new volunteers, all committed to supporting our school community.\n\nLook for our first general meeting in September to meet the team in person and learn more about this year''s priorities.', 'published', TIMESTAMPTZ '2026-08-28T09:00:00Z', TIMESTAMPTZ '2026-08-28T09:00:00Z')
) AS v(title, author, excerpt, body, status, published_at, created_at)
WHERE NOT EXISTS (SELECT 1 FROM articles ar WHERE ar.title = v.title);

-- Policies
INSERT INTO policies (title, description, file_url, updated_at)
SELECT * FROM (VALUES
  ('PAC Bylaws', 'Governing bylaws for the Kanaka Creek Elementary PAC, including membership, voting, and executive roles.', NULL::text, TIMESTAMPTZ '2026-09-01T00:00:00Z'),
  ('Fundraising Policy', 'Guidelines for organizing and approving PAC fundraising activities.', NULL::text, TIMESTAMPTZ '2026-09-01T00:00:00Z'),
  ('Code of Conduct', 'Expectations for respectful conduct at PAC meetings and events.', NULL::text, TIMESTAMPTZ '2026-09-01T00:00:00Z')
) AS v(title, description, file_url, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM policies p WHERE p.title = v.title);

-- Team Members
INSERT INTO team_members (name, role, bio, email, sort_order)
SELECT * FROM (VALUES
  ('Alice Wonder', 'Chair', 'Alice has two children at Kanaka Creek Elementary and has served on the PAC executive for three years.', '', 1),
  ('Bob Builder', 'Vice Chair', 'Bob coordinates volunteer scheduling for PAC events and leads the playground renovation committee.', '', 2),
  ('Priya Nair', 'Treasurer', 'Priya manages the PAC budget and financial reporting.', '', 3),
  ('Jane Doe', 'Secretary', 'Jane takes minutes at meetings and manages PAC communications.', '', 4)
) AS v(name, role, bio, email, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM team_members t WHERE t.name = v.name AND t.role = v.role);

-- Subscribers
INSERT INTO subscribers (email, subscribed_at)
VALUES ('staging-demo@example.com', NOW())
ON CONFLICT (email) DO NOTHING;

COMMIT;
