# Tenant isolation lives in a school-scoped data layer, with RLS as a blast-radius limiter

All nine content tables (`events`, `rsvps`, `minutes`, `announcements`, `articles`, `policies`, `team_members`, `subscribers`, `settings`) gain a `school_id` and stay in one shared schema. Isolation is enforced by the application: `src/lib/data.ts` is split into one module per resource, and every accessor requires a `school_id` obtained from the school resolved from the request host. Row Level Security is enabled on every table and denies the `anon` and `authenticated` roles outright, so a leaked anon key reads nothing.

It is important to be honest about what is enforcing what. Every query runs server-side through `src/lib/supabase.ts` using the service role key, and the service role bypasses RLS by design. RLS is therefore *not* the isolation mechanism here — it is a limiter on what a stolen client-side key can reach. The real guarantee is structural: there is no way to obtain a query builder without supplying a `school_id`, so an unscoped query is something you have to work at rather than something you forget into existence.

That structural guarantee is also why the per-resource split happens in the same pass rather than later. The scoping work rewrites every accessor in `data.ts` regardless, and the 728-line single file mixing seven resource concerns is precisely the shape in which a missing `school_id` filter hides. Deferring the split would mean touching every line twice and keeping the dangerous shape in the meantime.

## Considered Options

- **Shared tables, scoped data layer, RLS as a net** (chosen): one migration path, cheap to operate, and the enforcement point is a seam that also resolves the existing `data.ts` maintainability problem. Accepts that a determined mistake inside the data layer can still cross schools.
- **Shared tables with a per-request signed JWT carrying `school_id`**, enforced by RLS policies reading `auth.jwt()`: true database-level enforcement that survives an application bug. Rejected because public pages are fully anonymous, so every anonymous page view would require minting and signing a token, and we would own JWT issuance and key rotation.
- **`set_config` / `current_setting` per request**: superficially the most elegant way to give Postgres the tenant. Rejected as unsound here — `supabase-js` talks HTTP to PostgREST over pooled connections, so the setting is not guaranteed to apply to the connection the query runs on.
- **Schema per school, or database per school**: strong isolation and trivial per-school export or deletion. Rejected on operational cost for a solo maintainer — every migration runs N times, and cross-school superadmin queries become painful.

## Consequences

- The isolation guarantee is only as good as the seam. Any code path that reaches `supabase` directly rather than through a scoped accessor bypasses tenancy entirely, so that should be treated as a reviewable defect, and the unscoped client should be confined to superadmin provisioning routes.
- `subscribers.email` loses its global `UNIQUE` constraint in favour of `UNIQUE(school_id, email)`, so a parent with children at two schools can subscribe to both and unsubscribing from one does not affect the other.
- `settings` loses its `single_row` CHECK constraint and becomes one row per school.
- `rsvps` carries its own denormalized `school_id` rather than deriving it through `events`, so the scoped accessor can filter it without a join.
- Storage uses per-school path prefixes inside the existing public buckets rather than a bucket per school, so creating a school does not require provisioning storage.
- Content tables gain `created_by` and `updated_by` user references, backfilled as NULL for existing rows.
- Issue #47 (`data.ts` mixing seven concerns) is closed as part of this work rather than separately.
