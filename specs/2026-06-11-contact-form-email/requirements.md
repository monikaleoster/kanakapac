# Contact Form Email — Requirements

## Summary

Wire up the contact form at `/contact` so that submissions send a real email to the PAC treasurer and a confirmation email back to the submitter. Uses the existing Resend integration.

---

## Scope

### In scope
- All four form fields sent in the outbound email: **name**, **email**, **subject**, **message**
- Outbound email delivered to a configurable recipient (default `kcpactreasurer@gmail.com`)
- Submitter's email address set as `reply-to` on the treasurer email so replies go directly to them
- Auto-reply confirmation email sent to the submitter acknowledging receipt
- Client-side validation: all four fields are required before the form can be submitted
- Server-side validation: API returns 400 if any field is missing (defense against direct API calls)
- Recipient email configurable via `CONTACT_EMAIL` environment variable without a code change

### Out of scope
- Admin UI for viewing submissions
- Storing submissions in the JSON data files
- Rate limiting or spam protection (future work)
- Rich HTML template customization in admin

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Email provider | Resend | Already integrated; `sendEmail` helper in `src/lib/resend.ts` is reusable |
| Recipient config | `CONTACT_EMAIL` env var, fallback `kcpactreasurer@gmail.com` | Lets the address change without a deploy |
| Reply-to on treasurer email | Submitter's email | Treasurer can reply directly without copy/paste |
| Confirmation email | Yes | Closes the loop for the submitter; reduces duplicate submissions |
| Validation | All fields required | Consistent with the form's intent; no optional fields |
| API route | New public `POST /api/contact` | Keeps contact separate from the admin-auth `/api/send-email` route |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CONTACT_EMAIL` | `kcpactreasurer@gmail.com` | Recipient address for contact form submissions |
| `RESEND_API_KEY` | *(required)* | Already required for other email features |
| `RESEND_FROM_EMAIL` | `Kanaka PAC <onboarding@resend.dev>` | Already used; shared sender identity |

---

## Email Specifications

### Email to treasurer (`CONTACT_EMAIL`)
- **From:** `RESEND_FROM_EMAIL`
- **To:** `CONTACT_EMAIL`
- **Reply-To:** submitter's email
- **Subject:** `[Contact Form] {subject field}`
- **Body:** Name, email, subject, message in a clean HTML layout

### Confirmation to submitter
- **From:** `RESEND_FROM_EMAIL`
- **To:** submitter's email
- **Subject:** `We received your message — Kanaka PAC`
- **Body:** Acknowledgement that the message was received and the team will be in touch
