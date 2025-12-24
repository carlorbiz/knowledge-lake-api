#!/usr/bin/env python3
"""
Test classification algorithm on real conversations
"""

import sys
from pathlib import Path

# Import classification algorithm
sys.path.insert(0, str(Path(__file__).parent))
from classify_conversation import classify_conversation

# Test Case 1: Architecture Evolution (known complex)
architecture_evolution_path = Path(__file__).parent.parent / "agent-conversations" / "claude" / "2025-12-22-architecture-evolution.md"

print("=" * 80)
print("CLASSIFICATION TESTING ON REAL CONVERSATIONS")
print("=" * 80)
print()

# Test 1: Architecture Evolution (80+ pages, multi-topic)
if architecture_evolution_path.exists():
    with open(architecture_evolution_path, 'r', encoding='utf-8') as f:
        content = f.read()

    result = classify_conversation(content)

    print("Test 1: 2025-12-22-architecture-evolution.md")
    print("  Expected: COMPLEX (80+ pages, 2 overlapping threads)")
    print(f"  Classification: {result.classification.upper()}")
    print(f"  Complexity Score: {result.complexity_score}/100")
    print(f"  Word Count: {result.word_count:,}")
    print(f"  Topic Shifts: {result.topic_shift_count}")
    print(f"  Breakthrough Moments: {result.breakthrough_count}")
    print(f"  Reasoning: {result.reasoning[:200]}...")
    print()

    if result.classification == "complex":
        print("  [PASS] Correctly identified as complex")
    else:
        print(f"  [REVIEW] Classified as {result.classification} (expected complex)")
    print()
else:
    print("Test 1: SKIPPED (architecture-evolution.md not found)")
    print()

# Test 2: Bug fix conversation (simulate simple)
bug_fix_content = """
User: The PostgreSQL query syntax is wrong in /api/query endpoint

CC: Let me check the code.

[Reads file]

I see the issue. You're using SQLite placeholders (?) instead of PostgreSQL (%s).

Here's the fix:

```python
# Before:
cursor.execute("SELECT * FROM conversations WHERE userId = ?", (user_id,))

# After:
cursor.execute("SELECT * FROM conversations WHERE userId = %s", (user_id,))
```

User: Perfect! That fixed it. The query is now working.

CC: Great! The search results are returning correctly now.
"""

result2 = classify_conversation(bug_fix_content)

print("Test 2: Simulated Bug Fix Conversation")
print("  Expected: SIMPLE (single issue, linear resolution)")
print(f"  Classification: {result2.classification.upper()}")
print(f"  Complexity Score: {result2.complexity_score}/100")
print(f"  Word Count: {result2.word_count:,}")
print(f"  Topic Shifts: {result2.topic_shift_count}")
print(f"  Reasoning: {result2.reasoning}")
print()

if result2.classification == "simple":
    print("  [PASS] Correctly identified as simple")
else:
    print(f"  [REVIEW] Classified as {result2.classification} (expected simple)")
print()

# Test 3: Medium complexity (manual review zone)
medium_conversation = """
User: Help me set up the Knowledge Lake MCP for Claude

CC: I'll help you set up the MCP. First, let me read the configuration.

[Reads .vscode/mcp.json]

I see you need to add the Knowledge Lake MCP server. Here's the configuration:

```json
{
  "name": "knowledge-lake",
  "type": "stdio",
  "command": "python",
  "args": ["path/to/mcp_server.py"]
}
```

User: Got it. That reminds me - I also need to update the extraction endpoints.

CC: Good point. Let me add the extract_learning and archive_conversations methods.

[Adds methods to knowledge_lake.py]

Done. The MCP now has both endpoints.

User: Perfect! This will help with the multi-pass extraction workflow.

CC: Yes, now you can extract learnings and archive processed conversations.
"""

result3 = classify_conversation(medium_conversation)

print("Test 3: Medium Complexity Conversation")
print("  Expected: MANUAL_REVIEW or SIMPLE (gray zone)")
print(f"  Classification: {result3.classification.upper()}")
print(f"  Complexity Score: {result3.complexity_score}/100")
print(f"  Word Count: {result3.word_count:,}")
print(f"  Topic Shifts: {result3.topic_shift_count}")
print(f"  Reasoning: {result3.reasoning}")
print()

if result3.classification in ["manual_review", "simple"]:
    print(f"  [PASS] Classified as {result3.classification} (within expected range)")
else:
    print(f"  [UNEXPECTED] Classified as {result3.classification}")
print()

# Summary
print("=" * 80)
print("CLASSIFICATION SUMMARY")
print("=" * 80)
print()
print("Algorithm Performance:")
print("  - Complex conversations: Detected by word count, topic shifts, breakthroughs")
print("  - Simple conversations: Detected by low word count, linear structure")
print("  - Manual review: Gray zone conversations with mixed signals")
print()
print("Recommendations:")
print("  1. Deploy algorithm for auto-classification on new ingests")
print("  2. Manual review threshold (30-70) allows Carla to make final call")
print("  3. Adjust thresholds after real-world testing")
print()
