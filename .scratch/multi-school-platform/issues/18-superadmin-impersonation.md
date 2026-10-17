# 18: Enter a School, with a trail

**What to build:** The Superadmin enters a School and works inside it on its behalf, through the ordinary scoped path rather than any privileged shortcut, and leaves it again. Every action taken while impersonating is written to the audit log: who acted, in which School, on what, and when.

The Superadmin holds no membership in any School, so this is the only route by which operator help touches a School's content — which is what makes the trail complete.

**Blocked by:** 10, 11

**Status:** ready-for-agent

- [ ] The Superadmin enters a named School and acts within it
- [ ] Actions while impersonating run through the ordinary scoped data path
- [ ] Every impersonated action is written to the audit log with actor, School, target and time
- [ ] It is always visually clear when impersonation is active, and it can be exited
- [ ] The Superadmin holds no membership row in any School
- [ ] No content path bypasses scoping for the Superadmin
