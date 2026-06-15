# CDSA — DSA Placement Tracker

A single Next.js app + Neon Postgres that tracks a 23-week DSA placement-prep plan
(271 NeetCode-style problems, Jun 22 → Phase 1 on Dec 1). The dashboard is **public to
view**; checking problems off is locked behind a password.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/charanteja0017/dsa-tracker&env=DATABASE_URL,EDIT_PASSWORD&envDescription=Neon%20Postgres%20connection%20string%20and%20a%20password%20that%20unlocks%20editing)

## What's inside
- **Hero stats** — solved / streak / % complete, all derived from when you check problems off
- **Contribution heatmap + pace chart** — activity per day, actual vs. ideal pace to finish
- **This Week focus** — the current week's problems as a checklist (LeetCode + YouTube links)
- **Study plan** — week → pattern → problem accordion with difficulty + topic filters
- **By pattern** bars and a LeetCode-style **difficulty ring**
- **Senior recruiters** — interview patterns + prep focus per company
- **Edit lock** — viewing is public; editing needs a password (fails closed if unset)

---

## Deploy your own (free tier, ~10 min)

You bring two things of your own: a **Neon Postgres** database and a password.

### Option A — one click
1. Create a free **Neon** database at [neon.tech](https://neon.tech) and copy its
   **pooled connection string**.
2. Click **Deploy with Vercel** above. When prompted for env vars, paste:
   - `DATABASE_URL` = your Neon connection string
   - `EDIT_PASSWORD` = any password you choose (unlocks editing)
3. After it deploys, open `https://<your-app>.vercel.app/api/init` once — you should see
   `{"ok":true,"problems":271,...}` (creates the tables and loads the problems).
4. On the site, click **🔒 Locked** (top-right) → enter your password to enable the checkboxes.

### Option B — use this template
1. **Use this template → Create a new repository** (your own repo, not a fork).
2. Import it into Vercel (**Add New → Project**).
3. Add **Storage → Neon** (auto-injects `DATABASE_URL`) and add an `EDIT_PASSWORD`
   environment variable, then **Redeploy**.
4. Visit `/api/init` once, then unlock editing as above.

> ⚠️ Set **both** env vars **before the first deploy**: the build needs `DATABASE_URL`,
> and editing stays locked until `EDIT_PASSWORD` is set.

---

## Run locally
1. `cp .env.example .env` and fill in `DATABASE_URL` (Neon) + `EDIT_PASSWORD`.
2. `npm install && npm run dev` → http://localhost:3000
3. Visit http://localhost:3000/api/init once to seed.

## Customizing the problem set
Edit `lib/seedData.ts` (problems + `WEEK_TOPICS`) and re-visit `/api/init`. Re-seeding
**upserts** by title and drops problems no longer in the seed, but never touches your
`done` / `done_at` — so your progress survives.

## Tech
Next.js 15 (App Router) · TypeScript · Tailwind · `@neondatabase/serverless` · recharts ·
`@uiw/react-heat-map`. All stats derive from `problems.done_at` (no separate activity log).
