# JobLedger

> A refined, full-stack job application tracker — built to bring clarity and calm to your job search.

![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Overview

JobLedger is a full-stack job application tracker that helps you manage your entire job search in one place. Track every application from wishlist to offer, visualize your pipeline with a Kanban board, and measure your progress with real-time analytics — all wrapped in a dark, editorial UI.

---

## Features

| Feature                    | Description                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| 🔐 **Authentication**      | Secure email/password login via Supabase Auth                                |
| 📋 **Kanban Board**        | Drag-and-drop cards across 6 status columns with optimistic updates          |
| 📊 **Analytics Dashboard** | Status distribution donut chart, application trend line chart, and KPI cards |
| ➕ **Application CRUD**    | Add, edit, and delete applications via a polished modal form                 |
| 🗑️ **Safe Deletion**       | Confirm-delete dialog prevents accidental removals                           |
| 🔍 **Search & Filter**     | Real-time search by company or role, filter by status, sort by date          |
| 📱 **Fully Responsive**    | Optimized for mobile and desktop                                             |
| 🎨 **Dark UI**             | Editorial aesthetic with gold accents and a custom Tailwind design system    |

---

## Tech Stack

- **Framework:** Next.js (App Router) with Server Actions
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Styling:** Tailwind CSS with a custom design token system
- **Language:** TypeScript throughout
- **Charts:** Recharts (Pie/Donut + Line chart)
- **Icons:** Lucide React

---

## Project Structure

```
app-tracker/
├── app/
│   ├── globals.css             # Tailwind + custom design tokens
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Entry redirect
│   ├── dashboard/
│   │   ├── layout.tsx          # Auth guard + navbar wrapper
│   │   └── page.tsx            # Main dashboard (stats + kanban)
│   ├── kanban/
│   │   └── page.tsx            # Standalone kanban view
│   ├── login/
│   │   └── page.tsx            # Sign in page
│   └── signup/
│       └── page.tsx            # Sign up page
│
├── components/
│   ├── Navbar.tsx              # Top nav with sign out
│   ├── StatsBar.tsx            # KPI cards + donut + trend chart
│   ├── KanbanBoard.tsx         # Columns, drag-and-drop, search toolbar
│   ├── ApplicationCard.tsx     # Individual job card
│   ├── ApplicationForm.tsx     # Add / edit modal form
│   └── DeleteDialog.tsx        # Confirm-delete modal
│
├── actions/
│   ├── applications.ts         # CRUD Server Actions (get, create, update, delete, updateStatus)
│   └── auth.ts                 # Auth Server Actions (login, signup, signout)
│
├── lib/
│   ├── types.ts                # ApplicationStatus, Application, ActionResult types
│   ├── utils.ts                # cn() helper
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client (cookie-based)
│       └── proxy.ts            # Proxy client helper
│
├── supabase/
│   ├── config.toml             # Local Supabase config
│   └── migrations/
│       └── 20260601143130_migrationdb.sql
│
├── supabase-schema.sql         # Run this in Supabase SQL Editor to bootstrap the DB
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

---

## Application Statuses

JobLedger tracks applications through 6 stages:

```
Wishlist → Applied → Interview → In Progress → Offer → Rejected
```

| Status          | Color   | Meaning                          |
| --------------- | ------- | -------------------------------- |
| **Wishlist**    | Gray    | Saved for later, not yet applied |
| **Applied**     | Blue    | Application submitted            |
| **Interview**   | Amber   | Interview scheduled or completed |
| **In Progress** | Violet  | Active hiring process underway   |
| **Offer**       | Emerald | Offer received                   |
| **Rejected**    | Red     | Application closed / rejected    |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/your-username/application-tracker.git
cd application-tracker/app-tracker
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your project dashboard.
3. Paste and run the contents of `supabase-schema.sql` to create the `applications` table with Row Level Security enabled.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase project under **Settings → API**.

### 4. Enable Email Auth

In your Supabase dashboard, go to **Authentication → Providers** and confirm **Email** is enabled.

> **Tip for local development:** Under **Authentication → Email Templates**, you can disable email confirmation so you can sign up and log in instantly without needing to verify your email.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` — sign up for a new account and start tracking.

---

## Database Schema

The core table is `applications`, protected by Row Level Security so each user only sees their own data.

Key columns:

| Column          | Type          | Description                 |
| --------------- | ------------- | --------------------------- |
| `id`            | `uuid`        | Primary key                 |
| `user_id`       | `uuid`        | References `auth.users`     |
| `company_name`  | `text`        | Company name                |
| `job_title`     | `text`        | Role / position title       |
| `status`        | `text`        | One of the 6 status values  |
| `job_url`       | `text`        | Link to the job posting     |
| `location`      | `text`        | Job location                |
| `salary_range`  | `text`        | Compensation range          |
| `notes`         | `text`        | Free-form notes             |
| `applied_date`  | `date`        | When you applied            |
| `followup_date` | `date`        | Reminder date for follow-up |
| `created_at`    | `timestamptz` | Auto-set on insert          |
| `updated_at`    | `timestamptz` | Auto-updated on change      |

Run `supabase-schema.sql` in the Supabase SQL editor to create this table along with RLS policies.

---

## Deployment

### Deploy to Vercel (recommended)

1. Push your repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Set the **Root Directory** to `app-tracker`.
4. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

### Local Supabase (optional)

If you want to run Supabase locally with the included config:

```bash
npx supabase start
```

This uses `supabase/config.toml` and applies the migration in `supabase/migrations/`.

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## License

MIT — see [LICENSE](../LICENSE) for details.
