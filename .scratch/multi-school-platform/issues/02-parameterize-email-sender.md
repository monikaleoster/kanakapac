# 02: Make the email sender identity a parameter

**What to build:** Outbound email currently hardcodes a single from-address and a single reply-to. Make both arguments to the send path, with the current values as defaults, so nothing about today's behaviour changes.

This is a prefactor for ticket 14, where the display name and reply-to start coming from each School's settings.

**Blocked by:** None (can start immediately). Lands on `main` before the conversion branch starts.

**Status:** ready-for-agent

- [ ] From display name and reply-to are arguments to the send path
- [ ] Defaults reproduce today's behaviour exactly
- [ ] Contact, subscribe, and bulk-send paths all route through the parameterized sender
- [ ] Existing email tests pass unchanged
