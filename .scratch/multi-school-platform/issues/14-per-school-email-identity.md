# 14: Outbound email carries the sending School's identity

**What to build:** Every email a School sends — announcements, article notifications, contact-form delivery, unsubscribe confirmations — goes out with that School's display name and a reply-to that reaches that School's PAC, drawn from its settings. The platform keeps one verified sending domain.

This replaces the hardcoded reply-to that currently sends every School's replies to one address.

**Blocked by:** 02, 13

**Status:** ready-for-agent

- [ ] All School-context email uses that School's display name and reply-to from settings
- [ ] The hardcoded from-address and reply-to are gone
- [ ] Superadmin sign-in email is platform-level, not School-branded
- [ ] Unsubscribe acts only on the subscription for the sending School
- [ ] A Subscriber on two Schools receives each School's mail with its own identity

## Comments

**2026-10-15 — carried over from the ticket 02 prefactor (commit 8d0b141).**

Ticket 02 parameterized the send path and added a first pass at hardening the
display name, since this ticket is what starts feeding admin-entered text into
a mail header. A code review of that work found defects in the hardening. They
were deliberately left in place rather than fixed, because there is no caller
until this ticket adds one, and the fallback policy question below is this
ticket's to answer. All three were reproduced by running the logic directly.

Confirmed defects in `buildFromHeader` / `renderDisplayName` / `extractAddress`
in `src/lib/resend.ts`:

- `extractAddress` falls back to `bare.includes('@')`, which accepts any string
  containing an `@`. With `RESEND_FROM_EMAIL="Kanaka PAC mail@pacsolution.ca"`
  (brackets omitted) a display name yields
  `Westview PAC <Kanaka PAC mail@pacsolution.ca>` — the malformed header the
  function's own JSDoc and test comment claim cannot happen. Dropping the bare
  branch entirely and composing only from a bracketed address fixes it and
  removes the only part with no caller.
- `renderDisplayName` strips `[\r\n]` only. TAB, NUL and other control
  characters survive: `"Westview\tPAC\u0000X"` is emitted bare. TAB is folding
  whitespace and NUL is a smuggling character; strip `[\x00-\x1f\x7f]`.

Unconfirmed, needs checking against Resend before deciding:

- A non-ASCII display name (`École Élémentaire`) is emitted as raw UTF-8.
  RFC 5322 `qtext` excludes non-ASCII, so quoting cannot represent it — strictly
  it needs an RFC 2047 encoded-word. Whether this actually breaks depends on
  whether Resend MIME-encodes the display name itself, which was not verified.
  This matters here: BC has French-named Schools, so a School whose name does
  not fit in ASCII is a realistic first customer, not an edge case.

Two policy questions this ticket owns:

- When a display name is rejected or unusable, `buildFromHeader` currently
  discards it silently and sends as configured. Reject the save, log, or fall
  back? A School Owner who sets an unusable name should probably learn that at
  save time, not have it silently ignored on every send.
- `replyTo` has no hardening, while `fromName` does. The asymmetry is defensible
  today — the from-header is composed from two parts in our code, whereas
  `replyTo` is handed to Resend as a discrete JSON field it serializes — but
  this ticket draws both from School settings, so settle it explicitly rather
  than by omission.
