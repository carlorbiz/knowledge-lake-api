# AAE Content Structure Guide
**For Claude GUI, Manus, and All AAE Council Members**

**Version:** 1.0
**Date:** 2025-12-03
**Purpose:** Standardize conversation content structure for seamless ingestion into Notion AI Agents Universal Database and Knowledge Lake via n8n workflows

---

## 📋 Quick Reference

| System | Endpoint | Format | Auto-Process |
|--------|----------|--------|--------------|
| **Notion AI Agents Universal DB** | `collection://12da15e1-369e-4bae-87a1-7f51182c978f` | Notion Pages | ✅ via n8n |
| **Knowledge Lake API** | `https://knowledge-lake-api-production.up.railway.app` | JSON/Markdown | ✅ via n8n |
| **AAE Dashboard** | D1 Database | JSON | ✅ Dual-write |

---

## 🎯 Content Structure Requirements

### Universal Format (Works for ALL agents)

```markdown
---
agent: [CLAUDE/MANUS/FRED/DEV/JAN/PENNY/GROK/GEMINI/NOTEBOOKLM]
date: YYYY-MM-DD
title: [Brief descriptive title - max 100 chars]
business_area: [GPSA/HPSA | CARLORBIZ | MTMOT | ALL THINGS CARLA | AAE Development | Technology Infrastructure]
quality_rating: [1-5 | Excellent | High - Breakthrough]
business_impact: [High Impact | Medium Impact | Low Impact | Reference Only]
status: [📥 Captured | 🔄 Processing | ✅ Applied | 📚 Reference | 🗄️ Archived]
tags: [consulting, course-creation, automation, research, strategy, technical, content, breakthrough]
---

## Context
[Brief context or background - 2-3 sentences]

## User
[Your prompt/question here - copy full text]

## [Agent Name]
[Agent's response here - copy full text]

## User
[Follow-up prompt if applicable]

## [Agent Name]
[Follow-up response]

---

## Key Insights
- [Main takeaway 1]
- [Main takeaway 2]
- [Main takeaway 3]

## Deliverables Created
- [What was produced: code, plan, document, etc.]

## Next Steps
- [ ] [Action item 1]
- [ ] [Action item 2]

## Cross-References
- Related conversation: [Link or reference]
- Related project: [Link or reference]
```

---

## 📊 Notion AI Agents Universal Database Schema

### Required Properties

| Property | Type | Purpose | Example Values |
|----------|------|---------|----------------|
| **Conversation Title** | Title | Unique identifier | "AAE Dashboard Architecture Discussion" |
| **Primary AI Agent** | Select | Which agent | Claude, Manus, Fred, Dev, Jan, Penny |
| **Conversation Date** | Date | When it occurred | 2025-12-03 |
| **Key Insights** | Text | Main takeaways | "Dual-write architecture enables..." |
| **Deliverables Created** | Text | What was produced | "Railway deployment guide, MCP server" |
| **Business Area** | Multi-select | Which business | AAE Development, CARLORBIZ |
| **Agent Primary Role** | Select | Agent function | Technical Development, Strategic Planning |
| **Quality Rating** | Select | How valuable | Excellent, High - Breakthrough, 1-5 |
| **Business Impact** | Select | Impact level | High Impact, Medium Impact, Low Impact |
| **Status** | Select | Processing state | 📥 Captured, ✅ Applied, 📚 Reference |
| **Tags** | Multi-select | Categorization | automation, research, technical |

### Optional Properties

| Property | Type | Purpose |
|----------|------|---------|
| **Source Link** | URL | Link to original conversation |
| **Extended Synthesis** | Text | Full synthesis content |
| **Cross-References** | Text | Links to related conversations |

---

## 🌊 Knowledge Lake API Requirements

### Endpoint: `/api/conversations/ingest`

**Method:** POST
**Content-Type:** application/json

#### Required Fields

```json
{
  "userId": 1,
  "agent": "Claude",
  "date": "2025-12-03",
  "topic": "AAE Dashboard Architecture",
  "content": "Full conversation text...",
  "entities": [],
  "relationships": [],
  "metadata": {}
}
```

#### Field Specifications

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `userId` | integer | ✅ | Always `1` for Carla | `1` |
| `agent` | string | ✅ | Agent name | `"Claude"`, `"Manus"`, `"Dev"` |
| `date` | string | ✅ | ISO format YYYY-MM-DD | `"2025-12-03"` |
| `topic` | string | ✅ | Conversation title | `"Railway Deployment Guide"` |
| `content` | string | ✅ | Full conversation | Complete markdown text |
| `entities` | array | ❌ | Extracted entities | See entity schema below |
| `relationships` | array | ❌ | Entity relationships | See relationship schema below |
| `metadata` | object | ❌ | Additional data | `{"priority": "high"}` |

---

## 🔍 Entity Extraction Guide

### Entity Types

| Type | Use For | Examples |
|------|---------|----------|
| `Agents` | AI assistants | Claude, Manus, Fred, Dev, Aurelia |
| `Technology` | Tools, platforms | Notion, GitHub, Railway, n8n, HeyGen |
| `ExecutiveAI` | AI strategy, governance | AI Leadership Academy, Executive Coaching |
| `Content` | Documents, courses | Ebook, Course Module, Presentation |
| `Consulting` | Business processes | RWAV Compliance, Course Architecture |
| `ClientIntelligence` | Client insights | Target Audience Analysis |
| `Projects` | Named projects | AAE Dashboard, Aurelia, Knowledge Lake |

### Entity Schema

```json
{
  "name": "AAE Dashboard",
  "entityType": "Technology",
  "confidence": 0.95,
  "description": "Central control panel for AI automation ecosystem",
  "sourceContext": "Main topic of discussion about dual-write architecture"
}
```

### Extraction Rules

1. **Always Extract:**
   - Agent names (your conversation partner)
   - Technology platforms mentioned
   - Projects being discussed
   - People or organizations referenced

2. **Extract If Significant:**
   - Concepts requiring explanation
   - Frameworks or methodologies
   - Tools or services

3. **Don't Extract:**
   - Generic terms (e.g., "the system", "this tool")
   - Common words without specific meaning
   - Temporary references

---

## 🔗 Relationship Types

### Standard Relationships

| Relationship | Meaning | Example |
|--------------|---------|---------|
| `uses` | One entity utilizes another | "AAE Dashboard uses Knowledge Lake API" |
| `integrates_with` | Technical integration | "Manus integrates_with Railway API" |
| `requires` | Dependency | "Aurelia requires HeyGen Avatar API" |
| `discusses` | Mentioned together | "Claude discusses n8n workflows" |
| `implements` | Implementation relationship | "Dev implements ChatGPT MCP" |
| `contributes_to` | Contributing relationship | "Fred contributes_to Course Content" |

### Relationship Schema

```json
{
  "from": "AAE Dashboard",
  "to": "Knowledge Lake API",
  "relationType": "uses",
  "confidence": 0.9,
  "context": "Dual-write architecture requires both D1 and Knowledge Lake"
}
```

---

## 📝 Examples by Agent Type

### Example 1: Claude Conversation

```markdown
---
agent: CLAUDE
date: 2025-12-03
title: Railway Deployment Troubleshooting - Python venv Solution
business_area: AAE Development
quality_rating: High - Breakthrough
business_impact: High Impact
status: ✅ Applied
tags: technical, deployment, railway, troubleshooting, breakthrough
---

## Context
Deploying Knowledge Lake API to Railway encountered "externally-managed-environment" error due to Nix's immutable filesystem.

## User
The Railway deployment is failing with pip installation errors...

## Claude
The issue is that Nix Python environments are immutable (PEP 668). Solution: Use Python venv...

## Key Insights
- Nix `/nix/store` filesystem is read-only by design
- Python venv creates mutable installation directory
- This pattern works for all Nixpacks Python deployments

## Deliverables Created
- Updated nixpacks.toml with venv configuration
- Successful Railway deployment at https://knowledge-lake-api-production.up.railway.app
- Documentation for future deployments

## Next Steps
- [x] Test deployment health endpoint
- [x] Share Railway URL with Manus
- [ ] Enable mem0 by adding OPENAI_API_KEY
```

**JSON for Knowledge Lake:**
```json
{
  "userId": 1,
  "agent": "Claude",
  "date": "2025-12-03",
  "topic": "Railway Deployment Troubleshooting - Python venv Solution",
  "content": "[Full markdown content above]",
  "entities": [
    {
      "name": "Railway",
      "entityType": "Technology",
      "confidence": 0.95,
      "description": "Cloud deployment platform",
      "sourceContext": "Deployment target for Knowledge Lake API"
    },
    {
      "name": "Knowledge Lake API",
      "entityType": "Projects",
      "confidence": 1.0,
      "description": "Centralized knowledge management API",
      "sourceContext": "Application being deployed"
    }
  ],
  "relationships": [
    {
      "from": "Knowledge Lake API",
      "to": "Railway",
      "relationType": "deployed_on",
      "confidence": 1.0,
      "context": "Production deployment"
    }
  ],
  "metadata": {
    "deployment_url": "https://knowledge-lake-api-production.up.railway.app",
    "resolved_issue": "externally-managed-environment",
    "solution": "Python venv"
  }
}
```

---

### Example 2: Manus Email Processing

```markdown
---
agent: MANUS
date: 2025-12-03
title: Email Automation Workflow Setup for Knowledge Lake Integration
business_area: AAE Development
quality_rating: Excellent
business_impact: High Impact
status: 🔄 Processing
tags: automation, email, knowledge-lake, integration
---

## Context
Setting up Manus to receive and process conversation exports via email, then ingest into Knowledge Lake.

## User
Manus, I need you to process these conversation captures and update the Knowledge Lake...

## Manus
I'll set up email monitoring for files sent to carla@carlorbiz.com.au with subject "Manus action this"...

## Key Insights
- Email-based workflow enables asynchronous processing
- Manus can handle conversation parsing autonomously
- Reduces n8n workflow complexity

## Deliverables Created
- Email monitoring script
- Markdown/JSON parser
- Knowledge Lake ingestion client

## Next Steps
- [ ] Test with sample email
- [ ] Verify Notion database updates
- [ ] Confirm Knowledge Lake API writes
```

---

### Example 3: Dev (ChatGPT) Voice Conversation

```markdown
---
agent: DEV
date: 2025-12-03
title: Ebook Development - Extended Podcast Brainstorm Session
business_area: CARLORBIZ | Content
quality_rating: High - Breakthrough
business_impact: High Impact
status: 📥 Captured
tags: content, ebook, ai-adoption, executive-education, voice-conversation
---

## Context
2-hour extended voice conversation developing ebook structure on authentic AI adoption for executives. Dev queried Knowledge Lake for insights from Claude, Manus, and Jan.

## User
[Voice conversation transcribed]
Let's develop an ebook about authentic AI adoption based on all our AAE Council conversations...

## Dev
[Voice response transcribed]
Querying Knowledge Lake... I found 47 conversations about authentic AI adoption. Based on insights from Claude's executive coaching frameworks, Manus's automation workflows, and Jan's research...

## Key Insights
- Cross-agent knowledge enables richer content
- Voice conversations benefit from Knowledge Lake context
- Extended sessions produce high-quality outlines

## Deliverables Created
- Ebook outline (5 chapters, 15 sections)
- Chapter 1 draft content
- Research citations from AAE Council knowledge

## Next Steps
- [ ] Review and edit Chapter 1
- [ ] Continue voice session for Chapter 2
- [ ] Gather additional case studies from Fred
```

**Metadata for Knowledge Lake:**
```json
{
  "metadata": {
    "voice_conversation": true,
    "duration_minutes": 120,
    "knowledge_lake_queries": 12,
    "agents_referenced": ["Claude", "Manus", "Jan", "Fred"],
    "content_type": "ebook_development"
  }
}
```

---

## 🤖 n8n Workflow Integration

### Stream A: JSON Exports (Claude, Fred, Gemini)

**Trigger:** New file in Google Drive `/AAE-Exports/JSON-Native/[Agent]/`

**Processing:**
1. Parse JSON conversation structure
2. Extract metadata (date, agent, topic)
3. AI summarization (Claude API)
4. Dual-write:
   - Create Notion page in AI Agents Universal DB
   - POST to Knowledge Lake API `/api/conversations/ingest`
5. Move file to `/Archive/JSON-Native/[Agent]/`

### Stream B: Markdown Manual (Jan, Penny, Grok, NotebookLM)

**Trigger:** New file in Google Drive `/AAE-Exports/Markdown-Manual/0X-[API]/`

**Processing:**
1. Read markdown frontmatter (YAML)
2. Parse conversation structure
3. API processing (Anthropic/Gemini/OpenAI/Perplexity)
4. Entity extraction via AI
5. Dual-write (Notion + Knowledge Lake)
6. Move to archive

### Stream C: Manus Autonomous

**Trigger:** New file in `/AAE-Exports/Markdown-Manual/05-Manus/`

**Processing:**
1. Create Gmail draft with attachment
2. Email to carla@carlorbiz.com.au
3. Manus processes email attachment
4. Manus updates Notion + Knowledge Lake
5. Move to archive

---

## ✅ Validation Checklist

Before submitting content for ingestion, verify:

### Required Metadata
- [ ] Agent name specified
- [ ] Date in YYYY-MM-DD format
- [ ] Conversation title (max 100 chars)
- [ ] Business area selected
- [ ] Content is complete

### Content Quality
- [ ] Context section provides background
- [ ] User/Agent exchanges are complete
- [ ] Key insights are summarized
- [ ] Deliverables are listed
- [ ] Next steps identified (if applicable)

### Entity Extraction
- [ ] Major entities identified
- [ ] Entity types are correct
- [ ] Relationships make logical sense
- [ ] Source context provided

### Format Compliance
- [ ] Markdown formatting is correct
- [ ] YAML frontmatter is valid
- [ ] No sensitive information exposed
- [ ] File naming convention followed

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T:
- Use generic titles like "Conversation with Claude"
- Forget to include the date
- Mix multiple conversations in one file
- Include passwords or API keys
- Skip the Key Insights section
- Use unclear entity names

### ✅ DO:
- Be specific with titles
- Include full context
- Separate distinct conversations
- Sanitize sensitive information
- Extract meaningful insights
- Use consistent naming

---

## 📞 Support & Questions

**For technical issues:**
- Check Railway deployment: `https://knowledge-lake-api-production.up.railway.app/health`
- Verify n8n workflows are active
- Review Notion database permissions

**For content questions:**
- Refer to AAE Knowledge Lake Implementation Plan
- Check previous conversation examples
- Ask in AAE Council coordination chat

---

## 📚 Related Documentation

- **AAE Knowledge Lake Implementation Plan:** `C:\Users\carlo\Development\mem0-sync\mem0\knowledge-lake\AAE_Knowledge_Lake_Implementation_Plan.md`
- **Claude MCP Setup:** `C:\Users\carlo\Development\mem0-sync\mem0\agent-conversations\claude\claude-knowledge-lake-mcp\claude-knowledge-lake-mcp\README.md`
- **Railway API Docs:** `C:\Users\carlo\Development\mem0-sync\mem0\MANUS_RAILWAY_INTEGRATION.md`
- **AAE Dashboard Dual-Write:** `C:\Users\carlo\Development\mem0-sync\mem0\github-projects\aae-dashboard\DUAL_WRITE_IMPLEMENTATION.md`

---

**Version History:**

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-03 | 1.0 | Initial comprehensive guide created |

---

*Built for Carla's AI Automation Ecosystem* 🤖
