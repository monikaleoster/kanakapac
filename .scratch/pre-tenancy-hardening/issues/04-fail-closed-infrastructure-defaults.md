# 04: Configuration defaults and route-level inconsistencies

**What to build:** A cluster of small fixes, grouped because they are each a
few lines and share the review that found them. Two are the same fail-open
pattern as ticket 01; the rest are consistency.

**The Supabase client falls back to a placeholder.** `src/lib/supabase.ts:6-13`
logs a warning when the URL or service role key is missing and then calls
`createClient('http://localhost', 'placeholder')`. The app boots and fails at
query time with an error that points at the network rather than at the missing
variable. It should fail at startup, naming the variable that is unset.

**Subscribe accepts anything containing an at-sign.**
`src/app/api/subscribe/route.ts:21` validates with `email.includes("@")`, then
stores the value and sends mail to it. Tighten the check.

**Route caching is inconsistent.** `api/events/route.ts:6` sets
`export const dynamic = "force-dynamic"`; `api/minutes`, `api/announcements`,
`api/team`, and `api/policies` do not, despite serving the same kind of
mutable content. Either they all need it or events does not — decide once and
apply it uniformly, rather than leaving the difference to look deliberate.

**Dead NextAuth callbacks.** `src/lib/auth-options.ts:34-41` defines `session`
and `jwt` callbacks that return their arguments unchanged. They do nothing and
will mislead whoever extends them during ticket 08 of the conversion. Remove
them, or implement them there.

**Blocked by:** None. Lands on `main` before the conversion branch starts.
Overlaps ticket 01 in `src/lib/auth-options.ts`, so sequence after it to avoid
a conflict in the same file.

**Status:** ready-for-agent

- [ ] A missing Supabase URL or service role key fails at startup, naming the
      variable, rather than producing a client pointed at localhost
- [ ] Subscriber email validation rejects values that are not plausible
      addresses
- [ ] `force-dynamic` is applied consistently across the content routes, with
      the choice stated in a comment or not needed at all
- [ ] The no-op `session` and `jwt` callbacks are removed
- [ ] Existing unit and e2e tests pass unchanged
