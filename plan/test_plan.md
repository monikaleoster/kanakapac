# Test Plan — Kanaka PAC Website

Covers unit, integration, and end-to-end testing for every layer of the application.

---

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit** | Jest + React Testing Library | Isolated functions and UI components |
| **Integration** | Jest + `node-fetch` / Next.js test utils | API routes against the CI Supabase DB |
| **E2E** | Playwright | Full user journeys in a real browser |

### Installation

```bash
# Unit + Integration
npm install --save-dev jest @types/jest ts-jest \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-environment-jsdom

# E2E
npm install --save-dev @playwright/test
npx playwright install chromium
```

### Config files needed

```
jest.config.ts          # Jest config (unit + integration)
jest.setup.ts           # @testing-library/jest-dom import
playwright.config.ts    # Playwright config
```

---

## Directory Structure

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── format.test.ts
│   │   │   ├── data.test.ts
│   │   │   └── auth.test.ts
│   │   └── components/
│   │       ├── EventCard.test.tsx
│   │       ├── AnnouncementCard.test.tsx
│   │       ├── MinutesCard.test.tsx
│   │       └── SubscribeForm.test.tsx
│   └── integration/
│       └── api/
│           ├── events.test.ts
│           ├── minutes.test.ts
│           ├── announcements.test.ts
│           ├── policies.test.ts
│           ├── team.test.ts
│           ├── subscribe.test.ts
│           ├── settings.test.ts
│           └── upload.test.ts
└── e2e/
    ├── public/
    │   ├── home.spec.ts
    │   ├── events.spec.ts
    │   ├── minutes.spec.ts
    │   ├── announcements.spec.ts
    │   ├── policies.spec.ts
    │   ├── about.spec.ts
    │   └── subscribe.spec.ts
    └── admin/
        ├── login.spec.ts
        ├── events.spec.ts
        ├── minutes.spec.ts
        ├── announcements.spec.ts
        ├── settings.spec.ts
        └── subscribers.spec.ts
```

---

## 1. Unit Tests

Unit tests run entirely in-process with **mocked Supabase** (`jest.mock('@/lib/supabase')`). No network calls.

### 1.1 `src/lib/format.ts`

**File:** `src/__tests__/unit/lib/format.test.ts`

#### `formatDate(dateStr)`
| Test | Input | Expected Output |
|------|-------|----------------|
| Formats a typical date | `"2026-02-22"` | `"February 22, 2026"` |
| Handles January correctly | `"2026-01-01"` | `"January 1, 2026"` |
| Handles December 31 | `"2026-12-31"` | `"December 31, 2026"` |
| Does not shift date due to timezone | `"2026-06-15"` | `"June 15, 2026"` (no off-by-one) |

#### `formatTime(timeStr)`
| Test | Input | Expected Output |
|------|-------|----------------|
| Morning time (AM) | `"09:30"` | `"9:30 AM"` |
| Noon | `"12:00"` | `"12:00 PM"` |
| Afternoon time (PM) | `"14:45"` | `"2:45 PM"` |
| Midnight | `"00:00"` | `"12:00 AM"` |
| 11 PM | `"23:59"` | `"11:59 PM"` |

#### `formatDateTime(dateStr)`
| Test | Input | Expected Output |
|------|-------|----------------|
| ISO timestamp renders human-readable | `"2026-02-22T19:00:00.000Z"` | Contains `"February"`, `"2026"`, `"7"`, `"PM"` or `"AM"` |

---

### 1.2 `src/lib/data.ts` (with mocked Supabase)

**File:** `src/__tests__/unit/lib/data.test.ts`

Mock setup:
```ts
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    // etc.
  }
}));
```

#### Events
| Test | Scenario | Expected |
|------|----------|---------|
| `getEvents` returns mapped array | Supabase returns 2 rows with `snake_case` columns | Returns array with `camelCase` fields (`createdAt` not `created_at`) |
| `getEvents` returns empty array on error | Supabase returns `{ error: { message: "..." } }` | Returns `[]`, does not throw |
| `getUpcomingEvents` filters by today | Supabase receives `.gte("date", today)` | `gte` is called with today's ISO date |
| `getPastEvents` filters past | Supabase receives `.lt("date", today)` | `lt` is called and order is descending |
| `getEventById` returns undefined on not found | Supabase returns `{ data: null, error: null }` | Returns `undefined` |
| `saveEvent` calls upsert with correct payload | Called with a full `Event` object | Supabase `upsert` called with `snake_case` payload |
| `deleteEvent` calls delete with id | Called with id `"abc-123"` | Supabase `delete().eq("id", "abc-123")` called |
| `saveEvent` re-throws on Supabase error | Supabase returns error | Function throws |

#### Announcements
| Test | Scenario | Expected |
|------|----------|---------|
| `getActiveAnnouncements` filters expired | Query uses `.or("expires_at.is.null,expires_at.gt.{now}")` | The OR filter is applied |
| `saveAnnouncement` with `expiresAt: null` | `expiresAt` is null | Payload has `expires_at: null` |
| Announcement priority is preserved | Row has `priority: "urgent"` | Returned object has `priority: "urgent"` |

#### Subscribers
| Test | Scenario | Expected |
|------|----------|---------|
| `saveSubscriber` ignores unique constraint error | Supabase error code `"23505"` | Does not throw |
| `saveSubscriber` throws on other errors | Supabase error code `"42501"` | Throws |
| `deleteSubscriber` calls delete by email | Email `"test@test.com"` | `.eq("email", "test@test.com")` called |

#### Settings
| Test | Scenario | Expected |
|------|----------|---------|
| `getSchoolSettings` returns `defaultSettings` on error | Supabase returns error | Returns `defaultSettings` constant |
| `getSchoolSettings` maps columns correctly | DB row has `school_name` | Returned object has `schoolName` |
| `saveSchoolSettings` upserts with `id: 1` | Called with settings object | Upsert payload always has `id: 1` |

---

### 1.3 Components

**Framework:** React Testing Library

#### `EventCard` — `src/__tests__/unit/components/EventCard.test.tsx`

| Test | Scenario | Expected |
|------|----------|---------|
| Renders event title | Event with title `"Spring Fair"` | `"Spring Fair"` visible on screen |
| Renders formatted date | Event date `"2026-06-15"` | `"June 15, 2026"` visible |
| Renders formatted time | Event time `"09:00"` | `"9:00 AM"` visible |
| Renders location | Event location `"School Gym"` | `"School Gym"` visible |
| Renders description | Event with description text | Description text visible |
| Missing time shows gracefully | Event with `time: ""` | Does not crash |

#### `AnnouncementCard` — `src/__tests__/unit/components/AnnouncementCard.test.tsx`

| Test | Scenario | Expected |
|------|----------|---------|
| Renders title and content | Normal announcement | Both title and content visible |
| Urgent priority shows visual indicator | `priority: "urgent"` | Element with urgency indicator rendered (e.g., badge, color class) |
| Normal priority has no urgency indicator | `priority: "normal"` | No urgent badge |
| Expired announcement still renders | `expiresAt` in the past | Component does not crash |
| `expiresAt: null` renders without expiry info | `expiresAt: null` | No expiry text shown |

#### `MinutesCard` — `src/__tests__/unit/components/MinutesCard.test.tsx`

| Test | Scenario | Expected |
|------|----------|---------|
| Renders title and formatted date | Minutes record | Title and `"February 22, 2026"` visible |
| Shows download link when `fileUrl` present | Minutes with `fileUrl` set | Link element with `href` matching `fileUrl` |
| Hides download link when no `fileUrl` | Minutes with `fileUrl: undefined` | No download link rendered |
| Links to detail page | Minutes with `id: "xyz"` | Anchor href includes `/minutes/xyz` |

#### `SubscribeForm` — `src/__tests__/unit/components/SubscribeForm.test.tsx`

| Test | Scenario | Expected |
|------|----------|---------|
| Renders email input and submit button | Initial render | Input and button present |
| Disables submit with empty input | No email entered | Button disabled or form not submitted |
| Calls POST `/api/subscribe` on submit | Valid email entered and submitted | `fetch` called with correct URL and body |
| Shows success message on 200 response | API returns `{ success: true }` | Success message visible |
| Shows error message on 400 response | API returns 400 | Error message visible |
| Clears input after successful submit | Submit succeeds | Email input cleared |

---

## 2. Integration Tests

Integration tests run against the **CI Supabase database** (`kanakapac-ci`) which is seeded before each test run. They call the actual Next.js API route handlers, testing the full request/response cycle including auth middleware.

### Setup

```ts
// jest.integration.setup.ts
// Seed CI DB before all tests
// Each test suite can use beforeEach to reset affected tables
```

Environment variables required:
```
NEXT_PUBLIC_SUPABASE_URL=<ci-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<ci-service-role-key>
DATABASE_URL=<ci-database-url>
ADMIN_PASSWORD=ci-test-password
NEXTAUTH_SECRET=ci-secret
```

### Auth helper for integration tests
```ts
// Helper to get a valid session cookie for authenticated requests
async function getAdminCookie(): Promise<string> {
  // POST /api/auth/callback/credentials with ci-test-password
  // Return Set-Cookie header value
}
```

---

### 2.1 `/api/events`

**File:** `src/__tests__/integration/api/events.test.ts`

#### GET `/api/events`
| Test | Scenario | Expected |
|------|----------|---------|
| Returns event list | Seeded DB has 2 events | 200, array of 2 events with `camelCase` fields |
| Returns empty array when no events | Table is empty | 200, `[]` |
| Events ordered by date ascending | DB has mixed dates | Response array dates are sorted ascending |

#### POST `/api/events`
| Test | Scenario | Expected |
|------|----------|---------|
| Creates event when authenticated | Valid body + admin cookie | 201, returned object has an `id` |
| Rejects unauthenticated request | No session cookie | 401, `{ error: "Unauthorized" }` |
| Created event persists in DB | POST then GET | GET returns the newly created event |
| Auto-generates `id` if not provided | Body without `id` field | Response has a UUID `id` |

#### PUT `/api/events`
| Test | Scenario | Expected |
|------|----------|---------|
| Updates existing event | Authenticated, valid body with existing `id` | 200, response matches updated body |
| Rejects unauthenticated request | No session cookie | 401 |

#### DELETE `/api/events?id=...`
| Test | Scenario | Expected |
|------|----------|---------|
| Deletes event by id | Authenticated, existing id | 200, `{ success: true }` |
| Returns 400 if id missing | No `id` query param | 400, `{ error: "ID required" }` |
| Rejects unauthenticated request | No session cookie | 401 |
| Deleted event no longer in GET | DELETE then GET | Event absent from list |

---

### 2.2 `/api/minutes`

**File:** `src/__tests__/integration/api/minutes.test.ts`

| Test | Scenario | Expected |
|------|----------|---------|
| GET returns minutes ordered newest-first | Seeded DB | Dates in descending order |
| POST creates minutes record | Authenticated, body with title/date/content | 201, persisted record returned |
| POST with `fileUrl` stores URL | Body includes `fileUrl` | Returned record has `fileUrl` |
| PUT updates minutes content | Authenticated, existing record | 200, content updated |
| DELETE removes record | Authenticated, existing id | 200, record gone from GET |
| Unauthenticated POST/PUT/DELETE returns 401 | All three verbs without auth | 401 each |

---

### 2.3 `/api/announcements`

**File:** `src/__tests__/integration/api/announcements.test.ts`

| Test | Scenario | Expected |
|------|----------|---------|
| GET returns all announcements (admin) | Authenticated | 200, all records including expired |
| POST creates normal priority | `priority: "normal"` | 201, `priority` stored correctly |
| POST creates urgent priority | `priority: "urgent"` | 201, `priority: "urgent"` |
| PUT updates priority from normal to urgent | Update existing | 200, priority changed |
| POST with `expiresAt` null stored correctly | `expiresAt: null` in body | Returned record has `expiresAt: null` |
| DELETE removes announcement | Authenticated | 200, record gone |

---

### 2.4 `/api/subscribe`

**File:** `src/__tests__/integration/api/subscribe.test.ts`

#### POST (public endpoint)
| Test | Scenario | Expected |
|------|----------|---------|
| Subscribes valid email without auth | Valid email, no cookie | 200, `{ success: true }` |
| Rejects missing email | Empty body | 400, `{ error: "Valid email is required" }` |
| Rejects invalid email (no `@`) | `"notanemail"` | 400 |
| Duplicate email is idempotent | POST same email twice | Second POST returns 200, no 500 error |

#### GET (admin endpoint)
| Test | Scenario | Expected |
|------|----------|---------|
| Returns subscriber list with auth | Admin cookie | 200, array of subscribers |
| Rejects unauthenticated GET | No cookie | 401 |

#### DELETE (admin endpoint)
| Test | Scenario | Expected |
|------|----------|---------|
| Removes subscriber by email | Admin cookie + `?email=...` | 200 |
| Returns 400 if email missing | No query param | 400 |
| Rejects unauthenticated DELETE | No cookie | 401 |

---

### 2.5 `/api/settings`

**File:** `src/__tests__/integration/api/settings.test.ts`

| Test | Scenario | Expected |
|------|----------|---------|
| GET returns current settings (public) | No auth required | 200, `schoolName` and `pacName` present |
| PUT updates settings | Authenticated | 200, subsequent GET reflects changes |
| PUT rejects unauthenticated | No cookie | 401 |
| Settings always returns singleton | Multiple GETs | Always returns same single object |

---

### 2.6 `/api/upload`

**File:** `src/__tests__/integration/api/upload.test.ts`

| Test | Scenario | Expected |
|------|----------|---------|
| Rejects unauthenticated upload | No cookie, multipart body | 401 |
| Returns 400 if no file in body | Authenticated, empty form | 400 |
| Uploads PDF and returns public URL | Authenticated, valid PDF file | 200, response contains a URL string |
| Rejects files over size limit | Authenticated, file > 10 MB | 400 or 413 |

---

### 2.7 Auth Middleware (`src/middleware.ts`)

**File:** `src/__tests__/integration/api/auth-middleware.test.ts`

| Test | Route | Scenario | Expected |
|------|-------|----------|---------|
| Admin dashboard protected | `/admin/dashboard` | No session | Redirect to `/admin` |
| Admin events protected | `/admin/events` | No session | Redirect to `/admin` |
| Admin minutes protected | `/admin/minutes` | No session | Redirect to `/admin` |
| Admin announcements protected | `/admin/announcements` | No session | Redirect to `/admin` |
| Authenticated user passes through | `/admin/dashboard` | Valid session | 200, page content returned |
| Public pages not protected | `/events`, `/about` | No session | 200 |

---

## 3. End-to-End Tests

E2E tests run against a **live dev server** pointing at the CI Supabase database. Playwright launches a real Chromium browser.

### playwright.config.ts settings
```ts
{
  baseURL: 'http://localhost:3000',
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  }
}
```

### Auth helper (shared fixture)
```ts
// src/e2e/fixtures/auth.ts
// Logs in via the /admin form and stores session storage
// Reused across all admin specs
```

---

### 3.1 Public — Home Page

**File:** `src/e2e/public/home.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Page loads successfully | Visit `/` | Status 200, no console errors |
| PAC name visible in header | Visit `/` | School/PAC name from settings renders |
| Upcoming events section shown | Events exist in CI DB | At least one event card visible |
| Announcements section shown | Announcements exist in CI DB | At least one announcement visible |
| Navigation links present | Visit `/` | Links to Events, Minutes, About, Contact visible |
| Footer renders contact info | Visit `/` | Email address from settings visible |

---

### 3.2 Public — Events Page

**File:** `src/e2e/public/events.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Events page loads | Visit `/events` | Page title visible |
| Upcoming events displayed | CI DB has future events | Event cards with dates >= today |
| Past events section shown | CI DB has past events | Past events listed separately |
| Event date is human-readable | Any event card | Date shows `"February 22, 2026"` format, not `"2026-02-22"` |
| Event time is 12-hour format | Event card with time | Time shows `"7:00 PM"` format |
| Empty state message shown | No upcoming events | Graceful "no upcoming events" message |

---

### 3.3 Public — Minutes Page & Detail

**File:** `src/e2e/public/minutes.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Minutes list page loads | Visit `/minutes` | Page renders, at least one card |
| Clicking a minutes item navigates | Click a minutes card | Navigates to `/minutes/[id]` |
| Detail page shows content | Visit `/minutes/[id]` with content | Markdown content rendered |
| Download link visible when file attached | Minutes with `fileUrl` | Download link present and has correct `href` |
| Back navigation works | Click back from detail | Returns to `/minutes` |

---

### 3.4 Public — Announcements Page

**File:** `src/e2e/public/announcements.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Announcements page loads | Visit `/announcements` | Page renders |
| Urgent announcements visually distinct | CI DB has urgent announcement | Visual distinction present (badge/color) |
| Normal announcements rendered | CI DB has normal announcement | Renders without urgent styling |
| Expired announcements not shown on public page | CI DB has expired announcement | Expired item not visible |

---

### 3.5 Public — Subscribe Flow

**File:** `src/e2e/public/subscribe.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Subscribe form visible on home page | Visit `/` | Email input and button present |
| Successful subscription | Enter valid email, click subscribe | Success message appears |
| Invalid email shows error | Enter `"notanemail"`, submit | Error message appears |
| Empty email shows error | Click submit with empty input | Error or button is disabled |

---

### 3.6 Admin — Login Flow

**File:** `src/e2e/admin/login.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Login page renders | Visit `/admin` | Password input and login button present |
| Correct password grants access | Enter `CI_ADMIN_PASSWORD`, submit | Redirected to `/admin/dashboard` |
| Wrong password shows error | Enter wrong password, submit | Error message, stays on `/admin` |
| Unauthenticated dashboard redirect | Visit `/admin/dashboard` directly | Redirected to `/admin` |
| Session persists across page refresh | Login, refresh dashboard | Still on dashboard, not redirected |
| Logout clears session | Click logout (if visible) | Redirected to `/admin` login |

---

### 3.7 Admin — Events Management

**File:** `src/e2e/admin/events.spec.ts`

Uses the auth fixture. Each test starts authenticated.

| Test | Action | Expected |
|------|--------|---------|
| Events list renders in admin | Visit `/admin/events` | Table/list of events visible |
| Create new event | Fill form (title, date, location, description), submit | New event appears in list |
| Created event appears on public page | Create event, visit `/events` | Event visible on public events page |
| Edit existing event | Click edit, change title, save | Updated title shown in list |
| Delete event | Click delete, confirm | Event removed from list |
| Deleted event gone from public page | Delete event, visit `/events` | Event not visible publicly |
| Form validation — required fields | Submit empty form | Error shown, form not submitted |

---

### 3.8 Admin — Minutes Management

**File:** `src/e2e/admin/minutes.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Minutes list renders in admin | Visit `/admin/minutes` | List of minutes records |
| Create minutes with text content | Fill title, date, content, submit | New entry in list |
| Edit minutes content | Click edit, change content, save | Updated content visible in detail page |
| Upload PDF file | Attach PDF in upload field, submit | Record shows download link |
| Delete minutes | Click delete, confirm | Record removed |

---

### 3.9 Admin — Announcements Management

**File:** `src/e2e/admin/announcements.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Create normal announcement | Fill form, select "Normal", submit | Appears in list without urgent badge |
| Create urgent announcement | Fill form, select "Urgent", submit | Appears in list with urgent indicator |
| Create announcement with expiry | Set `expiresAt` date, submit | Expiry date stored |
| Expired announcement hidden on public page | Set past expiry date, visit `/announcements` | Not visible publicly |
| Delete announcement | Click delete | Removed from list and public page |

---

### 3.10 Admin — Settings Management

**File:** `src/e2e/admin/settings.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Settings page loads with current values | Visit `/admin/settings` | Form pre-filled with existing settings |
| Update school name | Change `schoolName`, save | Header on all public pages reflects new name |
| Update PAC email | Change `email`, save | Footer on public pages reflects new email |
| Settings form validation | Clear required field, save | Validation error shown |

---

### 3.11 Admin — Subscribers Management

**File:** `src/e2e/admin/subscribers.spec.ts`

| Test | Action | Expected |
|------|--------|---------|
| Subscriber list visible | Subscribe a test email, visit `/admin/subscribers` | Email appears in list |
| Delete subscriber | Click delete next to email | Email removed from list |
| List shows subscription date | Subscriber in list | Formatted date visible |

---

## 4. Test Data (CI Seed)

The `supabase/seed.sql` run against the CI database should include:

```sql
-- Minimum required seed for tests
INSERT INTO events VALUES
  ('evt-upcoming', 'Spring Fair', '2099-06-15', '10:00', 'School Gym', 'Annual fair', NOW()),
  ('evt-past',     'Fall BBQ',   '2020-09-01', '17:00', 'Field',      'Past event', NOW());

INSERT INTO announcements VALUES
  ('ann-normal', 'Welcome Back', 'School starts Sept 5', 'normal', NOW(), NULL),
  ('ann-urgent', 'School Closure', 'Closed tomorrow', 'urgent', NOW(), NULL),
  ('ann-expired', 'Old News', 'This expired', 'normal', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day');

INSERT INTO minutes VALUES
  ('min-1', 'February 2026 Meeting', '2026-02-05', '## Agenda\n- Budget review', NULL, NOW()),
  ('min-with-file', 'January 2026 Meeting', '2026-01-08', NULL, 'https://example.com/jan.pdf', NOW());

INSERT INTO settings VALUES
  (1, 'Kanaka Elementary', 'Kanaka PAC', '123 School Rd', 'Maple Ridge, BC',
   'pac@kanakaelementary.ca', NULL, 'First Wednesday, 7:00 PM')
  ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    pac_name = EXCLUDED.pac_name;
```

---

## 5. CI Integration

Add to `.github/workflows/ci.yml` after the DB seed step:

```yaml
- name: Run unit tests
  run: npx jest --testPathPattern="unit" --ci --coverage

- name: Run integration tests
  run: npx jest --testPathPattern="integration" --ci
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.CI_SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.CI_SUPABASE_SERVICE_ROLE_KEY }}
    DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
    NEXTAUTH_SECRET: ci-secret
    ADMIN_PASSWORD: ci-test-password

- name: Run E2E tests
  run: npx playwright test
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.CI_SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.CI_SUPABASE_SERVICE_ROLE_KEY }}
    ADMIN_PASSWORD: ci-test-password

- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

---

## 6. Coverage Targets

| Layer | Target | Notes |
|-------|--------|-------|
| Unit — `src/lib/format.ts` | 100% | Pure functions, fully testable |
| Unit — `src/lib/data.ts` | ≥ 80% | All happy paths + error branches |
| Unit — Components | ≥ 70% | Key rendering paths and interactions |
| Integration — API routes | ≥ 85% | All HTTP verbs, auth checks |
| E2E — Critical paths | 100% | Login, CRUD for events, subscribe flow |

---

## 7. Implementation Order

1. Install dependencies and configure Jest + Playwright.
2. Write unit tests for `format.ts` (fastest feedback, no mocks needed).
3. Write unit tests for `data.ts` with mocked Supabase.
4. Write component unit tests.
5. Configure CI Supabase + seed data for integration tests.
6. Write integration tests for API routes (start with `/api/events`).
7. Write E2E auth fixture and admin login spec.
8. Write remaining E2E specs (public flows, then admin CRUD flows).
9. Wire all test runs into the GitHub Actions CI workflow.
