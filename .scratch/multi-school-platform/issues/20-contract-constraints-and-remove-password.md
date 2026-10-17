# 20: Make tenancy structural

**What to build:** The contract step. With the backfill verified, make the School reference non-nullable with foreign keys on all nine tables, so a write that forgets a School fails loudly instead of silently landing in the first School's content.

The shared-password credentials provider is removed in the same ticket, since no Member path depends on it any more.

**Blocked by:** 19

**Status:** ready-for-agent

- [ ] The School reference is non-nullable with a foreign key on all nine tables
- [ ] An insert without a School fails
- [ ] The shared-password credentials provider is removed
- [ ] The admin password environment variable is no longer read by any Member sign-in path
- [ ] Any tooling or test still using the shared password has been rewritten
- [ ] Issue #51 is closed for Members; the Superadmin rate limiting from ticket 17 is noted as the remainder
