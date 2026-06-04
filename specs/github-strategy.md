# GitHub CI/CD Strategy

## Overview

Two environments, two databases. All validation happens before code reaches
production. Production receives only a migration + deploy — no test workloads
hit the live database or live URL.

```
Feature Branch → PR → main → [Staging: migrate + deploy + E2E] → tag vX.Y.Z → [Production: migrate + deploy]
```

---

## Environments & Databases

| Environment | Database Secret      | Vercel Target | Triggered By        |
|-------------|----------------------|---------------|---------------------|
| Staging     | `CI_DATABASE_URL`    | Preview       | Push to `main`      |
| Production  | `PROD_DATABASE_URL`  | Production    | Push of tag `v*`    |

---

## Workflow Detail

### 1. `ci.yml` — runs on every push/PR to `main`, `feature/**`, `claude/**`

| Job                  | Depends On           | What it does |
|----------------------|----------------------|--------------|
| `test-migrations`    | —                    | Spins up a local Postgres 15 container, applies all migrations in order, asserts expected tables exist |
| `migrate-staging-db` | `test-migrations`    | Applies migrations to the staging Supabase DB. Skipped on `main` (staging.yml owns that) |
| `lint-and-typecheck` | —                    | ESLint + `tsc --noEmit` |
| `build`              | `lint-and-typecheck` | `next build` with placeholder env vars; uploads `.next/` artifact |

**Purpose:** Catch migration errors, type errors, and build failures on every
branch before anything reaches staging.

---

### 2. `staging.yml` — runs on push to `main`

| Job                  | Depends On           | What it does |
|----------------------|----------------------|--------------|
| `migrate-staging-db` | —                    | Applies all migrations to staging Supabase |
| `deploy-staging`     | `migrate-staging-db` | `vercel build` + `vercel deploy --prebuilt`; outputs preview URL |
| `e2e-tests`          | `deploy-staging`     | Installs Playwright, runs full suite against the live preview URL, uploads HTML report |

**Purpose:** The staging environment is the quality gate. Every merge to `main`
must pass E2E tests against a real deployed URL and a real database before a
production tag can be cut.

---

### 3. `production.yml` — runs on push of a `v*` tag

| Job                      | Depends On              | What it does |
|--------------------------|-------------------------|--------------|
| `migrate-production-db`  | —                       | Applies migrations to production Supabase; **requires manual approval** via GitHub environment gate |
| `deploy-production`      | `migrate-production-db` | `vercel build --prod` + `vercel deploy --prebuilt --prod` to `kanakapac.ca` |

**Purpose:** Production is intentionally minimal. By the time a tag is cut,
all validations have already passed on staging. Manual approval on the
environment gate adds a human checkpoint before the migration touches live data.

---

## Secrets Reference

| Secret               | Used In                     | Purpose                            |
|----------------------|-----------------------------|------------------------------------|
| `CI_DATABASE_URL`    | `ci.yml`, `staging.yml`     | Staging Supabase connection string |
| `PROD_DATABASE_URL`  | `production.yml`            | Production Supabase connection string |
| `VERCEL_TOKEN`       | `staging.yml`, `production.yml` | Vercel CLI authentication      |
| `ADMIN_PASSWORD`     | `staging.yml` (e2e-tests)   | Playwright admin login             |

---

## Suggested Improvements

### High Priority

**1. Add a smoke test job to `production.yml`**
After `deploy-production`, run a minimal Playwright smoke test (3–5 tests only)
against `https://kanakapac.ca` — not the full suite, but enough to confirm the
app loaded, the homepage renders, and login works. This catches deploy failures
that aren't migration-related (bad env var, Vercel config drift, etc.).

```yaml
  smoke-production:
    name: Production Smoke Test
    runs-on: ubuntu-latest
    needs: deploy-production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache-dependency-path: e2etest/package-lock.json
      - working-directory: e2etest
        run: npm ci && npx playwright install --with-deps chromium
      - working-directory: e2etest
        env:
          PLAYWRIGHT_BASE_URL: https://kanakapac.ca
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
        run: npx playwright test tests/public/homepage.spec.ts tests/admin/auth.spec.ts
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: smoke-report
          path: e2etest/playwright-report/
          retention-days: 7
```

**2. Migration idempotency**
The current migration runner replays all `.sql` files every time. On a clean
database this is fine, but on an existing database already at version N it will
attempt to re-apply older migrations and likely error or silently no-op
depending on SQL content. Use a migration tool with state tracking:

- **Option A (recommended):** `supabase db push` via the Supabase CLI — tracks
  applied migrations in a `supabase_migrations` table.
- **Option B:** Flyway or Liquibase for full versioned migration history.

Until then, all migration SQL should be written to be idempotent
(`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, etc.).

**3. Pin Vercel CLI version**
`npm install -g vercel@latest` installs whatever is latest at run time. A
Vercel CLI breaking change can silently break deploys. Pin to a specific version:

```yaml
run: npm install -g vercel@34.x
```

---

### Medium Priority

**4. Separate staging and production secrets into GitHub Environments**
Currently all secrets are repo-level. Move `PROD_DATABASE_URL` and production
`ADMIN_PASSWORD` into a `production` GitHub Environment so they are only
accessible when the environment gate is approved — reducing blast radius if a
workflow file is tampered with.

**5. Add `npm audit --audit-level=high` to `ci.yml`**
The current audit shows 7 high + 1 critical vulnerability. Add a gating step:

```yaml
- name: Security audit
  run: npm audit --audit-level=high
```

This prevents merging code that introduces new high-severity dependency issues.

**6. Cache Playwright browsers**
Playwright browser install takes ~60s on every run. Cache it:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-chromium-${{ hashFiles('e2etest/package-lock.json') }}
```

---

### Low Priority

**7. Tag creation workflow**
Currently a developer must manually run `git tag v1.2.3 && git push --tags`.
Add a GitHub Actions workflow dispatch or a script that bumps the version,
creates the tag, and pushes — removing the chance of a typo in the tag format
breaking the `v*` trigger.

**8. Notify on E2E failure**
When the `e2e-tests` job fails on staging, there is no notification beyond a
red check in GitHub. Add a Slack or email notification step so the team is
alerted immediately rather than discovering it when they next open GitHub.

---

## Decision: Does Production Need More Validation?

**Short answer: a smoke test only — not the full E2E suite.**

Rationale:

- The full E2E suite runs on staging (real DB, real deployed URL) before any
  tag is cut. If it passes there, the code is correct.
- Running the full suite against production would create test data in the live
  database and slow the release pipeline unnecessarily.
- The one failure mode staging does **not** catch is a production-specific
  configuration problem (wrong env var in Vercel production environment, DNS
  issue, production Supabase connection failure). A 3–5 test smoke check covers
  this without polluting production data.
- The manual approval gate on `migrate-production-db` is the human checkpoint
  for judgment calls (e.g. risky schema change, peak traffic window).

**Production validation checklist (manual, pre-tag):**
- [ ] All E2E tests green on staging
- [ ] Migration SQL reviewed and confirmed idempotent
- [ ] Vercel production environment variables confirmed up to date
- [ ] Not deploying during a known high-traffic window
