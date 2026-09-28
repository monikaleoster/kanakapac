# Validation: Event Photo Upload

## Automated Checks

- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with no new warnings

---

## Manual Verification

### Setup

- [ ] `events` bucket exists in Supabase Storage and has public read access enabled
- [ ] Local dev environment has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set

---

### Admin — Create Event with Photo

1. Log in as admin and navigate to **Manage Events**.
2. Click **+ New Event** to open the form.
3. Fill in title, date, time, location, and description.
4. Click the photo upload field and select a `.jpg` or `.png` image.
5. Confirm a thumbnail preview appears in the form immediately after selection.
6. Submit the form.
7. The new event appears in the admin events list.

---

### Admin — Edit Event Photo

1. Click **Edit** on the event created above.
2. Confirm the existing photo thumbnail is shown in the form.
3. Upload a different image.
4. Confirm the preview updates to the new image.
5. Save. Confirm the event detail page now shows the new photo.

---

### Admin — Event Without Photo

1. Create a second event and leave the photo field empty.
2. Confirm the event is saved and appears normally — no broken image placeholder.

---

### Public — Event Listing Page (`/events`)

1. Navigate to `/events`.
2. The event with a photo shows a thumbnail image at the top of its card.
3. The event without a photo shows the card with no image — layout is intact, no gap or broken element.

---

### Public — Event Detail Page (`/events/[id]`)

1. Click through to the event that has a photo.
2. A hero image renders at the top of the detail card, above the title.
3. Click through to the event without a photo.
4. The detail page renders normally with no image slot shown.

---

### Public — Homepage

1. Navigate to `/`.
2. If upcoming events are shown on the homepage, verify that events with photos display them and events without photos are unaffected.

---

### Edge Cases

- [ ] Uploading a non-image file (e.g. `.pdf`) is rejected with an error message in the form
- [ ] Uploading with an expired/invalid session returns 401 and the form shows an error
- [ ] An event saved before this feature (no `photoUrl` field) renders without errors on all surfaces

---

## Merge Criteria

All manual verification steps above pass. Build and lint are clean. No regressions observed on the events listing, detail, or homepage.