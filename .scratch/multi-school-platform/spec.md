Status: ready-for-agent

# Multi-School Platform Conversion

## Problem Statement

The site serves exactly one Parent Advisory Council. Everything about it assumes that: there is one shared admin password with no notion of who is logged in, nine content tables with no column saying who the content belongs to, a `settings` table structurally incapable of holding more than one row, and a `subscribers` table whose email column is globally unique. A second school cannot be added without either standing up a second deployment and a second database, or rewriting the assumptions above.

The operator wants to run one platform hosting many schools: the operator creates a School; several admins per School manage that School's own Events, Minutes, Announcements, Articles, Policies, Team Members, and Subscribers; and parents read their School's content with no account at all. None of those three roles exists today — there is only "knows the password" and "doesn't".

## Solution

One deployment, one database, many Schools. Each School is reached at its own subdomain (`<slug>.pacsolution.ca`) and sees only its own content; the School is resolved from the request host before anything else happens. Parents need no account and no login — a School's public pages are world-readable exactly as the single-school site is today.

Admins become real people. A `users` table and a `school_members` join table replace the shared password, with each membership carrying a role of Owner or Editor. Admins sign in by emailed magic link, and one login works across every School they belong to. The operator is a Superadmin: a separate surface for creating, suspending, exporting, and deleting Schools, plus the ability to enter a School and act on its behalf, with that impersonation recorded.

Tenant isolation is structural rather than conventional. Every content table gains a `school_id`, and the single large data-access module is split into one module per resource where every accessor requires a School to operate on, so an unscoped query is something one has to work at rather than something one forgets into existence.

The existing Kanaka site becomes the first School, with its current domain redirecting permanently to its subdomain and all its existing rows backfilled to it. The conversion ships as one cutover.

## User Stories

### Parents and public visitors

1. As a parent, I want to open my School's subdomain and see that School's homepage, so that I reach the right content without choosing a school from a list.
2. As a parent, I want to browse my School's Events, so that I know what is happening at my child's school.
3. As a parent, I want to read my School's Minutes, so that I can follow what the PAC decided.
4. As a parent, I want to see my School's Announcements, so that I do not miss time-sensitive notices.
5. As a parent, I want to read my School's Articles, so that I can follow longer-form PAC communications.
6. As a parent, I want to see my School's Policies and Team Members, so that I know how the PAC is governed and who runs it.
7. As a parent, I want to do all of the above without creating an account or logging in, so that there is no barrier between me and my school's information.
8. As a parent, I want to never see another school's content on my School's site, so that what I read is relevant and trustworthy.
9. As a parent, I want to RSVP to one of my School's Events, so that the PAC can plan attendance — and have that RSVP belong to that School only.
10. As a parent, I want to subscribe to my School's email updates, so that I am notified when new content is published.
11. As a parent with children at two Schools, I want to subscribe to both independently, so that one address is not blocked from the second School by the first.
12. As a parent with children at two Schools, I want unsubscribing from one School to leave my other subscription intact, so that I do not silently lose updates I still want.
13. As a parent, I want my School's site to show its own name, logo, and colour, so that I can tell at a glance I am in the right place.
14. As a parent, I want to use the Contact form and have it reach my School's PAC rather than another School's, so that my message goes to the right people.
15. As a visitor who mistypes a subdomain, I want a clear 404 page with a link back to the platform's main page, so that I am not left on a broken or confusing screen.
16. As a parent of a suspended School, I want a plain notice rather than a crash or a blank page, so that I understand the site is temporarily unavailable.
17. As a former visitor of the original single-school domain, I want my old bookmarks and newsletter links to still work, so that the move does not break my access.
18. As a prospective visitor, I want the platform's main domain to explain what the platform is, so that I understand what I have found.

### School Editors

19. As a School Editor, I want to sign in by clicking a link emailed to me, so that I do not have to remember or store a password.
20. As a School Editor, I want my single login to work for every School I belong to, so that I do not maintain separate credentials per school.
21. As a School Editor, I want to create, edit, and delete my School's Events, so that I can keep our calendar current.
22. As a School Editor, I want to post, edit, and delete my School's Minutes, so that our meeting record stays complete.
23. As a School Editor, I want to post, edit, and delete my School's Announcements, so that parents hear about urgent items.
24. As a School Editor, I want to draft and publish my School's Articles, so that longer pieces follow the existing Draft and Published lifecycle.
25. As a School Editor, I want to manage my School's Policies and Team Members, so that governance information stays accurate.
26. As a School Editor, I want to see and export my School's Subscribers, so that I know who receives our updates.
27. As a School Editor, I want to see only my School's content in the admin area, so that I cannot confuse another School's Event for ours.
28. As a School Editor, I want it to be impossible to edit a School I do not belong to, even by changing the subdomain in the address bar, so that a mistake or a stolen session cannot damage another School.
29. As a School Editor, I want uploaded images and documents to belong to my School, so that our files are not mixed with another School's.
30. As a School Editor, I want to see who last changed a piece of content, so that I can ask them about it rather than guess.
31. As a School Editor, I want my own name recorded against content I create, so that my colleagues know who wrote it.

### School Owners

32. As a School Owner, I want to do everything an Editor can do, so that managing membership does not cost me content access.
33. As a School Owner, I want to invite another admin to my School by email address, so that I can add a new PAC member without contacting the platform operator.
34. As a School Owner, I want to choose whether a new member is an Owner or an Editor, so that only the people who should manage membership can.
35. As a School Owner, I want to remove a member, so that a departing PAC member loses access promptly.
36. As a School Owner, I want to see the current list of my School's members and their roles, so that I know who has access.
37. As a School Owner, I want to set my School's name, logo, accent colour, and contact details, so that our site and our emails look and sound like ours.
38. As a School Owner, I want our outgoing email to carry our School's name and a reply-to address that reaches us, so that parents replying are answered by the right PAC.
39. As a School Owner, I want to be prevented from removing the last Owner, so that my School cannot lock itself out.

### Superadmin

40. As the Superadmin, I want to create a School by entering its name, subdomain slug, and first Owner's email address, so that onboarding is a single step.
41. As the Superadmin, I want creating a School to also create its settings and its first Owner membership and email that Owner a sign-in link, so that the School can start immediately without further help from me.
42. As the Superadmin, I want a newly created School to have a working if empty public site, so that nothing looks broken if a parent visits early.
43. As the Superadmin, I want slugs validated against a reserved list and a format rule at creation time, so that a School cannot claim a name that collides with platform infrastructure.
44. As the Superadmin, I want a School's slug to be permanent once created, so that no links ever break and no redirect history has to be maintained.
45. As the Superadmin, I want to suspend a School so that its public site shows a notice and its admins cannot write, while all its data is retained, so that I can park a School without destroying anything.
46. As the Superadmin, I want to un-suspend a School, so that suspension is reversible.
47. As the Superadmin, I want to export a School's content as structured data plus its uploaded files, so that a departing School can take its records with it.
48. As the Superadmin, I want deleting a School to require an export first and an explicit confirmation of its slug, so that deletion cannot happen casually.
49. As the Superadmin, I want to enter a School and act on its behalf, so that I can help an admin who is stuck.
50. As the Superadmin, I want every action I take while acting as a School recorded in an audit log, so that the School can see what I did on their behalf.
51. As the Superadmin, I want a list of all Schools with their status, so that I can see the state of the platform at a glance.
52. As the Superadmin, I want to retain a password or second-factor sign-in that does not depend on email, so that an email outage cannot lock me out of the platform entirely.
53. As the Superadmin, I want School admins to have no password sign-in at all, so that the password attack surface is one account rather than many.
54. As the Superadmin, I want the administrative surface for creating and deleting Schools kept separate from the content admin area, so that content editing never runs through unscoped data access.

### Migration and continuity

55. As the operator, I want all existing Kanaka content, Subscribers, and RSVPs to carry over intact as the first School, so that no history or consent record is lost.
56. As the operator, I want the schema change delivered as separate add, backfill, and constrain steps, so that the backfill can be verified against real data before it becomes permanent.
57. As the operator, I want the backfill verified to leave no row without a School before the constraint is applied, so that the riskiest step in the migration fails loudly rather than silently.
58. As the operator, I want the original domain to redirect permanently to the School's subdomain, so that existing links and search results keep working.
59. As a Kanaka admin, I want my first sign-in after the cutover to work by magic link without anyone creating an account for me, so that the transition does not lock me out.

### Development and operations

60. As a developer, I want to reach each School locally at its own `*.localhost` subdomain, so that local routing matches production rather than diverging from it.
61. As a developer, I want the end-to-end suite to address Schools by subdomain rather than a single base URL, so that tenant routing is actually exercised by tests.
62. As a developer, I want a seeded second School available in tests, so that cross-school leakage is something a test can detect rather than something we hope about.
63. As a developer, I want every data accessor to require a School, so that writing an unscoped query is difficult rather than merely discouraged.

## Implementation Decisions

These follow ADR-0002 (subdomain addressing), ADR-0003 (scoped data layer), ADR-0004 (magic-link identity), and ADR-0005 (single cutover). Read those first; this section records what they imply for the build and the details they do not cover.

### Tenant resolution

- A School is resolved from the leading label of the request `Host`. Resolution happens once per request in middleware and is made available to everything downstream; nothing re-parses the host.
- The apex host is not a School. It serves a marketing page and the Superadmin sign-in, and no School-scoped route is reachable there.
- An unresolvable subdomain yields a 404 that links to the apex. A suspended School is distinguished from a nonexistent one: it serves a plain notice that the site is temporarily unavailable. This confirms the slug exists, which is accepted deliberately — slugs are school names and effectively guessable, and a parent hitting a bare 404 on a site that worked last week is a worse outcome than the disclosure.
- School lookup by slug is cached; cache invalidation on School creation, suspension, and deletion is part of this work.
- Slugs are validated at creation against a reserved list (at minimum `www`, `admin`, `api`, `mail`, `app`, `static`) and a lowercase alphanumeric-and-hyphen format rule. Slugs are immutable thereafter.

### Schema

- A `schools` table holds the slug, display name, status (active or suspended), and timestamps. The slug is unique and immutable.
- All nine existing content tables gain `school_id` referencing `schools`: events, rsvps, minutes, announcements, articles, policies, team_members, subscribers, settings.
- `rsvps` carries its own `school_id` rather than deriving it through its Event, so the scoped accessor can filter it without a join.
- `subscribers` drops its global unique constraint on email in favour of uniqueness scoped to `(school_id, email)`. Unsubscribe tokens are per subscription, so unsubscribing from one School does not affect another.
- `settings` drops its single-row CHECK constraint and becomes one row per School, holding school name, PAC name, logo, accent colour, address, contact email, reply-to address, and meeting time.
- A `users` table holds email, display name, and a Superadmin flag.
- A `school_members` table joins users to schools with a role of `owner` or `editor`, unique per user and school.
- Content tables gain nullable `created_by` and `updated_by` user references. Existing rows backfill as null; the existing free-text `author` field on Article is retained unchanged.
- An audit log table records Superadmin impersonation: who acted, in which School, on what, and when.
- Row Level Security is enabled on all tables and denies the anon and authenticated roles. This is a limiter on what a leaked client key can reach, not the isolation mechanism — server-side queries use the service role and bypass it.

### Data access

- The single large data-access module is split into one module per resource in the same pass, since every accessor is being rewritten anyway and the combined module is the shape in which a missing filter hides.
- Every accessor takes a School as a required argument, enforced by its signature, so an unscoped call does not compile.
- The unscoped client is confined to Superadmin provisioning and export routines. Any other module reaching it directly is a defect.

### Identity, sessions, and authorization

- The shared-password credentials provider is removed for School admins and replaced by emailed magic links. The `ADMIN_PASSWORD` path survives only for the Superadmin account as break-glass, and needs rate limiting of its own.
- The session cookie is scoped to the parent domain so one sign-in covers every subdomain. The cookie establishes identity only.
- Authorization is per request: the resolved School plus the session identity are checked against `school_members` on every admin route and every mutating API route. A valid session with no membership in the resolved School is rejected.
- Superadmin acting within a School goes through the ordinary scoped path, with an audit log entry, rather than a privileged bypass.
- The last Owner of a School cannot be removed or demoted.

### Email

- One verified sending domain for the whole platform. Per-School identity comes from the display name and reply-to address on that School's settings row, replacing the currently hardcoded from-address and reply-to.
- All outbound mail — magic links, Announcement and Article notifications, contact-form delivery, and unsubscribe confirmations — is sent in the context of a School and carries that School's identity, except Superadmin sign-in which is platform-level.
- Outbound email must be demonstrably working before cutover, since magic links gate all admin access.

### Storage

- Uploads are written under a per-School path prefix inside the existing public buckets. No bucket is provisioned per School.
- The export routine collects a School's rows as structured data together with its files under that prefix.

### Provisioning and lifecycle

- Creating a School is one form taking name, slug, and first Owner email. It creates the School, its settings row with defaults, the Owner membership, and sends that Owner a magic link.
- No starter content is seeded; a new School's site renders correctly while empty.
- Suspension sets School status, which makes public pages render a notice and causes admin writes to be rejected while preserving all data.
- Deletion is Superadmin-only, requires an export to have been produced and the slug typed to confirm, and then hard-deletes the School's rows and files.

### Migration

- Three sequential migrations: add `school_id` as nullable everywhere; insert the first School and backfill every table to it; apply `NOT NULL` and foreign keys. The backfill is verified to leave no null before the third step runs.
- Built on a long-lived branch against a staging database, released in one cutover during a maintenance window. Automatic deployment is already disabled on the main branch.
- The original domain is configured as a permanent redirect to the first School's subdomain.
- Wildcard DNS and wildcard TLS are confirmed available on the current hosting plan, including its free tier. The remaining setup requirement is that the apex can answer the certificate DNS challenge, by using the host's nameservers or delegating `_acme-challenge` to it.

### Local development and tests

- Schools are addressed locally as `<slug>.localhost`, which resolves without host-file changes in Chrome and Firefox. Safari does not support this.
- The end-to-end configuration's single base URL is replaced by a helper that builds a URL for a named School, and the same convention is used in CI.
- The existing end-to-end authentication fixture signs in with the shared password and must be rewritten for magic-link sign-in.

## Testing Decisions

A good test here asserts externally observable behaviour: what a parent sees on a page, what an admin can and cannot reach, what an API returns. It does not assert that a particular function was called or that a query was shaped a certain way. The specific thing worth testing is the property the whole change exists to provide — that one School's data never appears in another School's surfaces — and that property is only meaningful when more than one School exists, so every tenancy test needs a decoy.

Two seams, deliberately:

**Primary — end-to-end, two seeded Schools.** A dedicated tenant-isolation spec seeds School A and School B with distinguishable content in every resource, then walks School A's public surfaces and admin surfaces asserting School B's content never appears, that an Editor of A cannot reach B's admin area by changing the subdomain, that an unknown subdomain 404s, and that a suspended School shows its notice. This is the highest available seam: it exercises host resolution, the data layer, authorization, and rendering together. It follows the existing Page Object pattern under the end-to-end tests directory, and the existing public and admin specs are the prior art for how pages are driven.

**Secondary — the data-layer seam.** One unit test file enumerating the per-resource modules and asserting that every read and write accessor filters by School and rejects a call without one. Most of this should be guaranteed by the accessor signatures rather than by assertions; the test exists to catch a module that reaches past the seam to the unscoped client, which the primary seam cannot see unless a test happens to walk that path. The existing data-layer unit test is the prior art.

Also in scope for tests:

- Authorization is covered at the primary seam rather than in isolation: a session with no membership in the resolved School is rejected on admin routes and mutating API routes.
- Subscriber uniqueness scoped per School, and unsubscribing from one School leaving the other intact, are covered at the primary seam because the behaviour spans two Schools.
- The migration backfill is verified by an assertion that no row lacks a School before the constraint step runs, rather than by a test.
- The existing end-to-end authentication fixture is rewritten for magic-link sign-in. Tests use a known sign-in link rather than capturing real mail. Whatever serves that link must be absent or inert in production builds and must fail closed when the environment cannot be positively identified as test, since a working hardcoded link is a credential that bypasses email for every School at once. A test asserting the path is unavailable in a production-like build is part of this work. Reading the issued token from the database in tests is a safer equivalent and is preferred if it proves straightforward.
- Existing public and admin specs are updated to address a School by subdomain. They are not individually made tenancy-aware — that is the dedicated spec's job.

## Out of Scope

- **Custom domains per School.** Explicitly rejected in ADR-0002. Adding them later reopens that decision rather than extending it.
- **Parent accounts of any kind.** All School content is public; there is no login, no gating, and no per-parent state beyond Subscriber records and RSVPs.
- **Private or restricted content within a School.** There is no visibility model beyond the existing Article Draft and Published lifecycle.
- **A public directory of Schools on the apex.** The apex is a marketing page and Superadmin sign-in only.
- **Self-serve School signup.** Schools are created by the Superadmin; there is no request-and-approve queue.
- **Roles beyond Owner and Editor.** A contributor role implies a draft-and-review workflow no content table models.
- **Slug renaming, slug history, or redirects between slugs.** Slugs are immutable.
- **Cross-School features** of any kind: shared content, district-wide announcements, a unified subscriber identity, or cross-School reporting.
- **Per-School sending domains and per-School email reputation isolation.** One verified sending domain for the platform.
- **Self-serve data export for Owners.** Export is a Superadmin action tied to deletion.
- **Fixing issues #48, #49, and #50.** They gate onboarding the second School, not this conversion; they are tracked separately.
- **Fixing issue #35.** It is a prerequisite to cutover and tracked separately, not delivered by this spec.
- **Per-School theming beyond name, logo, accent colour, and contact details.** No custom fonts, multiple colours, or custom CSS.
- **Per-School section toggles** (hiding Articles or Policies for a School). This overlaps issue #36 and is deferred.

## Further Notes

**This contradicts the glossary.** `CONTEXT.md` currently states, under **Author (Article)**, that attribution is "not tied to a login — the site has one shared admin credential, not individual admin accounts," and the root description says content is "managed by a single shared admin login." Both become false. The glossary needs new entries for **School**, **Owner**, **Editor**, and **Superadmin**, and the Author and Subscriber entries need revising — Subscriber is currently defined as "one shared list," which becomes one list per School. Worth a `/domain-modeling` pass rather than an incidental edit here.

**Issue #47 is closed by this work**, not alongside it. The per-resource split of the data-access module is the enforcement mechanism for tenancy, not a tidy-up done at the same time.

**Issue #51 is closed by this work** for School admins, since magic links remove the password surface. It is not fully closed: the Superadmin break-glass password still needs rate limiting.

**The branch will be large** — nine tables, a rewritten data layer, a new identity model, and routing, with no partial production feedback before cutover. ADR-0005 records the incremental alternative as the explicit fallback if the branch starts to sprawl, and that judgement should be made early rather than at the end.

**The hosting plan's non-commercial restriction is the live constraint, not wildcard support.** Wildcard subdomains are confirmed available on the free tier, so ADR-0002 is not at risk. The free tier does restrict use to non-commercial personal use, so onboarding Schools that pay requires upgrading the plan first — a billing change with no architectural consequence, but enforcement is an account pause that would take every School offline at once.

**Becoming a service provider changes the risk calculus.** Hosting other schools' meeting records and parent email addresses makes an outage or a stored-XSS hole someone else's problem as well as the operator's. That is what makes the security gate before the second School a real gate rather than a preference.
