# 03: Update routes accept only named fields

**What to build:** Five routes read the request body and hand it to the data
layer unchanged:

- `src/app/api/events/route.ts:41-43`
- `src/app/api/minutes/route.ts:34-35`
- `src/app/api/announcements/route.ts:39-40`
- `src/app/api/articles/route.ts:46-48`
- `src/app/api/settings/route.ts:17-20`, which carries the comment
  `// Basic validation if needed`

Their POST handlers already build an explicit field list; only the update paths
skip it. Make each update handler accept named fields only, so a property the
handler does not name cannot reach the database.

**The pattern to copy already exists in this repo.** `api/team/route.ts:46-64`
and `api/policies/route.ts:44-57` fetch the existing row by id, return 404 when
it is missing, and merge named fields over it. Seven routes, five of which
diverge from the two that got it right — this is consistency work, not new
design.

**Why this is worth doing before the conversion rather than during it.** Today
the impact is mass assignment on a route that already requires authentication,
which is moderate on a single-tenant site. Once ticket 05 of the conversion adds
`school_id` to these tables, an update handler that forwards the raw body is the
mechanism by which an Editor of one School writes a row into another — by
sending `school_id` in the body of an otherwise ordinary request. ADR-0003
states the isolation guarantee is structural, that "there is no way to obtain a
query builder without supplying a `school_id`"; a handler that takes
`school_id` from user input satisfies that signature while defeating its
purpose. Fixing the shape now means the scoping work inherits five routes that
cannot express the bug.

Note that ticket 05 of the conversion will still need to ensure the School comes
from the resolved host rather than the body. This ticket makes that the only
remaining place to get it right.

**Blocked by:** None. Lands on `main` before the conversion branch starts.

**Status:** ready-for-agent

- [ ] Each of the five update handlers accepts only fields it names
- [ ] An unrecognised property in the body is ignored, not persisted
- [ ] Each fetches the existing row and returns 404 when the id does not exist,
      matching `api/team` and `api/policies`
- [ ] The `// Basic validation if needed` comment in `api/settings` is resolved
      rather than left
- [ ] Existing unit and e2e tests pass unchanged
- [ ] A test per route asserts an unexpected body property does not persist
