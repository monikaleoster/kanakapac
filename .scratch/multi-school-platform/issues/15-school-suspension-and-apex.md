# 15: Suspend a School, and give the apex a front door

**What to build:** The Superadmin suspends a School: its public site serves a plain notice that the site is temporarily unavailable, and its Members can no longer publish, while everything it owns is retained. Un-suspending restores it.

The notice confirms the slug exists, which is accepted deliberately — a parent meeting a bare 404 on a site that worked last week is the worse outcome. The apex gets its marketing page and the Superadmin sign-in link.

**Blocked by:** 11

**Status:** ready-for-agent

- [ ] Suspending a School makes its public site serve a temporarily-unavailable notice
- [ ] A suspended School's Members cannot publish; its content is retained
- [ ] Un-suspending fully restores the School
- [ ] A suspended School is distinguishable from an unknown slug, which still 404s
- [ ] The apex serves a marketing page and a Superadmin sign-in link
- [ ] The isolation spec covers the suspended-School notice
