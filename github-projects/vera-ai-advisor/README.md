Executive AI Advisor – Dev and Deploy

Quick start
- Install deps: `npm install`
- Run dev: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

Environment
- Local dev (direct to Google Gemini API):
  - Create `.env` with: `VITE_API_KEY=YOUR_GEMINI_API_KEY`
  - Optional: `VITE_ENABLE_SEARCH=true` to enable Google Search tool in fast model mode.
- With Cloudflare Worker proxy (hides API key from the browser):
  - Deploy the Worker (see below), then set in `.env`:
    - `VITE_API_BASE=https://your-worker-subdomain.workers.dev`
  - Omit `VITE_API_KEY` from the client when using the proxy.

Cloudflare Pages (static site)
- Connect GitHub repo to Cloudflare Pages.
- Build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Node version: 18 or 20
- Environment variables (Production and Preview):
  - If using direct API: `VITE_API_KEY`
  - If using proxy: `VITE_API_BASE`

Cloudflare Worker proxy (recommended for production)
This keeps your Gemini API key server-side.

1) Files live under `cloudflare-worker/`:
   - `wrangler.toml`
   - `src/index.ts`

2) Configure and deploy
- Install Wrangler locally (optional): `npm i -g wrangler`
- From `cloudflare-worker/`:
  - `wrangler login`
  - `wrangler secret put GEMINI_API_KEY` (paste your key)
  - `wrangler deploy`

3) Update the web app
- Create/update `.env` in the web app with:
  - `VITE_API_BASE=https://<your-worker-subdomain>.workers.dev`
- Restart dev server: `npm run dev`

Notes
- Models are pinned to `gemini-2.5-flash` for stability.
- Live transcription (Gemini Live) is not proxied by the Worker in this starter; the UI will gracefully no-op when using the proxy.
- If you enable the Google Search tool, confirm your key/entitlement supports it; otherwise keep `VITE_ENABLE_SEARCH` unset.

