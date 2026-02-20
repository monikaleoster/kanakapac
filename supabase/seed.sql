-- Seed data for Kanaka PAC

-- Settings
INSERT INTO settings (id, school_name, pac_name, address, city, email, meeting_time)
VALUES (1, 'Kanaka Creek Elementary School', 'Kanaka Creek Elementary PAC', 'Kanaka Elementary School', 'Maple Ridge, BC', 'kcpacpresident@gmail.com', 'First Wednesday of each month, 7:00 PM');

-- Events
INSERT INTO events (title, date, time, location, description, created_at)
VALUES 
('PAC Welcome Back BBQ', '2026-03-15', '11:30', 'School Gymnasium', 'Join us for our annual Welcome Back BBQ! Meet other parents, learn about PAC initiatives for the year, and enjoy some great food. All families are welcome.', '2026-02-01T10:00:00Z'),
('Monthly PAC Meeting', '2026-03-05', '19:00', 'School Library', 'Regular monthly PAC meeting. Agenda includes budget review, upcoming fundraiser planning, and guest speaker from the school district on new curriculum updates.', '2026-02-01T10:00:00Z'),
('Spring Fundraiser Gala', '2026-04-20', '18:00', 'Community Centre Hall', 'Our biggest fundraising event of the year! Silent auction, dinner, and entertainment. Tickets available through the school office. All proceeds go to playground renovation.', '2026-02-05T10:00:00Z'),
('Test Event', '2026-12-02', '10:00', 'School Hall', 'This is a test event created by automation.', '2026-02-13T06:57:25.031Z');

-- Minutes
INSERT INTO minutes (title, date, content, file_url, created_at)
VALUES 
('January 2026 General Meeting', '2026-01-15', '## Attendance\n\nPresent: 18 parents, Principal Smith, Vice-Principal Jones\n\n## Agenda Items\n\n### 1. Treasurer''s Report\n- Current balance: $4,250\n- Hot lunch program revenue: $1,200\n- Outstanding expenses: $350 for winter event supplies\n\n### 2. Fundraising Update\n- Spring Gala planning committee formed\n- Venue booked for April 20\n- Volunteer sign-up sheet circulated\n\n### 3. Playground Renovation\n- Quotes received from 3 contractors\n- Target budget: $15,000\n- District matching grant application submitted\n\n### 4. Next Meeting\n- February 12, 2026 at 7:00 PM in the School Library\n\nMinutes submitted by: Secretary Jane Doe', NULL, '2026-01-16T10:00:00Z'),
('February 2026 General Meeting', '2026-02-05', '## Attendance\n\nPresent: 22 parents, Principal Smith\n\n## Agenda Items\n\n### 1. Treasurer''s Report\n- Current balance: $4,800\n- Approved $500 for classroom supplies request\n\n### 2. Spring Gala Update\n- Silent auction items being collected\n- Ticket price set at $40 per person\n- Entertainment committee confirmed live music\n\n### 3. School Safety Discussion\n- Review of pick-up/drop-off procedures\n- New crosswalk guard schedule approved\n\n### 4. Next Meeting\n- March 5, 2026 at 7:00 PM in the School Library\n\nMinutes submitted by: Secretary Jane Doe', NULL, '2026-02-06T10:00:00Z'),
('Test Minutes Upload', '2026-12-03', 'Test content for minutes upload.', '/uploads/minutes/1770966911424-Order8077103-DaxtonVeltri.pdf', '2026-02-13T07:15:30.224Z');

-- Announcements
INSERT INTO announcements (title, content, priority, published_at, expires_at)
VALUES 
('Volunteer Opportunities Available', 'We are looking for parent volunteers to help with our upcoming Spring Gala. If you can donate a few hours of your time, please contact the PAC at pac@school.ca. We need help with setup, decorations, silent auction coordination, and cleanup.', 'normal', '2026-02-01T10:00:00Z', NULL),
('Hot Lunch Program - Menu Change', 'Please note that the hot lunch menu for March has been updated. New options include vegetarian and gluten-free choices. Orders must be placed by February 28. Visit the school website to place your order.', 'normal', '2026-02-08T10:00:00Z', '2026-02-28T23:59:59Z'),
('Emergency PAC Meeting Rescheduled', 'Due to inclement weather, the PAC meeting originally scheduled for February 10 has been rescheduled to February 12 at 7:00 PM. Same location: School Library. We apologize for any inconvenience.', 'urgent', '2026-02-09T10:00:00Z', '2026-02-13T00:00:00Z');

-- Policies
INSERT INTO policies (title, description, file_url, updated_at)
VALUES 
('Test Policy', 'This is a test policy description.', '/uploads/minutes/1770967491294-Order8077103-DaxtonVeltri.pdf', '2026-02-13T07:25:04.260Z');

-- Team Members
INSERT INTO team_members (name, role, bio, email, sort_order)
VALUES 
('Alice Wonder', 'Chair', 'A wonderful chair.', '', 1),
('Bob Builder', 'Vice Chair', 'Vice Chair of the PAC.', '', 2),
('ttest', 'test', 'test', '', 3);

-- Subscribers
INSERT INTO subscribers (email, subscribed_at)
VALUES 
('test@example.com', '2026-02-13T07:42:13.104Z');
