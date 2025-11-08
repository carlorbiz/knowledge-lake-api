# Executive AI Advisor - Production Setup Guide

Complete guide to deploying the Executive AI Advisor as a production web app with WordPress paywall integration.

## Architecture Overview

```
WordPress Site (Paywall)
    ↓ JWT Authentication
Backend API (Express + TypeScript)
    ↓ Authenticated Requests
React Frontend (Vite)
    ↓ AI Queries
Google Gemini AI + Supabase Database
```

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Gemini API key
- WordPress site with JWT Authentication plugin
- Domain/hosting for deployment (Railway, Vercel, or similar)

---

## Part 1: Supabase Database Setup

### Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **New Project**
3. Name it: `executive-ai-advisor`
4. Choose region closest to your users
5. Set a strong database password (save it!)
6. Wait for project to provision (~2 minutes)

### Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open file: `backend/supabase-schema.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run**
6. Verify tables created: Go to **Table Editor** → should see:
   - `users`
   - `chat_sessions`
   - `messages`
   - `usage_analytics`
   - `user_context`

### Step 3: Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **service_role key** (under "Project API keys")

---

## Part 2: Backend API Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# WordPress JWT Configuration
WORDPRESS_JWT_SECRET=your-wordpress-jwt-secret
WORDPRESS_SITE_URL=https://your-wordpress-site.com

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-wordpress-site.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**How to get each value:**

- **GEMINI_API_KEY**: Get from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **WORDPRESS_JWT_SECRET**: Set in WordPress (see Part 3)
- **WORDPRESS_SITE_URL**: Your WordPress site URL
- **ALLOWED_ORIGINS**: Comma-separated list of domains that can access your API

### Step 3: Build and Test Locally

```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build

# Run production build
npm start
```

Test health endpoint:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T...",
  "environment": "production"
}
```

---

## Part 3: WordPress JWT Setup

### Step 1: Install JWT Authentication Plugin

1. In WordPress admin, go to **Plugins** → **Add New**
2. Search for: **JWT Authentication for WP REST API**
3. Install and activate

### Step 2: Configure JWT Plugin

Edit `wp-config.php` and add:

```php
define('JWT_AUTH_SECRET_KEY', 'your-super-secret-key-here-min-64-chars');
define('JWT_AUTH_CORS_ENABLE', true);
```

**Important**: Generate a strong secret key (64+ characters). Example:
```bash
openssl rand -base64 64
```

Copy this secret and use it as `WORDPRESS_JWT_SECRET` in your backend `.env`

### Step 3: Create JWT Endpoint (Optional Custom Endpoint)

If you need custom user data in JWT, add to `functions.php`:

```php
add_filter('jwt_auth_token_before_dispatch', function($data, $user) {
    $data['data']['user']['firstName'] = get_user_meta($user->ID, 'first_name', true);
    $data['data']['user']['lastName'] = get_user_meta($user->ID, 'last_name', true);
    return $data;
}, 10, 2);
```

### Step 4: Test JWT Authentication

```bash
# Get JWT token
curl -X POST https://your-wordpress-site.com/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

Should return:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_email": "user@example.com",
  "user_nicename": "username",
  ...
}
```

---

## Part 4: Deploy Backend API

### Option A: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will detect Node.js and auto-deploy
5. Add environment variables:
   - Go to project → **Variables**
   - Add all values from your `.env` file
6. Set start command: `npm run build && npm start`
7. Note your deployed URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Vercel (Serverless)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts to link project
4. Add environment variables: `vercel env add`
5. Deploy: `vercel --prod`

### Option C: Deploy to VPS (DigitalOcean, AWS, etc.)

```bash
# On your server
git clone your-repo
cd executive-ai-advisor/backend
npm install
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start dist/server.js --name "executive-ai-advisor"
pm2 save
pm2 startup
```

Setup nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Part 5: Frontend Configuration

### Step 1: Update Frontend Environment

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-api-url.com
VITE_WORDPRESS_URL=https://your-wordpress-site.com
```

### Step 2: Update Frontend API Client

Create `frontend/src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = {
  async sendMessage(sessionId: string | undefined, message: string, token: string) {
    const response = await fetch(`${API_URL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId, message })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  async getSessions(token: string) {
    const response = await fetch(`${API_URL}/api/chat/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  },

  // Add more API methods as needed
};
```

### Step 3: Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with your production build.

### Step 4: Deploy Frontend

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
1. Drag and drop `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Or use Netlify CLI

**Option C: GitHub Pages**
```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## Part 6: WordPress Integration (Paywall)

### Method 1: Iframe Embed

Create `wordpress-widget.php`:

```php
<?php
// Shortcode: [executive_ai_advisor]

add_shortcode('executive_ai_advisor', function($atts) {
    // Check if user has active subscription
    if (!current_user_can('read') || !user_has_active_subscription()) {
        return '<p>Please subscribe to access Executive AI Advisor.</p>';
    }

    // Generate JWT token for current user
    $user = wp_get_current_user();
    $token = generate_jwt_token_for_user($user);

    // Embed iframe with token
    return sprintf(
        '<iframe
            src="https://your-frontend-url.com?token=%s"
            width="100%%"
            height="800px"
            frameborder="0"
            allow="microphone"
        ></iframe>',
        $token
    );
});

function generate_jwt_token_for_user($user) {
    // Use JWT plugin's function or implement manually
    // This passes authentication to your React app
}
```

### Method 2: Direct Integration (Advanced)

For tighter integration, use WordPress REST API + React:

```javascript
// In WordPress theme's footer
wp_localize_script('your-script', 'wpData', array(
    'jwt_token' => wp_create_nonce('jwt'),
    'api_url' => 'https://your-backend-api.com',
    'user' => wp_get_current_user()
));
```

---

## Part 7: Testing & Verification

### Test Backend API

```bash
# Health check
curl https://your-backend-api.com/health

# Test authentication (with JWT from WordPress)
curl -X POST https://your-backend-api.com/api/chat/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Vera"}'
```

### Test Frontend

1. Visit your frontend URL
2. Should redirect to WordPress login if not authenticated
3. After login, JWT token should be passed
4. Test chat functionality
5. Verify voice interface works
6. Check session persistence

### Test Database

In Supabase:
1. Go to **Table Editor** → **users**
2. Should see new users appearing after first login
3. Check **chat_sessions** table for conversations
4. Check **messages** table for message history
5. Check **usage_analytics** for tracking data

---

## Part 8: Monitoring & Maintenance

### Supabase Dashboard

Monitor:
- **Database** → Table sizes, row counts
- **API** → Request counts, response times
- **Auth** → User activity
- **Logs** → Error tracking

### Backend Monitoring

Add logging service (e.g., LogRocket, Sentry):

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics Dashboard

Create admin route (`/api/admin/stats`) for monitoring:
- Total users
- Active users (last 7 days)
- Total messages sent
- Average session length
- Token usage trends

---

## Security Checklist

- [ ] WordPress JWT secret is strong (64+ characters)
- [ ] Supabase service key is kept secret
- [ ] Environment variables are not committed to Git
- [ ] CORS is configured to only allow your domains
- [ ] Rate limiting is enabled (100 req/15min default)
- [ ] HTTPS is enabled on all endpoints
- [ ] Supabase RLS (Row Level Security) is enabled
- [ ] User data is encrypted in transit and at rest
- [ ] API endpoints require authentication

---

## Troubleshooting

### "Invalid token" errors
- Check JWT secret matches between WordPress and backend
- Verify token hasn't expired (default: 7 days)
- Ensure JWT plugin is activated in WordPress

### CORS errors
- Add frontend domain to `ALLOWED_ORIGINS` in backend `.env`
- Check browser console for specific blocked origin
- Verify CORS middleware is properly configured

### Database connection errors
- Check Supabase URL and service key
- Verify Supabase project is active
- Check network connectivity

### Gemini API errors
- Verify API key is valid at [aistudio.google.com](https://aistudio.google.com)
- Check API quotas and billing
- Monitor rate limits

---

## Cost Estimation

**Free Tier (Good for 100-500 users/month):**
- Supabase: Free up to 500MB database, 2GB bandwidth
- Railway: $5/month
- Gemini API: $0.075 per 1M tokens (very cheap)
- Estimated: **$5-10/month**

**Production Tier (1000-5000 users/month):**
- Supabase Pro: $25/month
- Railway Pro: $20/month
- Gemini API: ~$50/month (with heavy usage)
- Estimated: **$95/month**

---

## Support & Updates

For questions or issues:
1. Check Supabase logs for database errors
2. Check backend logs for API errors
3. Check browser console for frontend errors
4. Review this documentation
5. Contact support@yourdomain.com

---

**Setup Complete!** 🎉

Your Executive AI Advisor is now live and ready to help executives make smarter AI decisions.
