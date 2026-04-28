# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development (frontend only, no API)
npm run dev

# Local development with serverless API (required for LLM features)
vercel dev

# Production build
npm run build

# Preview production build
npm run preview
```

Environment setup: copy `.env.example` to `.env.local` and fill in `OPENAI_API_KEY` (required) and Supabase vars (optional).

## Architecture

**Habla** is a Castilian Spanish practice app — AI-generated writing exercises with feedback, streak tracking, and workbook vocabulary.

```
src/App.jsx        ← monolithic ~1200-line React component (entire UI)
src/supabase.js    ← Supabase client (optional cloud sync)
api/llm.js         ← Vercel serverless function: proxies to OpenAI gpt-4o
```

### State & persistence

All state lives in `App.jsx` with React hooks. Persisted to `localStorage` under key `"habla_v1"`. Optional 30-minute Supabase sync for cross-device use (`user_state` table, RLS policies).

Key state: `settings` (CEFR level A1–C2, time budget), `sessions` (completed practice), `chapters` (16 workbook chapters with vocab), `grammarWeaknesses` (up to 8 tracked errors), `phase` (idle → generating → brief → transcription → analysing → feedback).

### Session flow

1. User picks level/chapters → `/api/llm` generates a Spanish writing prompt
2. User writes response
3. Response sent to `/api/llm` for scoring and feedback
4. Session saved with score, corrections, grammar issues detected

### API (`api/llm.js`)

Expects `POST { system, messages }`. Calls OpenAI `gpt-4o` with `response_format: { type: "json_object" }`, max 1000 tokens. All LLM communication goes through this proxy — never directly from the browser.

### Styling

All CSS is inline inside `App.jsx`. No CSS framework. Fonts: Playfair Display + DM Sans (Google Fonts via `index.html`).

### Spanish dialect

System prompts enforce **Castilian Spanish** (Peninsular): vosotros forms, leísmo, Spain dialect. Do not alter prompts to use Latin American Spanish.
