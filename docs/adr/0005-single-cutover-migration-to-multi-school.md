# Kanaka migrates to multi-school in one cutover, not incrementally

Kanaka is a live site with real content and real subscribers, on tables that have no tenancy at all. The multi-school work rewrites the data layer, the authentication model, routing, and the schema together, so it is built on a long-lived branch against a staging database and released in a single cutover during a planned maintenance window. Automatic deployment is already disabled in `vercel.json`, so `main` is not at risk while the branch runs.

All nine tables are made tenant-aware in the same release. A partially tenanted schema is a leak waiting to happen: any table still lacking `school_id` would show one school's rows to another, so there is no safe intermediate state to ship. The schema change itself is split into three sequential migrations — add `school_id` as nullable, backfill every row to Kanaka's school, then apply `NOT NULL` and the foreign key — so the backfill can be verified against real data before the constraint makes it permanent, and each step is independently reversible.

Kanaka becomes the first school, reachable at its subdomain, with `kanakapac.com` redirecting permanently. The platform apex domain does not exist yet and must be chosen and registered. Wildcard DNS and certificate support, which ADR-0002 depends on, has been confirmed available on the current hosting plan, so choosing the apex is the remaining prerequisite rather than a question of whether the addressing model is viable at all.

Four open security issues interact with this work. Issue #51 (no brute-force protection on admin login) is closed by the move to magic links. Issues #48 (stored XSS in minutes) and #49/#50 (no rate limiting on public write endpoints) are not closed by it, and their severity rises: a known hole is a risk accepted on one's own site, but not on a platform holding other schools' content and parent email addresses. They are fixed before any school other than Kanaka is onboarded, which is a later gate than cutover and does not block the tenancy work itself.

## Considered Options

- **Long-lived branch, all tables at once, single cutover** (chosen): one coherent switch with one rollback point, and no period in which the codebase supports two tenancy models. Costs a large branch that drifts from `main` and concentrates risk in a single window.
- **Incremental on `main`, multi-tenancy inert until switched on**: nullable `school_id`, the users tables, and the scoped data layer shipped in small reviewable pieces, with subdomain routing flipped last. Smaller diffs and continuous deployment. Rejected for now, but it is the fallback if the branch begins to sprawl.
- **Parallel deployment, migrating Kanaka once proven**: the live site is never at risk. Rejected because Kanaka's content keeps changing during the build, making the eventual migration a moving target, and two deployments and databases must be kept in step.
- **Nullable `school_id` permanently, treating NULL as Kanaka**: no backfill risk at all. Rejected as actively dangerous — an INSERT that forgets `school_id` would silently become Kanaka's content instead of failing, which is exactly the failure class ADR-0003 exists to prevent.
- **Export, rebuild the schema clean, re-import**: the tidiest end state. Rejected because it replaces reviewable migrations with a bespoke transform script run once under time pressure.

## Consequences

- Wildcard support is confirmed on the current plan, so ADR-0002 no longer carries the risk of reopening and blocking this plan. Registering the apex domain remains a prerequisite, and it must be registered somewhere that lets Vercel answer the certificate DNS challenge.
- The platform runs on the free Hobby tier during the build, which permits non-commercial personal use only. Onboarding schools that pay, or being paid to host them, requires upgrading to Pro. The upgrade is a billing change with no architectural consequence, but a fair-use violation is enforced by pausing the account, which would take every school's site down at once.
- Issue #35 must be fixed before cutover, because magic-link login depends on it (ADR-0004).
- There is no partial feedback. Nothing is exercised against production until the cutover itself, which is the main argument for watching branch size and switching to the incremental approach if it grows.
- The maintenance window must be long enough for three migrations plus verification, and short enough not to land during an event or meeting week.
- A school's slug is immutable once created, so no redirect table or slug history is needed, and creation-time slug choice matters.
- Suspension and deletion are distinct: suspending keeps all data and blocks writes while showing a notice publicly; deletion is superadmin-only and requires generating a JSON-plus-files export first, so a departing school can take its minutes with it.
- Onboarding school #2 is gated on #48, #49, and #50 being fixed.
