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
