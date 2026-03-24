# grindset

A mobile-first lifestyle tracking app for logging vapes, drinks, and BAC — with a social feed, leaderboard, and friend nudges.

## Features

- **Feed** — social cards showing friends' night-out activity, BAC readings, and photos
- **Log** — track vapes, drinks, and BAC entries with timestamps
- **BAC Graph** — visualize blood alcohol over time
- **Leaderboard** — ranked friend standings with peak BAC
- **Record** — personal stats, streaks, achievements, and insights
- **Shop** — in-app shop tab
- **Auth** — email/password login and signup via Supabase

## Tech stack

- React 19 + Vite
- Supabase (auth)
- Recharts (BAC graph)
- Deployed to GitHub Pages

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Deployment

Deploys automatically to GitHub Pages on push to `master` via GitHub Actions. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set as repository secrets.
