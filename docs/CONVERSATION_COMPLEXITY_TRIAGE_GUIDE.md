# Conversation Complexity Triage Guide

**For: Claude GUI**
**Purpose:** Classify all Knowledge Lake conversations by complexity and mark for multi-pass extraction

---

## 📋 Task Overview

Review all conversations in the Knowledge Lake and add complexity classification metadata so they can be:
1. Automatically populated into the Notion Multi-Pass Queue
2. Prioritized for learning extraction
3. Processed by the automated extraction workflow

---

## 🎯 Classification Criteria

### **Complex** (requires multi-pass extraction)
**Indicators:**
- Word count ≥ 2,000 words
- Multiple topic shifts (3+ distinct subjects discussed)
- Strategic planning or architecture discussions
- Decision-making processes with trade-offs
- Deep technical implementation details
- Cross-domain knowledge integration
- High correction density (changing approach mid-conversation)

**Examples:**
- "Hybrid Architecture Plan" - 184,304 words, 74 threads
- "Knowledge Lake Implementation" - 96,400 words, strategic planning
- "AAE Council Briefing" - multi-agent coordination

### **Moderate** (optional multi-pass)
**Indicators:**
- Word count: 500-2,000 words
- 1-2 topic shifts
- Tactical implementation discussions
- Bug fixes with context-building
- Feature requests with detailed requirements

**Examples:**
- Single-feature implementation sessions
- Debugging sessions with learning outcomes
- Configuration/setup conversations with decisions

### **Simple** (standard ingestion only)
**Indicators:**
- Word count < 500 words
- Single-topic, single-task
- Quick bug fixes
- Simple questions/answers
- Status updates

**Examples:**
- "Fix typo in README"
- "How do I install X?"
- "Test conversation"

---

## 🔧 Required Metadata Fields

For EACH conversation, ensure these metadata fields exist:

```json
{
  "complexity_classification": "complex|moderate|simple",
  "complexity_score": 0-100,  // Calculated score
  "requires_multipass": true|false,
  "word_count": 1234,  // Actual word count
  "topic_shift_count": 5,  // Estimated number of distinct topics
  "businessArea": "AAE Development|MTMOT|GPSA|etc.",
  "processingAgent": "Claude GUI",  // Who classified it
  "agent": "Claude GUI|Fred|Manus|etc."  // Original conversation agent
}
```

---

## 📊 Complexity Scoring Formula

Use this scoring approach (0-100 scale):

```
Base Score = (word_count / 100) * 10  // Max 10 points per 1000 words

Topic Shift Bonus = topic_shift_count * 15  // 15 points per topic shift

Content Type Bonuses:
- Strategic planning: +20
- Architecture design: +20
- Multi-agent coordination: +15
- Decision-making process: +10
- Code implementation: +5
- Bug fix: -10 (unless multi-topic)

Final Score = min(100, Base + Topic Shift + Content Bonuses)

Classification:
- 70-100: Complex (requires multipass)
- 30-69: Moderate (optional multipass)
- 0-29: Simple (standard ingestion)
```

---

## 🚀 How to Classify Conversations

### **Method 1: Using Knowledge Lake MCP Tools** (Recommended)

Use the `search_knowledge_lake` or `kl_list_conversations` tools to fetch all conversations, then update them with classification metadata.

**Workflow:**
1. Fetch conversations: `kl_list_conversations(limit=200)`
2. For each conversation:
   - Analyze content for complexity indicators
   - Calculate complexity score
   - Prepare updated metadata
3. Use `kl_add_knowledge` to store classification results

### **Method 2: Direct API Calls**

```bash
# 1. Get all conversations
curl "https://knowledge-lake-api-production.up.railway.app/api/conversations?userId=1&limit=200"

# 2. For each conversation, calculate complexity

# 3. Re-ingest with updated metadata
curl -X POST "https://knowledge-lake-api-production.up.railway.app/api/conversations/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "agent": "Claude GUI",
    "date": "2025-12-24",
    "topic": "Conversation Title",
    "content": "...",
    "metadata": {
      "complexity_classification": "complex",
      "complexity_score": 85,
      "requires_multipass": true,
      "word_count": 5000,
      "topic_shift_count": 4,
      "businessArea": "AAE Development",
      "processingAgent": "Claude GUI"
    }
  }'
```

---

## ✅ Expected Outcomes

After classification, all conversations will have:

1. **Complexity metadata** for automated queue population
2. **Priority scores** for extraction workflow
3. **Business area tags** for context
4. **Topic shift counts** for multi-pass planning

The Notion Multi-Pass Queue will automatically populate with:
- All "complex" conversations (`requires_multipass: true`)
- Sorted by complexity_score (highest first)
- Ready for learning extraction via MCP tools

---

## 📝 Classification Checklist

For each conversation, verify:

- [ ] `complexity_classification` set (complex/moderate/simple)
- [ ] `complexity_score` calculated (0-100)
- [ ] `requires_multipass` boolean set
- [ ] `word_count` accurate
- [ ] `topic_shift_count` estimated
- [ ] `businessArea` assigned
- [ ] `processingAgent` = "Claude GUI"
- [ ] `agent` field correct (who had the conversation)

---

## 🔄 Automation Integration

Once classified, conversations will:

1. **Automatically appear** in Notion Multi-Pass Queue (if complex)
2. **Trigger extraction workflow** when assigned to an agent
3. **Update status** as extraction completes
4. **Archive** after learning extraction (optional)

---

## 📊 Example Classifications

### Example 1: Complex Strategic Planning
```json
{
  "id": 165,
  "topic": "Hybrid Architecture Plan for AAE",
  "content": "184,304 words discussing multi-agent architecture...",
  "metadata": {
    "complexity_classification": "complex",
    "complexity_score": 95,
    "requires_multipass": true,
    "word_count": 184304,
    "topic_shift_count": 74,
    "businessArea": "AAE Development",
    "processingAgent": "Claude GUI",
    "agent": "Claude Code"
  }
}
```

### Example 2: Moderate Feature Implementation
```json
{
  "id": 142,
  "topic": "Add MCP Knowledge Lake tools",
  "content": "1,500 words implementing new MCP server tools...",
  "metadata": {
    "complexity_classification": "moderate",
    "complexity_score": 45,
    "requires_multipass": false,
    "word_count": 1500,
    "topic_shift_count": 2,
    "businessArea": "AAE Development",
    "processingAgent": "Claude GUI",
    "agent": "Claude Code"
  }
}
```

### Example 3: Simple Bug Fix
```json
{
  "id": 550,
  "topic": "Fix typo in README",
  "content": "Quick fix for spelling error in documentation",
  "metadata": {
    "complexity_classification": "simple",
    "complexity_score": 5,
    "requires_multipass": false,
    "word_count": 100,
    "topic_shift_count": 0,
    "businessArea": "AAE Development",
    "processingAgent": "Claude GUI",
    "agent": "Claude Code"
  }
}
```

---

## 🎓 Tips for Accurate Classification

1. **Read the first 500 words** to understand context
2. **Scan for topic boundaries** (look for "switching gears", "moving on to", etc.)
3. **Count distinct subjects** discussed (not just mentions)
4. **Weight strategic > tactical > operational** discussions
5. **Consider learning density** - corrections, insights, methodology changes
6. **Check word count thresholds** - simple heuristic starting point

---

## 📈 Success Metrics

After triaging all conversations:

| Metric | Target |
|--------|--------|
| **Total conversations classified** | 100% (all in Knowledge Lake) |
| **Complex conversations identified** | 20-30% of total |
| **Moderate conversations** | 30-40% of total |
| **Simple conversations** | 30-50% of total |
| **Notion queue populated** | All complex conversations |
| **Missing metadata** | 0% |

---

## 🚦 Next Steps After Triage

1. **Verify Notion Queue** - Check https://notion.so/f64fdf5a8fdd4456a3308eec24368589
2. **Run populate command again** - Will add newly classified conversations
3. **Test extraction workflow** - Pick 1-2 complex conversations for test extraction
4. **Monitor results** - Check extraction quality and adjust classification if needed

---

## ❓ Questions to Ask Yourself

For each conversation:
- Does this teach me something new? → Complex/Moderate
- Would I reference this later? → Complex/Moderate
- Is this a single action/question? → Simple
- Does this involve multiple decisions? → Complex
- Could this be summarized in 1 sentence? → Simple
- Does this span multiple work sessions? → Complex

---

**Ready to Start?**

Use the Knowledge Lake MCP tools to fetch all conversations and begin classification. The system will handle the rest automatically!

---

*Last Updated: 2025-12-24*
*Version: 1.0*
*Status: Production Ready*
