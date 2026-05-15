# Kanaka PAC — Workflow Specifications

> This file documents every user-facing workflow on the Kanaka PAC website, covering both public and admin journeys. Each workflow includes the happy path and all known edge cases derived from the codebase.
>
> **Naming convention:** `WF-PUB-XX` = public workflow, `WF-ADM-XX` = admin workflow.

---

## Public Workflows

---

### WF-PUB-01: Browse Homepage

**Actor:** Any visitor
**URL:** `https://kanakapac.vercel.app/`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `https://kanakapac.vercel.app/`.
2. Hero section displays with "Welcome to Kanaka PAC" heading and two CTA buttons: "View Upcoming Events" → `/events`, "Learn About PAC" → `/about`.
3. If any announcements with `priority = "urgent"` and no expiry (or future expiry) exist, a red urgent banner is displayed at the top.
4. Up to 3 upcoming events (date ≥ today) are shown in an "Upcoming Events" section.
5. Up to 3 active announcements (non-expired) are shown in a "Recent Announcements" section.

**Edge Cases:**
- No upcoming events → "No upcoming events scheduled" message shown in place of event cards.
- No active announcements → announcements section shows empty state.
- Multiple urgent announcements → all are shown in the banner.
- Expired urgent announcement → does NOT appear in banner (filtered by `getActiveAnnouncements()`).
- More than 3 upcoming events → only first 3 shown; user must visit `/events` to see all.
- Page always fetches fresh data (`force-dynamic`); no stale caching.

---

### WF-PUB-02: Browse Events Page

**Actor:** Any visitor
**URL:** `/events`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `/events`.
2. "Upcoming Events" section lists all events with date ≥ today, sorted ascending (soonest first).
3. Each event card shows: title, formatted date (e.g. "March 15, 2026"), formatted time (e.g. "11:30 AM"), location, and description.
4. "Past Events" section lists events with date < today, sorted descending (most recent first), displayed at 75% opacity.
5. Subscribe form is shown at the bottom of the page.

**Edge Cases:**
- No events at all → both sections show empty state messages.
- All events are in the future → past events section is hidden.
- All events are in the past → upcoming section shows empty state.
- Malformed date string in DB → date formatting may display "Invalid Date".
- Time stored as 24hr string (e.g. "19:00") → displayed as 12hr (e.g. "7:00 PM").

---

### WF-PUB-03: Browse Announcements Page

**Actor:** Any visitor
**URL:** `/announcements`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `/announcements`.
2. All announcements are listed (including expired ones), sorted by `publishedAt` descending.
3. Urgent announcements display with red background, red border, and "Urgent" badge.
4. Normal announcements display with white background and gray border.
5. Each card shows: title, published timestamp, and content.
6. Subscribe form shown at the bottom.

**Edge Cases:**
- No announcements → empty state message shown.
- Expired announcements still appear here (this page shows ALL, unlike the homepage which shows only active).
- Announcement with `expiresAt = null` → never expires; always shown.
- Announcement with past `expiresAt` → still shown on this page but excluded from homepage.

---

### WF-PUB-04: Browse Meeting Minutes Archive

**Actor:** Any visitor
**URL:** `/minutes`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `/minutes`.
2. All meeting minutes are listed as cards, sorted by date descending (most recent first).
3. Each card shows title and formatted date.
4. If `fileUrl` exists on a minutes record → "Download Minutes" button shown linking to the file.
5. If no `fileUrl` → first 150 characters of content shown as preview (markdown stripped).
6. Clicking a card navigates to `/minutes/[id]`.
7. Subscribe form shown at the bottom.

**Edge Cases:**
- No minutes records → empty state message shown.
- Content preview strips `#`, `*`, and newline characters via regex.
- Minutes with both `fileUrl` and `content` → only download button shown (content preview hidden).
- Minutes with neither `fileUrl` nor `content` → empty preview shown.
- Malformed date → may display "Invalid Date".

---

### WF-PUB-05: Read Meeting Minutes Detail

**Actor:** Any visitor
**URL:** `/minutes/[id]`
**Preconditions:** Valid minutes ID exists in the database

**Happy Path:**
1. Visitor clicks a minutes card or navigates directly to `/minutes/[id]`.
2. Page shows: back link to `/minutes`, meeting title, formatted date, and full rendered content.
3. Markdown in `content` is rendered:
   - `# Heading` → styled `<h1>`
   - `## Heading` → styled `<h2>`
   - `### Heading` → styled `<h3>`
   - `- item` → bullet list item
   - Double newlines → paragraph breaks (`<br/><br/>`)

**Edge Cases:**
- Invalid or non-existent ID → `notFound()` called → Next.js 404 page shown.
- Minutes has `fileUrl` but no `content` → content area is empty; download is available via the archive card (not shown on detail page).
- Markdown rendered via `dangerouslySetInnerHTML`; content is admin-controlled, not user-supplied.

---

### WF-PUB-06: Browse About Page

**Actor:** Any visitor
**URL:** `/about`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `/about`.
2. Static "Our Mission" and "What We Do" sections are shown (4 areas: Fundraising, Advocacy, Community Building, Volunteer Coordination).
3. "Executive Team (2025–2026)" section shows team members in a 2-column grid, sorted by `order` ascending.
4. Each team member shows: name, role, bio, and email link (if email is set).
5. "How to Get Involved" section lists 5 participation options.

**Edge Cases:**
- No team members in DB → "Executive team information coming soon." fallback shown.
- Team member with empty email → email link not rendered.
- Team member with `order` gaps (e.g. after a deletion) → remaining members still sorted correctly.

---

### WF-PUB-07: Browse Policies Page

**Actor:** Any visitor
**URL:** `/policies`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `/policies`.
2. Dynamic policies from the database are listed at the top, each with: title, description, and "Download" button linking to `fileUrl` (opens in new tab).
3. Static fallback policy sections are shown below: Constitution & Bylaws, Code of Conduct, Volunteer Policy, Privacy Policy.

**Edge Cases:**
- No dynamic policies in DB → only static sections shown (static content always renders).
- `fileUrl` is a Supabase Storage public URL; if file was deleted from Storage the link is broken (404 on click).

---

### WF-PUB-08: View Contact Page

**Actor:** Any visitor
**URL:** `/contact`
**Preconditions:** None

**Happy Path:**
1. Visitor navigates to `/contact`.
2. Left column shows contact information sourced from settings: email address, address + city, meeting times, and a note about executive email forwarding.
3. Right column shows a contact form with fields: Name, Email, Subject, Message.

**Edge Cases:**
- Contact form submit button does nothing (no submit handler wired up); form is display-only.
- If settings have not been saved → fallback default values shown (school name, default email, etc.).
- Email in contact info is a `mailto:` link; clicking opens the user's default email client.

---

### WF-PUB-09: Subscribe to Newsletter

**Actor:** Any visitor
**URL:** Any page with `SubscribeForm` (Homepage, `/events`, `/announcements`, `/minutes`)
**Preconditions:** None

**Happy Path:**
1. Visitor enters a valid email address in the subscribe form.
2. Clicks "Subscribe".
3. POST request sent to `/api/subscribe` with `{ email }`.
4. On success: green success message "You are now subscribed to updates!" shown; email input cleared.

**Edge Cases:**
- Email with no `@` character → HTML5 `type="email"` validation blocks submission.
- Empty email field → browser blocks submission.
- Duplicate email → API receives it, Supabase ignores the duplicate (UNIQUE constraint, error code `23505` silently swallowed); user sees success message anyway.
- Server/DB error → error message shown from API response or catch block.
- Form shows "Subscribing…" and disables the button during the request.

---

### WF-PUB-10: Unsubscribe via Email Link

**Actor:** Email subscriber
**URL:** `/api/unsubscribe?token={base64url-encoded-email}`
**Preconditions:** Subscriber received an email containing a personalized unsubscribe link (feature in implementation plan)

**Happy Path:**
1. Subscriber clicks unsubscribe link in email.
2. GET request hits `/api/unsubscribe?token={token}`.
3. Token decoded from base64url → email string extracted.
4. `deleteSubscriber(email)` called.
5. HTML confirmation page returned: "Unsubscribed Successfully" with link back to homepage.

**Edge Cases:**
- Missing `token` query param → `400 Bad Request` JSON error.
- Token decodes to a string without `@` → `400 Bad Request`.
- Email not found in DB → `deleteSubscriber` runs with no match; no error thrown; confirmation page still shown.
- Malformed base64url → Buffer decode may throw → `500 Internal Server Error`.
- Unsubscribed user can re-subscribe immediately via the subscribe form.

---

### WF-PUB-11: Navigate Site — Desktop

**Actor:** Any visitor
**Preconditions:** Viewport width ≥ md (768px)

**Happy Path:**
1. Horizontal navigation bar visible in header.
2. Links: Home, Events, Minutes, Announcements, Policies, About, Contact, Admin.
3. Current page link highlighted with `bg-primary-900` styling.

**Edge Cases:**
- All nav links are always shown regardless of content existence.
- "Admin" link is always visible; clicking navigates to `/admin` (login or dashboard).

---

### WF-PUB-12: Navigate Site — Mobile

**Actor:** Any visitor
**Preconditions:** Viewport width < md (768px)

**Happy Path:**
1. Hamburger button visible in header (desktop nav hidden).
2. Tap hamburger → mobile menu slides open with all nav links stacked vertically.
3. Tap any link → navigation occurs AND menu closes automatically.

**Edge Cases:**
- Menu does not close on outside tap (only link click or hamburger toggle closes it).
- Current page still highlighted in mobile menu.

---

### WF-PUB-13: FloatingPromo Interaction

**Actor:** Any visitor
**Preconditions:** None

**Happy Path:**
1. Rocket icon button visible fixed at bottom-right of every page (z-50).
2. Button pulses with animation to draw attention.
3. Clicking button toggles a tooltip card above it showing "Built by Vector Local" and a "Book a Free Consultation" link to `https://www.vectorlocal.ca`.

**Edge Cases:**
- Clicking outside the tooltip does NOT close it — only the button toggles it.
- Tooltip link opens in a new tab.

---

## Admin Workflows

---

### WF-ADM-01: Admin Login

**Actor:** PAC administrator
**URL:** `/admin`
**Preconditions:** User is not authenticated

**Happy Path:**
1. Admin navigates to `/admin` or any protected `/admin/dashboard/*` route.
2. If not authenticated, middleware redirects to `/admin` (login page).
3. Admin enters the correct password.
4. NextAuth `signIn("credentials", { password })` called.
5. On success: redirected to `/admin/dashboard`.

**Edge Cases:**
- Wrong password → "Invalid password" error message shown below form.
- Empty password → form submission shows error (no HTML5 required on password field; error returned from NextAuth).
- Already authenticated → visiting `/admin` goes directly to dashboard (no login form shown).
- Session expires → next protected page load redirects back to `/admin`.
- Default password is `pac-admin-2026`; overridden by `ADMIN_PASSWORD` env var.

---

### WF-ADM-02: Admin Logout

**Actor:** Authenticated admin
**URL:** `/admin/dashboard`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin clicks "Sign Out" button on the dashboard.
2. NextAuth session is destroyed.
3. Admin is redirected to `/admin` (login page).

**Edge Cases:**
- Using browser back button after logout shows cached page; any data fetch or navigation to a protected route will re-redirect to login.

---

### WF-ADM-03: Manage Events — Create

**Actor:** Authenticated admin
**URL:** `/admin/events`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin clicks "+ New Event" button.
2. Form opens with fields: Title, Date, Time, Location, Description (all required).
3. Admin fills all fields and submits.
4. POST `/api/events` with `{ title, date, time, location, description }`.
5. API generates UUID and `createdAt` timestamp, saves to Supabase.
6. Event list refreshes showing the new event.

**Edge Cases:**
- Any required field left empty → HTML5 `required` validation blocks submission.
- Date in the past accepted (no future-date validation).
- Time stored as 24hr string (e.g. "19:00"); displayed as 12hr on public pages.
- Server/DB error → list does not refresh; no error feedback shown to admin.

---

### WF-ADM-04: Manage Events — Edit

**Actor:** Authenticated admin
**URL:** `/admin/events`
**Preconditions:** At least one event exists

**Happy Path:**
1. Admin clicks "Edit" on an existing event.
2. Form pre-fills with existing event data.
3. Admin modifies desired fields and submits.
4. PUT `/api/events` with full event object including `id`.
5. Event list refreshes with updated data.

**Edge Cases:**
- Clearing a required field → HTML5 blocks submission.
- Clicking Edit on one event then Edit on another → form state resets to the second event's data.
- Clicking Cancel (if implemented) resets form; otherwise navigating away loses unsaved changes.

---

### WF-ADM-05: Manage Events — Delete

**Actor:** Authenticated admin
**URL:** `/admin/events`
**Preconditions:** At least one event exists

**Happy Path:**
1. Admin clicks "Delete" on an event.
2. Confirmation modal appears asking to confirm deletion.
3. Admin confirms → DELETE `/api/events?id={id}`.
4. Event removed from list.

**Edge Cases:**
- Clicking Cancel in the modal → event is not deleted.
- Deleting the only event → list shows empty state.

---

### WF-ADM-06: Manage Minutes — Create (with file upload)

**Actor:** Authenticated admin
**URL:** `/admin/minutes`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin clicks "+ New Minutes" button.
2. Form opens with fields: Title (required), Meeting Date (required), File Upload (optional), Content/markdown (required).
3. Admin selects a file (PDF, DOC, DOCX, or TXT) → file immediately uploaded on `onChange` via POST `/api/upload`.
4. Upload returns `{ fileUrl }` → stored in form state; filename shown in UI.
5. Admin fills remaining fields and submits.
6. POST `/api/minutes` with `{ title, date, content, fileUrl }`.
7. Minutes list refreshes.

**Edge Cases:**
- Invalid file type (e.g. `.exe`, `.png`) → `/api/upload` returns `400 Bad Request`; error shown; `fileUrl` remains null.
- No file selected → minutes saved with `fileUrl = null`; public card shows content preview instead of download button.
- File upload fails (Supabase error) → `500` returned; `fileUrl` stays null; user must retry.
- Selecting a second file replaces the first `fileUrl` in form state (no limit on re-uploads).
- Content field required by form; no server-side validation on content.
- `/api/upload` has NO authentication — any user with the URL could upload files directly.

---

### WF-ADM-07: Manage Minutes — Edit

**Actor:** Authenticated admin
**URL:** `/admin/minutes`
**Preconditions:** At least one minutes record exists

**Happy Path:**
1. Admin clicks "Edit" on an existing minutes record.
2. Form pre-fills with title, date, content; existing file shown if `fileUrl` is set.
3. Admin may change text fields and/or re-upload a new file.
4. Submitting sends PUT `/api/minutes` with full minutes object.
5. List refreshes with updated data.

**Edge Cases:**
- Re-uploading a file sets a new `fileUrl`; old file remains in Supabase Storage (orphaned).
- Editing without re-uploading keeps the existing `fileUrl`.

---

### WF-ADM-08: Manage Minutes — Delete

**Actor:** Authenticated admin
**URL:** `/admin/minutes`
**Preconditions:** At least one minutes record exists

**Happy Path:**
1. Admin clicks "Delete" → confirmation modal → confirm.
2. DELETE `/api/minutes?id={id}`.
3. Record removed from list.

**Edge Cases:**
- The associated file in Supabase Storage is NOT deleted — only the DB record is removed. The file becomes an orphan.
- Deleting minutes that have no `fileUrl` → no storage impact.

---

### WF-ADM-09: Manage Announcements — Create

**Actor:** Authenticated admin
**URL:** `/admin/announcements`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin clicks "+ New Announcement".
2. Form fields: Title (required), Content (required), Priority dropdown (`normal` | `urgent`, required), Expires On (date, optional).
3. Admin fills form and submits.
4. If expires date provided → `expiresAt` set to `{date}T23:59:59` (end of day).
5. POST `/api/announcements` → `publishedAt` auto-set to current time; `priority` defaults to `"normal"` if omitted.
6. List refreshes with new announcement.

**Edge Cases:**
- No expiry date set → `expiresAt = null`; announcement never expires.
- Past expiry date accepted without warning → announcement is immediately "expired" and excluded from homepage.
- Urgent announcement → shown with red styling on public-facing pages and homepage banner.
- Server error → list does not refresh; no error UI shown.

---

### WF-ADM-10: Manage Announcements — Edit

**Actor:** Authenticated admin
**URL:** `/admin/announcements`
**Preconditions:** At least one announcement exists

**Happy Path:**
1. Admin clicks "Edit" → form pre-fills with existing data including expiry date (if set).
2. Admin modifies fields → submits → PUT `/api/announcements`.
3. List refreshes.

**Edge Cases:**
- Changing priority from `urgent` to `normal` → red styling removed immediately on public pages.
- Clearing expiry date and saving → `expiresAt` set to `null` (announcement becomes permanent).
- `publishedAt` is preserved on edit (not reset to now).

---

### WF-ADM-11: Manage Announcements — Delete

**Actor:** Authenticated admin
**URL:** `/admin/announcements`
**Preconditions:** At least one announcement exists

**Happy Path:**
1. Admin clicks "Delete" → confirmation modal → confirm.
2. DELETE `/api/announcements?id={id}`.
3. Announcement removed from list.

**Edge Cases:**
- Expired announcements remain visible in the admin list until explicitly deleted.
- Deleting an expired announcement removes it from both admin list and the public announcements page.
- Deleting an urgent announcement removes it from the homepage banner immediately.

---

### WF-ADM-12: Manage Policies — Create

**Actor:** Authenticated admin
**URL:** `/admin/policies`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin clicks "+ New Policy".
2. Form fields: Title (required), Description (required), File Upload (required for new policies).
3. Admin selects a file → immediately uploaded via POST `/api/upload` → `fileUrl` stored in form state.
4. Submit button is disabled until `fileUrl` is set.
5. Admin fills title and description → submits.
6. POST `/api/policies` → API validates all three fields; returns `400` if any missing.
7. List refreshes.

**Edge Cases:**
- Admin cannot submit the form without uploading a file (button disabled until `fileUrl` exists).
- Invalid file type → `400` from `/api/upload`; button remains disabled.
- Title or description missing → API returns `400 Bad Request`.
- File upload succeeds but admin closes form before submitting → file is orphaned in Supabase Storage.

---

### WF-ADM-13: Manage Policies — Edit

**Actor:** Authenticated admin
**URL:** `/admin/policies`
**Preconditions:** At least one policy exists

**Happy Path:**
1. Admin clicks "Edit" → form pre-fills with title, description, and existing `fileUrl`.
2. Admin may change title/description without re-uploading the file.
3. Admin may optionally upload a new file to replace the existing one.
4. Submit → PUT `/api/policies`.
5. API returns `404` if policy ID not found (race condition).
6. List refreshes.

**Edge Cases:**
- Editing without re-uploading keeps the existing `fileUrl`.
- Re-uploading orphans the old file in Supabase Storage.

---

### WF-ADM-14: Manage Policies — Delete

**Actor:** Authenticated admin
**URL:** `/admin/policies`
**Preconditions:** At least one policy exists

**Happy Path:**
1. Admin clicks "Delete" → confirmation modal → confirm.
2. DELETE `/api/policies?id={id}`.
3. Policy removed from list and public policies page.

**Edge Cases:**
- Associated file in Supabase Storage is NOT deleted — orphan remains.

---

### WF-ADM-15: Manage Team Members — Create

**Actor:** Authenticated admin
**URL:** `/admin/team`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin clicks "+ Add Member".
2. Form fields: Name (required), Role (required), Bio (required), Email (optional, email type), Display Order (optional number).
3. Admin fills form → submits.
4. POST `/api/team` → UUID auto-generated; `order` defaults to current member count + 1 if blank.
5. Member appears on public About page in sort order.

**Edge Cases:**
- Empty email → saved as empty string; email link not shown on About page.
- Duplicate `order` values possible if admin manually sets same number for two members — both are shown, sorted stably.
- No server-side validation on bio or name length.

---

### WF-ADM-16: Manage Team Members — Edit

**Actor:** Authenticated admin
**URL:** `/admin/team`
**Preconditions:** At least one team member exists

**Happy Path:**
1. Admin clicks "Edit" → form pre-fills.
2. Admin changes any field → submits → PUT `/api/team`.
3. API supports partial updates (only changed fields written).
4. Member list and public About page reflect changes.

**Edge Cases:**
- Clearing email field → empty string saved; email link removed from About page.
- Changing `order` manually may conflict with other members' orders.

---

### WF-ADM-17: Manage Team Members — Delete

**Actor:** Authenticated admin
**URL:** `/admin/team`
**Preconditions:** At least one team member exists

**Happy Path:**
1. Admin clicks "Delete" → confirmation modal → confirm.
2. DELETE `/api/team?id={id}`.
3. Member removed from list and About page.

**Edge Cases:**
- Deleting a middle member leaves a gap in order numbers (e.g. 1, 3, 4); remaining members still sort correctly.
- No auto-reorder of remaining members after deletion.

---

### WF-ADM-18: Manage Team Members — Reorder

**Actor:** Authenticated admin
**URL:** `/admin/team`
**Preconditions:** At least two team members exist

**Happy Path:**
1. Admin clicks Up (↑) or Down (↓) arrow next to a team member.
2. The member's `order` value is swapped with the adjacent member's `order` via two sequential PUT requests.
3. Member list re-fetches and re-sorts to reflect new order.
4. Public About page reflects new order.

**Edge Cases:**
- Top member has no Up button rendered.
- Bottom member has no Down button rendered.
- Rapid clicks may fire multiple simultaneous PUT requests before re-fetch completes → potential race condition causing incorrect order.
- If either PUT fails, list may be left in a partially-swapped state.

---

### WF-ADM-19: Manage Subscribers — View

**Actor:** Authenticated admin
**URL:** `/admin/subscribers`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin navigates to `/admin/subscribers`.
2. Page fetches GET `/api/subscribe` (requires auth).
3. Table displays all subscribers with: email and subscribed date, sorted by `subscribedAt` descending.
4. Subscriber count shown above the table.

**Edge Cases:**
- No subscribers → empty table shown.
- Session expired → GET `/api/subscribe` returns `401 Unauthorized`; table likely shows empty or throws error.
- Note: `/admin/subscribers` page is NOT protected by middleware (only API is auth-gated). The page HTML is accessible without login, but fetches will fail with `401`.

---

### WF-ADM-20: Manage Subscribers — Remove

**Actor:** Authenticated admin
**URL:** `/admin/subscribers`
**Preconditions:** At least one subscriber exists

**Happy Path:**
1. Admin clicks "Remove" next to a subscriber.
2. Confirmation modal shows subscriber email.
3. Admin confirms → DELETE `/api/subscribe?email={encodeURIComponent(email)}`.
4. Subscriber removed from list.

**Edge Cases:**
- Email with special characters (e.g. `+`) must be properly URL-encoded; handled via `encodeURIComponent`.
- Removed subscriber can immediately re-subscribe via the public subscribe form.
- Cancel in modal → subscriber not removed.

---

### WF-ADM-21: Manage Subscribers — Copy Emails

**Actor:** Authenticated admin
**URL:** `/admin/subscribers`
**Preconditions:** At least one subscriber exists

**Happy Path:**
1. Admin clicks "Copy All Emails".
2. All subscriber emails joined as comma-separated string and copied to clipboard.
3. Useful for manually pasting into a bulk email client.

**Edge Cases:**
- Clipboard API unavailable in some browsers (non-HTTPS, old browsers) → copy silently fails with no feedback.
- No subscribers → copies an empty string.

---

### WF-ADM-22: Manage Subscribers — Send Update

**Actor:** Authenticated admin
**URL:** `/admin/subscribers`
**Preconditions:** Admin is logged in

**Current Behavior (simulated):**
1. Admin clicks "Send Update".
2. Browser `alert()` displays "Email functionality coming soon".

**Planned Behavior (per `docs/resend-email-implementation-plan.md`):**
1. Admin clicks "Send Update" → email compose modal opens.
2. Admin fills subject and message body.
3. Submit → POST `/api/send-email` → Resend API sends email to each subscriber with personalized unsubscribe link.
4. Result shown: "Sent to X/Y subscribers".

**Edge Cases (planned):**
- No subscribers → API returns `400`; admin informed.
- Partial send failure → failed emails listed in response.
- Resend free tier limit: 100 emails/day.

---

### WF-ADM-23: Manage Settings — Update

**Actor:** Authenticated admin
**URL:** `/admin/settings`
**Preconditions:** Admin is logged in

**Happy Path:**
1. Admin navigates to `/admin/settings`.
2. Form pre-fills with current settings fetched from GET `/api/settings`.
3. Admin may change: School Name, PAC Name, Email Address, Address, City/Province, Meeting Time.
4. Admin may optionally upload a logo image (PNG, JPG only).
5. If logo uploaded → POST `/api/upload` first; returns `{ fileUrl }` → stored in form state.
6. Admin submits → POST `/api/settings` with full settings object.
7. Success message shown.
8. Header, footer, and contact page reflect changes on next page load (all pages use `force-dynamic`).

**Edge Cases:**
- No logo uploaded → existing `logoUrl` preserved if already set; if `logoUrl` is empty/null, header shows "P" initial fallback.
- Invalid image type (e.g. PDF) → `/api/upload` returns `400`; logo not updated.
- Clearing a text field (e.g. meeting time) and saving → empty string saved; contact page shows blank for that field.
- Settings API accepts arbitrary JSON with no validation; saving incomplete settings could break defaults.
- If Supabase is unavailable → GET falls back to hardcoded `defaultSettings` object; POST fails silently.
- Settings are a singleton (upserted at id=1); there is only ever one settings record.
