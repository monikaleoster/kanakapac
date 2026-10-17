# 01: Default platform email becomes support@vectorlocal.ca

**What to build:** Both places that fell back to `kcpactreasurer@gmail.com` use
`support@vectorlocal.ca` instead: the default reply-to on all outbound mail
(`DEFAULT_REPLY_TO` in `src/lib/resend.ts`) and the contact-form recipient when
`CONTACT_EMAIL` is unset (`src/app/api/contact/route.ts`). The `.env.example`
default and its comment follow.

Written after the fact: this was a direct request during the ticket 01/02
implementation session, not a planned ticket. Recorded so the change is tracked
like everything else and so the open item below is not lost.

This is a product change, not part of the multi-school conversion. It is
deliberately separate from ticket 02 of that effort, whose own acceptance
criteria require its defaults to reproduce today's behaviour exactly — this
does not. Once ticket 14 of the conversion lands, this default applies only to
platform-level mail and to Schools that have set no reply-to of their own.

**Blocked by:** None.

**Status:** ready-for-human

- [x] `DEFAULT_REPLY_TO` is `support@vectorlocal.ca`
- [x] The contact-form recipient falls back to `support@vectorlocal.ca`
- [x] `.env.example` and its comment carry the new address
- [x] Unit tests assert the new address; full suite green
- [ ] `support@vectorlocal.ca` is a deliverable mailbox on a Resend-verified
      sending domain, and a real contact-form submission has been seen to arrive

## Comments

**2026-10-15 — landed as commit 953586e on `multi-school-platform-design`.**

Code and tests are done; `tsc`, `next lint`, `next build` and all 169 unit
tests are green. No `kcpactreasurer@gmail.com` reference remains in `src/` or
`.env.example`.

The last checkbox is the reason this is `ready-for-human` rather than closed. It
needs someone with access to the Resend dashboard and the mailbox:

- If `vectorlocal.ca` is not a verified sending domain in Resend, outbound mail
  using this address as reply-to may be rejected or land in spam.
- If the mailbox does not exist, contact-form submissions fail into a
  `console.error` in `src/app/api/contact/route.ts` and the submitter still sees
  success. Nobody finds out until a parent asks why they got no reply.

Setting `CONTACT_EMAIL` in the environment overrides the recipient without a
code change, so that is the escape hatch if the mailbox is not ready.

Deliberately not changed, as they are different addresses serving different
purposes: `pac@kanakaelementary.ca` in `src/lib/types.ts` (a School's own public
contact detail), `admin@kanakapac.com` in `src/lib/auth-options.ts`, and the
seed data in `supabase/seed.sql` and `seed-staging.sql`.

Still carrying the old address, left alone as historical records:
`specs/2026-06-11-contact-form-email/requirements.md` and `Plan.md`.
`docs/DEVELOPER_WIKI.md:889` is stale on this and was also left — it is tracked
as a separate documentation issue, not part of this change.
