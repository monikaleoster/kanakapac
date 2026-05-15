# Roadmap

Phases are ordered by user value delivered. Each phase should be shippable on its own. Keep phases small — a phase is done when a real user can exercise the feature end-to-end.

---

## Phase 1 — Core site ✅

**Goal:** A public-facing site with static and dynamic content, plus a working admin login.

- Homepage, About, Contact, Policies pages
- Events listing and detail pages
- Meeting Minutes archive
- Announcements listing
- Admin login (`/admin`) with password protection
- Supabase Postgres data layer (`supabase/schema.sql`) with typed read/write utilities (`src/lib/data.ts`)

---

## Phase 2 — Admin content management ✅

**Goal:** Admins can create, edit, and delete all content types without touching files.

- Admin CRUD for Events
- Admin CRUD for Meeting Minutes
- Admin CRUD for Announcements
- Admin CRUD for Policies
- Admin team management page
- Admin settings page

---

## Phase 3 — Email subscriptions ✅ / in progress

**Goal:** Families can subscribe to updates; admins can send email blasts.

- `SubscribeForm` component on public pages
- `POST /api/subscribe` — saves email to Supabase `subscribers` table
- Resend SDK integration (`src/lib/resend.ts`)
- `POST /api/send-email` — admin-triggered blast to all subscribers
- `GET /api/unsubscribe?token=` — one-click unsubscribe flow
- Admin subscribers page (view list, trigger sends)

**Remaining in this phase:**
- [ ] Admin compose UI — subject + body form that calls `/api/send-email`
- [ ] Confirmation email on subscribe (welcome message)

---
## Phase 4 — Production launch

**Goal:** The site is live at a real domain and email works end-to-end with a verified sender.

- Verify custom sender domain in Resend dashboard
- Set all production environment variables in Vercel
- Deploy to Vercel, confirm all routes work
- Smoke-test the full subscribe → announcement email → unsubscribe flow
- Set `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to production domain

---

## Phase 5 — Polish & reliability

**Goal:** The site feels professional and admins can operate it with confidence.

- Error states and loading indicators on all forms
- Empty-state UI when no events / announcements exist
- Mobile layout review across all pages
- Email preview before sending (show rendered HTML in admin)
- Subscriber count displayed in admin dashboard

---

## Phase 6 — Future enhancements

Held for after the site is live and in use. Revisit based on actual family and admin feedback.

- Event RSVP / attendance tracking
- Paginated archives for minutes and announcements
- Search across content
- Multiple admin accounts (extend NextAuth with a Supabase users table)