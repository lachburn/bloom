# 🌸 Bloom — Personal Habit Tracker PWA

A premium, mobile-first Progressive Web App built with React + Vite, Tailwind CSS, Supabase, and Framer Motion. Designed to feel like a native iOS app when saved to the home screen.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Generate app icons (requires sharp)

```bash
npm install -D sharp
node scripts/generate-icons.mjs
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `src/lib/database.sql`
3. In **Settings → API**, copy your Project URL and anon key

### 4. Configure environment

```bash
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add your env vars in Vercel Dashboard → Project → Settings → Environment Variables.

---

## Push Notifications (optional)

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add `VITE_VAPID_PUBLIC_KEY` to `.env.local`
3. Add `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, and `VAPID_SUBJECT` to Supabase Edge Function secrets
4. Deploy the edge function:
   ```bash
   supabase functions deploy send-notifications
   ```
5. Schedule it via Supabase Dashboard → Edge Functions → Schedules

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion |
| Auth & DB | Supabase (magic link auth, PostgreSQL) |
| State | Zustand |
| PWA | vite-plugin-pwa + Workbox |
| Deployment | Vercel |
| Fonts | Playfair Display + DM Sans |

## Database Schema

See `src/lib/database.sql` for the full schema with RLS policies.

- **users** — profile, notification time, water defaults
- **habits** — name, emoji, type, config (JSONB), sort order
- **habit_logs** — daily completion records with value tracking

## Habit Types

| Type | Config | UI |
|------|--------|-----|
| `boolean` | — | Single "Mark done" button |
| `timed` | `duration_minutes` | Start/stop timer with progress bar |
| `quantity` | `goal`, `unit`, `increment` | Fill bar with +increment button |
| `count` | `goal`, `unit` | Counter with +1 button |
