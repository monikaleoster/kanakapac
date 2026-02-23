# Productionization Plan — Kanaka PAC

A checklist and guide for taking the Kanaka PAC website from development to a reliable, secure production deployment.

---

## 1. Environment & Secrets Management

| Concern | Action |
|---|---|
| **Hardcoded secrets** | Move all secrets out of `.env.local`. Use your hosting provider's encrypted environment variable store (e.g. Vercel Environment Variables, AWS Secrets Manager). |
| **`NEXTAUTH_SECRET`** | Generate a cryptographically random secret (`openssl rand -base64 32`). The current value `kanaka-pac-secret-key-change-me` is **not safe for production**. |
| **`ADMIN_PASSWORD`** | Replace with a strong, unique password. Consider migrating to a proper identity provider (Google OAuth, Magic Link) in the future. |
| **`DATABASE_URL`** | Never commit. Confirm it is in `.gitignore`. Use connection pooling (Supabase provides a pooler URL on port `6543`). |
| **Service Role Key** | This key bypasses Row Level Security. Ensure it is **only** used server-side and never exposed to the browser (i.e. never prefixed with `NEXT_PUBLIC_`). |

---

## 2. Supabase Infrastructure

### Database
- **Enable Row Level Security (RLS)** on every table. Currently all tables are open because the Service Role Key bypasses RLS, but an accidental leak would expose everything.
  - Public tables (`events`, `minutes`, `announcements`, `policies`, `team_members`, `settings`): `SELECT` for `anon`, all operations for `service_role`.
  - Private tables (`subscribers`): restrict to `service_role` only.
- **Enable Point-in-Time Recovery (PITR)** on the Supabase Pro plan for database backups.
- **Connection Pooling**: Use the Supabase Supavisor pooler URL (`pooler.supabase.co:6543`) for `DATABASE_URL` in production to avoid connection exhaustion on serverless platforms.

### Storage
- **Bucket Policies**: The `minutes` bucket should have a public read policy but restrict uploads to authenticated/service-role users only.
- **File Size Limits**: Set a max upload size (e.g. 10 MB) in both the API route and Supabase Storage settings.

---

## 3. Hosting & Deployment (Vercel)

| Item | Detail |
|---|---|
| **Platform** | Vercel (recommended for Next.js) or similar serverless platform. |
| **Region** | Deploy close to your Supabase region to minimize latency. If Supabase is in `us-east-1`, deploy Vercel there too. |
| **Environment Variables** | Add all secrets (`NEXTAUTH_SECRET`, `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`) to the Vercel project settings. |
| **`NEXTAUTH_URL`** | Set to your final production domain (e.g. `https://kanakapac.ca`). |
| **Preview Deployments** | Consider using a separate Supabase project for preview/staging branches to avoid corrupting production data. |

---

## 4. Domain & SSL

- **Custom Domain**: Purchase and configure a domain (e.g. `kanakapac.ca`) and point DNS to Vercel.
- **SSL/TLS**: Vercel provides automatic SSL. Ensure HTTPS is enforced (redirect HTTP → HTTPS).
- **HSTS Header**: Add `Strict-Transport-Security` to prevent protocol downgrade attacks.

---

## 5. Security Hardening

### Authentication
- The current system uses a single shared password. For production, consider:
  - Adding rate limiting on the login endpoint to prevent brute force attacks.
  - Implementing account lockout after N failed attempts.
  - Migrating to OAuth (Google) or Magic Link authentication for stronger security.

### API Routes
- Add **rate limiting** to public-facing API routes (`/api/subscribe`, `/api/settings` GET) using middleware or a library like `next-rate-limit`.
- Validate and sanitize all user inputs server-side (already partially done).
- Add **CSRF protection** (NextAuth handles this for auth routes, but custom API routes may need explicit protection).

### Headers
Add security headers in `next.config.js`:
```js
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ],
}]
```

---

## 6. Performance & Caching

| Strategy | Where |
|---|---|
| **ISR (Incremental Static Regeneration)** | Public pages (`/events`, `/about`, `/announcements`) can use `revalidate: 60` instead of `force-dynamic` to cache responses for 60 seconds, massively reducing Supabase queries. |
| **Image Optimization** | Use Next.js `<Image>` component with proper `sizes` and `priority` attributes. Configure `remotePatterns` in `next.config.js` for Supabase Storage URLs. |
| **Bundle Size** | Run `npx next build` and review the build output. Ensure no unexpectedly large chunks. |

### Recommended Caching Change
Replace `export const dynamic = "force-dynamic"` on public pages with:
```ts
export const revalidate = 60; // Revalidate every 60 seconds
```
This serves cached pages to most visitors while still reflecting data changes within a minute.

---

## 7. Monitoring & Observability

- **Error Tracking**: Integrate [Sentry](https://sentry.io) or [LogRocket](https://logrocket.com) to capture runtime errors in production.
- **Uptime Monitoring**: Use a free service like [UptimeRobot](https://uptimerobot.com) or [Better Uptime](https://betterstack.com) to monitor the site and get alerts on downtime.
- **Analytics**: Add [Vercel Analytics](https://vercel.com/analytics) or [Plausible](https://plausible.io) for privacy-friendly traffic insights.
- **Supabase Dashboard**: Monitor query performance and database health in the Supabase project dashboard.

---

## 8. CI/CD & Quality

- **Automated Builds**: Vercel automatically builds on every push to `main`. Ensure `npm run build` passes before merging PRs.
- **Linting**: Already configured. Run `npm run lint` in CI.
- **Branch Protection**: Enable branch protection rules on `main` in GitHub to require passing builds before merge.
- **Staging Environment**: Use Vercel preview deployments with a separate Supabase project for safe testing.

---

## 9. Data & Backup Strategy

| Item | Detail |
|---|---|
| **Database Backups** | Supabase Free tier provides daily backups. Pro plan offers PITR. |
| **Seed Data** | Keep `supabase/schema.sql` and `supabase/seed.sql` versioned in Git as your source of truth for schema. |
| **Migration Strategy** | For future schema changes, use Supabase CLI migrations (`supabase migration new`) instead of editing `schema.sql` directly. |

---

## 10. Pre-Launch Checklist

- [ ] Replace `NEXTAUTH_SECRET` with a cryptographically random value
- [ ] Replace `ADMIN_PASSWORD` with a strong password
- [ ] Enable RLS on all Supabase tables
- [ ] Configure Supabase Storage bucket policies
- [ ] Set up connection pooling for `DATABASE_URL`
- [ ] Add all environment variables to Vercel
- [ ] Configure custom domain and verify SSL
- [ ] Add security headers to `next.config.js`
- [ ] Switch public pages from `force-dynamic` to `revalidate: 60`
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Test all admin flows (Create, Edit, Delete) in staging
- [ ] Test file uploads in staging
- [ ] Run `npm run build` with production env vars
- [ ] Verify `.gitignore` excludes `.env.local` and test scripts
- [ ] Remove utility scripts (`test-db.mjs`, `reload-cache.mjs`)
