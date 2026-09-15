# Contact Form Email — Implementation Plan

## Task Group 1 — Email helper functions

**File:** `src/lib/resend.ts`

1.1 Add `buildContactEmailHtml(name, email, subject, message)` — HTML template for the email sent to the treasurer. Displays all four fields clearly. Sets no unsubscribe footer (this is a transactional message).

1.2 Add `buildContactConfirmationHtml(name)` — HTML template for the auto-reply sent to the submitter. Acknowledges receipt and says the team will be in touch.

---

## Task Group 2 — API route

**File:** `src/app/api/contact/route.ts` *(new file)*

2.1 Accept `POST` with JSON body `{ name, email, subject, message }`.

2.2 Validate all four fields are present and non-empty strings. Return `400` with a descriptive error if any are missing.

2.3 Read recipient from `process.env.CONTACT_EMAIL ?? 'kcpactreasurer@gmail.com'`.

2.4 Call `sendEmail` twice (in parallel with `Promise.all`):
- Treasurer email: to `CONTACT_EMAIL`, reply-to submitter's email, subject `[Contact Form] {subject}`, html from `buildContactEmailHtml`
- Confirmation email: to submitter's email, subject `We received your message — Kanaka PAC`, html from `buildContactConfirmationHtml`

2.5 Return `200 { success: true }` on success. Return `500 { error: 'Failed to send message' }` if Resend throws (do not leak internal error details to the client).

---

## Task Group 3 — ContactForm component

**File:** `src/components/ContactForm.tsx`

3.1 Add `required` attribute to all four inputs/textarea so browsers enforce basic validation before submit.

3.2 Change `handleSubmit` to an async function that:
- Sets a `"loading"` status while the request is in flight
- POSTs form data as JSON to `/api/contact`
- Sets `"success"` on 2xx
- Sets `"error"` on non-2xx, capturing the error message

3.3 Add an error state type (`"idle" | "loading" | "success" | "error"`) and show an inline error message when status is `"error"`.

3.4 Disable the submit button while status is `"loading"` and update its label to `"Sending…"`.

---

## Task Group 4 — Environment documentation

4.1 Add `CONTACT_EMAIL=kcpactreasurer@gmail.com` to `.env.example` (or the existing env example file) with a comment explaining it is the contact form recipient.