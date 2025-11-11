# Cloudflare Pages Deployment Fix

## 🎯 The Problem

The build succeeds perfectly, but deployment fails with this error:

```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
  For Pages, please run `wrangler pages deploy` instead.
```

**Root Cause:** The Cloudflare Pages project settings have a **Deploy command** configured as `npx wrangler deploy`, which is for Workers projects, not Pages projects.

---

## ✅ The Solution (5 Minutes)

### Option 1: Fix in Cloudflare Dashboard (Recommended)

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Navigate to **Workers & Pages**
   - Find and click on `mtmot-vibesdk-production`

2. **Go to Settings**
   - Click the **Settings** tab
   - Scroll to **Build & deployments** section

3. **Update Build Configuration**
   - **Build command:** `npm run build` ✅ (already correct)
   - **Build output directory:** `dist` ✅ (already correct)
   - **Deploy command:** **DELETE THIS** or leave it **EMPTY** ⚠️
   
   The deploy command should be completely empty or removed. Cloudflare Pages automatically deploys the build output.

4. **Save and Retry**
   - Click **Save**
   - Go to **Deployments** tab
   - Click **Retry deployment** on the latest failed deployment

---

### Option 2: Use Wrangler CLI (Alternative)

If you prefer to use the command line:

```bash
cd /home/ubuntu/mtmot-vibesdk-production

# Deploy directly using wrangler pages deploy
npx wrangler pages deploy dist --project-name=mtmot-vibesdk-production
```

This bypasses the automatic deployment and manually deploys the built `dist` directory.

---

## 📋 Correct Cloudflare Pages Configuration

For reference, here's what the settings should look like:

| Setting | Value |
|---------|-------|
| **Framework preset** | None (or Vite) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |
| **Environment variables** | (Set your secrets here) |
| **Deploy command** | **(EMPTY)** ← This is the key! |

---

## 🔍 Why This Happens

Cloudflare has two deployment types:

1. **Workers** - Serverless functions
   - Deploy with: `wrangler deploy`
   - Configuration: `wrangler.jsonc` or `wrangler.toml`

2. **Pages** - Static sites with optional Functions
   - Deploy with: `wrangler pages deploy <directory>`
   - Configuration: Build settings in dashboard
   - **No separate deploy command needed** - automatic deployment

Your project is a **Pages project** (it has a `dist` output directory with static assets + Functions), but the dashboard is configured to run a **Workers deploy command**.

---

## 🎉 What Happens After the Fix

Once you remove the deploy command:

1. ✅ Build runs: `npm run build`
2. ✅ Build completes in ~25 seconds
3. ✅ Cloudflare Pages automatically deploys the `dist` directory
4. ✅ Your site goes live at:
   - `https://mtmot-vibesdk-production.pages.dev`
   - `https://vibe.mtmot.com` (custom domain)

---

## 🚀 Quick Fix Commands

If you want to deploy manually right now without waiting for dashboard changes:

```bash
# Navigate to project
cd /home/ubuntu/mtmot-vibesdk-production

# Build the project
npm run build

# Deploy manually to Pages
npx wrangler pages deploy dist --project-name=mtmot-vibesdk-production --commit-dirty=true
```

This will deploy immediately and bypass the automatic deployment system.

---

## 📝 Summary

**The build is working perfectly!** The only issue is a misconfigured deploy command in the Cloudflare Pages dashboard.

**To fix:**
1. Go to Cloudflare Dashboard → Workers & Pages → mtmot-vibesdk-production → Settings
2. Remove or empty the "Deploy command" field
3. Save and retry deployment

**Or deploy manually:**
```bash
npx wrangler pages deploy dist --project-name=mtmot-vibesdk-production
```

That's it! Your AAE Dashboard will be live in minutes. 🎉
