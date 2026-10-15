# 01: Split the data layer into one module per resource

**What to build:** The data-access layer is one large module mixing all nine resource concerns, which is the shape in which a missing School filter will later hide. Split it into one module per resource — events, RSVPs, minutes, announcements, articles, policies, team members, subscribers, settings — with no change in behaviour whatsoever. Every caller keeps working and every existing test keeps passing, unchanged.

This is a prefactor: it makes the School-scoping change in ticket 05 reviewable per resource rather than as one sweeping rewrite. It also closes issue #47 on its own merits. ADR-0003 describes the split and the scoping as one pass; doing the split first is the same effort, sequenced so the risky half is read in small pieces.

**Blocked by:** None (can start immediately). Lands on `main` before the conversion branch starts.

**Status:** ready-for-agent

- [ ] Each of the nine resources has its own data-access module
- [ ] No accessor's signature or behaviour changes
- [ ] All existing unit and e2e tests pass without modification
- [ ] No caller outside the data layer needs editing beyond import paths
- [ ] Issue #47 can be closed
