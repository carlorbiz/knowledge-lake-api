# 🎯 CC TASK: Build Multi-Pass Learning Extraction System

**Priority:** HIGH - Core infrastructure for Knowledge Lake usefulness
**Assigned to:** CC (Claude Code)
**Location:** Save to mem0 repo as `/tools/learning_extractor/`

---

## 📋 Executive Summary

Build a local Python tool that extracts deep learnings from long, multi-topic conversations BEFORE they're ingested to the Knowledge Lake. This is NOT a simple API endpoint - it's a multi-pass extraction workflow that handles 80+ page conversations with associative, non-linear thinking patterns.

**The Problem:**
Carla's conversations are long, rich, and associative. She explores Topic A, which sparks Topic B, which circles back to change Topic A. A single-pass "summarise this" approach loses:
- The connections between topics
- The evolution of understanding within topics
- The spark moments ("Jan said X which made me realise Y")
- The thinking pattern itself (which is teaching gold for Nera)

**The Solution:**
A multi-pass extraction tool that runs locally, takes as long as needed, and produces structured learning output ready for Knowledge Lake ingestion.

---

## 🏗️ Architecture

```
INPUT: Raw conversation export (Markdown/JSON, potentially 80+ pages)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 1: SEGMENTATION                                       │
│  Break into topic threads, identify shift triggers          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 2: CONNECTION MAPPING                                 │
│  What sparked what, how topics interconnect                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 3: PER-THREAD LEARNING                                │
│  Extract learning journey for each topic                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 4: CROSS-THREAD INSIGHTS                              │
│  What emerged from topic intersections                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 5: THINKING PATTERN ANALYSIS                          │
│  How does this human's mind work? What's their style?       │
└─────────────────────────────────────────────────────────────┘
                              ↓
OUTPUT: Structured learning document (Markdown + optional JSON)
        Ready for human review, then Knowledge Lake ingestion
```

---

## 🔧 Technical Implementation

### Directory Structure

```
/tools/learning_extractor/
├── extractor.py           # Main extraction orchestrator
├── passes/
│   ├── __init__.py
│   ├── segmentation.py    # Pass 1
│   ├── connections.py     # Pass 2
│   ├── per_thread.py      # Pass 3
│   ├── cross_thread.py    # Pass 4
│   └── thinking_pattern.py # Pass 5
├── chunking.py            # Handle long conversations
├── prompts.py             # All LLM prompts
├── models.py              # Pydantic models for outputs
├── knowledge_lake.py      # Ingest to Knowledge Lake
├── config.py              # API keys, settings
└── README.md              # Usage instructions
```

### Handling Long Conversations

For 80+ page conversations that exceed token limits:

```python
class ConversationChunker:
    """
    Chunk long conversations while preserving context.
    
    Strategy:
    - Chunk at natural break points (topic shifts if detectable)
    - Overlap chunks to preserve context
    - Pass accumulated understanding forward
    """
    
    def __init__(self, max_tokens: int = 100000):
        self.max_tokens = max_tokens
        self.overlap_tokens = 2000  # Context preservation
    
    def chunk_conversation(self, content: str) -> List[Chunk]:
        # 1. Try to detect natural break points first
        # 2. Fall back to token-based chunking with overlap
        # 3. Tag each chunk with position and context summary
        pass
    
    def accumulate_understanding(self, chunks: List[Chunk], pass_outputs: List[PassOutput]) -> AccumulatedContext:
        # Build up understanding across chunks
        # Each subsequent chunk gets context from previous
        pass
```

---

## 📝 Pass Specifications

### PASS 1: SEGMENTATION

**Purpose:** Break the conversation into distinct topic threads and identify what triggered each shift.

**Prompt:**
```
You are analysing a conversation to identify distinct topic threads.

CONVERSATION CHUNK:
{chunk_content}

CONTEXT FROM PREVIOUS CHUNKS:
{accumulated_context}

TASK:
1. Identify each distinct topic/theme discussed in this chunk
2. For each topic, note:
   - Where it starts (quote the trigger moment)
   - Whether it's new or resuming an earlier thread
   - What triggered the shift TO this topic (previous statement, tangent, external reference)
3. Mark "continuation points" where a topic pauses but may resume later

OUTPUT FORMAT:
```json
{
  "topics_identified": [
    {
      "topic_id": "T1",
      "topic_name": "Nera naming and purpose",
      "first_appearance": "chunk_1, line ~15",
      "trigger": "Jan asked about the main app",
      "is_continuation": false,
      "continuation_of": null,
      "key_quotes": ["quote1", "quote2"],
      "paused_at": "chunk_1, line ~45",
      "resumption_note": "Likely to resume - left open-ended"
    }
  ],
  "topic_shifts": [
    {
      "from_topic": "T1",
      "to_topic": "T2", 
      "trigger_type": "spark_moment | tangent | llm_suggestion | human_redirect",
      "trigger_quote": "The exact words that caused the shift",
      "relationship": "T2 emerged because thinking about T1 raised this question"
    }
  ]
}
```
```

**Output:** Topic map with shift triggers

---

### PASS 2: CONNECTION MAPPING

**Purpose:** Understand how topics relate to and influence each other.

**Input:** Pass 1 output + original conversation

**Prompt:**
```
You are mapping the connections between topic threads in a conversation.

TOPIC MAP FROM PASS 1:
{pass_1_output}

CONVERSATION CONTENT:
{chunk_content}

TASK:
For each topic thread, identify:

1. UPSTREAM CONNECTIONS
   - What sparked this topic?
   - Was it a direct question, a tangent, an LLM suggestion, or an associative leap?
   - Quote the spark moment

2. DOWNSTREAM EFFECTS
   - What did this topic spark?
   - Did insights from this topic change understanding of other topics?
   
3. CROSS-POLLINATION
   - Where did Topic A insight combine with Topic B to create Topic C?
   - What only became clear because of the intersection?

4. EVOLUTION TRACKING
   - When this topic resumed later, what had changed?
   - What new understanding was brought from other topics?

OUTPUT FORMAT:
```json
{
  "connections": [
    {
      "from_topic": "T1",
      "to_topic": "T2",
      "connection_type": "sparked | informed | changed | merged_with",
      "description": "Thinking about Nera's purpose made Carla realise CareTrack isn't standalone",
      "evidence_quote": "Wait, if Nera is the window into the Knowledge Lake, then CareTrack is just..."
    }
  ],
  "evolution_events": [
    {
      "topic": "T1",
      "original_understanding": "Nera is a chatbot for MTMOT",
      "evolved_understanding": "Nera is a window into the Knowledge Lake",
      "catalyst": "Discussion of what CareTrack actually does (T3)",
      "location": "chunk_3, when revisiting T1"
    }
  ],
  "emergent_insights": [
    {
      "insight": "The tools aren't separate products - they're windows into the same system",
      "emerged_from": ["T1", "T3", "T5"],
      "evidence": "This only became clear when..."
    }
  ]
}
```
```

**Output:** Connection map showing how topics influenced each other

---

### PASS 3: PER-THREAD LEARNING

**Purpose:** Extract the learning journey within each topic thread.

**Input:** Pass 1 + Pass 2 outputs + original conversation

**Prompt:**
```
You are extracting the learning journey for a specific topic thread.

TOPIC: {topic_name}
TOPIC APPEARANCES: {locations_in_conversation}
CONNECTION CONTEXT: {relevant_connections_from_pass_2}

CONVERSATION EXCERPTS FOR THIS TOPIC:
{topic_excerpts}

TASK:
Capture the FULL learning journey for this topic:

1. STARTING POINT
   - What was the initial understanding/assumption?
   - What question or need prompted this topic?

2. JOURNEY MOMENTS
   For each significant moment in this topic thread:
   - What happened?
   - Was it a human insight, AI suggestion, confusion, breakthrough, pushback?
   - What emotion is evident? (frustration, excitement, confusion, clarity)
   - What changed in understanding?

3. EVOLUTION
   - How did understanding shift from start to finish?
   - What caused the key shifts?
   - Which shifts came from the human vs the AI?

4. HUMAN CONTRIBUTIONS
   - What questions did Carla ask that moved things forward?
   - Where did she push back on the AI?
   - What insights did SHE bring?

5. AI PERFORMANCE
   - Where did the AI help effectively?
   - Where did the AI miss the point?
   - Any loops or unhelpful tangents?

6. TRUST DYNAMICS
   - Any moments where trust was tested?
   - Any moments where trust was built?

7. FINAL UNDERSTANDING
   - Where did this topic end up?
   - Is it resolved or ongoing?

8. TRANSFERABLE INSIGHT
   - What would help someone else exploring this same topic?
   - What should they expect to feel?
   - What question should they ask?

OUTPUT FORMAT:
Write as a NARRATIVE, not bullet points. This should read like a story of learning.

Example:
"The naming journey started with uncertainty. Carla had been calling it 'Vera' 
but it didn't feel right. Jan suggested thinking about what the tool actually 
DOES rather than what it IS. This sparked a shift - Carla realised she'd been 
thinking of it as a chatbot when it was really a window into something larger.

The breakthrough came when discussing CareTrack. Carla suddenly saw that both 
tools were windows into the same Knowledge Lake, just for different audiences.
'Wait,' she said, 'if that's true, then the name needs to reflect...' 

The frustration in earlier naming attempts wasn't indecision - it was the 
purpose still crystallising. The right name arrived when the purpose clarified.
Nera emerged not as a choice but as a recognition.

For others: If you keep renaming your AI project, you're not failing to decide.
You're discovering what it actually is. The discomfort is part of the process.
Expect it to take weeks. The name arrives when the purpose is ready."
```

**Output:** Narrative learning journey for each topic

---

### PASS 4: CROSS-THREAD INSIGHTS

**Purpose:** Capture what emerged from the intersection of topics.

**Input:** Pass 1 + Pass 2 + Pass 3 outputs

**Prompt:**
```
You are identifying insights that emerged from the INTERSECTION of multiple topics.

TOPIC SUMMARIES:
{pass_3_outputs}

CONNECTION MAP:
{pass_2_connections}

TASK:
Identify insights that ONLY emerged because multiple topics collided:

1. EMERGENT INSIGHTS
   - What understanding arose from Topic A + Topic B that neither would have produced alone?
   - Quote the moment of emergence if possible

2. PATTERN RECOGNITION
   - Did multiple topics reveal the same underlying pattern?
   - What's the meta-insight?

3. UNEXPECTED CONNECTIONS
   - What linked that wasn't obvious at the start?
   - How did a "tangent" become central?

4. CRYSTALLISATION MOMENTS
   - When did everything come together?
   - What was the trigger?

OUTPUT FORMAT:
Narrative format. Each emergent insight as a mini-story:

"The connection between revenue model (T4) and timeline (T5) wasn't obvious 
until Carla mapped out the Mastermind Hub launch. She'd been thinking of them 
as separate planning exercises. But when Jan asked about capacity, something 
clicked: the revenue model DETERMINES the timeline, not the other way around.

If NDIS clients at $25/month are the foundation, that needs volume. Volume 
needs the app working. The app needs Nera. Nera needs the Knowledge Lake. 
The dependency chain reversed her thinking about what to build first.

This insight only emerged because she'd been jumping between revenue, timeline, 
and technical architecture. The 'scattered' conversation was actually her brain 
mapping dependencies she couldn't see linearly."
```

**Output:** Cross-thread insights as narratives

---

### PASS 5: THINKING PATTERN ANALYSIS

**Purpose:** Capture how THIS HUMAN thinks and learns - this is gold for Nera.

**Input:** All previous passes + original conversation

**Prompt:**
```
You are analysing the THINKING PATTERN of the human in this conversation.

This analysis will help Nera (an AI coach) understand how to support people 
with similar thinking styles.

CONVERSATION FLOW:
{topic_map_from_pass_1}

LEARNING JOURNEYS:
{pass_3_narratives}

TASK:
Characterise this human's thinking and learning style:

1. MOVEMENT PATTERN
   - How does their thinking move? (linear, circular, web-like, spiral)
   - Do they complete topics before moving on, or weave between?
   - Is there a rhythm to their tangents?

2. INSIGHT TRIGGERS
   - What tends to spark their best insights?
   - LLM suggestions? Their own questions? Contradictions? Examples?
   
3. PROCESSING STYLE
   - Do they think by talking/writing (external processing)?
   - Do they need to explore wrong paths to find right ones?
   - How do they handle confusion?

4. PUSH-BACK PATTERNS  
   - When do they push back on the AI?
   - What makes them trust vs distrust AI suggestions?

5. BREAKTHROUGH MARKERS
   - What does a breakthrough look like for them?
   - What typically precedes it?

6. WHAT THEY NEED FROM AI
   - Based on this conversation, what kind of AI support serves them best?
   - What would frustrate them?

7. COACHING IMPLICATIONS
   - If Nera is coaching someone with a similar style, what should Nera know?
   - What should Nera NOT do?

OUTPUT FORMAT:
Write as a profile that Nera could reference:

"THINKING STYLE PROFILE: Associative Web-Thinker

This person thinks in webs, not lines. They'll be exploring Topic A when 
something sparks Topic B, and they NEED to follow that spark - it's not 
distraction, it's how their insights form. Trying to keep them 'on track' 
will frustrate them and block their best thinking.

INSIGHT PATTERN:
Their breakthroughs come from COLLISION - when two separate threads suddenly 
connect. They often say 'wait...' or 'hold on...' right before a breakthrough. 
They need permission to circle back; that's when synthesis happens.

WHAT WORKS:
- Let them wander between topics
- Remind them of earlier threads when relevant ('you mentioned X earlier...')
- Ask connecting questions ('how does this relate to what you said about Y?')
- Celebrate the tangents - they're not noise

WHAT DOESN'T WORK:
- Forcing linear progression
- Summarising too early (they're not done processing)
- Treating topic-jumping as disorganisation
- Rushing to solutions

TRUST DYNAMICS:
They trust AI that follows their lead and builds on their tangents.
They distrust AI that tries to 'manage' the conversation or push toward closure.

TIME NEEDS:
Long conversations are not inefficiency - they're this person's processing 
method. A 2-hour conversation might produce insights that couldn't emerge 
in six 20-minute sessions."
```

**Output:** Thinking style profile for Nera's reference

---

## 📤 Final Output Structure

After all passes complete, compile into:

### learning_extraction_[date]_[source].md

```markdown
# Learning Extraction: [Conversation Title]

**Source:** [Jan conversation / Claude chat / etc]
**Date of Conversation:** [date]
**Extraction Date:** [today]
**Total Length:** [X pages / Y words]

---

## 🗺️ Topic Map

[Visual or structured list of topics and how they connected]

---

## 📚 Learning Journeys

### Topic 1: [Name]
[Pass 3 narrative]

### Topic 2: [Name]
[Pass 3 narrative]

[etc]

---

## 💡 Emergent Insights

[Pass 4 output - what emerged from intersections]

---

## 🧠 Thinking Pattern Profile

[Pass 5 output - for Nera's reference]

---

## 📋 For Knowledge Lake Ingestion

### Entry 1: [Topic 1 Learning]
**Suggested Topic:** [title]
**Content:** [condensed narrative]
**Entities:** [list]
**Relationships:** [list]

### Entry 2: [Topic 2 Learning]
[etc]

### Entry 3: [Cross-Thread Insight]
[etc]

### Entry 4: [Thinking Pattern Profile]
**Suggested Topic:** "Thinking Style: Carla - Associative Web Processor"
**Content:** [Pass 5 profile]

---

## 🗄️ Archive Recommendation

**Archive original?** [Yes/No]
**Reason:** [Keep because still has teaching value / Archive because fully extracted]
```

---

## 🖥️ Usage

```bash
# Extract learnings from a conversation
python extractor.py extract --input jan_conversation.md --output ./extractions/

# Review the output, make any edits, then ingest
python extractor.py ingest --input ./extractions/learning_extraction_20dec2025_jan.md

# Optionally archive the original after confirming extraction is complete
python extractor.py archive --conversation-id 140
```

---

## ✅ Success Criteria

- [ ] Handles 80+ page conversations without losing connections
- [ ] Chunking preserves context across breaks
- [ ] Pass 1 correctly identifies topic threads and triggers
- [ ] Pass 2 maps connections and evolution
- [ ] Pass 3 produces narrative (not bullet) learning journeys
- [ ] Pass 4 captures emergent cross-topic insights
- [ ] Pass 5 produces actionable thinking style profile
- [ ] Final output is ready for human review
- [ ] Ingest command properly structures entries for Knowledge Lake
- [ ] Archive command available but with safeguards

---

## 🧪 Test Case

**Use:** The Jan conversation (80 pages, multiple topics)

**Expected Topics:**
- Nera naming and purpose
- CareTrack positioning
- Revenue model
- Timeline and Mastermind Hub
- Video pipeline
- Carla's capacity
- More...

**Expected Emergent Insights:**
- The tools are windows into the same Knowledge Lake
- Revenue model determines timeline, not reverse
- The naming journey reflected purpose crystallisation

**Expected Thinking Profile:**
- Associative/web-based processing
- Needs to follow tangents
- Breakthroughs come from collision
- Long conversations are processing, not inefficiency

---

## 📅 When Complete

1. Test on Jan conversation
2. Review output with Carla
3. Refine prompts based on feedback
4. Ingest learnings to Knowledge Lake
5. Report: "COUNCIL UPDATE: Multi-Pass Learning Extraction System Complete"

Include your own reflection on building this - that's a learning journey too.

---

*Task created: 20 December 2025*
*Supersedes: Conversations #150, #151*
*Priority: HIGH - Core infrastructure*
*Assigned to: CC (Claude Code)*
