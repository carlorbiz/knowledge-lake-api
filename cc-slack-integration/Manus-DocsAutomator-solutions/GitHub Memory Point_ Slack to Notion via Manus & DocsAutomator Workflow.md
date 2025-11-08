# GitHub Memory Point: Slack to Notion via Manus & DocsAutomator Workflow

**Date:** November 5, 2025

**Context:** Critical workflow architecture for AAE (Autonomous Agent Ecosystem)

**Purpose:** Document the complete architecture for processing long-form Slack content through Manus AI and DocsAutomator to overcome Notion's 2000-character property limit.

---

## Workflow Overview

This workflow enables the capture of long-form content from Slack tasks, processing through Manus AI, document generation via DocsAutomator, and storage of the resulting Google Drive URL in Notion.

### Key Components

1. **n8n** - Workflow orchestration
2. **Manus AI** - Content analysis, formatting, and API orchestration
3. **DocsAutomator** - Google Doc generation
4. **Notion** - Final storage with URL reference

### Architecture Flow

```
Slack Task (Long Content) 
  → n8n Trigger 
  → HTTP Request to Manus 
  → Manus: Analyze & Format 
  → Manus: Call DocsAutomator API 
  → DocsAutomator: Generate Google Doc 
  → Manus: Capture & Return URL 
  → n8n: Receive URL 
  → Notion Node: Create DB Page with URL
```

---

## Manus AI Role (Critical)

Manus serves as the **central processing hub** with these responsibilities:

1. **Analytical:** Parse and analyze long-form Slack content
2. **Content Generation:** Format content for DocsAutomator template
3. **API Orchestration:** Trigger DocsAutomator API with formatted data
4. **URL Storage:** Capture Google Drive URL from DocsAutomator response
5. **Response Formatting:** Return structured JSON with URL to n8n

---

## n8n Workflow Configuration

### Node 1: HTTP Request to Manus
- **Method:** POST
- **URL:** Manus webhook endpoint
- **Body:** JSON with `slack_content` field
- **Response:** JSON with `google_drive_url` field

### Node 2: Notion Create Database Page
- **Database ID:** Target Notion database
- **Properties:**
  - Title: Document title
  - URL: `{{$node["HTTP Request"].json.google_drive_url}}`

---

## DocsAutomator Template Design

### Recommended Template Structure

```
Title: {{document_title}}
Date: {{generation_date}}

Content:
{{main_content}}
```

### Template Features
- **Flexible placeholders** for various content types
- **Markdown formatting support** (enable in advanced options)
- **Conditional sections** for optional elements
- **Line items** for structured data

---

## Notion Integration Strategy

### Problem Solved
Notion has a 2000-character limit on all property types. This workflow bypasses that limitation by:
1. Storing full content in Google Docs
2. Saving only the URL in Notion
3. Maintaining full searchability and accessibility

### Notion Database Schema
- **Title:** Text (document name)
- **URL:** URL property (Google Drive link)
- **Created:** Date (auto-populated)
- **Source:** Select (e.g., "Slack")

---

## Implementation Checklist

- [ ] Create DocsAutomator template in Google Docs
- [ ] Get DocsAutomator `docId` from dashboard
- [ ] Configure Manus webhook endpoint
- [ ] Set up n8n workflow with HTTP Request node
- [ ] Configure Notion node with database ID
- [ ] Test with sample long-form content
- [ ] Verify Google Drive URL is correctly stored in Notion

---

## Key Insights & Decisions

1. **Direct API Integration:** Using DocsAutomator API directly (not Zapier) for efficiency
2. **Manus as Hub:** Centralizing complex logic in Manus reduces n8n workflow complexity
3. **Synchronous Response:** Manus waits for DocsAutomator response before returning to n8n
4. **URL-Only Storage:** Notion stores only the URL, not the content itself

---

## Future Enhancements

1. **Multiple Template Selection:** Manus could choose different templates based on content type
2. **Content Summarization:** Generate a summary for Notion preview
3. **Webhook Notifications:** Add DocsAutomator webhook for async processing
4. **Error Handling:** Implement retry logic and fallback mechanisms

---

## Related Documentation

- DocsAutomator API: https://docs.docsautomator.co/integrations-api/docsautomator-api
- n8n HTTP Request Node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- Notion API: https://developers.notion.com/

---

**Status:** Architecture Defined - Ready for Implementation

**Next Steps:** Create DocsAutomator templates and configure Manus webhook endpoint
