# 07: Prove isolation with a two-School end-to-end seam

**What to build:** The primary test seam, and the proof the whole conversion rests on. Seed two Schools with distinguishable content in every resource, then walk the first School's public surfaces asserting the second's content never appears anywhere.

Isolation is only a meaningful property when more than one School exists, so this ticket also establishes the two-School seed fixture every later tenancy test reuses.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] A reusable fixture seeds two Schools with distinguishable content in every resource
- [ ] A dedicated isolation spec walks every public surface of one School asserting the other's content never appears
- [ ] The spec asserts an unknown subdomain 404s
- [ ] The spec follows the existing Page Object pattern
- [ ] The fixture is structured so admin-surface assertions can be added in ticket 09
