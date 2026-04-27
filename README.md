# habla 🇪🇸

> A daily Castilian Spanish practice coach powered by Claude AI.

Habla generates personalised speaking and writing exercises, tracks your grammar weaknesses over time, and gives structured feedback on your transcribed responses — all in Peninsular Spanish.

---

## Features

- **CEFR levels** A1 → C2 with adaptive content
- **Skill focus** — Speaking, Writing, or Both per session
- **Time budget** — 5, 15, or 30 minute sessions
- **Grammar weakness tracker** — silently targets your recurring errors
- **Structured feedback** — corrections, score (%), and natural phrasing tips
- **Calendar view** — streak tracking, tap any day to review sessions
- **History** — full session log with retry support
- **Castilian Spanish** — vosotros, Peninsular vocabulary throughout
- **Optional cloud sync** — Supabase email/password auth + cross-device state sync every 30 minutes

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/habla.git
cd habla
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

```bash
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key
```

Get your key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) on your phone (same WiFi) or browser.

> **Note:** For the API proxy to work locally, install the Vercel CLI:
> ```bash
> npm i -g vercel
> vercel dev
> ```
> This runs both the frontend and the `/api/claude` serverless function together.

---

## Deployment (Vercel)

### First deploy

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   - Key: `OPENAI_API_KEY`
   - Value: your key from console.anthropic.com
5. Click **Deploy**

Vercel will give you a URL like `habla-xyz.vercel.app`. Add it to your phone's home screen.

### Subsequent deploys

```bash
git add .
git commit -m "your change"
git push
```

Vercel auto-deploys on every push to `main`.

---

## Project Structure

```
habla/
├── api/
│   └── claude.js          # Vercel serverless function (API proxy)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx           # React entry point
│   └── App.jsx            # Full application
├── .env.example           # Environment variable template
├── .gitignore
├── index.html
├── package.json
├── vercel.json            # Vercel routing config
└── vite.config.js
```

---

## How it works

1. **Generate** — Claude picks a topic suited to your CEFR level, avoids recent topics, and subtly targets your grammar weak points
2. **Prepare** — You get vocab + grammar rules, then record yourself (Whisper or similar) or write your response
3. **Paste** — Transcription goes into the app
4. **Feedback** — Claude analyses against Castilian Spanish standards: corrections, score, and fluency tips

By default, session history is stored in `localStorage`. If Supabase is configured, the app syncs state to the cloud for the signed-in user.

---

## Supabase setup (free tier)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run:

```sql
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "user can read own state"
on public.user_state for select
using (auth.uid() = user_id);

create policy "user can insert own state"
on public.user_state for insert
with check (auth.uid() = user_id);

create policy "user can update own state"
on public.user_state for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

3. In Supabase **Authentication > Providers**, keep **Email** enabled.
4. Add frontend env vars:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. Restart the app and go to **Settings → Cloud sync** to create/sign in with email/password.

### Detailed setup checklist (copy/paste)

Use this as an exact sequence:

- [ ] **Create project**
  - [ ] Go to Supabase dashboard → **New project**
  - [ ] Choose org, project name, strong DB password, and region closest to you
  - [ ] Wait until project status is **healthy**

- [ ] **Get keys and URL**
  - [ ] Open **Project Settings → API**
  - [ ] Copy:
    - [ ] **Project URL** → will be `VITE_SUPABASE_URL`
    - [ ] **anon public key** → will be `VITE_SUPABASE_ANON_KEY`
  - [ ] Do **not** use service role key in frontend

- [ ] **Create database table + policies**
  - [ ] Open Supabase dashboard for your project → left sidebar → **SQL Editor**
  - [ ] Click **+ New query**
  - [ ] Paste the SQL block above
  - [ ] Click **Run**
  - [ ] Confirm table exists in **Table Editor → public.user_state**
  - [ ] Confirm RLS is enabled for `user_state`

- [ ] **Configure Auth (email/password)**
  - [ ] Open **Authentication → Providers**
  - [ ] Ensure **Email** is enabled
  - [ ] (Optional) Turn off email confirmation for faster local testing in **Authentication → Settings**

- [ ] **Set local environment variables**
  - [ ] Copy `.env.example` to `.env.local`
  - [ ] Fill values:
    ```bash
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
  - [ ] Save file

- [ ] **Install and run app**
  - [ ] `npm install`
  - [ ] `npm run dev` (or `vercel dev` if you need local serverless route behavior)
  - [ ] Open app → **Settings → Cloud sync**

- [ ] **Create user and sync**
  - [ ] Enter your email + password
  - [ ] Click **Create account** (first time), then **Sign in**
  - [ ] Generate a session or change settings/chapter data
  - [ ] Click **Sync now**
  - [ ] In Supabase **Table Editor**, verify a row appears in `public.user_state`

- [ ] **Verify cross-device behavior**
  - [ ] Open the app on second device/browser
  - [ ] Sign in with the same email/password
  - [ ] Confirm your sessions/settings/chapters appear after initial pull
  - [ ] Confirm updates sync automatically every ~30 minutes or when you press **Sync now**

### Deploy checklist (Vercel)

- [ ] In Vercel project settings, add:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `OPENAI_API_KEY`
- [ ] Redeploy
- [ ] On production URL, sign in once and run **Sync now**
- [ ] Confirm data row creation in Supabase table

### Troubleshooting checklist

- [ ] **“Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY” still showing**
  - [ ] Restart dev server after editing `.env.local`
  - [ ] Verify variable names start with `VITE_`
- [ ] **Auth errors**
  - [ ] Ensure Email provider is enabled
  - [ ] If confirmation is required, verify email before signing in
- [ ] **Sync errors / permission denied**
  - [ ] Verify table name is exactly `user_state`
  - [ ] Re-run RLS policy SQL
  - [ ] Ensure logged-in user owns the row (`user_id = auth.uid()`)

---

## Roadmap ideas

- [ ] Audio recording directly in the browser (Web Audio API)
- [ ] Whisper API integration for in-app transcription
- [ ] Progress charts (score over time per grammar concept)
- [ ] Export session as PDF for offline review
- [ ] PWA support (full offline home screen app)
