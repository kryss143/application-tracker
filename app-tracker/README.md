# JobLedger — Job Application Tracker

A refined, full-stack job application tracker built with Next.js 14, Supabase, and Tailwind CSS.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Server Logic:** Next.js Server Actions
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security + Auth)
- **Styling:** Tailwind CSS with custom design system
- **Language:** TypeScript

## Features

- 🔐 Email/password auth via Supabase Auth
- 📋 Kanban board with 5 status columns (Wishlist → Applied → Interview → Offer → Rejected)
- ➕ Add / Edit applications via modal form
- 🗑️ Delete with confirmation dialog
- 🔍 Real-time search + status filter + sort
- 📊 Stats bar (total, active, interviews, offers, response rate)
- 🎨 Dark, editorial aesthetic with gold accents
- 📱 Fully responsive (mobile + desktop)

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd application-tracker
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In your project, open the **SQL Editor** and run the contents of `supabase-schema.sql`.
3. Go to **Settings → API** and copy your Project URL and anon key.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Email Auth in Supabase

Go to **Authentication → Providers** and make sure **Email** is enabled.

Optionally, under **Authentication → Email Templates**, you can disable email confirmation for faster local development.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Project Structure

```
app/
├── login/page.tsx          ← Sign in page
├── signup/page.tsx         ← Sign up page
├── dashboard/
│   ├── layout.tsx          ← Auth guard + navbar
│   └── page.tsx            ← Main dashboard
├── layout.tsx              ← Root layout (fonts, metadata)
└── globals.css             ← Tailwind + custom utilities

components/
├── Navbar.tsx              ← Top navigation with sign out
├── StatsBar.tsx            ← Summary metric cards
├── KanbanBoard.tsx         ← Columns + search/filter toolbar
├── ApplicationCard.tsx     ← Individual job card
├── ApplicationForm.tsx     ← Add/edit modal form
└── DeleteDialog.tsx        ← Confirm-delete modal

lib/
├── types.ts                ← Shared TypeScript types
├── utils.ts                ← cn() utility
└── supabase/
    ├── client.ts           ← Browser Supabase client
    ├── server.ts           ← Server Supabase client (cookies)
    └── middleware.ts       ← Session refresh middleware

actions/
├── auth.ts                 ← login, signup, signout Server Actions
└── applications.ts         ← CRUD Server Actions

middleware.ts               ← Route protection + session refresh
supabase-schema.sql         ← Run this in Supabase SQL editor
```

## Deployment

Deploy to Vercel in one click:

1. Push your repo to GitHub.
2. Import in [vercel.com/new](https://vercel.com/new).
3. Add your two env vars in the Vercel dashboard.
4. Deploy.

## License

MIT
