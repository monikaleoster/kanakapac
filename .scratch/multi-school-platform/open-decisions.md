Status: needs-info

# Multi-School Platform — Open Decisions

Everything settled in the grilling session is recorded in `spec.md` and ADRs 0002–0005. This file lists what is *not* settled: facts to verify, decisions deferred, and one inconsistency between the ADRs and the spec.

Work these first. Each has an ID so it can become a ticket or be cited in one. Nothing here should be split into implementation tickets until the **Blocking** section is cleared, because the answers change what the tickets are.

---

## Blocking — resolve before any code is written

### D-01 — Does the hosting plan support wildcard subdomains and wildcard TLS? — RESOLVED 2026-10-15

**Yes, on every plan including the free Hobby plan.** Vercel's multi-tenant limits page states under *Wildcard domains*: "**All plans**: Support for wildcard domains (e.g. `*.acme.com`)". ADR-0002 is not at risk on technical grounds and does not reopen.

**One real configuration requirement:** Vercel must be able to answer the DNS challenge to issue and renew the wildcard certificate. That means either pointing the apex at Vercel's nameservers, or delegating `_acme-challenge` to Vercel if the nameservers can't be changed. This is a setup constraint, not a plan constraint, and it is a task for the cutover runbook.

**Incidental confirmation that subdomain-only was the right call:** Hobby caps custom domains at 50 per project (Pro is unlimited). Under ADR-0002 every School is covered by the single `*.pacsolution.ca` wildcard rather than being a custom domain, so that cap is irrelevant. Under the rejected custom-domain-only model it would have become a hard ceiling at 50 Schools.

---

### D-01a — Hobby vs Pro — RESOLVED 2026-10-15

**Decision: stay on the free Hobby plan during the build; upgrade to Pro ($20/month) when Schools start paying.**

This is sound for the build phase. Vercel's Hobby plan is restricted to non-commercial personal use, with commercial defined as "any Deployment that is used for the purpose of financial gain of **anyone** involved in **any part of the production** of the project, including a paid employee or consultant writing the code." Named examples include "receiving payment to create, update, or host the site." Donations are explicitly excluded. While the operator is the only user and no money changes hands, none of that applies.

Wildcard domains work on Hobby (see D-01), so nothing about the architecture has to change on upgrade, and upgrading is a billing action with no migration.

**One gap in the stated trigger, recorded rather than argued:** the trigger is "when Schools start paying." The unclear case sits before that — hosting *other organisations'* sites for free, after the platform has a second School but before anyone pays. Vercel's fair-use page does not address that case either way, and recommends contacting support when unsure. Worth a support question at the point a non-Kanaka School is about to go live, not now.

**Make the trigger concrete rather than remembered.** Enforcement for a fair-use violation is an account or deployment pause, which would take down every School's live site at once. Two cheap safeguards:

- Treat "upgrade to Pro" as an explicit item in the onboarding checklist for the first paying School, alongside the security gate for issues #48/#49/#50.
- Note that Hobby's lower ceilings bite before any licensing question does: runtime logs retained 1 hour (vs 1 day on Pro), WAF custom rules capped at 3 (vs 40), and 100 deployments per day. The logging window in particular is a practical argument for upgrading once anyone other than the operator depends on the platform.

---

### D-02 — What is the platform's apex domain? — RESOLVED 2026-10-15

**`pacsolution.ca`.** Schools are served at `<slug>.pacsolution.ca`, with Kanaka at `kanaka.pacsolution.ca` and `kanakapac.com` redirecting there permanently. The wildcard certificate covers `*.pacsolution.ca`, and `pacsolution.ca` becomes the single verified email sending domain for the platform.

**Carried forward into setup, from D-01:** Vercel has to answer the DNS challenge to issue and renew the wildcard certificate, so `pacsolution.ca` must either use Vercel's nameservers or delegate `_acme-challenge` to Vercel at its registrar. Confirm the registrar permits whichever route is chosen.

**Unblocks:** D-03 (the sending domain is now known and can be verified), the redirect configuration, and the `*.localhost` dev convention.

---

## Blocking cutover — resolve before the release, not before the build

**All clear as of 2026-10-15.** Everything in this section is resolved; the remaining work it implies belongs in implementation tickets and the cutover runbook, not here.

### D-03 — Issue #35: outbound email — RESOLVED 2026-10-15

**Fixed.** Outbound email now works, so magic-link sign-in has a working delivery path and cutover is no longer gated on it.

**Still outstanding as build work, not as an open decision:** the per-School sender identity described in the spec. Delivery working is not the same as delivery carrying the right School's display name and reply-to address, which replaces the currently hardcoded from-address and reply-to. That belongs in an implementation ticket.

**Also carry forward:** the sending domain is `pacsolution.ca` (D-02) and needs verifying in Resend before cutover.

---

### D-04 — How does an end-to-end test obtain a magic link? — RESOLVED 2026-10-15

**Decision: hardcode a known sign-in link for the end-to-end suite rather than capturing real mail.** No inbox service, no provider sandbox.

**The guard this needs, recorded because it is the whole risk.** A hardcoded link that works is, by construction, a credential that bypasses email. If the code path serving it can run in production, it is a permanent backdoor into every School's admin area, and the blast radius is every School on the platform rather than one site. The requirement is therefore:

- The path must be absent from or inert in production builds, not merely disabled by a runtime flag that someone could set.
- It must fail closed: if the environment cannot be positively identified as test, the path does not work.
- It must be covered by a test asserting it is unavailable in a production-like build, so the guard breaking is itself a test failure rather than a silent regression.

**A strictly safer variant worth considering at implementation time, at no real cost:** have the test read the issued token directly from the database instead of hardcoding one. The test still needs no inbox, the flow exercised is the real one, and no bypass code path exists in the application at all. If that turns out to be straightforward, prefer it; if not, the hardcoded link with the guards above is acceptable.

---

### D-05 — Superadmin break-glass — RESOLVED 2026-10-15

**Decision: TOTP, not a password.** The Superadmin signs in with a time-based one-time code when email is unavailable. School admins keep magic links only. This removes stored passwords from the platform entirely and closes issue #51 more completely than a password with lockout would have.

**Three things this requires, all easy to omit:**

- **Recovery codes.** TOTP-only means the authenticator seed *is* the credential. A lost, wiped, or replaced phone locks the operator out of the one path that does not depend on email — which is precisely the scenario break-glass exists for. Single-use recovery codes, generated at enrolment and stored offline, are not optional here.
- **Rate limiting is still required, arguably more than with a password.** A six-digit code is one million combinations, and acceptance windows that allow the adjacent time step widen that further. Unthrottled, it is brute-forceable. Issue #51's rate-limiting work therefore still applies to this endpoint; TOTP changes the shape of the attack, not its existence.
- **Replay prevention.** A code that has been used must not be accepted again within its validity window.

**Worth stating plainly:** TOTP alone is a single factor — possession of the seed. That is a reasonable trade for one break-glass account that exists only for email outages, but it should be a deliberate choice rather than an assumption that "TOTP" implies two-factor.

---

### D-06 — Which email addresses become the first School's Owners? — RESOLVED 2026-10-15

**`kcpactreasurer@gmail.com`** becomes the first and initially only Owner of the Kanaka School.

**What the migration must therefore seed**, beyond the content backfill: a `users` row for that address, and a `school_members` row joining it to Kanaka with the `owner` role. Without both, the first sign-in after cutover fails for the person who most needs it to work.

**Note the overlap:** this is the same address currently hardcoded as the reply-to in the email module. That hardcoding is being replaced by a per-School reply-to drawn from settings, so the address will appear in two distinct places for two distinct reasons — as a user identity, and as Kanaka's reply-to setting. They should not be wired to each other; an Owner changing their login address must not silently change where parents' replies go.

**One Owner to start is workable** since Owners can invite further Owners, and the last Owner cannot be removed. It does mean Kanaka has no second person who can restore access if that account is lost, so adding a second Owner early is worth doing.

---

### D-17 — Who is the Superadmin, and how is the first one created? — RESOLVED 2026-10-15

**`monikaleoster@gmail.com`, seeded by the migration.** The migration inserts a `users` row for that address with the Superadmin flag set, alongside the Kanaka Owner row from D-06. Cutover therefore produces a usable platform in one step, with no manual database edit and no bootstrap gap.

**The two roles stay separate**, which is the point: the Superadmin address differs from Kanaka's Owner address, so platform operation and school administration are distinct identities even though one person holds both. The Superadmin is deliberately *not* given a `school_members` row for Kanaka — content work on Kanaka goes through impersonation like any other School, so it is audited rather than invisible.

**No TOTP deadlock.** The Superadmin is an ordinary user for sign-in purposes and logs in by magic link like everyone else; TOTP (D-05) is break-glass for when email is unavailable, not the primary path. Enrolment is therefore a post-cutover runbook step rather than a prerequisite, and nothing is locked out while it is pending.

**Two residual risks worth naming:**

- **Between cutover and TOTP enrolment there is no break-glass.** If email breaks in that window, there is no way in but the database. Enrol immediately after cutover and store the recovery codes offline before doing anything else.
- **One Superadmin is the platform's bus factor.** Recovery codes cover a lost authenticator, but not a lost or compromised Google account, which would take the operator role with it. Worth revisiting once more than one School depends on the platform.

---

## Inconsistency to resolve

### D-07 — Is a suspended School distinguishable from one that doesn't exist? — RESOLVED 2026-10-15

**Yes. A suspended School serves a plain "temporarily unavailable" notice; an unknown slug 404s.**

The disclosure this creates — confirming that a slug exists — is accepted deliberately. School slugs are school names and effectively guessable regardless, so concealing them protects nothing real, while a parent hitting a bare 404 on a site that worked last week is a genuine support problem.

**Both documents corrected.** ADR-0002's claim that the 404 "avoids disclosing whether a given slug is taken or merely suspended" was wrong and is replaced with the behaviour above and its rationale. The spec's self-contradictory sentence — which said a suspended School was "not distinguished from a nonexistent one ... beyond the notice" — is replaced to match. User story 16, user story 45, and the primary test seam already described this behaviour correctly and are unchanged.

---

## Needed before splitting into tickets

### D-08 — Glossary and context update — RESOLVED 2026-10-15

**`CONTEXT.md` rewritten.** The tenant is a **School**; the branding, contact details, and subdomain name all belong to the school rather than to the council, so School is the thing content hangs off. **PAC** is defined against it as the council of a School, one per School, whose name is displayed alongside the school's. PAC-as-tenant was considered and rejected.

**Consequence worth noting:** the spec and ADRs 0002–0005 already use School as the tenant throughout, so no rename is needed anywhere.

**Three disambiguations the rewrite introduced**, each one a collision that would otherwise have produced real bugs:

- **Member vs Team Member.** A Team Member is a publicly listed PAC executive; a Member is someone who can sign in. Neither implies the other.
- **Author vs the creating Member.** Author stays free-text display attribution; the Member who created the content is recorded but not shown. An Article may credit someone with no login.
- **Subscriber** is explicitly per School, with independent unsubscribe.

Also added: Slug, Suspension, Owner, Editor, Superadmin, Impersonation. The root description no longer claims a single shared admin login. Terms are grouped under Tenancy, People and access, and Content.

**No ADR for this.** The choice of School as tenant is the unsurprising one — a future reader seeing `school_id` in a multi-school platform will not wonder why — so it fails the "surprising without context" test even though it was a real trade-off.

---

### D-09 — Branch-size tripwire — RESOLVED 2026-10-15

**Milestone, not calendar.** The checkpoint is capability: if the per-resource data layer split and the magic-link auth model are not both passing their tests before other work is started, stop extending the branch and switch to the incremental path from ADR-0005 — nullable `school_id`, the users tables, and the scoped data layer shipped to main separately, with subdomain routing flipped last.

**Known weakness of this choice, recorded rather than argued:** a milestone trigger has no deadline, so a branch that stalls before reaching the milestone never trips it. If the two milestones have not been reached and work has gone quiet, treat the silence itself as the signal.

---

### D-10a — Reserved slugs and name collisions — RESOLVED 2026-10-15

**Slugs are derived from the school's name and chosen by the school**, rather than picked from an open namespace. Collisions with platform words are therefore unlikely by construction, so a minimal infrastructure guard suffices rather than a broad product-term blocklist: at minimum `www`, `admin`, `api`, `app`, `mail`, `static`, validated at creation.

**Duplicate school names, which are the real collision risk, are disambiguated by district or city at onboarding.** Several schools share a name across BC districts, so the second school to join takes something like `kanaka-sd42` or `kanaka-maple-ridge`, agreed with that school when it is created. The first school keeps the short slug.

**Two consequences to handle deliberately rather than discover:**

- Because slugs are immutable and retired permanently on deletion (D-10b), the disambiguated name is permanent too. The suffix should be settled in conversation with the school at onboarding, not improvised by whoever runs the creation form.
- The second school's URL is visibly longer than the first's, which can read as second-class. Worth naming plainly when onboarding them rather than letting them notice.

**Creation must therefore reject a slug that is already taken or retired**, and surface the reason, so the disambiguation conversation happens before the record exists rather than after.

---

### D-10b — Can a deleted School's slug be reused? — RESOLVED 2026-10-15

**No. Retired permanently.** Old newsletter links, cached pages, and search results pointing at a former School would otherwise resolve to a different School's content — confusing at best, and a privacy-adjacent surprise at worst, since a parent would be reading another community's material believing it to be theirs.

**Implication for deletion:** a tombstone record of the slug survives deletion, so "hard delete" means the School's content and files are destroyed while the name is retained as a gravestone. Worth stating explicitly in the deletion implementation so it is not mistaken for incomplete cleanup.

---

### D-11 — Export format — RESOLVED 2026-10-15

**A zip of CSVs plus the School's uploaded files.** One CSV per resource — events, minutes, announcements, articles, policies, team members, subscribers, settings — alongside the School's files under their original relative paths, and a manifest naming the School, the export date, and row counts. The Superadmin produces it and hands it over; nothing is retained after deletion.

**Chosen for the School's benefit, not the operator's:** CSV opens in Excel without technical help, which matters because the point of the export is giving a PAC its records back.

**Two known costs of CSV, with one worth mitigating:**

- Re-importing into the platform is lossier than JSON would be. Accepted — this is a portability artifact, not a backup.
- **Article Body is sanitized HTML and will be unreadable crammed into a CSV cell.** Writing each Article's Body to its own `.html` file beside the CSVs, with the CSV referencing the filename, keeps the archive genuinely readable. Recommended at implementation time.

---

## Can be decided during implementation

### D-12 — How far does the accent colour propagate?

One colour is settled. Unsettled: which surfaces it touches, and what guarantees contrast remains accessible when a school picks something unreadable against white. Constraining the input is cheaper than policing the output.

### D-13 — Is the audit log visible to Schools?

ADR-0004 records Superadmin impersonation so a School can see what was done on its behalf — but nothing says a School can actually read it. If it is operator-only, the stated justification is weaker than it sounds.

**Also open:** retention.

### D-14 — Maintenance window length and timing

The cutover runs three migrations plus verification. Needs an estimate, and a date that avoids an event or meeting week.

### D-15 — Safari local development

`*.localhost` does not resolve in Safari. Acceptable, or does local dev need a host-file fallback documented?

### D-16 — Cache invalidation on School status change

The spec says School lookups are cached and invalidated on create, suspend, and delete. The mechanism and its staleness window are unspecified — relevant because a suspension that doesn't take effect promptly is a visible failure.
