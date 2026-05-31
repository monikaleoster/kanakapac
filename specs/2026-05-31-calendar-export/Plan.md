# Calendar Export — Plan

## Task Group 1 — API route

1. Create `src/app/api/events/[id]/ics/route.ts`
   - `GET` handler: fetch event by ID from Supabase via `getEventById()` in `src/lib/data.ts`
   - Return 404 if event not found
   - Fetch PAC name from settings via `getSettings()` for the organizer field
   - Build `.ics` string (see format notes below)
   - Return `Response` with `Content-Type: text/calendar; charset=utf-8` and `Content-Disposition: attachment; filename="<slug>.ics"`

**ICS format (RFC 5545 minimum viable):**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kanaka PAC//kanakapac.com//EN
BEGIN:VEVENT
UID:<event-id>@kanakapac.com
DTSTAMP:<now in UTC, YYYYMMDDTHHmmssZ>
DTSTART:<event date+time in local format or DATE if no time>
SUMMARY:<title>
LOCATION:<location>
DESCRIPTION:<description — newlines escaped as \n>
ORGANIZER;CN=<PAC name>:mailto:<contact email from settings>
END:VEVENT
END:VCALENDAR
```

## Task Group 2 — UI button

2. Add "Add to Calendar" button to `src/app/events/[id]/page.tsx`
   - Render as an `<a>` tag pointing to `/api/events/[id]/ics`
   - Add `download` attribute so the browser triggers a file save
   - Style with Tailwind to match existing page action buttons

## Task Group 3 — Data access (if needed)

3. Confirm `getEventById(id)` exists in `src/lib/data.ts`; add it if missing
4. Confirm `getSettings()` exists and returns PAC name + contact email; add if missing

## Task Group 4 — Testing & QA

5. Manual: download `.ics` from a local event and import into Apple Calendar, Google Calendar (import flow), and verify fields appear correctly
6. Manual: verify 404 is returned for a non-existent event ID
7. Verify button is visible on the public event detail page without login
