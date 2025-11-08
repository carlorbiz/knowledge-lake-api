# Executive AI Advisor - Production Web App

<div align="center">

**Transform your AI Studio prototype into a production-ready SaaS platform behind a WordPress paywall**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

</div>

---

## 🎯 What Is This?

**Executive AI Advisor (Vera)** is a sophisticated AI-powered advisory platform designed for C-suite executives and business leaders who need expert guidance on AI/ML adoption, vendor selection, ROI modeling, and implementation strategy.

### Key Features

✅ **Real-time AI Intelligence** - Powered by Google Gemini with live search grounding
✅ **Smart Model Switching** - Auto-selects optimal model (Pro/Flash/Lite) based on query complexity
✅ **WordPress Integration** - Seamless paywall integration with JWT authentication
✅ **Persistent Conversations** - Supabase-backed session management across devices
✅ **Advanced Analytics** - Track user engagement, token usage, and ROI
✅ **Premium Features** - ROI calculators, competitor analysis, implementation roadmaps
✅ **Voice Interface** - Native audio conversation support
✅ **Admin Dashboard** - Monitor users, sessions, and system performance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WordPress Site (Paywall)                     │
│                  MemberPress / WooCommerce / PMPro              │
└────────────────────────┬────────────────────────────────────────┘
                         │ JWT Token
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API (Express + TypeScript)            │
│  ├─ WordPress JWT Auth Middleware                              │
│  ├─ Chat Routes (/api/chat/send, /sessions)                    │
│  ├─ User Routes (/api/user/profile, /context)                  │
│  └─ Admin Routes (/api/admin/stats, /users)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ↓                             ↓
┌──────────────────────┐      ┌──────────────────────┐
│ Supabase PostgreSQL  │      │  Google Gemini API   │
│ - users              │      │  - gemini-2.5-pro    │
│ - chat_sessions      │      │  - gemini-2.5-flash  │
│ - messages           │      │  - gemini-2.5-lite   │
│ - usage_analytics    │      │  - Google Search     │
│ - user_context       │      └──────────────────────┘
└──────────────────────┘
          ↑
          │
          ↓
┌─────────────────────────────────────────────────────────────────┐
│              React Frontend (Vite + TypeScript)                 │
│  ├─ Chat Interface with Message History                        │
│  ├─ Voice Interface (Gemini Native Audio)                      │
│  ├─ Session Management                                          │
│  └─ Real-time Suggested Prompts                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
executive-ai-advisor/
│
├── backend/                          # Express API server
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts              # WordPress JWT authentication
│   │   ├── routes/
│   │   │   ├── chat.ts              # Chat endpoints
│   │   │   ├── user.ts              # User profile endpoints
│   │   │   └── admin.ts             # Admin dashboard endpoints
│   │   ├── services/
│   │   │   ├── gemini.ts            # Gemini AI service (with advanced features)
│   │   │   └── database.ts          # Supabase database service
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript types
│   │   └── server.ts                # Main server file
│   ├── supabase-schema.sql          # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── wordpress-integration/            # WordPress plugin
│   ├── executive-ai-advisor-widget.php
│   └── css/
│       └── widget.css
│
├── admin-dashboard/                  # React admin dashboard
│   └── src/
│       └── components/
│           └── AdminDashboard.tsx
│
├── src/                              # React frontend (existing AI Studio app)
│   ├── components/
│   ├── services/
│   ├── types.ts
│   └── App.tsx
│
├── PRODUCTION_SETUP.md               # Complete deployment guide
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier works)
- **Google Gemini API** key ([get one here](https://aistudio.google.com/apikey))
- **WordPress** site with membership/paywall plugin
- **Hosting** for backend (Railway, Vercel, etc.)

### 1. Database Setup (5 minutes)

```bash
# Create new Supabase project at supabase.com
# Go to SQL Editor and run:
cat backend/supabase-schema.sql
# Paste and execute

# Get your credentials:
# Settings → API → Copy "Project URL" and "service_role key"
```

### 2. Backend Setup (10 minutes)

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
nano .env
```

Required environment variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
WORDPRESS_JWT_SECRET=your-jwt-secret  # Must match WordPress
WORDPRESS_SITE_URL=https://your-site.com
ALLOWED_ORIGINS=https://your-frontend.com,https://your-site.com
```

```bash
# Test locally
npm run dev

# Visit http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. WordPress Setup (15 minutes)

**Install JWT Plugin:**
```bash
# In WordPress admin:
# Plugins → Add New → Search "JWT Authentication for WP REST API"
# Install and activate
```

**Configure JWT (edit `wp-config.php`):**
```php
// Generate secret: openssl rand -base64 64
define('JWT_AUTH_SECRET_KEY', 'your-64-char-secret-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

**Install Widget Plugin:**
```bash
# Upload wordpress-integration/executive-ai-advisor-widget.php to:
# wp-content/plugins/executive-ai-advisor/

# Or create new plugin and paste the code
# Activate in WordPress admin
```

**Configure Widget:**
```bash
# Settings → Executive AI Advisor
# Frontend URL: https://your-frontend-url.vercel.app
# Backend URL: https://your-backend-url.railway.app
# Upgrade Page: (select your pricing page)
```

**Add to Page:**
```
[executive_ai_advisor]
```

### 4. Deploy Backend (Railway - easiest)

```bash
# Push code to GitHub
git add .
git commit -m "Production setup"
git push

# Go to railway.app
# New Project → Deploy from GitHub repo
# Select your repo

# Add environment variables (same as .env file)
# Railway will auto-deploy

# Note your URL: https://your-app.railway.app
```

### 5. Deploy Frontend

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd ..  # Back to root
vercel --prod

# Follow prompts
# Note your URL: https://your-app.vercel.app
```

### 6. Test End-to-End

1. ✅ Log into WordPress as premium member
2. ✅ Visit page with `[executive_ai_advisor]` shortcode
3. ✅ Chat interface should load with JWT authentication
4. ✅ Send a message to Vera
5. ✅ Check Supabase → Tables → Should see new user, session, messages
6. ✅ Test voice interface (microphone permission)
7. ✅ Log out → Should see "upgrade" message

---

## 💡 Usage Examples

### Basic Chat Integration

```html
<!-- In WordPress page/post -->
[executive_ai_advisor]
```

### Custom Size

```html
[executive_ai_advisor height="600px" width="90%"]
```

### Programmatic API Calls

```typescript
// Send message to Vera
const response = await fetch('https://your-api.railway.app/api/chat/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`  // From WordPress
  },
  body: JSON.stringify({
    message: 'What are the best AI tools for marketing automation?'
  })
});

const data = await response.json();
console.log(data.message.content);  // Vera's response
```

### Admin Dashboard

```typescript
// Get system stats
const stats = await fetch('https://your-api.railway.app/api/admin/stats?range=30d', {
  headers: {
    'X-Admin-Key': process.env.ADMIN_API_KEY
  }
});

// Returns: { overview, modelUsage, subscriptionBreakdown }
```

---

## 🎨 Advanced Features

### 1. Smart Model Selection

Vera automatically selects the optimal Gemini model based on query complexity:

- **Gemini 2.5 Pro** → Complex analysis (ROI, comparisons, implementation plans)
- **Gemini 2.5 Flash** → Real-time search queries (news, latest updates, pricing)
- **Gemini 2.5 Flash Lite** → General queries (fast, cost-effective)

### 2. Premium Features (for paying customers)

```typescript
// ROI Calculator
POST /api/chat/roi-calculator
{
  "tool": "Notion AI",
  "teamSize": 50,
  "monthlyBudget": 5000
}

// Competitor Analysis
POST /api/chat/competitor-analysis
{
  "primaryTool": "ChatGPT Enterprise",
  "alternatives": ["Claude Pro", "Gemini Business", "Perplexity Pro"]
}
```

### 3. User Context Personalization

```typescript
// Update user context for better recommendations
POST /api/user/context
{
  "roleDescription": "VP of Marketing at B2B SaaS",
  "priorities": "Lead generation, content automation",
  "interests": ["Marketing AI", "CRM integration"],
  "painPoints": ["Manual reporting", "Tool sprawl"],
  "aiExperienceLevel": "intermediate"
}
```

Vera will use this context to tailor responses to the user's specific situation.

---

## 📊 Admin Dashboard

Access comprehensive analytics at `/admin` (protected by API key):

### Key Metrics

- **User Growth** - Total, active, new users
- **Engagement** - Sessions, messages, avg conversation length
- **Performance** - Response times, model usage distribution
- **Revenue** - Subscription tier breakdown
- **Token Usage** - API costs and trends

### Sample Admin API Endpoints

```bash
# Get dashboard stats
curl -H "X-Admin-Key: your-secret" \
  https://your-api.railway.app/api/admin/stats?range=30d

# List users with pagination
curl -H "X-Admin-Key: your-secret" \
  https://your-api.railway.app/api/admin/users?page=1&limit=20

# Get specific user details
curl -H "X-Admin-Key: your-secret" \
  https://your-api.railway.app/api/admin/users/{userId}

# Update user subscription
curl -X POST -H "X-Admin-Key: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"tier":"premium","status":"active"}' \
  https://your-api.railway.app/api/admin/users/{userId}/subscription
```

---

## 🔒 Security

### Authentication Flow

```
1. User logs into WordPress
2. WordPress generates JWT token (signed with JWT_AUTH_SECRET_KEY)
3. JWT passed to React app via URL parameter
4. React app includes JWT in Authorization header
5. Backend verifies JWT signature
6. Backend creates/updates user in Supabase
7. Supabase RLS enforces user can only access own data
```

### Row-Level Security (RLS)

All Supabase tables have RLS policies ensuring:
- Users can only see their own sessions/messages
- Admin endpoints require separate API key
- No cross-user data leakage

### Best Practices

✅ Use strong JWT secret (64+ characters)
✅ Enable HTTPS on all endpoints
✅ Rotate API keys regularly
✅ Monitor admin endpoint access
✅ Rate limit API calls (100 req/15min default)
✅ Never commit `.env` files to Git

---

## 💰 Cost Estimation

### Free Tier (100-500 users/month)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | $0 | 500MB database, 2GB bandwidth |
| Railway | $5 | Hobby plan |
| Gemini API | $2-5 | ~$0.075 per 1M tokens |
| Vercel | $0 | Free for frontend hosting |
| **Total** | **~$7/mo** | Perfect for MVP |

### Production Tier (1000-5000 users/month)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase Pro | $25 | 8GB database, 100GB bandwidth |
| Railway Pro | $20 | Better performance |
| Gemini API | $30-50 | Heavy usage scenarios |
| Vercel Pro | $20 | Better performance, analytics |
| **Total** | **~$95-115/mo** | Scales to 5K users |

---

## 🐛 Troubleshooting

### "Invalid token" errors

**Problem:** Backend rejects WordPress JWT

**Solution:**
1. Check `JWT_AUTH_SECRET_KEY` in `wp-config.php` matches `WORDPRESS_JWT_SECRET` in backend `.env`
2. Verify JWT plugin is activated in WordPress
3. Test JWT generation:
   ```bash
   curl -X POST https://your-site.com/wp-json/jwt-auth/v1/token \
     -d '{"username":"test","password":"test"}'
   ```

### CORS errors

**Problem:** Browser blocks requests from frontend to backend

**Solution:**
1. Add frontend domain to `ALLOWED_ORIGINS` in backend `.env`
2. Ensure CORS middleware is configured in `server.ts`
3. Check browser console for specific blocked origin

### Database connection errors

**Problem:** Backend can't connect to Supabase

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
2. Check Supabase project is active (not paused)
3. Test connection:
   ```bash
   curl https://your-project.supabase.co/rest/v1/ \
     -H "apikey: your-service-key"
   ```

### No messages appearing in Supabase

**Problem:** Chat works but no database records

**Solution:**
1. Check RLS policies in Supabase (may be blocking inserts)
2. Verify `DatabaseService.createMessage()` is called
3. Check backend logs for errors
4. Test direct insert:
   ```sql
   INSERT INTO messages (session_id, role, content)
   VALUES ('uuid-here', 'user', 'test');
   ```

---

## 📚 Documentation

- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Complete step-by-step deployment guide
- **[API Documentation](./API_DOCS.md)** - Full API endpoint reference (TODO)
- **[WordPress Integration Guide](./wordpress-integration/README.md)** - Membership plugin setup (TODO)

---

## 🤝 Support

For questions, issues, or feature requests:

1. **Check logs** - Backend logs in Railway, Supabase logs in dashboard
2. **Review docs** - `PRODUCTION_SETUP.md` has detailed troubleshooting
3. **GitHub Issues** - Open an issue with error logs and steps to reproduce
4. **Email** - support@yourdomain.com

---

## 📝 License

MIT License - feel free to use for commercial projects

---

## 🎉 What's Next?

Your Executive AI Advisor is now production-ready! Here are some ideas to enhance it:

- [ ] Add email notifications for new users
- [ ] Implement conversation export (PDF/Word)
- [ ] Build mobile app (React Native)
- [ ] Add team collaboration features
- [ ] Integrate with Slack/Teams
- [ ] Create API for third-party integrations
- [ ] Add multilingual support
- [ ] Implement A/B testing for prompts
- [ ] Build Chrome extension
- [ ] Add document upload and analysis

---

<div align="center">

**Built with ❤️ for busy executives who want AI to actually work**

[Live Demo](#) • [Documentation](./PRODUCTION_SETUP.md) • [Support](mailto:support@yourdomain.com)

</div>
