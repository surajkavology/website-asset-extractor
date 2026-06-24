# Deployment Guide

**Frontend → Vercel** | **Backend → Railway**

---

## Prerequisites

- GitHub account with this repo pushed
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "chore: production deployment prep"
git push origin main
```

---

## Step 2 — Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select `website-asset-extractor`
3. When asked for the root directory, set it to: **`backend`**
4. Railway auto-detects Node.js and runs:
   - Build: `npm install && npx playwright install chromium --with-deps`
   - Start: `node server.js`
5. Wait for the deployment to turn green
6. Copy your Railway URL — it will look like:
   ```
   https://website-asset-extractor-backend.up.railway.app
   ```

### Railway Environment Variables

In Railway → your service → **Variables**, add:

| Variable | Value |
|----------|-------|
| `ALLOWED_ORIGINS` | `https://your-project.vercel.app` ← fill in after Vercel deploy |

> `PORT` is injected automatically by Railway — do not set it manually.

---

## Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `website-asset-extractor`
2. Set **Root Directory** to: **`frontend`**
3. Framework preset: **Vite** (Vercel auto-detects this)
4. Build command: `npm run build` (auto-detected)
5. Output directory: `dist` (auto-detected)

### Vercel Environment Variables

In Vercel → your project → **Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.up.railway.app/api` |

Use the Railway URL you copied in Step 2 — **no trailing slash**.

6. Click **Deploy**

---

## Step 4 — Wire CORS

After Vercel assigns your production URL (e.g. `https://website-asset-extractor.vercel.app`):

1. Go back to Railway → your backend service → **Variables**
2. Update `ALLOWED_ORIGINS` to your **actual** Vercel URL:
   ```
   ALLOWED_ORIGINS=https://website-asset-extractor.vercel.app
   ```
3. Railway will redeploy automatically

---

## Step 5 — Verify Production

```bash
# 1. Backend health check
curl https://your-backend.up.railway.app/health
# Expected: {"status":"ok"}

# 2. Open the frontend
open https://your-project.vercel.app

# 3. Test end-to-end
# Paste a URL → click Analyze → verify assets load
```

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run install-browsers   # installs Chromium
npm run dev                # starts on :5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev                # starts on :3000, proxies /api → :5000
```

The frontend `.env` is **not required locally** — Vite's dev proxy (`vite.config.js`) automatically routes `/api` to `localhost:5000`.

---

## Environment Variables Reference

### Backend (`backend/.env`)

```env
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (`frontend/.env.local`)

```env
# Only needed in production — leave empty for local dev
VITE_API_URL=https://your-backend.up.railway.app/api
```

---

## Production Checklist

- [ ] `git push origin main` — latest code on GitHub
- [ ] Railway build passes (green) — Playwright + Chromium installed
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Vercel build passes — `npm run build` exits 0
- [ ] `VITE_API_URL` set on Vercel → Railway URL
- [ ] `ALLOWED_ORIGINS` set on Railway → Vercel URL
- [ ] End-to-end test: paste a URL, verify all tabs populate
- [ ] Screenshots tab shows desktop + mobile captures
- [ ] Fonts tab shows downloadable font files
- [ ] ZIP download works
