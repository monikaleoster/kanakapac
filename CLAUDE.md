# Kanaka PAC Website

## Project Overview

This is the official website for the **Parent Advisory Council (PAC)**. It serves as the central hub for PAC communications, event management, meeting documentation, announcements, and policy information.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Storage:** JSON files in `/data` directory (file-based, no external database)
- **Authentication:** Simple admin password via environment variable `ADMIN_PASSWORD`

## Project Structure

```
/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout with header/footer
│   │   ├── page.tsx          # Homepage
│   │   ├── events/           # Events listing and detail pages
│   │   ├── minutes/          # Meeting minutes archive
│   │   ├── announcements/    # Announcements listing
│   │   ├── policies/         # PAC policies page
│   │   ├── about/            # About PAC page
│   │   ├── contact/          # Contact page
│   │   └── admin/            # Admin dashboard (protected)
│   │       ├── page.tsx      # Admin login/dashboard
│   │       ├── events/       # Manage events
│   │       ├── minutes/      # Manage minutes
│   │       └── announcements/# Manage announcements
│   ├── components/           # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── EventCard.tsx
│   │   ├── AnnouncementCard.tsx
│   │   └── MinutesCard.tsx
│   └── lib/                  # Utility functions and data access
│       ├── data.ts           # Read/write JSON data files
│       └── auth.ts           # Admin authentication helpers
├── data/                     # JSON data storage
│   ├── events.json
│   ├── minutes.json
│   └── announcements.json
├── public/                   # Static assets
└── CLAUDE.md                 # This file
```

## Key Features

1. **Events Management** - Admin can create, edit, and delete events. Public users see upcoming and past events.
2. **Meeting Minutes** - Archive of PAC meeting minutes with date, title, and content. Admin can upload/post new minutes.
3. **Announcements** - Time-sensitive announcements displayed prominently. Admin can post and manage.
4. **PAC Policies** - Static page displaying PAC bylaws, policies, and governance documents.
5. **About Page** - Information about the PAC, its mission, and current executive members.
6. **Contact Page** - Contact form and PAC contact information.
7. **Admin Dashboard** - Password-protected area for managing all dynamic content.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Data Format

All data is stored as JSON arrays in the `/data` directory.

### Events (`data/events.json`)
```json
[{
  "id": "string",
  "title": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "string",
  "description": "string",
  "createdAt": "ISO date string"
}]
```

### Minutes (`data/minutes.json`)
```json
[{
  "id": "string",
  "title": "string",
  "date": "YYYY-MM-DD",
  "content": "string (markdown)",
  "createdAt": "ISO date string"
}]
```

### Announcements (`data/announcements.json`)
```json
[{
  "id": "string",
  "title": "string",
  "content": "string",
  "priority": "normal | urgent",
  "publishedAt": "ISO date string",
  "expiresAt": "ISO date string | null"
}]
```

## Conventions

- Use server components by default; add `"use client"` only when interactivity is needed.
- API routes live under `src/app/api/` and handle data mutations.
- Keep components small and focused.
- Use Tailwind utility classes for all styling — no separate CSS files.
- All dates displayed in a human-readable format (e.g., "February 11, 2026").
- Admin routes are protected via session cookie validated against `ADMIN_PASSWORD`.
