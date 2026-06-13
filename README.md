# DSA Placement Tracker

A single Next.js app + Neon Postgres to track your 23-week placement prep
(Jun 22 → Phase 1 on Dec 1). No login — it's just for you.

## What's inside
- **Dashboard**: current week, days to Phase 1, streak, total solved, % to 271-problem target
- **Today's log**: solved count, minutes, confidence, topic, notes (one row per day)
- **By pattern**: progress bars per topic (Array, DP, Graphs…)
- **Senior recruiters**: AI Dept 2026 hiring list with per-company interview patterns & your prep focus (tap to expand)
- **Must-do 60**: highest-frequency problems from your plan, with checkboxes that persist

---

## Deploy (≈10 minutes, all free tier)

### 1. Push to GitHub
```bash
cd dsa-tracker
git init
git add .
git commit -m "DSA tracker"
# create an empty repo on github.com, then:
git remote add origin https://github.com/charanteja0017/dsa-tracker.git
git push -u origin main
```

### 2. Import to Vercel
- Go to vercel.com → **Add New → Project** → import the GitHub repo.
- Framework auto-detects as Next.js. Click **Deploy** (it'll deploy without a DB the first time — that's fine).

### 3. Attach Neon (the database)
- In your Vercel project → **Storage** tab → **Create Database** → choose **Neon** (Postgres).
- One click. Vercel injects `DATABASE_URL` into your project automatically.
- **Redeploy** the project so it picks up the new env var (Deployments → ⋯ → Redeploy).

### 4. Initialize the database (once)
- Visit `https://<your-app>.vercel.app/api/init` in your browser.
- You should see `{"ok":true,"problems":60}`. Done — tables created and seeded.

### 5. Use it
- Open the app URL. Check off problems, log your day. Everything persists.

---

## Run locally (optional)
1. Copy `.env.example` to `.env` and paste your Neon connection string
   (Vercel → Storage → your Neon DB → `.env.local` snippet, or the Neon dashboard).
2. `npm install && npm run dev` → http://localhost:3000
3. Visit http://localhost:3000/api/init once.

## Notes
- Neon scales to zero when idle, so a personal tracker costs nothing on the free tier.
- To re-seed or add problems later, edit `lib/seedData.ts` and re-visit `/api/init`
  (existing rows are skipped via `ON CONFLICT DO NOTHING`).
- Tech: Next.js 15 (App Router) · `@neondatabase/serverless` · Tailwind. TypeScript throughout.
