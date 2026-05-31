# Calendar Export — Validation

## Definition of done

The feature is mergeable when all checks below pass.

---

## Automated checks

- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run lint` passes with no new warnings

---

## Manual verification

### 1. API route — happy path
- Navigate to `/api/events/<valid-id>/ics` in the browser (or use `curl`)
- Expected: browser downloads a file named `<event-slug>.ics`
- Expected: `Content-Type` header is `text/calendar`

### 2. ICS file content
- Open the downloaded `.ics` in a text editor
- Verify the file contains:
  - `BEGIN:VCALENDAR` / `END:VCALENDAR`
  - `SUMMARY:` matches the event title exactly
  - `DTSTART:` matches the event date and time
  - `LOCATION:` matches the event location
  - `DESCRIPTION:` contains the event description (newlines as `\n`)
  - `UID:` is present and unique to the event
  - `ORGANIZER` or `PRODID` reflects the PAC name

### 3. Calendar import — Apple Calendar
- Double-click the `.ics` file on macOS
- Expected: Apple Calendar opens an "Add event" dialog with correct title, date/time, and location pre-filled

### 4. Calendar import — Google Calendar
- In Google Calendar, go to Settings → Import & export → Import
- Upload the `.ics` file
- Expected: event appears with correct title, date/time, and location

### 5. API route — 404
- Navigate to `/api/events/nonexistent-id/ics`
- Expected: HTTP 404 response, no file download

### 6. UI button visibility
- Visit `/events/<valid-id>` as a logged-out user
- Expected: "Add to Calendar" button/link is visible on the page
- Click it — expected: `.ics` file downloads without redirect to login

### 7. Event with no time set
- If an event has no time (time field is null/empty), the `.ics` should use a `DATE` value (`DTSTART;VALUE=DATE:YYYYMMDD`) rather than a `DATETIME` value
- Import into a calendar app and confirm it appears as an all-day event

---

## Edge cases confirmed

- [ ] Event description contains special characters (commas, semicolons, backslashes) — verify they are escaped correctly per RFC 5545
- [ ] Event title is long (>75 chars) — verify line folding or that the file still imports correctly
- [ ] Settings organizer email is empty — route should still return a valid `.ics` (omit `ORGANIZER` line rather than rendering a broken value)
