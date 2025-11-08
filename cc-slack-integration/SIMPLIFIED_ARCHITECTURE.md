# Simplified Architecture - Manus Integration

## What You're Building

A clean, intelligent Slack → Document generation system that costs ~$7/month instead of $20-100/month.

---

## Visual Architecture

```
                     Slack /ai cc Command
                              │
                              ↓
                    ┌─────────────────────┐
                    │  n8n Webhook Trigger │
                    └─────────────────────┘
                              │
                              ↓
                    ┌─────────────────────┐
                    │ Parse Slack Command │
                    │  (Extract content)  │
                    └─────────────────────┘
                              │
                              ↓
                    ┌─────────────────────┐
                    │ Should Route to     │
                    │ Manus?              │
                    │ (IF: length>=1800)  │
                    └─────────────────────┘
                         ╱         ╲
                   false╱           ╲true
                       ╱             ╲
                      ╱               ╲
        ┌─────────────────┐    ┌─────────────────────┐
        │ Format for      │    │ Call Manus API      │
        │ GitHub          │    │ POST /v1/tasks      │
        └─────────────────┘    └─────────────────────┘
                 │                       │
                 ↓                       ↓
        ┌─────────────────┐    ┌─────────────────────┐
        │ Create GitHub   │    │ Manus Intelligence: │
        │ Issue           │    │ • Analyzes content  │
        │                 │    │ • Picks template    │
        │ (CC processes)  │    │ • Calls Railway MCP │
        └─────────────────┘    │ • Returns Doc URL   │
                               └─────────────────────┘
                                        │
                                        ↓
                               ┌─────────────────────┐
                               │ Log to Notion       │
                               │ (Store Doc URL)     │
                               └─────────────────────┘
                                        │
                                        ↓
                               ┌─────────────────────┐
                               │ Reply to Slack      │
                               │ (Send Doc Link)     │
                               └─────────────────────┘
```

---

## Intelligence Distribution

### What n8n Does (Simple)
- ✅ Receive Slack command
- ✅ Parse user input
- ✅ Simple routing (long vs short)
- ✅ Store results in Notion
- ✅ Send response to Slack

**Total**: 8 nodes

### What Manus Does (Intelligent)
- ✅ Analyze content complexity
- ✅ Select from 5 specialized templates:
  1. AAE_DeepDive_Analysis
  2. AAE_MultiAgent_Coordination
  3. AAE_Status_Update
  4. AAE_Research_Summary
  5. AAE_Quick_Note
- ✅ Format data for template
- ✅ Call Railway DocsAutomator MCP
- ✅ Return clean result

**All the complexity lives with Manus!**

---

## Data Flow Example

### Input
```
/ai cc Investigate AI automation trends. Analyze adoption rates,
ROI metrics, implementation challenges... [2000+ characters]
```

### Step 1: Parse
```json
{
  "command_text": "Investigate AI automation...",
  "user_name": "carla",
  "channel_id": "C123ABC",
  "response_url": "https://hooks.slack.com/..."
}
```

### Step 2: Route
- Length = 2000+ characters
- Routes to: **Manus** (true branch)

### Step 3: Call Manus
```http
POST https://api.manus.ai/v1/tasks
Header: API_KEY: [your_key]
Body: {
  "prompt": "Investigate AI automation...",
  "taskMode": "agent"
}
```

### Step 4: Manus Processes
1. Analyzes keywords: "Investigate", "Analyze"
2. Selects: **AAE_Research_Summary** template
3. Calls Railway MCP:
   ```http
   POST https://web-production-14aec.up.railway.app/create_document
   Body: {
     "docId": "690b3ffa3756bfff14626c17",
     "documentName": "carla - 2025-11-06 14:30",
     "data": {
       "document_title": "AI Automation Trends Research",
       "generation_date": "November 6, 2025",
       "main_content": "Investigate AI automation..."
     }
   }
   ```
4. Returns result:
   ```json
   {
     "documentUrl": "https://docs.google.com/document/d/abc123..."
   }
   ```

### Step 5: Log to Notion
```
Title: AI Automation Trends Research
Document URL: https://docs.google.com/document/d/abc123...
Agent: Manus
User: carla
Source: Slack
```

### Step 6: Reply to Slack
```
🧠 Manus created your document!
📄 View Google Doc
Generated by Manus AI | Logged to Notion
```

---

## Cost Breakdown

### Old Architecture (Zapier-based)
- Slack trigger: 1 task
- Parse data: 1 task
- Call DocsAutomator: 1 task
- Format response: 1 task
- Log to Notion: 1 task
- Reply to Slack: 1 task

**Per document**: 6 Zapier tasks
**At 100 docs/month**: 600 tasks = $20-30/month
**At 500 docs/month**: 3000 tasks = $70-100/month

### New Architecture (Railway + Manus)
- Railway hosting: $7/month (both MCPs)
- Manus subscription: [Your existing plan]
- Zapier tasks: **0 for document generation!**

**Savings**: $18-98/month (90-98% reduction)

---

## Template Intelligence (Manus's Decision Tree)

```
┌─────────────────────────────────────────────────┐
│          Manus Receives Content                 │
└─────────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │  Keyword Analysis     │
          └───────────┬───────────┘
                      │
      ┌───────────────┼───────────────┬───────────────┬───────────────┐
      │               │               │               │               │
   "Delegate"     "Status"       "Investigate"   Multi-section   Default
   "Coordinate"   "Report"       "Research"      Complex         Simple
      │               │               │               │               │
      ↓               ↓               ↓               ↓               ↓
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Multi    │   │ Status   │   │ Research │   │ DeepDive │   │ Quick    │
│ Agent    │   │ Update   │   │ Summary  │   │ Analysis │   │ Note     │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
   docId:         docId:         docId:         docId:         docId:
  690b3d3f       690b3f97       690b3ffa       69088da6       690b41a5
```

---

## Comparison: Before vs After

### Before (Complex)
```
Parse Slack
    ↓
IF (length >= 1800)
    ↓ true
    IF (has "presentation")
        ↓ true
        Gamma nodes...
        ↓ false
        IF (has "research")
            ↓ true
            DocsAutomator (research template)
            ↓ false
            IF (has "status")
                ↓ true
                DocsAutomator (status template)
                ↓ false
                ... [8 more IF nodes]
```

**Problems**:
- 15-20 nodes
- Complex routing logic in n8n
- Hard to maintain
- Template selection in wrong place

### After (Simple)
```
Parse Slack
    ↓
Should Route to Manus? (IF: length >= 1800)
    ↓
    ├─ false → GitHub
    └─ true → Manus → Notion → Slack
```

**Benefits**:
- 8 nodes total
- Simple routing
- Easy to maintain
- Intelligence where it belongs (Manus)

---

## Security & Reliability

### API Key Storage
- ✅ Manus API key: n8n credential (encrypted)
- ✅ DocsAutomator API key: Railway environment variable
- ✅ Gamma API key: Railway environment variable
- ✅ No secrets in workflow JSON

### Error Handling
- n8n retries on HTTP failures
- Manus has internal error handling
- Railway MCP has timeout protection
- Slack response_url has 30-minute window

### Monitoring
- n8n execution history
- Railway logs
- Notion audit trail
- GitHub issue tracking (for short content)

---

## Scalability

### Current Capacity
- **Railway MCPs**: Handle 1000s of requests/day
- **Manus API**: Enterprise-grade
- **n8n**: Can process 100s of workflows simultaneously
- **Notion**: No rate limit issues for our usage

### Future Expansion
Easy to add:
- New templates (just add to Manus)
- New triggers (more Slack commands)
- New outputs (email, PDF, etc.)
- New routing rules (in IF node)

---

## What Makes This Clean?

1. **Single Responsibility**: Each node does ONE thing
2. **Intelligence Centralized**: Manus makes all complex decisions
3. **No Redundancy**: No duplicate nodes or logic
4. **Easy to Test**: Can test each path independently
5. **Easy to Debug**: Linear flow, clear data passing
6. **Easy to Modify**: Change routing or add templates without touching multiple places

---

## Summary

**What You Have**:
- ✅ 2 Railway MCP servers deployed
- ✅ Manus API key saved
- ✅ All 5 template docIds ready
- ✅ Complete documentation

**What You Need to Do**:
1. Create Manus credential in n8n (2 min)
2. Add 4 new nodes (5 min)
3. Test with short + long content (2 min)

**Result**:
- Clean architecture
- Massive cost savings
- Intelligent document generation
- Easy to maintain

**Ready to build it? See DO_THIS_NOW.md** 🚀
