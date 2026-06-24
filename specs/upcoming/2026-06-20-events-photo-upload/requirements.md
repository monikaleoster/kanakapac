# Requirements: Event Photo Upload

## Summary

Admins can upload a single hero/banner photo when creating or editing an upcoming event. The photo is stored in Supabase Storage and its public URL is persisted on the event record. The photo renders in three places on the public site: the event detail page, the event listing cards, and the homepage (where events are surfaced).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Storage backend | Supabase Storage (`events` bucket) | Already used for minutes uploads; keeps infra consolidated |
| Photos per event | One (hero/banner) | Keeps the data model simple; sufficient for flyer-style promotion |
| Scope | Upcoming events only | Photo serves as promotional material before the event |
| Display surfaces | Detail page, listing cards, homepage | Confirmed by user |

## Out of Scope

- Gallery / multiple photos per event
- Photos on past events
- Photo cropping or resizing server-side
- Alt-text management (use event title as alt)
- Photo deletion without deleting the event

## Data Model Change

Add optional `photoUrl` field to the `Event` type:

```ts
photoUrl?: string;   // public Supabase Storage URL
```

`events.json` records without this field are unaffected (photo renders nothing).

## Affected Files

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `photoUrl?: string` to `Event` |
| `src/app/api/upload/route.ts` | Accept `bucket` query param (`events` | `minutes`) |
| `src/app/api/events/route.ts` | Pass `photoUrl` through on POST and PUT |
| `src/app/admin/events/page.tsx` | Add photo upload field to create/edit form |
| `src/components/EventCard.tsx` | Render photo thumbnail when present |
| `src/app/events/[id]/page.tsx` | Render hero image when present |
| `src/app/page.tsx` | Render event photo on homepage (if events are displayed there) |

## Supabase Setup Required

A public `events` bucket must exist in Supabase Storage before this feature is deployed. The existing `minutes` bucket pattern can be followed exactly.

## Constraints

- Accepted image types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- Max file size: not enforced server-side (browser `<input>` is sufficient for now)
- Photo is optional — events without a photo render normally
- Auth check on upload: admin session must be valid (same as other mutations)