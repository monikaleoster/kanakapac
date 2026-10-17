# 01: Admin sign-in fails closed when no password is configured

**What to build:** `src/lib/auth-options.ts:21` reads
`process.env.ADMIN_PASSWORD || "<literal>"`. If the variable is unset in any
environment, the admin area is reachable with that hardcoded literal, which is
visible at that line and in every commit of this file's history. The fallback
must be removed so that a missing `ADMIN_PASSWORD` makes `authorize` return
null for every input rather than accepting a known string.

This is the most serious finding of the review. It is not that the production
value is weak — it is that the failure mode of a configuration mistake is an
open door rather than a locked one, and the key is public.

Two things beyond the code change. The literal is in git history, so the value
must be treated as compromised wherever it may have been reused, and
`ADMIN_PASSWORD` must be confirmed set in every deployed environment before the
fallback is removed — removing it first would lock the admin area if any
environment is relying on it. Neither is something code can check, which is why
this is filed for a human.

Ticket 08 of the multi-school conversion removes this provider for School
admins entirely, and ADR-0004 keeps a break-glass path for the Superadmin only.
That does not make this wait for the conversion: the door is open on the live
site now, and D-05 has since replaced the break-glass password with TOTP, so
nothing downstream depends on this fallback existing.

**Blocked by:** None. Lands on `main` before the conversion branch starts.

**Status:** ready-for-human

- [ ] `ADMIN_PASSWORD` is confirmed set in every deployed environment
- [ ] The password is rotated, on the assumption the git-history literal leaked
- [ ] The `||` fallback is removed from `src/lib/auth-options.ts`
- [ ] With `ADMIN_PASSWORD` unset, `authorize` returns null for every input,
      including the former literal and the empty string
- [ ] A unit test covers the unset-variable case, so the fallback cannot return
- [ ] `.env.example` states that admin sign-in is unavailable when the variable
      is unset, rather than leaving the behaviour implied
