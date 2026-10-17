# 17: Break-glass sign-in that does not depend on email

**What to build:** The Superadmin can sign in with a time-based one-time code when email is unavailable. Members have no password or code path at all — this exists solely so an email outage cannot lock the operator out of every School at once.

TOTP alone is a single factor: possession of the seed. That is an accepted trade for one account, but it means losing the authenticator must not be unrecoverable.

**Blocked by:** 08

**Status:** ready-for-agent

- [ ] The Superadmin enrols an authenticator and signs in with a code when email is unavailable
- [ ] Single-use recovery codes are generated at enrolment and shown once
- [ ] A recovery code signs the Superadmin in and cannot be reused
- [ ] The code endpoint is rate limited; a six-digit code is brute-forceable without it
- [ ] A used code is rejected within its validity window
- [ ] No Member has any password or code sign-in path
- [ ] Enrolment is documented as a post-cutover runbook step
