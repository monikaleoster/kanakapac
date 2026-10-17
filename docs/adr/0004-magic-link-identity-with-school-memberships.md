# Admins are real accounts with per-school memberships, authenticated by magic link

The site currently has no concept of a user. `src/lib/auth-options.ts` compares a submitted password against a single `ADMIN_PASSWORD` environment variable and returns a hardcoded identity. Multi-school operation needs several named admins per school, so this is replaced by a `users` table and a `school_members` join table carrying `user_id`, `school_id`, and a role of either `owner` or `editor`. Editors create and edit their school's content; owners also manage that school's membership. Superadmin is an `is_superadmin` flag on `users`, not a membership row.

Authentication is by emailed magic link. This removes password storage, password reset, and the brute-force surface that issue #51 describes — which matters more in a multi-school system, where that surface would otherwise be multiplied across every school's admins. The session cookie is scoped to `.yoursite.com` so one login covers every subdomain; the subdomain states which school is being addressed, and membership in that school is checked on every request. Superadmin edits a school's content by entering that school explicitly and acting through the ordinary scoped path, with the impersonation recorded in an audit log, so content editing has no privileged special case.

Owners, not the superadmin, invite subsequent admins. A PAC executive turns over roughly annually, and routing every change through the platform operator would make the operator a bottleneck on an entirely predictable schedule.

Magic-link authentication makes email delivery the gate on all administrative access, and issue #35 reports subscriber email failing on staging. Fixing it is therefore a prerequisite for cutover rather than adjacent work. Even so, an email outage must not lock everyone out of everything: superadmin alone retains a password or TOTP login as break-glass. School admins have no password path.

## Considered Options

- **Magic link, `users` plus `school_members`, owner/editor roles** (chosen): no credential storage, closes #51, and the minimum role model that lets schools administer themselves. Depends entirely on reliable transactional email.
- **Email and password accounts**: familiar to school admins and independent of email delivery. Rejected because it requires password hashing, reset flows, and brute-force protection we do not have, all of it security-critical code to own, across every school.
- **Google OAuth only**: near-zero friction for schools on Google Workspace and no credential handling. Rejected as it excludes anyone without a Google account.
- **A shared password per school**: the smallest change from today. Rejected outright — it gives no audit trail of who published what and no way to revoke one person's access.
- **Superadmin as a membership row on every school**, rather than a flag: a uniform authorization model with one check everywhere. Rejected because creating a school would mean inserting membership rows, and a school missing that row becomes invisible to the operator.
- **Three or more roles** (owner / editor / contributor): closer to how a PAC with volunteers actually works. Rejected for now because a contributor role implies a draft-and-review workflow that no content table models.

## Consequences

- Issue #35 becomes a hard gate on cutover. Until outbound email is provably working, no admin can log in to the new system.
- One password login survives, on the superadmin account. It needs the brute-force protection #51 asked for, now concentrated on a single high-value account.
- A cookie scoped to `.yoursite.com` is sent to every school's subdomain. Tenant authorization is therefore entirely the application's responsibility — the browser provides no isolation between schools, and a request that fails to check membership is a cross-school access bug.
- Content gains `created_by` and `updated_by`, and superadmin impersonation is written to an audit log, so "who published this" is answerable even when the operator acted on a school's behalf.
- A school can be created with an owner who never logs in. Provisioning creates the school, its `settings` row, and the first owner membership, then emails that owner a magic link; nothing verifies they acted on it.
- `ADMIN_PASSWORD` and the `CredentialsProvider` in `src/lib/auth-options.ts` are removed for school admins, so any tooling or test that logs in with the shared password must be rewritten.
