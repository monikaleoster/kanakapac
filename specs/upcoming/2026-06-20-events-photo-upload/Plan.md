# Plan: Event Photo Upload

## Group 1 — Supabase Setup (manual, pre-deploy)

1. Create a public `events` bucket in Supabase Storage dashboard.
   - Mirror the settings of the existing `minutes` bucket.
   - Confirm public read access is enabled so image URLs work without auth.

---

## Group 2 — Type & API Layer

2. **`src/lib/types.ts`** — Add `photoUrl?: string` to the `Event` interface.

3. **`src/app/api/upload/route.ts`** — Accept a `bucket` query param (`events` or `minutes`). Default to `minutes` so existing minute-upload flows are unaffected. Upload to the correct bucket based on the param.

4. **`src/app/api/events/route.ts`** — Ensure `photoUrl` is passed through on both `POST` (new event) and `PUT` (edit event). No new logic needed if the route already spreads `body`; verify and patch if not.

---

## Group 3 — Admin Form

5. **`src/app/admin/events/page.tsx`**
   - Add `photoUrl: string` to the form state (default `""`).
   - Add `photoFile: File | null` to local state for the pending upload.
   - Add a photo upload `<input type="file" accept="image/*">` field in the form UI, below the description field.
   - On file selection: upload immediately to `/api/upload?context=image&bucket=events`, store the returned `fileUrl` in `form.photoUrl`.
   - Show a small preview of the selected/existing photo when `form.photoUrl` is set.
   - On edit, pre-populate `form.photoUrl` from `event.photoUrl`.
   - Include `photoUrl` in the body of POST and PUT requests.

---

## Group 4 — Public Display

6. **`src/components/EventCard.tsx`** — When `event.photoUrl` is set, render it as a fixed-height thumbnail image above the card content (full card width, `object-cover`, roughly 160px tall). When absent, card renders as today.

7. **`src/app/events/[id]/page.tsx`** — When `event.photoUrl` is set, render it as a hero image at the top of the detail card (full width, `object-cover`, roughly 300px tall, `rounded-t-lg`). When absent, detail page renders as today.

8. **`src/app/page.tsx`** — Audit whether events are surfaced on the homepage. If so, ensure `photoUrl` is passed to whichever component renders them and renders similarly to `EventCard`.

---

## Group 5 — Validation

9. Manual verification per `Validation.md`.
10. Confirm no TypeScript errors (`npm run build`).