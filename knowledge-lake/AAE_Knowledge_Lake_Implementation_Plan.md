# AAE Knowledge Lake Implementation Plan

## Document Purpose
Complete implementation plan for bulk exporting, indexing, and ingesting LLM conversation history into Carla's AI Automation Ecosystem (AAE) dashboard and Knowledge Lake.

---

## Executive Summary

### Objective
Export 6+ months of AI conversations from all LLM platforms (Claude, Jan, Manus, Fred, Fredo, Gemini, Penny, Grok, NotebookLM, Claude Code) and ingest them into:
1. **Notion:** 🤖 AI Agent Conversations - Universal Database
2. **Railway API:** Knowledge Lake (powers AAE dashboard and apps)

### Key Decisions Made
- **Solution A adopted:** AI processing happens during ingestion (not as a second pass)
- **Manus as autonomous processor:** Handles its own stream via email, reducing n8n complexity
- **Archive strategy:** All processed files move to Archive folders to prevent reprocessing
- **Voice capture for artifacts:** Voice memo + screenshot approach (not Google Form) for capturing sandbox app learnings
- **Noris handles summaries:** Document Repository AI summaries generated on-demand in Notion, not automated

---

## LLM Council Members & Export Capabilities

| Council Member | Platform | Native Export | Export Format | Processing Stream |
|----------------|----------|---------------|---------------|-------------------|
| **Claude** | Claude.ai | ✅ Yes | JSON | Stream A: JSON-Ingest via n8n |
| **Fred** (ChatGPT Personal) | OpenAI | ✅ Yes | JSON/HTML | Stream A: JSON-Ingest via n8n |
| **Fredo** (ChatGPT Business) | OpenAI | ✅ Yes | JSON/HTML | Stream A: JSON-Ingest via n8n |
| **Gemini** | Google | ✅ Yes | JSON (Takeout) | Stream A: JSON-Ingest via n8n |
| **Jan** (Genspark) | Genspark.ai | ❌ No | Manual Markdown | Stream B: n8n API processing |
| **Manus** | Manus.ai | ❌ No | Manual Markdown | Stream C: Manus autonomous via email |
| **Penny** (Perplexity) | Perplexity.ai | ❌ No | Manual Markdown | Stream B: n8n API processing |
| **Grok** | X/Twitter | ❌ No | Manual Markdown | Stream B: n8n API processing |
| **NotebookLM** | Google | ⚠️ Limited | Manual Markdown | Stream B: n8n API processing |
| **Claude Code** | CLI/VS Code | ⚠️ Local logs | Session extraction | Stream B: Manual capture |

### Volume Priority (May 2025 - Present)
1. **Tier 1 (Highest):** Claude, Jan, Manus, Fred
2. **Tier 2:** Gemini, Penny, NotebookLM, Grok

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INGESTION LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STREAM A: Native JSON Exports       STREAM B: Manual Markdown (n8n)        │
│  (Claude, Fred, Fredo, Gemini)       (Jan, Penny, Grok, NotebookLM)         │
│                                                                              │
│  ↓ JSON → n8n single workflow        ↓ Markdown → n8n API-specific          │
│    parses + AI summarises              workflows (load-balanced)            │
│                                                                              │
│                                      STREAM C: Manus Autonomous              │
│                                      (Manus conversations + overflow)        │
│                                                                              │
│                                      ↓ Email → Manus processes directly      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STORAGE LAYER (Parallel Write)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  A) Notion: 🤖 AI Agent Conversations    B) Railway API: Knowledge Lake     │
│     - Universal Database                    - Powers AAE Dashboard           │
│     - Human-browsable, indexed              - Feeds apps & automations       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Google Drive Folder Structure

```
Google Drive/
  AAE-Exports/
    JSON-Native/
      Claude/                    ← Unzip Claude export here
      Fred/                      ← ChatGPT personal export
      Fredo/                     ← ChatGPT business export
      Gemini/                    ← Google Takeout Gemini export
    Markdown-Manual/
      01-Anthropic/              ← Manual captures → Claude API processing
      02-Gemini/                 ← Manual captures → Gemini API processing
      03-OpenAI/                 ← Manual captures → OpenAI API processing
      04-Perplexity/             ← Manual captures → Perplexity API processing
      05-Manus/                  ← Manual captures → Email to Manus
    Voice-Captures/              ← Voice memos + screenshots
    Artifacts/                   ← Standalone artifact files
    
    Archive/                     ← PROCESSED FILES MOVE HERE
      JSON-Native/
        Claude/
        Fred/
        Fredo/
        Gemini/
      Markdown-Manual/
        01-Anthropic/
        02-Gemini/
        03-OpenAI/
        04-Perplexity/
        05-Manus/
      Voice-Captures/
```

---

## n8n Workflow Suite

### Complete Workflow List

| # | Workflow Name | Trigger | Action | Archive To |
|---|---------------|---------|--------|------------|
| 1a | `AAE-JSON-Ingest-Claude` | New file in `/JSON-Native/Claude/` | Parse JSON → AI summarise → Notion + Knowledge Lake | `/Archive/JSON-Native/Claude/` |
| 1b | `AAE-JSON-Ingest-Fred` | New file in `/JSON-Native/Fred/` | Parse JSON → AI summarise → Notion + Knowledge Lake | `/Archive/JSON-Native/Fred/` |
| 1c | `AAE-JSON-Ingest-Fredo` | New file in `/JSON-Native/Fredo/` | Parse JSON → AI summarise → Notion + Knowledge Lake | `/Archive/JSON-Native/Fredo/` |
| 1d | `AAE-JSON-Ingest-Gemini` | New file in `/JSON-Native/Gemini/` | Parse JSON → AI summarise → Notion + Knowledge Lake | `/Archive/JSON-Native/Gemini/` |
| 2 | `AAE-MD-Anthropic` | New file in `/01-Anthropic/` | Claude API process → Notion + Knowledge Lake | `/Archive/Markdown-Manual/01-Anthropic/` |
| 3 | `AAE-MD-Gemini` | New file in `/02-Gemini/` | Gemini API process → Notion + Knowledge Lake | `/Archive/Markdown-Manual/02-Gemini/` |
| 4 | `AAE-MD-OpenAI` | New file in `/03-OpenAI/` | OpenAI API process → Notion + Knowledge Lake | `/Archive/Markdown-Manual/03-OpenAI/` |
| 5 | `AAE-MD-Perplexity` | New file in `/04-Perplexity/` | Perplexity API process → Notion + Knowledge Lake | `/Archive/Markdown-Manual/04-Perplexity/` |
| 6 | `AAE-Manus-Email-Packager` | New file in `/05-Manus/` | Create Gmail draft with attachment | `/Archive/Markdown-Manual/05-Manus/` |
| 7 | `AAE-Artifact-Voice-Capture` | New file in `/Voice-Captures/` | Transcribe → Generate narrative → Package for processing | `/Archive/Voice-Captures/` |
| 8 | `AAE-Document-Repository-Sync` | Any new file in Drive (filtered) | Extract metadata → Notion Document Repository | N/A (doesn't move files) |

### Workflow Pattern (All Follow This)

```
TRIGGER: New file in [Source Folder]
    ↓
PROCESS: [Parse / API call / Create draft / etc.]
    ↓
MOVE: File from [Source Folder] → [Archive/Source Folder]
    ↓
(Optional) LOG: Record for audit trail
```

---

## Manus Autonomous Pipeline

### How It Works
1. Files saved to `/05-Manus/` folder trigger n8n workflow
2. n8n creates Gmail draft with file attached
3. n8n moves file to Archive
4. Carla reviews/sends draft to Manus (or Manus monitors email directly)
5. Manus processes: parses content, generates summaries, updates Notion + Knowledge Lake

### Email Specification
- **To:** carla@carlorbiz.com.au
- **Subject:** "Manus action this"
- **Body:** File reference + timestamp + processing instructions
- **Attachment:** The Markdown/JSON file

### Manus Processing Instructions
When Manus receives the email, it should:
1. Parse the Markdown/JSON content
2. Extract: title, date, agent, key insights, deliverables
3. Generate: AI summary, suggested tags, business area classification
4. Create entry in: 🤖 AI Agent Universal Conversations database (Notion)
5. Push record to: Knowledge Lake API (Railway)
6. Confirm completion via email reply or Notion status update

---

## Notion Database Schemas

### 🤖 AI Agent Conversations - Universal Database

**Data Source ID:** `collection://12da15e1-369e-4bae-87a1-7f51182c978f`

| Property | Type | Values/Notes |
|----------|------|--------------|
| Conversation Title | Title | Main identifier |
| Primary AI Agent | Select | Jan (Genspark), Fred (ChatGPT), Claude (Anthropic), Colin (CoPilot), Callum (CoPilot Pro), Penny (Perplexity), Pete (Qolaba), Manus, Grok (X/Twitter), Gemini (Google), NotebookLM, Claude Code, Noris |
| Conversation Date | Date | When conversation occurred |
| Key Insights | Text | Main takeaways |
| Deliverables Created | Text | What was produced |
| Business Area | Multi-select | GPSA/HPSA, CARLORBIZ, MTMOT, ALL THINGS CARLA, AAE Development, Technology Infrastructure / Data Management |
| Agent Primary Role | Select | Research & Analysis, Content Creation, Technical Development, Strategic Planning, Creative & Copy, Workflow Optimisation |
| Quality Rating | Select | 1-5, Excellent, High - Breakthrough |
| Business Impact | Select | High Impact, Medium Impact, Low Impact, Reference Only |
| Status | Select | 📥 Captured, 🔄 Processing, ✅ Applied, 📚 Reference, 🗄️ Archived, Completed |
| Tags | Multi-select | consulting, course-creation, automation, research, strategy, technical, content, breakthrough |
| Source Link | URL | Link to original conversation |
| Extended Synthesis | Text | Full synthesis content |
| Cross-References | Text | Links to related conversations |

### Document Repository

**Data Source ID:** `collection://e1820264-2fb0-4d3f-8c02-49a06d4c6838`

| Property | Type | Values/Notes |
|----------|------|--------------|
| Document Name | Title | File name |
| File Type | Select | PDF, Word Document, Google Doc, Spreadsheet, Google Sheets, Presentation, Google Slides, Image (.png), Image (.jpg), Other |
| Date Added | Date | When added to repository |
| Date Last Modified | Date | Last modification |
| Google Drive Link | URL | Direct link to file |
| AI Summary | Text | Generated by Noris on-demand |
| Status | Select | Active, Archived, Under Review |
| Tags | Multi-select | Final Version, Draft, Reference, Template |
| Area | Relation | Links to Areas database |
| Project | Relation | Links to Projects database |

---

## Markdown Capture Template

Use this format for manual copy-paste captures:

```markdown
---
agent: [JAN/MANUS/PENNY/GROK/NOTEBOOKLM/CLAUDE-CODE]
date: YYYY-MM-DD
title: [Brief descriptive title]
business_area: [CARLORBIZ/MTMOT/AAE Development/etc.]
---

## User
[Your prompt here - copy full text]

## [Agent Name]
[Agent's response here - copy full text]

### Artifact: [Name] (if applicable)
**Type:** [Code block / Table / Document / Sandbox app / GitHub repo]
**Location:** [Filename or repo URL]
**Notes:** [Any relevant context]

## User
[Follow-up prompt]

## [Agent Name]
[Follow-up response]

---
```

### File Naming Convention

**Format:** `[NN]-[AGENT]-[YYYY-MM-DD]-[brief-descriptor].md`

**Examples:**
- `01-JAN-2025-05-15-rwav-compliance-framework.md` → Goes to `/01-Anthropic/`
- `02-MANUS-2025-05-16-executive-dashboard.md` → Goes to `/02-Gemini/`
- `05-JAN-2025-05-17-course-architecture.md` → Goes to `/05-Manus/`

**Load Balancing:**
- Files ending in `01-` → Anthropic API processing
- Files ending in `02-` → Gemini API processing
- Files ending in `03-` → OpenAI API processing
- Files ending in `04-` → Perplexity API processing
- Files ending in `05-` → Manus email packaging

---

## Artifact Handling Strategy

### Tier 1: Inline Artifacts
Code blocks, tables, text outputs → Copy directly into Markdown file

### Tier 2: Standalone Files
PDFs, images, single files → Save to `/Artifacts/` with naming convention:
`[conversation-id]-artifact-[NN].[ext]`

Reference in Markdown:
```markdown
### Artifact: [Name]
**File:** `01-JAN-2025-05-15-artifact-01.pdf`
**Location:** `/AAE-Exports/Artifacts/`
**Type:** PDF document
```

### Tier 3: Multi-File Apps / Sandbox Builds

**If pushed to GitHub:**
```markdown
### Artifact: Executive Prompt Builder App
**Repo:** https://github.com/carla/executive-prompt-builder
**Status:** Production
**Key Learning:** [Notes on what this taught you]
```

**If sandbox-only (Voice Capture Route):**
1. Take screenshot
2. Record voice memo (30-60 seconds) capturing:
   - What it was
   - What went wrong
   - How we solved it
   - Key insight for executives
3. Save both to `/Voice-Captures/`
4. Workflow transcribes and generates narrative

### Tier 4: NotebookLM Outputs
Export summaries/content → Save to Document Repository in Notion
Noris handles AI summarisation on-demand

---

## Voice Capture Workflow

### User Experience
1. Encounter valuable sandbox artifact during copy-paste session
2. Take screenshot (save to `/Voice-Captures/`)
3. Record voice memo (same location)
4. Workflow handles transcription + narrative generation

### Workflow: `AAE-Artifact-Voice-Capture`

```
TRIGGER: New audio file in /Voice-Captures/
    ↓
TRANSCRIBE: Whisper API (OpenAI) or Google Speech-to-Text
    ↓
AI PROCESS: Claude API generates structured narrative
    Prompt: "Transform this voice note into a structured artifact narrative
    for teaching executives about authentic AI adoption. Include:
    - What it was (functional description)
    - What went wrong (failures/frustrations)  
    - How we solved it (workarounds)
    - Key insight for executives (the teaching moment)"
    ↓
GENERATE: Markdown file combining narrative + screenshot reference
    ↓
SAVE: To appropriate /Markdown-Manual/0X-[API]/ folder
    ↓
MOVE: Original files to /Archive/Voice-Captures/
    ↓
(Existing conversation workflows take over)
```

---

## Document Repository Sync Workflow

### Purpose
Automatically capture ALL new documents created anywhere in Google Drive

### Workflow: `AAE-Document-Repository-Sync`

```
TRIGGER: Google Drive - New file (entire Drive, filtered)
    ↓
FILTER: File type whitelist
    ✓ Google Docs, Sheets, Slides
    ✓ PDF, Word, Excel, PowerPoint
    ✓ Images (.png, .jpg)
    ✗ Temp files, system files
    ↓
FILTER: Location exclusions
    ✗ /AAE-Exports/ (handled separately)
    ✗ /Trash/
    ↓
EXTRACT: Metadata
    - File name
    - MIME type → File Type mapping
    - Created date
    - Modified date
    - Drive URL
    ↓
DEDUPE: Check if already exists in Document Repository
    ↓
CREATE: Notion page in Document Repository
    - Document Name: [filename]
    - File Type: [mapped]
    - Date Added: [created]
    - Date Last Modified: [modified]
    - Google Drive Link: [URL]
    - Status: "Active"
    - AI Summary: (empty - Noris fills on-demand)
```

### MIME Type Mapping

```javascript
const mimeTypeMap = {
  'application/vnd.google-apps.document': 'Google Doc',
  'application/vnd.google-apps.spreadsheet': 'Google Sheets',
  'application/vnd.google-apps.presentation': 'Google Slides',
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Spreadsheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',
  'image/png': 'Image (.png)',
  'image/jpeg': 'Image (.jpg)'
};
```

---

## Export Instructions by Platform

### Claude (claude.ai)
1. Go to: https://claude.ai/settings/account
2. Scroll to "Export Data"
3. Click "Request Export"
4. Wait 24-48 hours for email with download link
5. Download ZIP file
6. Unzip to `/AAE-Exports/JSON-Native/Claude/`

### ChatGPT - Fred & Fredo (OpenAI)
1. Go to: Settings → Data Controls → Export Data
2. Click "Export"
3. Wait for email with download link
4. Download and unzip to respective folder

### Gemini (Google)
1. Go to: https://takeout.google.com
2. Deselect all, then select only "Gemini Apps"
3. Create export
4. Download and extract to `/AAE-Exports/JSON-Native/Gemini/`

### Jan, Manus, Penny, Grok, NotebookLM
**No native export available**
→ Manual copy-paste using Markdown template
→ Save to appropriate `/Markdown-Manual/0X-[API]/` folder

### Claude Code
**Local session logs**
→ Extract from VS Code/terminal history
→ Format as Markdown
→ Save to Markdown-Manual folder

---

## Implementation Phases

### Phase 1: Foundation (Do Now)
- [ ] Create Google Drive folder structure (including Archive)
- [ ] Request Claude export
- [ ] Request Fred export  
- [ ] Request Fredo export
- [ ] Request Gemini export (Google Takeout)
- [ ] Note folder IDs for n8n configuration

### Phase 2: n8n Workflows (Build While Waiting)
- [ ] Import `AAE-Manus-Email-Packager` workflow
- [ ] Build `AAE-JSON-Ingest` workflows (x4)
- [ ] Build `AAE-MD-[API]` workflows (x4)
- [ ] Build `AAE-Document-Repository-Sync` workflow
- [ ] Build `AAE-Artifact-Voice-Capture` workflow

### Phase 3: Manus Configuration
- [ ] Brief Manus on email monitoring setup
- [ ] Share Notion database schema with Manus
- [ ] Share Knowledge Lake API endpoint with Manus
- [ ] Test Manus pipeline with sample file

### Phase 4: Bulk Processing
- [ ] Process Claude JSON export
- [ ] Process Fred JSON export
- [ ] Process Fredo JSON export
- [ ] Process Gemini JSON export
- [ ] Begin manual Markdown captures for Jan, Penny, Grok, NotebookLM

### Phase 5: Ongoing Operations
- [ ] Workflows handle new content automatically
- [ ] Manus processes via email
- [ ] Document Repository stays in sync
- [ ] Knowledge Lake powers AAE dashboard

---

## n8n Workflow: AAE-Manus-Email-Packager (JSON)

```json
{
  "name": "AAE-Manus-Email-Packager",
  "nodes": [
    {
      "parameters": {
        "pollTimes": {
          "item": [
            {
              "mode": "everyMinute",
              "minute": 5
            }
          ]
        },
        "triggerOn": "specificFolder",
        "folderToWatch": {
          "__rl": true,
          "value": "[YOUR_05-MANUS_FOLDER_ID]",
          "mode": "list"
        },
        "event": "fileCreated",
        "options": {}
      },
      "id": "trigger-drive",
      "name": "Watch Manus Folder",
      "type": "n8n-nodes-base.googleDriveTrigger",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "download",
        "fileId": {
          "__rl": true,
          "value": "={{ $json.id }}",
          "mode": "id"
        },
        "options": {
          "binaryPropertyName": "attachment"
        }
      },
      "id": "download-file",
      "name": "Download File",
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [460, 300]
    },
    {
      "parameters": {
        "operation": "createDraft",
        "to": "carla@carlorbiz.com.au",
        "subject": "Manus action this",
        "emailType": "text",
        "message": "=File for processing: {{ $('Watch Manus Folder').item.json.name }}\n\nTimestamp: {{ $now.format('yyyy-MM-dd HH:mm') }}\n\nPlease process this conversation capture and update:\n1. AI Agent Universal Conversations database\n2. Knowledge Lake API",
        "options": {
          "attachmentsBinary": {
            "values": [
              {
                "property": "attachment"
              }
            ]
          }
        }
      },
      "id": "create-draft",
      "name": "Create Gmail Draft",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "operation": "move",
        "fileId": {
          "__rl": true,
          "value": "={{ $('Watch Manus Folder').item.json.id }}",
          "mode": "id"
        },
        "driveId": {
          "__rl": true,
          "value": "My Drive",
          "mode": "name"
        },
        "folderId": {
          "__rl": true,
          "value": "[YOUR_ARCHIVE_05-MANUS_FOLDER_ID]",
          "mode": "list"
        }
      },
      "id": "move-to-archive",
      "name": "Move to Archive",
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [900, 300]
    }
  ],
  "connections": {
    "Watch Manus Folder": {
      "main": [
        [
          {
            "node": "Download File",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Download File": {
      "main": [
        [
          {
            "node": "Create Gmail Draft",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Gmail Draft": {
      "main": [
        [
          {
            "node": "Move to Archive",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

**Configuration Required:**
1. Replace `[YOUR_05-MANUS_FOLDER_ID]` with actual folder ID
2. Replace `[YOUR_ARCHIVE_05-MANUS_FOLDER_ID]` with archive folder ID
3. Connect Google Drive OAuth2 credentials
4. Connect Gmail OAuth2 credentials

---

## Key Integrations Required

### APIs Needed
- **Anthropic API** (Claude) - for AI processing in workflows
- **Google Gemini API** - for AI processing in workflows
- **OpenAI API** - for AI processing + Whisper transcription
- **Perplexity API** - for AI processing in workflows
- **Notion API** - for database operations
- **Railway API** - for Knowledge Lake
- **Google Drive API** - for file operations
- **Gmail API** - for email draft creation

### Manus Capabilities Required
- Email monitoring
- Markdown/JSON parsing
- Notion database operations
- API calls to Knowledge Lake
- Autonomous workflow execution

---

## Success Metrics

### Bulk Import Complete When:
- [ ] All Claude conversations indexed
- [ ] All Fred conversations indexed
- [ ] All Fredo conversations indexed
- [ ] All Gemini conversations indexed
- [ ] High-value Jan conversations captured
- [ ] High-value Manus conversations captured
- [ ] High-value Penny conversations captured
- [ ] Key Grok conversations captured
- [ ] NotebookLM outputs in Document Repository

### Ongoing Success:
- [ ] New conversations auto-process within 24 hours
- [ ] Document Repository stays current
- [ ] Knowledge Lake accessible via AAE dashboard
- [ ] No duplicate entries
- [ ] Archive folders show processing history

---

## Contacts & Resources

### Notion Databases
- **AI Agent Conversations:** https://www.notion.so/1a6c9296096a452981f9e6c014c4b808
- **Document Repository:** https://www.notion.so/dca9607b74374a6eb59d610432c39605

### Related Documentation
- AAE Dashboard architecture (see previous Claude chats)
- Knowledge Lake API documentation (Railway)
- n8n workflow templates (this document)

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-30 | 1.0 | Initial comprehensive plan created |

n