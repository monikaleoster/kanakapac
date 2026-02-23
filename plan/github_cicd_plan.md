# GitHub Actions CI/CD Pipeline Plan — Kanaka PAC

A plan for automated testing, building, and deployment using GitHub Actions with isolated databases per environment.

---

## Overview

```
Developer Push / PR
        │
        ▼
┌───────────────────┐
│  GitHub Actions   │
│  CI Pipeline      │
│  - Lint           │
│  - Type Check     │
│  - Build          │
└────────┬──────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
 PR Branch   main branch
 (lint+build  Production
  only, no    Deploy
  DB needed)  (Prod DB)
```

---

## 1. Environment & Database Strategy

Two isolated environments, each with its own Supabase project:

| Environment | Branch        | Supabase Project    | Vercel Environment |
|-------------|---------------|---------------------|--------------------|
| **Staging** | `main` merge  | `kanakapac-staging` | Preview            |
| **Production** | release tag | `kanakapac-prod`  | Production         |

**Why two databases?**
- Staging lets you verify migrations and preview the app before touching production.
- Production is only updated after staging passes.

**CI (PRs) uses no database** — the build step uses placeholder env vars since Next.js
pages are server-rendered at request time, not at build time. No DB connection is needed
to produce a successful build artifact.

### Supabase Projects to Create

1. **`kanakapac-staging`** — mirrors production schema; used for preview deployments.
2. **`kanakapac-prod`** — live production data; only updated via tagged release.

---

## 2. Secrets Strategy

**Rule:** GitHub Secrets hold only what GitHub Actions itself needs to operate. Runtime app configuration lives exclusively in Vercel Environment Variables. This avoids duplication and makes Vercel the single source of truth for the deployed app.

| Secret | Where | Reason |
|--------|-------|--------|
| Vercel deployment tokens | GitHub Secrets only | Actions-specific, app never needs them |
| Staging/Prod `DATABASE_URL` | GitHub Secrets only | Needed by `psql` migration commands in workflows |
| All other runtime secrets | Vercel Environment Variables only | Read at request time by the running Next.js app |

The `vercel pull` command (run before `vercel build`) downloads the Vercel env vars into the build context, so runtime secrets never need to be duplicated into GitHub.

---

### 2a. GitHub Repository Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

```
# Vercel deployment
VERCEL_TOKEN      = <VERCEL_TOKEN>
VERCEL_ORG_ID     = <VERCEL_ORG_ID>
VERCEL_PROJECT_ID = <VERCEL_PROJECT_ID>

# Staging DB URL — used only by psql migration command, not at runtime
STAGING_DATABASE_URL = <STAGING_DATABASE_URL>

# Production DB URL — used only by psql migration command, not at runtime
PROD_DATABASE_URL = <PROD_DATABASE_URL>
```

---

### 2b. Vercel Environment Variables

Configure in **Vercel → Project → Settings → Environment Variables**, scoped per environment:

```
# Preview environment (staging — kanakapac-staging Supabase project)
NEXT_PUBLIC_SUPABASE_URL  = <NEXT_PUBLIC_SUPABASE_URL>
   = eyJ...  (staging key)
DATABASE_URL              = postgresql://...staging...
NEXTAUTH_SECRET           = <random-32-bytes>
NEXTAUTH_URL              = https://kanakapac-staging.vercel.app
ADMIN_PASSWORD            = <staging-password>

# Production environment (kanakapac-prod Supabase project)
NEXT_PUBLIC_SUPABASE_URL  = <NEXT_PUBLIC_SUPABASE_URL>
SUPABASE_SERVICE_ROLE_KEY = eyJ...  (production key)
DATABASE_URL              = postgresql://...prod...
NEXTAUTH_SECRET           = <random-32-bytes>
NEXTAUTH_URL              = https://kanakapac.ca
ADMIN_PASSWORD            = <strong-production-password>
```

---

## 3. Branch & Workflow Strategy

```
feature/* ──► PR ──► main ──► tag vX.Y.Z ──► production
                 │                │
                 │                └── staging deploy (automatic)
                 └── CI checks (lint + build only)
```

- **Feature branches** → open a PR → triggers CI workflow (lint, type check, build — no DB).
- **Merge to `main`** → triggers staging deploy workflow.
- **Push a version tag** (`v1.0.0`) → triggers production deploy workflow.

---

## 4. Workflow Files

### 4.1 CI Workflow — `.github/workflows/ci.yml`

Triggers on every PR and push to `main`. Runs lint, type check, and build using placeholder
env vars — no database connection required.

```yaml
name: CI

on:
  push:
    branches: [main, "claude/**"]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript type check
        run: npx tsc --noEmit

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    env:
      # Placeholder values — build does not query the DB at build time
      NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
      SUPABASE_SERVICE_ROLE_KEY: placeholder-key
      DATABASE_URL: postgresql://postgres:placeholder@localhost:5432/postgres
      NEXTAUTH_SECRET: ci-secret-not-used-in-production
      NEXTAUTH_URL: http://localhost:3000
      ADMIN_PASSWORD: ci-test-password
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js app
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: nextjs-build
          path: .next/
          retention-days: 1
```

### 4.2 Staging Deploy — `.github/workflows/staging.yml`

Triggers when a PR merges to `main`. Runs DB migration on staging, then deploys to Vercel preview.

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  migrate-staging-db:
    name: Migrate Staging Database
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Apply schema migrations to staging DB
        run: |
          psql ${{ secrets.STAGING_DATABASE_URL }} -f supabase/schema.sql
        # For incremental migrations (future), use:
        # npx supabase db push --db-url ${{ secrets.STAGING_DATABASE_URL }}

  deploy-staging:
    name: Deploy to Vercel Staging
    runs-on: ubuntu-latest
    needs: migrate-staging-db
    environment:
      name: staging
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment (downloads staging secrets from Vercel)
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build for Vercel
        # Runtime secrets come from `vercel pull` above — no duplication needed
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$URL" >> $GITHUB_OUTPUT

      - name: Comment staging URL on PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ Staging deploy ready: ${{ steps.deploy.outputs.url }}`
            })
```

### 4.3 Production Deploy — `.github/workflows/production.yml`

Triggers on a version tag push (`v*`). Runs DB migration on production, then deploys.

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - "v*"

jobs:
  migrate-production-db:
    name: Migrate Production Database
    runs-on: ubuntu-latest
    environment: production   # requires manual approval in GitHub
    steps:
      - uses: actions/checkout@v4

      - name: Apply schema migrations to production DB
        run: |
          psql ${{ secrets.PROD_DATABASE_URL }} -f supabase/schema.sql
        # For incremental migrations (future), run in order:
        # psql ${{ secrets.PROD_DATABASE_URL }} -f supabase/migrations/001_initial.sql
        # psql ${{ secrets.PROD_DATABASE_URL }} -f supabase/migrations/002_add_column.sql

  deploy-production:
    name: Deploy to Vercel Production
    runs-on: ubuntu-latest
    needs: migrate-production-db
    environment:
      name: production
      url: https://kanakapac.ca
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment (downloads production secrets from Vercel)
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build for Vercel
        # Runtime secrets come from `vercel pull` above — no duplication needed
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 5. GitHub Environment Protection Rules

Configure in **GitHub → Settings → Environments**:

| Environment | Protection Rules |
|-------------|-----------------|
| `staging`   | No restrictions — auto-deploys on merge to `main`. |
| `production` | **Required reviewers** (1 PAC admin must approve). Deployment only from `main` or version tags. |

This ensures production deploys always have a human approval step.

---

## 6. Branch Protection Rules

Configure in **GitHub → Settings → Branches → Add rule** for `main`:

- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - Required checks: `Lint & Type Check`, `Build`
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings

---

## 7. Database Migration Strategy

### Current State (schema.sql approach)
The `supabase/schema.sql` file is idempotent-safe for initial setup. For now, run it on every deploy — PostgreSQL will error if tables already exist, so use `CREATE TABLE IF NOT EXISTS` in the schema file.

**Action required:** Update `supabase/schema.sql` to use `IF NOT EXISTS`:
```sql
CREATE TABLE IF NOT EXISTS events ( ... );
CREATE TABLE IF NOT EXISTS minutes ( ... );
-- etc.
```

### Future: Incremental Migrations
As the schema evolves, adopt a numbered migration file approach:

```
supabase/
├── schema.sql          # Full schema (source of truth for new DBs)
└── migrations/
    ├── 001_initial.sql
    ├── 002_add_file_url_to_minutes.sql
    └── 003_add_subscribers_table.sql
```

Migrations run in order; once merged, a migration is never edited — only new migrations are added.

---

## 8. Rollout Sequence

1. **Create two Supabase projects** — Staging and Production.
2. **Run `schema.sql`** in the Staging project via Supabase SQL editor.
3. **Add Vercel Environment Variables** for Preview and Production environments (Section 2b).
4. **Add GitHub Secrets** — Vercel tokens and DB URLs for migrations (Section 2a).
5. **Configure GitHub Environments** (Section 5) with protection rules.
6. **Create the three workflow files** under `.github/workflows/`.
7. **Enable branch protection** on `main` (Section 6).
8. **Update `schema.sql`** to use `IF NOT EXISTS` (Section 7).
9. **Test the pipeline** by opening a draft PR and watching the CI workflow run (lint + build only).
10. **Merge to `main`** and verify the staging deploy workflow triggers.
11. **Tag a release** (`git tag v1.0.0 && git push --tags`) and approve the production deploy.

---

## 9. Quick Reference

```
Open PR        → CI runs lint + build (no DB, placeholder env vars)
Merge to main  → Staging DB migrated → Vercel preview deployed
Push tag v*    → (Human approval) → Prod DB migrated → Vercel prod deployed
```
