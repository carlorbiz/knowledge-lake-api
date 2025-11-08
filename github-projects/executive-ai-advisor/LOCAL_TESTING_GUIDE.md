# Executive AI Advisor - Local Testing Guide

## ✅ Enhanced Research Component Verified

Your app now has **aggressive real-time search** that triggers for:
- ✅ **50+ AI tool names** (ChatGPT, Claude, Gemini, Perplexity, etc.)
- ✅ **25+ search keywords** (pricing, features, comparison, latest, etc.)
- ✅ **ALL Pro model queries** (ROI, competitor analysis, implementation)

**Result:** Vera will have access to TODAY'S AI news, pricing, and features.

---

## 🚀 Quick Start (30 minutes)

### Step 1: Install Backend Dependencies (5 min)

```bash
cd backend
npm install
```

Expected output:
```
added 150 packages in 30s
```

### Step 2: Configure Environment (5 min)

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` file with **real values**:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase (REQUIRED - get free account at supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# Gemini AI (REQUIRED - free at aistudio.google.com/apikey)
GEMINI_API_KEY=your-gemini-api-key

# WordPress JWT (can use dummy values for local testing)
WORDPRESS_JWT_SECRET=test-secret-for-local-development-only
WORDPRESS_SITE_URL=http://localhost

# CORS (allow frontend)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Admin API (for dashboard)
ADMIN_API_KEY=local-test-admin-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Where to get keys:**

1. **Supabase** (5 min):
   - Go to [supabase.com](https://supabase.com) → Sign up (free)
   - Create new project: "executive-ai-test"
   - Wait 2 minutes for provisioning
   - Go to Settings → API
   - Copy **Project URL** → paste as `SUPABASE_URL`
   - Copy **service_role key** → paste as `SUPABASE_SERVICE_KEY`

2. **Gemini API** (2 min):
   - Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Click "Create API Key"
   - Copy key → paste as `GEMINI_API_KEY`

### Step 3: Setup Database (3 min)

```bash
# In Supabase dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of backend/supabase-schema.sql
# 3. Paste and click "Run"
```

Verify tables created:
- Go to Table Editor
- Should see: users, chat_sessions, messages, usage_analytics, user_context

### Step 4: Start Backend (2 min)

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Executive AI Advisor API server running on port 3001
📊 Environment: development
🔒 CORS enabled for: http://localhost:5173
⏱️  Rate limit: 100 requests per 15 minutes
```

**Test health check:**
Open browser: http://localhost:3001/health

Should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T...",
  "environment": "development"
}
```

### Step 5: Test Research Component (5 min)

Open a new terminal and run the test script:

```bash
cd backend
node test-search.js
```

This will test real-time search with queries like:
- "What's the latest pricing for ChatGPT?"
- "Compare Claude vs Gemini"
- "What are the newest features in Perplexity?"

**Expected result:** Each query should return sources from Google Search with recent dates.

---

## 🧪 Manual Testing Scenarios

### Test 1: AI Tool Query (Should trigger search)

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "message": "What is the current pricing for ChatGPT Plus?"
  }'
```

**Expected:**
- Response includes `"sources"` array with URLs
- Pricing is up-to-date (October 2025)
- Response mentions verification date

### Test 2: Comparison Query (Should trigger search + Pro model)

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "message": "Compare ChatGPT Enterprise vs Claude for Teams - which is better for a 50-person marketing team?"
  }'
```

**Expected:**
- Uses `gemini-2.5-pro` model
- Includes Google Search sources
- Provides ROI analysis
- Suggests follow-up questions

### Test 3: Latest News Query (Should trigger search)

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "message": "What are the latest AI announcements from OpenAI this week?"
  }'
```

**Expected:**
- Real-time news from this week
- Sources with publication dates
- Links to official announcements

### Test 4: General Query (May use Lite model, no search)

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "message": "How do I motivate my team?"
  }'
```

**Expected:**
- Uses `gemini-2.5-flash-lite` (fast, cheap)
- No search sources (general advice)
- Still high-quality response

---

## 🔍 Verify Search is Working

Check backend logs for these indicators:

```bash
# In terminal running npm run dev, you should see:

✅ "Using model: gemini-2.5-flash with search"
✅ "Sources found: 5"
✅ "Search grounding enabled: true"
```

If you see:
```
❌ "Sources found: 0"
```

**Troubleshooting:**
1. Check `GEMINI_API_KEY` is valid
2. Verify query contains AI tool name or search trigger
3. Check console for Gemini API errors

---

## 🎯 Test Coverage

Your enhanced research component now covers:

### **50+ AI Tools** (always search):
- LLM Platforms: ChatGPT, Claude, Gemini, Perplexity, Grok
- Code AI: Copilot, Cursor, Replit, Codeium
- Content AI: Jasper, Copy.ai, Writesonic, Grammarly
- Video/Audio: Synthesia, HeyGen, ElevenLabs, Descript, Otter.ai
- Automation: Zapier, Make.com, n8n
- CRM/Sales: HubSpot, Salesforce, Pipedrive
- Communication: Slack, Teams, Zoom, Loom
- Memory/RAG: Mem0, LangChain, LlamaIndex, Pinecone

### **25+ Search Triggers** (always search):
- Time: latest, current, recent, today, new
- Comparison: vs, versus, compare, better than, alternative
- Evaluation: best, top, recommended, worth it, review
- Pricing: pricing, price, cost, how much, subscription
- Features: features, capabilities, can it, does it

---

## 🧪 Automated Test Script

Create `backend/test-search.js`:

```javascript
import { generateChatResponse } from './src/services/gemini.js';

const testQueries = [
  "What's the latest pricing for ChatGPT Plus?",
  "Compare Claude vs Gemini for enterprise use",
  "What are the newest features in Perplexity?",
  "Is Cursor better than GitHub Copilot?",
  "What's the current cost of Notion AI?",
];

async function runTests() {
  console.log('🧪 Testing Real-Time Search Component\n');

  for (const query of testQueries) {
    console.log(`📝 Query: "${query}"`);

    try {
      const response = await generateChatResponse({
        messages: [{ role: 'user', content: query }],
        subscriptionTier: 'premium'
      });

      console.log(`✅ Model: ${response.modelUsed}`);
      console.log(`✅ Sources: ${response.sources?.length || 0}`);

      if (response.sources && response.sources.length > 0) {
        console.log(`   - ${response.sources[0].title}`);
        console.log(`   - ${response.sources[0].uri}`);
      }

      console.log(`✅ Response time: ${response.responseTimeMs}ms`);
      console.log(`✅ Tokens: ${response.tokensUsed}\n`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

runTests();
```

Run it:
```bash
cd backend
npm run build  # Build TypeScript first
node test-search.js
```

**Expected output:**
```
🧪 Testing Real-Time Search Component

📝 Query: "What's the latest pricing for ChatGPT Plus?"
✅ Model: gemini-2.5-flash
✅ Sources: 3
   - OpenAI Pricing | ChatGPT Plus
   - https://openai.com/pricing
✅ Response time: 2300ms
✅ Tokens: 850

📝 Query: "Compare Claude vs Gemini for enterprise use"
✅ Model: gemini-2.5-pro
✅ Sources: 5
   - Anthropic Claude for Enterprise
   - https://anthropic.com/enterprise
✅ Response time: 4200ms
✅ Tokens: 1500
...
```

---

## 🐛 Common Issues

### Issue 1: "GEMINI_API_KEY not found"
**Solution:** Check `.env` file exists and has valid key

### Issue 2: "Failed to connect to Supabase"
**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. Check Supabase project is active (not paused)
3. Test connection: `curl https://your-project.supabase.co/rest/v1/`

### Issue 3: "No sources found" in response
**Solution:**
1. This is NORMAL for general queries (not AI-related)
2. Test with AI tool name: "What's new with ChatGPT?"
3. Check backend logs for "Search grounding enabled: true"

### Issue 4: Backend won't start
**Solution:**
1. Check Node.js version: `node --version` (need 18+)
2. Delete `node_modules` and run `npm install` again
3. Check port 3001 isn't already in use: `netstat -ano | findstr :3001`

---

## ✅ You're Ready When:

- ✅ Backend starts without errors
- ✅ `/health` endpoint returns 200 OK
- ✅ Test query returns sources with recent dates
- ✅ Logs show "Search grounding enabled: true"
- ✅ Supabase tables exist and are accessible

---

## 🎉 Next Step: Frontend Integration

Once backend is tested, connect your React frontend:

1. Update frontend to call `http://localhost:3001/api/chat/send`
2. Add JWT token to Authorization header
3. Display sources at bottom of each AI response
4. Show loading state during search (can take 2-5 seconds)

---

## 📞 Quick Reference

**Backend API:**
- Health: `GET http://localhost:3001/health`
- Chat: `POST http://localhost:3001/api/chat/send`
- Sessions: `GET http://localhost:3001/api/chat/sessions`
- Admin Stats: `GET http://localhost:3001/api/admin/stats`

**Default Credentials (Local Only):**
- Admin API Key: `local-test-admin-key`
- JWT Secret: `test-secret-for-local-development-only`

**Logs Location:**
- Backend: Terminal running `npm run dev`
- Supabase: Dashboard → Logs
- Network: Browser DevTools → Network tab

---

**Time to test:** ~30 minutes
**Result:** Fully functional AI advisor with real-time search! 🚀
