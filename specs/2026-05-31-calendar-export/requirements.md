# Calendar Export — Requirements

## Goal

Parents can add any PAC event directly to their personal calendar app with one click. No account required. Download a `.ics` file from the event detail page.

## Scope decisions

| Decision | Choice | Rationale |
|---|---|---|
| Export format | `.ics` (iCalendar RFC 5545) | Universal — works with Apple Calendar, Google Calendar (import), Outlook, and any iCal-compatible app |
| Delivery | File download (browser) | Simple, no server state, no subscription management |
| Targets | `.ics` download only | Covers all platforms; Google Calendar and Outlook web links are out of scope for this phase |
| Feed / webcal URL | Out of scope | Phase 1 covers individual events; a persistent feed can be added later |
| Auth | None — fully public | No login required; any visitor can download |

## What success looks like (from mission.md)

A parent on the event detail page can download a `.ics` file and have the event in their personal calendar in under 30 seconds.

## User story

> As a parent viewing a PAC event, I want to download a calendar file so I can add the event to my phone or computer calendar without manually typing in the details.

## In scope

- "Add to Calendar" button (or link) on every public event detail page (`/events/[id]`)
- `GET /api/events/[id]/ics` route that returns a valid `.ics` file
- `.ics` file includes: event title, date + time, location, description, organizer (PAC name from settings), and a UID based on the event ID
- Button is visible without login

## Out of scope

- Google Calendar / Outlook direct-link buttons
- Webcal feed URL or iCal subscription
- Admin preview of the generated `.ics`
- Bulk "export all events" download

## Context

- Events live in Supabase `events` table; accessed via `src/lib/data.ts`
- PAC name and contact info available in `settings` table (singleton row)
- Tech stack: Next.js 14 App Router, TypeScript, Tailwind CSS (see `specs/tech-stack.md`)
- No new dependencies needed — `.ics` generation is straightforward string construction for this simple use case
