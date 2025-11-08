# Notion Admin Dashboard Setup Guide

## Overview
This creates a beautiful admin dashboard in Notion synced from Supabase via n8n - **no additional backend complexity**.

**Setup Time:** ~2 hours
**Skills Required:** Basic Notion + n8n experience (you already have both!)

---

## Part 1: Create Notion Databases (30 minutes)

### Database 1: Users Dashboard

1. **Create new Notion database** called "Executive AI Advisor - Users"

2. **Add these properties:**

| Property Name | Type | Options/Notes |
|--------------|------|---------------|
| Name | Title | User's display name |
| Email | Email | User's email address |
| Subscription Tier | Select | Options: `basic`, `premium`, `enterprise` |
| Status | Select | Options: `active`, `inactive`, `cancelled` |
| Total Sessions | Number | Count of chat sessions |
| Total Messages | Number | Count of all messages |
| Total Tokens | Number | Sum of tokens used |
| Est. Cost ($) | Number | Format as currency |
| Created | Date | Account creation date |
| Last Active | Date | Last interaction timestamp |
| Active (7d) | Checkbox | Auto-checked if active within 7 days |

3. **Copy the Database ID:**
   - Click "..." menu → "Copy link"
   - URL format: `https://notion.so/workspace/DATABASE_ID?v=...`
   - Save `DATABASE_ID` for later

4. **Create useful views:**
   - **All Users** (Table) - Default view
   - **Premium Only** (Table) - Filter: `Subscription Tier = premium OR enterprise`
   - **Active This Week** (Table) - Filter: `Active (7d) = Checked`
   - **Growth Timeline** (Timeline) - Group by Created date
   - **By Tier** (Board) - Group by Subscription Tier
   - **High Usage** (Table) - Sort by Total Tokens descending

---

### Database 2: Usage Analytics Dashboard

1. **Create new Notion database** called "Executive AI Advisor - Usage Analytics"

2. **Add these properties:**

| Property Name | Type | Notes |
|--------------|------|-------|
| Date | Title | Format: YYYY-MM-DD |
| Total Messages | Number | Messages sent that day |
| Active Users | Number | Unique users that day |
| Total Tokens | Number | Total tokens consumed |
| Search Queries | Number | Queries with real-time search |
| Avg Response Time (ms) | Number | Average AI response time |

3. **Copy the Database ID** (same process as above)

4. **Create views:**
   - **Daily Stats** (Table) - Sort by Date descending
   - **This Week** (Gallery) - Filter: Last 7 days
   - **This Month** (Calendar) - Calendar view by Date
   - **Growth Chart** (Timeline) - Visualize usage trends

---

## Part 2: Create Supabase Analytics Function (15 minutes)

We need a PostgreSQL function to aggregate daily usage stats.

1. **Go to Supabase Dashboard** → SQL Editor

2. **Run this SQL:**

```sql
-- Function to get daily usage analytics
CREATE OR REPLACE FUNCTION get_daily_usage()
RETURNS TABLE (
  date DATE,
  total_messages BIGINT,
  active_users BIGINT,
  total_tokens BIGINT,
  search_queries BIGINT,
  avg_response_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(m.created_at) as date,
    COUNT(m.id) as total_messages,
    COUNT(DISTINCT cs.user_id) as active_users,
    SUM(COALESCE(m.tokens_used, 0)) as total_tokens,
    COUNT(CASE WHEN m.sources IS NOT NULL THEN 1 END) as search_queries,
    ROUND(AVG(COALESCE(m.response_time_ms, 0))::numeric, 2) as avg_response_time
  FROM messages m
  JOIN chat_sessions cs ON m.session_id = cs.id
  WHERE m.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(m.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant access to service role
GRANT EXECUTE ON FUNCTION get_daily_usage() TO service_role;
```

3. **Test it:**
```sql
SELECT * FROM get_daily_usage();
```

Should return rows with daily stats.

---

## Part 3: Setup n8n Workflow (45 minutes)

### Step 1: Import Workflow

1. Open n8n: `http://localhost:5678`

2. Click **"Add workflow"** → **"Import from File"**

3. Select: `n8n-supabase-notion-sync.json`

4. Workflow imports with these nodes:
   - ⏰ Hourly Sync Trigger
   - 📊 Fetch Users from Supabase
   - 🧮 Calculate User Stats
   - 🔍 Fetch Existing Notion Users
   - 🔄 Match Existing Records
   - ➕ Create Notion Page
   - ✏️ Update Notion Page
   - 📈 Fetch Usage Analytics
   - 📝 Create Usage Record

---

### Step 2: Configure Credentials

#### A. Supabase API Key

1. In n8n, click **Credentials** menu

2. Click **"New"** → **"HTTP Header Auth"**

3. **Name:** `Supabase Service Key`

4. **Configuration:**
   - **Name:** `apikey`
   - **Value:** Your `SUPABASE_SERVICE_KEY` (from backend/.env)

5. Add second header:
   - **Name:** `Authorization`
   - **Value:** `Bearer YOUR_SUPABASE_SERVICE_KEY`

6. **Save**

#### B. Notion Integration

1. **Create Notion Integration:**
   - Go to: https://www.notion.so/my-integrations
   - Click **"New integration"**
   - **Name:** `Executive AI Advisor n8n Sync`
   - **Associated workspace:** Your workspace
   - **Capabilities:** Check "Read content", "Update content", "Insert content"
   - Click **"Submit"**
   - Copy **Internal Integration Token**

2. **In n8n:**
   - Click **Credentials** → **"New"** → **"Notion API"**
   - **Name:** `Notion API`
   - **API Key:** Paste integration token
   - **Save**

3. **Share Notion databases with integration:**
   - Open your "Users" database in Notion
   - Click **"..."** menu → **"Add connections"**
   - Select **"Executive AI Advisor n8n Sync"**
   - Repeat for "Usage Analytics" database

---

### Step 3: Configure Environment Variables

1. In n8n workflow, click **Settings** → **Variables**

2. Add these environment variables:

```json
{
  "SUPABASE_URL": "https://your-project.supabase.co",
  "NOTION_USERS_DB_ID": "paste-users-database-id-here",
  "NOTION_USAGE_DB_ID": "paste-usage-database-id-here"
}
```

**Where to find Database IDs:**
- Open database in Notion
- Copy link: `notion.so/workspace/DATABASE_ID?v=...`
- Use the 32-character hexadecimal ID

---

### Step 4: Assign Credentials to Nodes

1. **Click "Fetch Users from Supabase" node:**
   - Under **Authentication** → **HTTP Header Auth**
   - Select: `Supabase Service Key`

2. **Click "Fetch Existing Notion Users" node:**
   - Under **Credentials**
   - Select: `Notion API`

3. **Click "Create Notion Page" node:**
   - Under **Credentials**
   - Select: `Notion API`

4. **Click "Update Notion Page" node:**
   - Under **Credentials**
   - Select: `Notion API`

5. Repeat for all Notion nodes

---

### Step 5: Test the Workflow

1. Click **"Execute Workflow"** button (play icon)

2. **Expected output:**
   - ✅ Fetches users from Supabase
   - ✅ Calculates stats for each user
   - ✅ Creates/updates Notion pages
   - ✅ Logs summary: "Synced X users to Notion"

3. **Check Notion:**
   - Open "Executive AI Advisor - Users" database
   - Should see user records with stats
   - Open "Usage Analytics" database
   - Should see daily usage records

4. **If errors:**
   - Check credentials are correctly assigned
   - Verify Notion databases are shared with integration
   - Check environment variables are correct
   - Review n8n execution logs

---

### Step 6: Activate Automatic Sync

1. Click **"Active"** toggle in top right (turns workflow on)

2. **Workflow now runs:**
   - Every hour automatically
   - Syncs all users and stats to Notion
   - Creates new records, updates existing ones

3. **Monitor executions:**
   - Click **"Executions"** tab
   - View history of all sync runs
   - Check for errors or warnings

---

## Part 4: Customize Your Notion Dashboard (30 minutes)

### Recommended Dashboard Layout

Create a new Notion page called "Executive AI Advisor - Admin Dashboard" with:

#### 1. **Overview Section** (at top)
```
# Executive AI Advisor - Admin Dashboard
Last updated: [Auto-updated timestamp]

## Quick Stats (use formulas)
- 👥 Total Users: [Count from Users DB]
- 💎 Premium Users: [Count where Tier = premium/enterprise]
- 🔥 Active This Week: [Count where Active (7d) = true]
- 💰 Total Revenue Estimate: [Sum of Est. Cost]
```

#### 2. **Embed Users Database**
- Click "/" → "Linked database" → Select "Users" database
- Choose view: "All Users" or "Active This Week"

#### 3. **Embed Usage Analytics**
- Click "/" → "Linked database" → Select "Usage Analytics" database
- Choose view: "This Week" or "Growth Chart"

#### 4. **Key Metrics Boards**

Create **Board View** grouped by Subscription Tier:
- Shows users by tier (Basic, Premium, Enterprise)
- Drag-and-drop to change user tiers

Create **Gallery View** for active users:
- Filter: Active (7d) = Checked
- Shows card-style user profiles

#### 5. **Alerts Section**
- Create "High Usage" view (filter: Total Tokens > 100000)
- Create "Inactive Premium" view (filter: Tier = premium AND Active (7d) = false)

---

## What You Get

### ✅ Real-Time Dashboard (1-hour delay)
- All user data synced hourly
- Usage analytics updated daily
- No manual exports needed

### ✅ Multiple Views
- Table view for detailed analysis
- Board view for tier management
- Timeline view for growth tracking
- Gallery view for user profiles

### ✅ Mobile Access
- Notion mobile app gives you admin dashboard anywhere
- No need to log into laptop for quick stats

### ✅ No Backend Complexity
- Zero new backend components
- Uses tools you already know (Notion + n8n)
- Supabase remains single source of truth

### ✅ Extensibility
- Add custom fields easily in Notion
- Create new views for specific analysis
- Share specific views with team members

---

## Maintenance

### Daily Tasks
- ✅ None! Workflow runs automatically

### Weekly Tasks
- Check n8n execution history for errors
- Review "High Usage" and "Inactive Premium" views

### Monthly Tasks
- Archive old usage analytics (optional)
- Review credential expiration dates

---

## Troubleshooting

### Issue: "Database not found"
**Fix:**
- Verify database IDs in workflow environment variables
- Check databases are shared with Notion integration

### Issue: "Unauthorized"
**Fix:**
- Regenerate Notion integration token
- Update credential in n8n
- Re-share databases with integration

### Issue: "No data syncing"
**Fix:**
- Check workflow is **Active** (toggle in top right)
- Verify Supabase credentials are correct
- Test Supabase API endpoint manually: `curl https://your-project.supabase.co/rest/v1/users`

### Issue: "Duplicate records"
**Fix:**
- Workflow should auto-detect duplicates by email
- If duplicates exist, delete manually in Notion
- Next sync will update correctly

---

## Next Steps

1. ✅ **Test the sync** - Run workflow manually first
2. ✅ **Activate automatic sync** - Enable hourly updates
3. ✅ **Customize dashboard** - Add your preferred views
4. ✅ **Set up mobile** - Install Notion app for on-the-go admin
5. ✅ **Share with team** - Invite team members to specific views (optional)

---

## Cost Estimate

- **Notion:** Free (databases + integrations included)
- **n8n:** Free (self-hosted on your machine)
- **Supabase:** Free tier includes 500MB database (plenty for this use case)

**Total additional cost:** $0/month 🎉

---

**Setup time:** 2 hours
**Maintenance:** 5 minutes/week
**Value:** Real-time business intelligence for your SaaS! 📊
