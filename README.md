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

All session history is stored in `localStorage` — no database needed.

---

## Roadmap ideas

- [ ] Audio recording directly in the browser (Web Audio API)
- [ ] Whisper API integration for in-app transcription
- [ ] Progress charts (score over time per grammar concept)
- [ ] Export session as PDF for offline review
- [ ] PWA support (full offline home screen app)
