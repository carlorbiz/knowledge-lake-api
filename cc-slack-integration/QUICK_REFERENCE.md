# Quick Reference: MCP Servers & Integration

## 🚀 Live MCP Servers

| Service | URL | Status |
|---------|-----|--------|
| **DocsAutomator** | `https://web-production-14aec.up.railway.app` | ✅ Live |
| **Gamma** | `https://web-production-b4cb0.up.railway.app` | ✅ Live |

## 📝 DocsAutomator Templates

| Template | Doc ID |
|----------|--------|
| Course Package Template | `68d7b000c2fc16ccc70abdac` |
| AAE Agent Content Automation | `69088da6d852c9556cec26af` |

## 🔗 Quick Test Commands

### Test DocsAutomator
```bash
curl -X POST "https://web-production-14aec.up.railway.app/create_document" \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "68d7b000c2fc16ccc70abdac",
    "documentName": "Test Doc",
    "data": {
      "document_title": "Test",
      "main_content": "Test content"
    }
  }'
```

### Test Gamma
```bash
curl -X POST "https://web-production-b4cb0.up.railway.app/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "inputText": "Test presentation",
    "format": "presentation",
    "numCards": 3
  }'
```

## 🔧 n8n Integration Points

### When to use DocsAutomator MCP:
- Content > 1800 characters
- Keywords: "document", "report", "write"
- Output: Google Doc URL for Notion

### When to use Gamma MCP:
- Keywords: "presentation", "slides", "deck"
- Output: Gamma URL + optional PDF

### Standard CC Processing:
- Content < 1800 characters
- GitHub issue → CC processing
- Output: GitHub response

## 📊 Cost Savings

| Before | After | Savings |
|--------|-------|---------|
| Zapier for every doc | Railway MCP | ~100-500 tasks/month |
| $20-100/month | $1-2/month | **$18-98/month** 💰 |

## ⚠️ Current Issues to Fix

1. **GitHub Labels**: Issue #1 has no labels
   - Fix: Reconfigure GitHub node in n8n
   - Labels needed: `pending`, `cc-task`, `from-slack`

2. **Test Workflow**: End-to-end test needed
   - Create test issue with proper labels
   - Verify CC picks it up
   - Verify response flows back to Slack

## 📁 Important Files

- `N8N_MCP_INTEGRATION_READY.md` - Full integration guide
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `Manus-DocsAutomator-solutions/` - MCP server code
