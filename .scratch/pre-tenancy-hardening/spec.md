Status: ready-for-agent

# Pre-Tenancy Hardening

## Problem Statement

A review of the single-school foundation, run to decide whether it was sound
enough to extend into the multi-school platform rather than rebuild, found
three defects not already tracked as issues #48–#51, plus a cluster of smaller
ones. The conclusion of that review was that the foundation is sound and the
conversion should proceed in this repo — these are the things to fix first, not
reasons to start over.

Three of the findings share one root cause: a default that fails open rather
than closed. A missing `ADMIN_PASSWORD` opens the admin area, a missing Supabase
key produces a client pointed at localhost, and four PUT routes accept whatever
body they are handed. `open-decisions.md` D-04 already states the rule these
break — "it must fail closed: if the environment cannot be positively identified
as test, the path does not work" — so the principle is settled and these are
places the code does not yet follow it.

One finding matters specifically for the conversion. Five PUT routes pass the
raw request body straight to the data layer. Today that is mass assignment on an
admin-only route. Once `school_id` exists on those tables it becomes the
mechanism by which an Editor of one School writes to another, which is the exact
failure class ADR-0003 exists to prevent. Fixing it before ticket 05 of the
conversion is cheaper than auditing for it afterwards.

## Scope of the review behind this

Read in full: all 15 API routes, `src/lib` (including the data layer, auth
config, storage, email, and sanitization), the schema, and the migrations.

**Not read:** the ~3,985 lines of admin pages under `src/app/admin/` and the
~1,601 lines of components. Findings from those surfaces are not represented
here, and a second pass over them is still outstanding. The one exception is a
targeted search across all of `src/` for raw-HTML render sites, which found
exactly one and found it correctly sanitized (see below).

## What the review found working

Recorded because it is the reason the conversion proceeds in this repo, and
because a later reader should not mistake this directory for a verdict on the
whole codebase:

- All eight mutating API routes check `isAuthenticated()`, with no omissions.
- `api/upload/route.ts` validates MIME type against a per-context allowlist,
  caps size per context, sanitizes the filename, and documents why the cap is
  4MB (the host's ~4.5MB body limit).
- `api/contact/route.ts` guards the JSON parse, rejects non-object bodies, and
  type-and-trim checks every field.
- `api/team/route.ts` and `api/policies/route.ts` fetch the existing row and
  merge named fields on PUT — the pattern ticket 03 applies to the other five.
- There is exactly one `dangerouslySetInnerHTML` in the codebase, at
  `src/app/articles/[id]/page.tsx:93`, and it is fed sanitized input. The
  companion path in `src/lib/resend.ts:165` sanitizes too. Both consumers of
  stored Article HTML are correct today; ticket 06 is about what keeps them
  that way, not about a present hole.
- All 15 routes share one shape, which is what makes the tenancy retrofit
  mechanical rather than archaeological.

## Out of Scope

- **Issues #48, #49, #50, #51.** Already tracked. #49/#50 (rate limiting on
  public write endpoints) overlap ticket 05 here but are not duplicated by it.
- **The admin pages and components.** Not reviewed; see above.
- **Any multi-school behaviour.** These tickets land on `main` before the
  conversion branch starts, and none of them introduces a School.
