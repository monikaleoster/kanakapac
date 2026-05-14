# Kanaka PAC Website

The official website for the **Kanaka Parent Advisory Council (PAC)** — a hub for communications, events, meeting minutes, announcements, and policies.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js

## Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project (free tier works)

## Local Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd kanakapac
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DATABASE_URL=postgresql://postgres:<password>@db.<your-project-ref>.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_SECRET=<any-random-string>
NEXTAUTH_URL=http://localhost:3000

# Admin
ADMIN_PASSWORD=your-admin-password
```

> Get `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project under **Settings → API**.
> Get `DATABASE_URL` from **Settings → Database → Connection string (URI)**.

### 4. Set up the database

Run the schema against your Supabase project. You can do this via the Supabase SQL editor or the CLI:

```bash
# Via Supabase SQL editor — paste the contents of:
supabase/schema.sql

# Optionally seed with sample data:
supabase/seed.sql
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The admin dashboard is at [http://localhost:3000/admin](http://localhost:3000/admin).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Protected admin dashboard
│   ├── api/          # API routes
│   ├── events/
│   ├── minutes/
│   ├── announcements/
│   ├── policies/
│   ├── about/
│   └── contact/
├── components/       # Reusable UI components
└── lib/              # Data access and auth helpers
supabase/
├── schema.sql        # Database schema
└── seed.sql          # Sample data
```