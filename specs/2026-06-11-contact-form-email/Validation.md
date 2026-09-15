# Contact Form Email — Validation

## Automated checks

| Check | How | Pass condition |
|---|---|---|
| TypeScript compiles | `npm run build` | Zero type errors |
| Lint passes | `npm run lint` | Zero ESLint errors |

---

## API-level checks

Test the `/api/contact` route directly (e.g. with `curl` or a REST client):

| Test | Input | Expected response |
|---|---|---|
| All fields present | `{ name, email, subject, message }` all non-empty | `200 { success: true }` |
| Missing `name` | omit `name` | `400` with error message |
| Missing `email` | omit `email` | `400` with error message |
| Missing `subject` | omit `subject` | `400` with error message |
| Missing `message` | omit `message` | `400` with error message |
| Empty string field | `{ name: "", ... }` | `400` with error message |

---

## Manual verification

**Prerequisites:** `RESEND_API_KEY` and `CONTACT_EMAIL` set in `.env.local`, dev server running (`npm run dev`).

### Happy path
1. Navigate to `/contact`.
2. Fill in all four fields with real values (use a personal email you can check as the "Email Address").
3. Click **Send Message**.
4. Confirm the button shows **Sending…** and is disabled while the request is in flight.
5. Confirm the form is replaced by the green success message: *"Thank you for your message! We'll be in touch soon."*
6. Check the inbox at `CONTACT_EMAIL` — email should arrive with:
   - Subject: `[Contact Form] {the subject you typed}`
   - Body showing all four fields
   - Reply-To set to the email address you typed in the form
7. Check the inbox of the email you typed — confirmation email should arrive with subject `We received your message — Kanaka PAC`.
8. Reply to the treasurer email and confirm the reply goes to the submitter address (reply-to working).

### Validation path
1. Navigate to `/contact`.
2. Leave all fields blank and click **Send Message**.
3. Confirm the browser prevents submission (native `required` validation).
4. Fill in three of four fields, leave one blank — confirm same browser block.

### Error path
1. With `RESEND_API_KEY` intentionally unset (or set to an invalid value), submit the form.
2. Confirm an error message is shown inline (not a blank screen or uncaught exception).

---

## Merge criteria

- [ ] `npm run build` passes with no errors
- [ ] Happy path manual test complete (both emails received)
- [ ] Validation path confirmed (browser blocks empty submission)
- [ ] Error path confirmed (graceful error message shown)
- [ ] `CONTACT_EMAIL` added to env example file