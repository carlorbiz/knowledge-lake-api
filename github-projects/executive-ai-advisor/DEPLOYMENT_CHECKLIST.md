# Executive AI Advisor - Deployment Checklist

Use this checklist to deploy your production web app in ~2 hours.

---

## ✅ Phase 1: Database Setup (15 minutes)

- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project named "executive-ai-advisor"
- [ ] Wait for provisioning (~2 min)
- [ ] Open SQL Editor
- [ ] Copy contents of `backend/supabase-schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables created in Table Editor:
  - [ ] users
  - [ ] chat_sessions
  - [ ] messages
  - [ ] usage_analytics
  - [ ] user_context
- [ ] Go to Settings → API
- [ ] Copy Project URL (save for later)
- [ ] Copy service_role key (save for later)

---

## ✅ Phase 2: Get API Keys (10 minutes)

- [ ] **Gemini API Key**
  - [ ] Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
  - [ ] Click "Create API Key"
  - [ ] Copy key (save for later)

- [ ] **Generate JWT Secret**
  - [ ] Run: `openssl rand -base64 64`
  - [ ] Copy output (save for later - this goes in both WordPress AND backend)

- [ ] **Generate Admin API Key**
  - [ ] Run: `openssl rand -hex 32`
  - [ ] Copy output (save for later)

---

## ✅ Phase 3: Backend Setup (20 minutes)

- [ ] Clone/download project
- [ ] Open terminal in `backend/` folder
- [ ] Run: `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `.env` with your values:

```env
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_KEY=[from Supabase Settings → API]
GEMINI_API_KEY=[from Google AI Studio]
WORDPRESS_JWT_SECRET=[generated with openssl]
WORDPRESS_SITE_URL=https://your-wordpress-site.com
ADMIN_API_KEY=[generated with openssl]
ALLOWED_ORIGINS=http://localhost:5173
```

- [ ] Test locally: `npm run dev`
- [ ] Visit `http://localhost:3001/health` in browser
- [ ] Should see: `{"status":"ok"}`
- [ ] Stop server (Ctrl+C)

---

## ✅ Phase 4: WordPress Setup (20 minutes)

- [ ] **Install JWT Plugin**
  - [ ] WordPress Admin → Plugins → Add New
  - [ ] Search: "JWT Authentication for WP REST API"
  - [ ] Install and Activate

- [ ] **Configure JWT**
  - [ ] Edit `wp-config.php` on your server
  - [ ] Add before "/* That's all, stop editing! */" line:
    ```php
    define('JWT_AUTH_SECRET_KEY', 'your-jwt-secret-here');
    define('JWT_AUTH_CORS_ENABLE', true);
    ```
  - [ ] Replace `your-jwt-secret-here` with the secret you generated
  - [ ] Save file

- [ ] **Test JWT**
  - [ ] Open browser dev tools (F12)
  - [ ] Go to Console tab
  - [ ] Run:
    ```javascript
    fetch('https://your-site.com/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'your-admin-username',
        password: 'your-password'
      })
    }).then(r => r.json()).then(console.log)
    ```
  - [ ] Should see token in response

- [ ] **Install Widget Plugin**
  - [ ] Create folder: `wp-content/plugins/executive-ai-advisor/`
  - [ ] Upload `wordpress-integration/executive-ai-advisor-widget.php`
  - [ ] Upload folder `wordpress-integration/css/`
  - [ ] WordPress Admin → Plugins → Activate "Executive AI Advisor Widget"

- [ ] **Configure Widget**
  - [ ] Settings → Executive AI Advisor
  - [ ] Frontend URL: `http://localhost:5173` (for now)
  - [ ] Backend URL: `http://localhost:3001` (for now)
  - [ ] Save

---

## ✅ Phase 5: Deploy Backend (30 minutes)

### Option A: Railway (Recommended)

- [ ] Push code to GitHub
- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign up / Log in
- [ ] Click "New Project"
- [ ] Click "Deploy from GitHub repo"
- [ ] Select your repository
- [ ] Click on project → Variables tab
- [ ] Add all environment variables from your `.env`:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_KEY
  - [ ] GEMINI_API_KEY
  - [ ] WORDPRESS_JWT_SECRET (same as in wp-config.php)
  - [ ] WORDPRESS_SITE_URL
  - [ ] ADMIN_API_KEY
  - [ ] ALLOWED_ORIGINS (update with real frontend URL later)
  - [ ] NODE_ENV = `production`
- [ ] Railway will auto-deploy
- [ ] Wait for build to complete (~5 min)
- [ ] Click "Settings" → "Domains"
- [ ] Copy your public URL (e.g., `https://your-app.railway.app`)
- [ ] Save this URL!

- [ ] **Test Deployment**
  - [ ] Visit `https://your-app.railway.app/health`
  - [ ] Should see: `{"status":"ok"}`

---

## ✅ Phase 6: Deploy Frontend (20 minutes)

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Navigate to project root (parent of backend/)
- [ ] Run: `vercel`
- [ ] Follow prompts:
  - [ ] "Set up and deploy?" → Yes
  - [ ] "Which scope?" → Your account
  - [ ] "Link to existing project?" → No
  - [ ] "Project name?" → executive-ai-advisor
  - [ ] "Directory?" → ./
  - [ ] "Want to override settings?" → No
- [ ] Wait for deployment (~2 min)
- [ ] Note the URL (e.g., `https://your-app.vercel.app`)
- [ ] Save this URL!

- [ ] **Update Backend CORS**
  - [ ] Railway → Your project → Variables
  - [ ] Update `ALLOWED_ORIGINS`:
    ```
    https://your-app.vercel.app,https://your-wordpress-site.com
    ```
  - [ ] Redeploy backend (Railway will auto-redeploy)

- [ ] **Update WordPress Widget**
  - [ ] WordPress → Settings → Executive AI Advisor
  - [ ] Frontend URL: `https://your-app.vercel.app`
  - [ ] Backend URL: `https://your-app.railway.app`
  - [ ] Save

---

## ✅ Phase 7: Add Widget to WordPress (10 minutes)

- [ ] Create new page or edit existing page
- [ ] Add shortcode: `[executive_ai_advisor]`
- [ ] Publish page
- [ ] Note page URL

---

## ✅ Phase 8: End-to-End Testing (15 minutes)

- [ ] **Test Unauthenticated**
  - [ ] Open page with widget in private/incognito window
  - [ ] Should see "Please log in" message

- [ ] **Test Authenticated**
  - [ ] Log into WordPress as admin
  - [ ] Visit page with widget
  - [ ] Widget should load (may take 5-10 seconds first time)
  - [ ] Send test message: "Hello Vera"
  - [ ] Should receive AI response

- [ ] **Verify Database**
  - [ ] Supabase → Table Editor → users
  - [ ] Should see your WordPress user
  - [ ] Check chat_sessions → Should see session
  - [ ] Check messages → Should see your messages

- [ ] **Test Voice** (if microphone available)
  - [ ] Click microphone button in widget
  - [ ] Allow microphone permission
  - [ ] Speak a question
  - [ ] Should see transcription and receive response

---

## ✅ Phase 9: Configure Membership (15 minutes)

Choose your membership plugin:

### Option A: MemberPress
- [ ] Install MemberPress
- [ ] Create membership level "Premium"
- [ ] Edit `executive-ai-advisor-widget.php`
- [ ] Uncomment MemberPress check in `user_has_access()`
- [ ] Upload updated file

### Option B: Paid Memberships Pro
- [ ] Install Paid Memberships Pro
- [ ] Create membership level
- [ ] WordPress → Settings → Executive AI Advisor
- [ ] Note the level ID
- [ ] Add level ID to widget settings

### Option C: WooCommerce Subscriptions
- [ ] Install WooCommerce + Subscriptions
- [ ] Create subscription product
- [ ] Widget will auto-detect active subscriptions

- [ ] **Test Paywall**
  - [ ] Create test user without subscription
  - [ ] Log in as test user
  - [ ] Visit widget page
  - [ ] Should see "Premium members only" message

---

## ✅ Phase 10: Admin Dashboard (10 minutes)

- [ ] Visit `https://your-app.railway.app/api/admin/stats?range=7d`
- [ ] Add header: `X-Admin-Key: [your-admin-api-key]`
- [ ] Should see stats JSON

**Test with curl:**
```bash
curl -H "X-Admin-Key: your-admin-api-key" \
  https://your-app.railway.app/api/admin/stats?range=7d
```

---

## ✅ Phase 11: Production Checklist

- [ ] **Security**
  - [ ] All `.env` files in `.gitignore`
  - [ ] JWT secret is 64+ characters
  - [ ] Admin API key is strong and secret
  - [ ] HTTPS enabled on all endpoints
  - [ ] CORS restricted to your domains only

- [ ] **Performance**
  - [ ] Rate limiting enabled (check backend logs)
  - [ ] Supabase RLS policies active
  - [ ] Database indexes created (auto-created by schema)

- [ ] **Monitoring**
  - [ ] Railway logs accessible
  - [ ] Supabase logs enabled
  - [ ] Test error handling (try invalid token, bad request, etc.)

- [ ] **Backup**
  - [ ] Code pushed to GitHub
  - [ ] Supabase auto-backup enabled (default)
  - [ ] Document all API keys in password manager

---

## ✅ Launch Day

- [ ] Announce to users
- [ ] Monitor Railway logs for errors
- [ ] Monitor Supabase for performance
- [ ] Test with real users
- [ ] Collect feedback

---

## 🎉 Success Criteria

You're done when:

✅ Users can log into WordPress
✅ Premium members see AI chat widget
✅ Chat conversations persist in Supabase
✅ Responses are intelligent and contextual
✅ Voice interface works
✅ Admin dashboard shows stats
✅ Non-premium users see upgrade message

---

## 📞 Need Help?

Stuck? Check these:

1. **Backend not responding**
   - Railway logs: Click project → Deployments → View logs
   - Check all env variables set
   - Test `/health` endpoint

2. **Widget not loading**
   - Browser console (F12) for errors
   - Check CORS settings
   - Verify frontend/backend URLs in widget settings

3. **JWT errors**
   - Verify JWT secret matches WordPress & backend
   - Test JWT endpoint directly
   - Check JWT plugin is activated

4. **Database errors**
   - Supabase → Logs → Check for errors
   - Verify RLS policies not blocking inserts
   - Test direct Supabase connection

---

**Estimated Total Time: 2-3 hours**

Good luck! 🚀
