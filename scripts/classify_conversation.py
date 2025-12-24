#!/usr/bin/env python3
"""
Conversation Classification Algorithm
Determines whether a conversation is SIMPLE or COMPLEX based on multiple criteria

Used to route conversations to:
- SIMPLE: Current ingest flow (unchanged)
- COMPLEX: Multi-pass extraction process
"""

import re
from typing import Dict, Literal
from dataclasses import dataclass


@dataclass
class ClassificationResult:
    """Result of conversation classification"""

    classification: Literal["simple", "complex", "manual_review"]
    complexity_score: int
    word_count: int
    topic_shift_count: int
    breakthrough_count: int
    reasoning: str


def classify_conversation(content: str, metadata: Dict = None) -> ClassificationResult:
    """
    Classify conversation as SIMPLE or COMPLEX

    Criteria:
    - Word count threshold
    - Topic shift detection
    - Structural analysis
    - Breakthrough moments

    Args:
        content: Full conversation content (markdown or plain text)
        metadata: Optional metadata dict with manual flags

    Returns:
        ClassificationResult with classification and scoring details
    """

    # Initialize scoring
    complexity_score = 0
    reasoning_parts = []

    # 1. WORD COUNT ANALYSIS
    word_count = len(content.split())

    if word_count > 5000:
        complexity_score = 100
        reasoning_parts.append(f"Word count {word_count} >> 5000 (definitely complex)")
    elif word_count < 2000:
        reasoning_parts.append(f"Word count {word_count} < 2000 (likely simple)")
        # Don't return yet - continue analysis
    else:
        complexity_score = 50
        reasoning_parts.append(f"Word count {word_count} in gray zone (needs further analysis)")

    # 2. TOPIC SHIFT DETECTION
    topic_indicators = [
        "actually, wait",
        "that reminds me",
        "speaking of",
        "on another note",
        "before i forget",
        "oh! i wanted to ask",
        "separately,",
        "one more thing",
        "also,",
        "wait, this is",
        "oh, another",
    ]

    topic_shift_count = sum(
        1 for indicator in topic_indicators if indicator.lower() in content.lower()
    )

    if topic_shift_count >= 3:
        complexity_score += 30
        reasoning_parts.append(
            f"Topic shifts ({topic_shift_count}) >= 3 (associative thinking pattern)"
        )
    elif topic_shift_count >= 1:
        complexity_score += 10
        reasoning_parts.append(f"Topic shifts ({topic_shift_count}) detected")
    else:
        reasoning_parts.append("Linear conversation (no topic shifts)")

    # 3. STRUCTURAL ANALYSIS

    # Code blocks suggest technical/focused conversation (reduce complexity)
    code_block_count = content.count("```")
    if code_block_count >= 5:
        complexity_score -= 10
        reasoning_parts.append(
            f"Many code blocks ({code_block_count // 2}) - likely focused technical discussion"
        )

    # Many headers suggest multiple sections/topics (increase complexity)
    header_count = len(re.findall(r"#{1,3}\s", content))
    if header_count > 10:
        complexity_score += 20
        reasoning_parts.append(f"Many section headers ({header_count}) - multi-faceted discussion")
    elif header_count > 5:
        complexity_score += 10
        reasoning_parts.append(f"Multiple sections ({header_count})")

    # 4. BREAKTHROUGH MOMENTS
    breakthrough_markers = [
        "oh my god",
        "wait, this is huge",
        "i just realized",
        "breakthrough",
        "finally!",
        "this changes everything",
        "that's the key",
        "now i get it",
        "aha!",
        "this is the solution",
    ]

    breakthrough_count = sum(
        1 for marker in breakthrough_markers if marker.lower() in content.lower()
    )

    if breakthrough_count >= 2:
        complexity_score += 25
        reasoning_parts.append(
            f"Multiple breakthroughs ({breakthrough_count}) - significant learning journey"
        )
    elif breakthrough_count == 1:
        complexity_score += 10
        reasoning_parts.append("Breakthrough moment detected")

    # 5. EMOTIONAL INDICATORS (frustration → mastery arc)
    frustration_markers = [
        "why isn't this working",
        "i don't understand",
        "this is confusing",
        "what am i missing",
        "this makes no sense",
        "i'm stuck",
    ]

    frustration_count = sum(
        1 for marker in frustration_markers if marker.lower() in content.lower()
    )

    if frustration_count >= 2:
        complexity_score += 15
        reasoning_parts.append(
            f"Frustration markers ({frustration_count}) - emotional learning journey"
        )

    # 6. METADATA OVERRIDES
    if metadata:
        # Manual flag always wins
        if metadata.get("manual_flag_complex"):
            return ClassificationResult(
                classification="complex",
                complexity_score=100,
                word_count=word_count,
                topic_shift_count=topic_shift_count,
                breakthrough_count=breakthrough_count,
                reasoning="MANUAL FLAG: User explicitly marked as complex",
            )

        if metadata.get("manual_flag_simple"):
            return ClassificationResult(
                classification="simple",
                complexity_score=0,
                word_count=word_count,
                topic_shift_count=topic_shift_count,
                breakthrough_count=breakthrough_count,
                reasoning="MANUAL FLAG: User explicitly marked as simple",
            )

    # 7. FINAL CLASSIFICATION DECISION
    reasoning = " | ".join(reasoning_parts)

    if complexity_score >= 70:
        classification = "complex"
    elif complexity_score <= 30:
        classification = "simple"
    else:
        classification = "manual_review"

    return ClassificationResult(
        classification=classification,
        complexity_score=min(100, max(0, complexity_score)),  # Clamp 0-100
        word_count=word_count,
        topic_shift_count=topic_shift_count,
        breakthrough_count=breakthrough_count,
        reasoning=reasoning,
    )


# Example usage and testing
if __name__ == "__main__":
    # Test case 1: Simple conversation (bug fix)
    simple_conversation = """
    User: The PostgreSQL query is failing with a syntax error

    CC: Let me check the query. I see the issue - you're using SQLite placeholders (?) instead of PostgreSQL (%s).

    ```python
    # Change this:
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

    # To this:
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    ```

    User: Perfect, that fixed it!

    CC: Great! The query is now working.
    """

    result1 = classify_conversation(simple_conversation)
    print("Test Case 1: Bug Fix")
    print(f"  Classification: {result1.classification}")
    print(f"  Complexity Score: {result1.complexity_score}")
    print(f"  Word Count: {result1.word_count}")
    print(f"  Reasoning: {result1.reasoning}")
    print()

    # Test case 2: Complex conversation (multi-topic, associative)
    complex_conversation = """
    User: Let's fix the Railway deployment issue

    CC: Looking at the Railway logs, I see CVE-2025-55183 is blocking the deployment...

    [3000 words of debugging...]

    User: Oh my god, finally! That fixes it.

    Actually, wait - that reminds me. While we're here, we should also set up the context sync protocol.

    CC: Good idea. Let me create CLAUDE.md...

    [2000 words on context sync...]

    User: This is huge. Speaking of context loss - I just realized we need the multi-pass extraction system too.

    CC: You're right. Let me design that architecture...

    [4000 words on multi-pass architecture...]

    User: Before I forget, we also need to handle the classification system. On another note, Nera needs this for the course launch.

    CC: Let me create the hybrid architecture plan...
    """

    result2 = classify_conversation(complex_conversation)
    print("Test Case 2: Complex Multi-Topic Session")
    print(f"  Classification: {result2.classification}")
    print(f"  Complexity Score: {result2.complexity_score}")
    print(f"  Word Count: {result2.word_count}")
    print(f"  Topic Shifts: {result2.topic_shift_count}")
    print(f"  Breakthroughs: {result2.breakthrough_count}")
    print(f"  Reasoning: {result2.reasoning}")
