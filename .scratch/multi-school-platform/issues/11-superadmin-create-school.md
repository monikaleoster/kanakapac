# 11: Create a School in one step

**What to build:** The Superadmin enters a school name, a slug, and the first Owner's email address. That creates the School, its settings row with sensible defaults, the Owner's membership, and emails that Owner a sign-in link. The School's public site works immediately, empty but not broken.

Slug rules are enforced here because a slug is permanent: reserved infrastructure names are rejected, and a slug already taken or retired is rejected with a reason, so the district-or-city disambiguation conversation happens before the record exists.

**Blocked by:** 08, 09

**Status:** ready-for-agent

- [ ] One form creates the School, its settings row, the first Owner membership, and sends a sign-in link
- [ ] The new School's public site renders correctly while empty
- [ ] Reserved infrastructure slugs are rejected
- [ ] A slug already in use or retired is rejected with a clear reason
- [ ] Slug format is validated as lowercase alphanumeric and hyphens
- [ ] The slug cannot be changed after creation
- [ ] Superadmin routes are a separate surface from the School admin area
