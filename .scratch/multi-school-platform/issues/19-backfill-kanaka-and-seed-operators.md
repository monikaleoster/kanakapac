# 19: Backfill the existing site as the first School

**What to build:** The migrate step of ADR-0005. Insert the Kanaka School, seed the Superadmin user and Kanaka's first Owner, and backfill every existing row to Kanaka, then verify that not one row in any of the nine tables is left without a School.

Getting the seeded identities wrong fails at the worst possible moment: the first sign-in after cutover, for the people who most need it to work.

**Blocked by:** 05, 11

**Status:** ready-for-agent

- [ ] The Kanaka School row exists with its permanent slug
- [ ] A Superadmin user is seeded
- [ ] Kanaka's first Owner is seeded as a user with an owner membership
- [ ] The Superadmin has no membership in Kanaka
- [ ] Every row in all nine tables references Kanaka
- [ ] A verification step asserts zero rows lack a School and fails loudly otherwise
- [ ] The migration is reversible and leaves the constraint step to ticket 20
