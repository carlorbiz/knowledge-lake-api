# 🎯 CC TASK BRIEF: Deep Learning Extraction System
## SUPERSEDES: Conversation #150 and all previous extract-learning task briefs

**Priority:** HIGH - Core to Nera's capability  
**Assigned to:** CC (Claude Code)  
**Created:** 21 December 2025  
**Status:** Ready for implementation

---

## ⚠️ CRITICAL CONTEXT SHIFT

This is NOT about summarising conversations. This is about **capturing the human journey of learning to work with AI** - including the struggle, the emotions, the trust dynamics, and the transferable insights.

### Why This Matters

The Knowledge Lake feeds **Nera** - Carla's Executive AI Advisor that will help other non-technical people navigate their own AI learning journeys.

Nera needs to be able to say:
> "What you're feeling right now - this frustration, this confusion about why nothing's working - that's completely normal. Let me show you what that looked like for someone else. It took three months. There were moments of wanting to give up. The breakthrough came from an unexpected direction. You're on track."

Nera can only say that if the Knowledge Lake captures **the journey**, not just the destination.

---

## The Four Layers of Learning

```
Layer 1: Individual Conversation Learnings
         "In this session, trust was tested when X happened..."
                              ↓
Layer 2: Pattern Recognition Across Conversations  
         "Over 6 months, we see a cycle: new AI release →
          frustration → adaptation → mastery"
                              ↓
Layer 3: Meta-Learning About Human-AI Collaboration
         "Trust isn't linear. It builds, breaks, rebuilds stronger.
          The breaking points are predictable. Recovery comes from..."
                              ↓
Layer 4: Nera's Teaching Capability
         "Client is frustrated. Nera can say: 'This matches a pattern
          we've seen. Here's what typically helps. You're not failing -
          you're in the messy middle.'"
```

---

## Task 1: Add `knowledge_lake_extract_learning` Tool

### Location
The MCP server in the mem0 repo (check Knowledge Lake conversation history for exact path).

### What It Must Extract (Four Dimensions)

#### 1. The Human Journey
- What was Carla trying to achieve?
- What obstacles did she hit?
- How did she feel? (frustration, confusion, breakthrough, satisfaction)
- What question or insight did SHE bring that moved things forward?
- Where did she push back or redirect the AI?

#### 2. The AI Performance
- Where did the AI help?
- Where did the AI fail or mislead?
- What was the AI's blind spot?
- Did the AI get stuck in a loop?
- How did the AI recover (or not)?

#### 3. The Collaboration Pattern
- What worked about the human-AI dynamic?
- What didn't work?
- When did trust build?
- When did trust break?
- What restored it?

#### 4. The Transferable Insight
- What would help someone else facing a similar situation?
- What's the "if I knew then what I know now" lesson?
- How is this applicable beyond the specific context?

---

## Task 2: Implement Multi-Pass Architecture

For long conversations (like Carla's 80+ page sessions with Jan), a single API call won't work. Token limits and context loss require a **multi-pass extraction**.

### The Five-Pass Sequence

```
PASS 1: SEGMENTATION
────────────────────
"Break this conversation into distinct topic threads. 
Identify where each thread starts, pauses, and resumes.
Note what TRIGGERED each topic shift."

Output: Topic map with markers/positions

Example:
- Topic A: "Railway deployment" starts at msg 5, resumes at msg 47, closes at msg 62
- Topic B: "Nera naming" starts at msg 12 (sparked by Topic A), evolves at msg 55
- Topic C: "Revenue model" starts at msg 23, intersects with Topic B at msg 60


PASS 2: CONNECTION MAPPING  
──────────────────────────
"For each topic thread, identify:
- What sparked it (previous topic, human tangent, AI suggestion)
- What it sparked (where did this lead)
- How the topic EVOLVED when revisited later"

Output: Thread connection diagram (JSON or structured format)

Example:
{
  "topicA": {
    "sparked_by": "human frustration with previous deployment",
    "sparked": ["topicD: timeline pressure"],
    "evolution": "Started as blocker → became teaching moment about CVE checking"
  }
}


PASS 3: PER-THREAD LEARNING
───────────────────────────
"For each topic thread, extract:
- Starting understanding
- Ending understanding  
- What caused the shift
- Transferable insight"

Output: Learning entry per topic

Example:
{
  "topic": "Railway deployment",
  "starting": "Confused why deploy kept failing",
  "ending": "CVE vulnerabilities in dependencies were blocking, not API code",
  "shift_trigger": "CC finally checked Next.js packages instead of Python code",
  "transferable": "When deploy fails repeatedly, check DEPENDENCIES not just your code"
}


PASS 4: CROSS-THREAD INSIGHTS
─────────────────────────────
"What insights emerged from the INTERSECTION of topics?
What only became clear because Topic A met Topic D?"

Output: Emergent learnings list

Example:
- "The timeline pressure (Topic C) forced a simplification that actually fixed the deployment (Topic A)"
- "The naming struggle (Topic B) was actually about purpose clarity, which informed the revenue model (Topic C)"


PASS 5: THINKING PATTERN CAPTURE
────────────────────────────────
"How does Carla's thinking move? What triggers her best insights?
What's her pattern of circling back? What does she do when stuck?"

Output: Meta-learning about the human

Example:
{
  "thinking_pattern": "Carla circles back to earlier topics when she gets stuck. 
    Her 'tangents' are actually her brain making connections. 
    She pushes back when the AI gets too mechanical. 
    Her best insights come when she says 'wait, but what about...'",
  "teachable_for_nera": "When a client seems to be going off-topic, 
    they may be making a connection. Ask them what sparked the tangent."
}
```

### Implementation Notes

- **Chunking strategy**: Break long conversations into manageable chunks (3000-4000 tokens each)
- **Context preservation**: Each chunk must include summary of previous chunks to maintain thread tracking
- **Thread tracking across chunks**: Use a running "topic register" that updates as you process
- **Multiple passes with accumulated understanding**: Each pass builds on the previous

---

## Task 3: Add `knowledge_lake_archive` Tool

### Purpose
After extracting learnings from a conversation, archive the original to:
- Prevent it polluting query results
- Keep the Knowledge Lake clean and queryable
- Preserve raw data for future reference if needed

### Implementation

```python
@mcp.tool()
async def knowledge_lake_archive(
    params: ArchiveInput
) -> str:
    """
    Archive a conversation after learning extraction.
    
    Use after extract_learning to keep the Knowledge Lake clean.
    Archived conversations are preserved but excluded from standard queries.
    
    Args:
        params: Contains conversation_id and optional archive_reason
    
    Returns:
        Confirmation of archive with learning IDs created from extraction
    """
    # POST to /api/conversations/archive
    # Body: {"conversation_id": id, "reason": reason}
```

### Safeguards Required

**DO NOT archive conversations that:**
- Represent ongoing, multi-topic strategic discussions (like Jan sessions)
- Have not had extract-learning run first
- Are marked as "journey" conversations (flag to be added)

**Archive criteria:**
- Single-task completion conversations → extract then archive
- Multi-topic conversations → extract learnings, keep original active for reference
- Decision log conversations → extract key decisions, keep original

---

## The Complete Workflow

```
INGEST → EXTRACT-LEARNING → ARCHIVE (if applicable)
```

For different conversation types:

### Single-Task Conversations
```
Example: "Fix the Railway deployment bug"
Flow: Ingest → Extract (all 5 passes) → Archive
Result: Clean learning entry, original archived
```

### Multi-Topic Strategic Sessions
```
Example: "80-page conversation with Jan about AAE, Nera, Revenue, Timeline"
Flow: Ingest → Extract (all 5 passes) → DO NOT Archive
Result: Multiple learning entries, original stays queryable for ongoing reference
```

### Meta-Learning Conversations
```
Example: "This conversation about how extract-learning should work"
Flow: Ingest → Extract (focus on Pass 5: thinking patterns) → Keep active
Result: Teaching material for Nera about process design
```

---

## Test Case: Process Conversations #140-141

The Jan conversation about strategic planning is your test case.

### Expected Outputs

From this test, you should produce:
1. **Segmented topic map** - showing the 12+ distinct threads woven through
2. **Connection diagram** - what sparked what
3. **Per-topic learnings** - at least one transferable insight per thread
4. **Cross-topic insights** - the emergent patterns
5. **Thinking pattern capture** - Carla's associative reasoning style

### Success Criteria

- [ ] Can extract all four dimensions (human journey, AI performance, collaboration, transferable)
- [ ] Extraction output reads as narrative, not bullet points
- [ ] Emotional arc is explicit in extractions
- [ ] Multi-pass architecture handles 80+ page conversations without losing thread connections
- [ ] Archive function has safeguards against archiving journey content
- [ ] Tools callable from Claude GUI via MCP

---

## Example Output Format

Here's what a good extraction from the Jan conversation should look like:

```markdown
## Extracted Learning: The Naming Journey
**From:** Conversation #140-141 (Carla + Jan strategic planning)
**Thread:** Nera naming evolution
**Connected to:** Revenue model, app architecture, purpose clarity

### THE JOURNEY:
The tool was called Vera, then Aurelia, then Nera. This wasn't 
indecision - it was evolution. Each name change reflected a deeper
understanding of what the tool actually IS.

Started as: "A chatbot for MTMOT"
Became: "A window into the Knowledge Lake"
Final: "An Executive AI Advisor that can coach others through 
        their own AI learning journeys"

### PATTERN: 
Naming struggles often signal that the PURPOSE is still crystallising.
Don't fight the renaming - it's part of the process. The right name
arrives when the purpose clarifies.

### TRANSFERABLE:
If you keep renaming your AI project, you're not failing to decide.
You're discovering what it actually is. Keep going.

### CONNECTION:
The name only settled after the revenue model conversation forced
clarity on WHO Nera serves and WHY they'd pay. Purpose preceded naming.
```

---

## When Complete

Ingest to Knowledge Lake with topic: **"COUNCIL UPDATE: Deep Learning Extraction System Implemented"**

Include your own reflection on building this - that's a learning journey too.

---

## API Endpoints (Already Exist)

The Railway API has these endpoints ready:
- `POST /api/conversations/extract-learning` - needs MCP wrapper
- `POST /api/conversations/archive` - needs MCP wrapper

Check the API documentation or test with curl to confirm exact schema.

---

## Key URLs

- Knowledge Lake API: `https://knowledge-lake-api-production.up.railway.app`
- Health: `https://knowledge-lake-api-production.up.railway.app/health`
- Stats: `https://knowledge-lake-api-production.up.railway.app/api/stats`
- Notion Tracking: `https://www.notion.so/2ce9440556f781b5b219d26fa3963b07`

---

*This supersedes all previous extract-learning task briefs*  
*Created: 21 December 2025*  
*Source: Carla + Claude conversation that ran out of context*
