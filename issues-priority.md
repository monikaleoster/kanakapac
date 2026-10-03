# Issues Priority

Ranking framework (agreed 2026-09-22):
- Live site, solo maintainer, no external deadline — backlog-grooming pass, not incident response.
- Security severity leads, but functional breaks (e.g. broken subscriber emails) compete on real-world impact, not just label.
- Tech debt is interleaved by how likely it is to cause a real bug, not dumped at the bottom wholesale.
- Docs debt is bundled together near the bottom as one cheap batch fix.
- Issues with no real spec, or work already completed, are flagged separately rather than ranked.

## Tier 1 — Security, live-site risk

1. **#48** — Stored XSS in meeting minutes via `dangerouslySetInnerHTML` — High severity, live site, any admin-posted minutes content is an attack vector.
2. **#51** — No brute-force protection on admin login — Medium, direct path to full admin takeover.
3. **#50** — Contact form usable as anonymous mailer — Medium, reputational/abuse risk on a public form.
4. **#49** — No rate limiting on public write endpoints (subscribe/rsvp/contact) — Medium, same abuse surface as #50, cheap to fix together.

## Tier 2 — Functional break

5. **#35** — Subscriber emails not working on staging — real broken feature, root-caused already to a likely env/config issue, fast fix. Held back from Tier 1 only because it's staging, not prod.

## Tier 3 — High-risk tech debt + remaining security

6. **#43** — RSVP state machine reimplemented in 3 components — highest bug-risk debt item; divergent logic across surfaces produces real inconsistent behavior.
7. **#52** — Unhandled JSON parse errors return raw 500s — Low-Medium security/correctness, easy fix, improves resilience.
8. **#42** — Duplicated CRUD boilerplate, inconsistent team-vs-other semantics — active correctness risk, not just style.

## Tier 4 — Lower-severity security + correctness

9. **#53** — Unescaped admin content in bulk emails — Low, admin-only trust boundary.
10. **#54** — Settings API validation comment is misleading — Low correctness, easy fix, prevents future confusion.

## Tier 5 — Remaining tech debt

11. **#47** — `data.ts` mixes 7 resource concerns (728 lines) — maintainability/velocity drag, not itself a live bug.
12. **#45** — `saveArticle()` mixes publish-decision logic into generic upsert.
13. **#44** — Status/priority unions redefined inline in multiple files.

## Tier 6 — Features/polish

14. **#36** — Hide Events/Announcements sections when empty — small UX polish, enhancement.
15. **#60** — Meeting minutes should support PDF file upload — re-adding a previously removed feature (see `.grill-me` history in the issue); real admin content-maintenance value, but requires a Supabase migration, new storage bucket, and backfilling existing minutes rows before it ships, so not urgent.
16. **#37** — Add profile photos for team members — content feature, no urgency.
17. **#59** — Missing e2e coverage for homepage magazine-hub — already labeled backlog, test debt, not user-facing.

## Tier 7 — Docs debt (bundle into one pass)

18. **#40** — CLAUDE.md stale (missing Articles/Team/Subscribers/Settings/Contact, real schema).
19. **#39** — CLAUDE.md says session-cookie auth, code uses NextAuth.
20. **#46** — DEVELOPER_WIKI.md out of date.
21. **#41** — `/admin/articles` middleware route undocumented.

## Flagged, not ranked (recommend closing or re-filing)

- **#30** — Apply DB changes to prod. Rollout already done per user confirmation.
- **#34** — Run staging seed data script. Same rollout, likely done.
- **#25** — "Validate-manual test" — empty, no description/labels.
- **#27** — "Event upload new photo" — empty, just leftover scratch notes about a branch/plan.
