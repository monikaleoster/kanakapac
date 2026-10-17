# 03: Add the tenancy and identity tables, and a nullable School reference everywhere

**What to build:** Introduce the new shape without anything depending on it yet. Add a `schools` table (slug, display name, status, timestamps), a `users` table (email, display name, Superadmin flag), a `school_members` join table (user, School, role of owner or editor), and an audit log table for Superadmin impersonation. Add a nullable School reference to all nine content tables, plus nullable created-by and updated-by user references on the content tables.

This is the expand step of ADR-0005's three-part migration. Nothing reads these columns yet, the site behaves identically, and the migration is reversible.

**Blocked by:** None (can start immediately). First ticket on the conversion branch.

**Status:** ready-for-agent

- [ ] All new tables exist with their constraints, including a unique immutable slug and one membership per user per School
- [ ] All nine content tables have a nullable School reference
- [ ] Content tables have nullable created-by and updated-by references
- [ ] `subscribers` email uniqueness is scoped to School rather than global
- [ ] The `settings` single-row constraint is removed
- [ ] RSVPs carry their own School reference rather than deriving it through Events
- [ ] Row Level Security is enabled on all tables, denying the anon and authenticated roles
- [ ] The running site behaves identically; all existing tests pass
