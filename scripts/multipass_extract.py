#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Multi-Pass Learning Extraction Tool
Extracts deep learnings from complex, multi-topic conversations

5-Pass Architecture:
1. Segmentation - Identify distinct topic threads
2. Connection Mapping - Map how topics relate and influence each other
3. Per-Thread Learning - Extract discrete learnings from each thread
4. Cross-Thread Insights - Find patterns across multiple threads
5. Thinking Pattern Analysis - How user's thought process evolves
"""

import re
import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Tuple, Optional
from datetime import datetime
from pathlib import Path


@dataclass
class TopicThread:
    """A distinct topic thread within a conversation"""
    thread_id: int
    title: str
    start_line: int
    end_line: int
    excerpt: str  # First few lines
    keywords: List[str] = field(default_factory=list)
    breakthrough_moments: List[str] = field(default_factory=list)
    word_count: int = 0


@dataclass
class ThreadConnection:
    """Connection between two topic threads"""
    from_thread_id: int
    to_thread_id: int
    connection_type: str  # "triggered_by", "builds_on", "contradicts", "parallels"
    explanation: str
    evidence: str  # Quote showing the connection


@dataclass
class Learning:
    """A discrete learning extracted from a thread"""
    thread_id: int
    category: str  # "methodology", "decision", "correction", "insight", "value", "prompting", "teaching"
    summary: str
    details: str
    evidence: str  # Supporting quote
    confidence: str  # "high", "medium", "low"


@dataclass
class CrossThreadInsight:
    """Pattern found across multiple threads"""
    involved_threads: List[int]
    insight_type: str  # "evolution", "contradiction_resolution", "emergent_pattern"
    description: str
    significance: str


@dataclass
class ExtractionResult:
    """Complete multi-pass extraction result"""
    conversation_id: Optional[int] = None
    conversation_topic: str = ""
    word_count: int = 0
    extraction_date: str = ""

    # Pass 1: Segmentation
    threads: List[TopicThread] = field(default_factory=list)

    # Pass 2: Connections
    connections: List[ThreadConnection] = field(default_factory=list)

    # Pass 3: Per-thread learnings
    learnings: List[Learning] = field(default_factory=list)

    # Pass 4: Cross-thread insights
    cross_thread_insights: List[CrossThreadInsight] = field(default_factory=list)

    # Pass 5: Thinking patterns
    thinking_patterns: Dict[str, str] = field(default_factory=dict)


class MultiPassExtractor:
    """Multi-pass learning extraction from complex conversations"""

    def __init__(self):
        # Topic shift indicators
        self.topic_indicators = [
            "actually, wait", "that reminds me", "speaking of",
            "on another note", "before i forget", "oh! i wanted to ask",
            "switching gears", "also,", "separately,", "meanwhile,",
            "back to", "returning to", "as for", "regarding",
            "oh wait", "hold on", "wait a minute"
        ]

        # Breakthrough markers
        self.breakthrough_markers = [
            "oh my god", "wait, this is huge", "i just realized",
            "breakthrough", "finally!", "this changes everything",
            "aha!", "eureka", "that's it!", "of course!",
            "now i see", "this is the key"
        ]

        # Connection type indicators
        self.connection_indicators = {
            "triggered_by": ["because of", "due to", "prompted by", "in response to"],
            "builds_on": ["building on", "extending", "taking this further", "based on"],
            "contradicts": ["actually, no", "wait, that's wrong", "correction:", "scratch that"],
            "parallels": ["similarly", "likewise", "in the same way", "analogously"]
        }

    def extract(self, conversation_text: str, conversation_id: Optional[int] = None,
                topic: str = "") -> ExtractionResult:
        """
        Run all 5 passes of extraction

        Args:
            conversation_text: Full conversation content
            conversation_id: Optional conversation ID
            topic: Optional conversation topic

        Returns:
            Complete extraction result
        """
        result = ExtractionResult(
            conversation_id=conversation_id,
            conversation_topic=topic,
            word_count=len(conversation_text.split()),
            extraction_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        print("=" * 80)
        print("MULTI-PASS LEARNING EXTRACTION")
        print("=" * 80)
        print(f"Conversation: {topic or 'Untitled'}")
        print(f"Word Count: {result.word_count:,}")
        print(f"Started: {result.extraction_date}")
        print()

        # Pass 1: Segmentation
        print("[PASS 1] Segmenting conversation into topic threads...")
        result.threads = self._pass1_segmentation(conversation_text)
        print(f"  Found {len(result.threads)} topic threads")
        print()

        # Pass 2: Connection Mapping
        print("[PASS 2] Mapping connections between threads...")
        result.connections = self._pass2_connection_mapping(conversation_text, result.threads)
        print(f"  Identified {len(result.connections)} connections")
        print()

        # Pass 3: Per-Thread Learning
        print("[PASS 3] Extracting learnings from each thread...")
        result.learnings = self._pass3_per_thread_learning(conversation_text, result.threads)
        print(f"  Extracted {len(result.learnings)} learnings")
        print()

        # Pass 4: Cross-Thread Insights (optional for MVP)
        print("[PASS 4] Finding cross-thread insights...")
        result.cross_thread_insights = self._pass4_cross_thread_insights(result.threads, result.learnings, result.connections)
        print(f"  Discovered {len(result.cross_thread_insights)} insights")
        print()

        # Pass 5: Thinking Patterns (optional for MVP)
        print("[PASS 5] Analyzing thinking patterns...")
        result.thinking_patterns = self._pass5_thinking_patterns(conversation_text, result.threads, result.connections)
        print(f"  Analyzed {len(result.thinking_patterns)} patterns")
        print()

        print("=" * 80)
        print("EXTRACTION COMPLETE")
        print("=" * 80)
        print()

        return result

    def _pass1_segmentation(self, text: str) -> List[TopicThread]:
        """
        Pass 1: Identify distinct topic threads

        Strategy:
        1. Split by major topic shifts
        2. Look for breakthrough moments
        3. Identify keywords for each segment
        """
        lines = text.split('\n')
        threads = []
        current_thread_start = 0
        thread_id = 1

        # Find topic shift points
        shift_points = [0]  # Always start at beginning

        for i, line in enumerate(lines):
            line_lower = line.lower()

            # Check for topic shift indicators
            for indicator in self.topic_indicators:
                if indicator in line_lower:
                    # Don't create tiny segments
                    if i - shift_points[-1] > 10:
                        shift_points.append(i)
                        break

        # Always end at the last line
        shift_points.append(len(lines))

        # Create threads from segments
        for i in range(len(shift_points) - 1):
            start = shift_points[i]
            end = shift_points[i + 1]

            segment_text = '\n'.join(lines[start:end])

            # Skip very small segments
            if len(segment_text.split()) < 50:
                continue

            # Extract title from first substantive line
            title = self._extract_thread_title(segment_text)

            # Get excerpt (first 200 chars)
            excerpt = segment_text[:200].strip()

            # Extract keywords
            keywords = self._extract_keywords(segment_text)

            # Find breakthrough moments
            breakthroughs = []
            for marker in self.breakthrough_markers:
                if marker in segment_text.lower():
                    # Extract the sentence containing the breakthrough
                    for sentence in segment_text.split('.'):
                        if marker in sentence.lower():
                            breakthroughs.append(sentence.strip())
                            break

            thread = TopicThread(
                thread_id=thread_id,
                title=title,
                start_line=start,
                end_line=end,
                excerpt=excerpt,
                keywords=keywords[:5],  # Top 5 keywords
                breakthrough_moments=breakthroughs,
                word_count=len(segment_text.split())
            )

            threads.append(thread)
            thread_id += 1

        return threads

    def _pass2_connection_mapping(self, text: str, threads: List[TopicThread]) -> List[ThreadConnection]:
        """
        Pass 2: Map how topic threads relate to each other
        """
        connections = []

        # Look for explicit references between threads
        for i, thread1 in enumerate(threads):
            for j, thread2 in enumerate(threads):
                if i >= j:  # Only look forward
                    continue

                # Check if thread2 mentions concepts from thread1
                thread1_keywords = set(k.lower() for k in thread1.keywords)
                thread2_text = text.split('\n')[thread2.start_line:thread2.end_line]
                thread2_content = '\n'.join(thread2_text).lower()

                # Check for keyword overlap
                mentions = sum(1 for kw in thread1_keywords if kw in thread2_content)

                if mentions >= 2:  # At least 2 keyword mentions
                    # Determine connection type
                    connection_type = "builds_on"  # default
                    explanation = f"Thread {thread2.thread_id} references concepts from Thread {thread1.thread_id}"

                    for conn_type, indicators in self.connection_indicators.items():
                        for indicator in indicators:
                            if indicator in thread2_content:
                                connection_type = conn_type
                                explanation = f"Thread {thread2.thread_id} {conn_type.replace('_', ' ')} Thread {thread1.thread_id}"
                                break

                    # Extract evidence (first sentence with overlap)
                    evidence = "..."
                    for line in thread2_text:
                        if any(kw in line.lower() for kw in thread1_keywords):
                            evidence = line.strip()[:150]
                            break

                    connection = ThreadConnection(
                        from_thread_id=thread1.thread_id,
                        to_thread_id=thread2.thread_id,
                        connection_type=connection_type,
                        explanation=explanation,
                        evidence=evidence
                    )
                    connections.append(connection)

        return connections

    def _pass3_per_thread_learning(self, text: str, threads: List[TopicThread]) -> List[Learning]:
        """
        Pass 3: Extract discrete learnings from each thread

        Categories:
        - methodology: How we approached the problem
        - decision: Choices made and why
        - correction: What we fixed or changed
        - insight: New understanding or realization
        - value: What matters to the user
        - prompting: Effective prompting patterns
        - teaching: Lessons that could teach others
        """
        learnings = []
        lines = text.split('\n')

        for thread in threads:
            thread_text = '\n'.join(lines[thread.start_line:thread.end_line])

            # Look for decision patterns
            if any(word in thread_text.lower() for word in ["decided", "chose", "opted", "selected"]):
                learning = self._extract_learning(
                    thread.thread_id, "decision", thread_text,
                    patterns=["decided to", "chose to", "opted for", "went with"]
                )
                if learning:
                    learnings.append(learning)

            # Look for corrections
            if any(word in thread_text.lower() for word in ["fixed", "corrected", "changed", "updated", "bug"]):
                learning = self._extract_learning(
                    thread.thread_id, "correction", thread_text,
                    patterns=["fixed", "corrected", "bug", "issue", "problem"]
                )
                if learning:
                    learnings.append(learning)

            # Look for insights (breakthrough moments)
            if thread.breakthrough_moments:
                summary = f"Breakthrough in {thread.title}"
                details = ". ".join(thread.breakthrough_moments)
                learning = Learning(
                    thread_id=thread.thread_id,
                    category="insight",
                    summary=summary,
                    details=details,
                    evidence=thread.breakthrough_moments[0] if thread.breakthrough_moments else "",
                    confidence="high"
                )
                learnings.append(learning)

            # Look for methodology patterns
            if any(word in thread_text.lower() for word in ["approach", "strategy", "method", "process"]):
                learning = self._extract_learning(
                    thread.thread_id, "methodology", thread_text,
                    patterns=["approach", "strategy", "method", "by using", "implemented"]
                )
                if learning:
                    learnings.append(learning)

        return learnings

    def _pass4_cross_thread_insights(self, threads: List[TopicThread],
                                     learnings: List[Learning],
                                     connections: List[ThreadConnection]) -> List[CrossThreadInsight]:
        """
        Pass 4: Find patterns across multiple threads
        """
        insights = []

        # Look for evolution patterns (threads building on each other)
        connected_chains = self._find_thread_chains(connections)
        for chain in connected_chains:
            if len(chain) >= 3:  # Chain of at least 3 threads
                insight = CrossThreadInsight(
                    involved_threads=chain,
                    insight_type="evolution",
                    description=f"Topic evolution across {len(chain)} threads",
                    significance="Shows progressive refinement of understanding"
                )
                insights.append(insight)

        # Look for contradiction resolution
        contradictions = [c for c in connections if c.connection_type == "contradicts"]
        if contradictions:
            for contradiction in contradictions:
                insight = CrossThreadInsight(
                    involved_threads=[contradiction.from_thread_id, contradiction.to_thread_id],
                    insight_type="contradiction_resolution",
                    description=f"Initial approach corrected: {contradiction.explanation}",
                    significance="Demonstrates learning and adaptation"
                )
                insights.append(insight)

        # Look for emergent patterns (same category learnings across threads)
        category_counts = {}
        for learning in learnings:
            category_counts[learning.category] = category_counts.get(learning.category, 0) + 1

        for category, count in category_counts.items():
            if count >= 3:  # Pattern across multiple threads
                relevant_threads = list(set(l.thread_id for l in learnings if l.category == category))
                insight = CrossThreadInsight(
                    involved_threads=relevant_threads,
                    insight_type="emergent_pattern",
                    description=f"Repeated {category} learnings across conversation",
                    significance=f"Strong focus on {category} throughout discussion"
                )
                insights.append(insight)

        return insights

    def _pass5_thinking_patterns(self, text: str, threads: List[TopicThread],
                                 connections: List[ThreadConnection]) -> Dict[str, str]:
        """
        Pass 5: Analyze how user's thought process evolves
        """
        patterns = {}

        # Conversation flow pattern
        if len(threads) <= 2:
            patterns["flow"] = "Linear - single focused topic"
        elif len(threads) <= 5:
            patterns["flow"] = "Branching - multiple related topics"
        else:
            patterns["flow"] = "Associative - wide-ranging exploration"

        # Problem-solving approach
        corrections = [c for c in connections if c.connection_type == "contradicts"]
        if corrections:
            patterns["problem_solving"] = "Iterative - tests ideas and corrects"
        else:
            patterns["problem_solving"] = "Deliberate - builds systematically"

        # Depth vs breadth
        avg_thread_length = sum(t.word_count for t in threads) / len(threads) if threads else 0
        if avg_thread_length > 500:
            patterns["exploration_style"] = "Deep dive - thorough exploration of topics"
        else:
            patterns["exploration_style"] = "Survey - covering multiple topics quickly"

        # Breakthrough frequency
        total_breakthroughs = sum(len(t.breakthrough_moments) for t in threads)
        if total_breakthroughs >= 3:
            patterns["innovation"] = "High breakthrough frequency - generative conversation"
        elif total_breakthroughs >= 1:
            patterns["innovation"] = "Moderate breakthroughs - productive exploration"
        else:
            patterns["innovation"] = "Incremental progress - steady advancement"

        return patterns

    # Helper methods

    def _extract_thread_title(self, text: str) -> str:
        """Extract a descriptive title from thread text"""
        # Try to find a question or heading
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        for line in lines[:10]:  # Check first 10 lines
            # Look for questions
            if '?' in line and len(line.split()) < 15:
                return line.strip('?').strip()

            # Look for headings (markdown or caps)
            if line.startswith('#') or (line.isupper() and len(line.split()) < 10):
                return line.lstrip('#').strip()

        # Fallback: use first substantive sentence
        for line in lines[:5]:
            if len(line.split()) >= 3:
                words = line.split()[:8]  # First 8 words
                return ' '.join(words) + "..."

        return "Thread topic"

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract key terms from text"""
        # Simple keyword extraction: find capitalized terms and technical words
        words = text.split()
        keywords = set()

        for word in words:
            clean_word = re.sub(r'[^\w]', '', word)

            # Capitalized words (but not sentence starts)
            if clean_word and clean_word[0].isupper() and len(clean_word) > 2:
                keywords.add(clean_word)

            # Technical terms (contain numbers, underscores, or are all caps)
            if any(char.isdigit() for char in clean_word) or '_' in clean_word:
                keywords.add(clean_word)

        # Return most common
        return sorted(keywords)[:10]

    def _extract_learning(self, thread_id: int, category: str, text: str,
                          patterns: List[str]) -> Optional[Learning]:
        """Extract a learning of specific category from text"""
        text_lower = text.lower()

        # Find relevant sentences
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        relevant = []

        for sentence in sentences:
            if any(pattern in sentence.lower() for pattern in patterns):
                relevant.append(sentence)

        if not relevant:
            return None

        # Create learning from first relevant sentence
        evidence = relevant[0]
        summary = f"{category.title()}: " + evidence[:100]
        details = '. '.join(relevant[:3])  # Up to 3 sentences

        return Learning(
            thread_id=thread_id,
            category=category,
            summary=summary,
            details=details,
            evidence=evidence,
            confidence="medium"
        )

    def _find_thread_chains(self, connections: List[ThreadConnection]) -> List[List[int]]:
        """Find chains of connected threads"""
        # Build adjacency list
        graph = {}
        for conn in connections:
            if conn.from_thread_id not in graph:
                graph[conn.from_thread_id] = []
            graph[conn.from_thread_id].append(conn.to_thread_id)

        # Find chains (simple DFS)
        chains = []
        visited = set()

        def dfs(node, current_chain):
            if node in visited:
                return
            visited.add(node)
            current_chain.append(node)

            if node in graph:
                for neighbor in graph[node]:
                    dfs(neighbor, current_chain)

        for start_node in graph:
            if start_node not in visited:
                chain = []
                dfs(start_node, chain)
                if len(chain) > 1:
                    chains.append(chain)

        return chains

    def to_markdown(self, result: ExtractionResult) -> str:
        """Convert extraction result to structured markdown"""
        md = []

        # Header
        md.append("# Multi-Pass Learning Extraction Report")
        md.append("")
        md.append(f"**Conversation:** {result.conversation_topic}")
        if result.conversation_id:
            md.append(f"**Conversation ID:** {result.conversation_id}")
        md.append(f"**Word Count:** {result.word_count:,}")
        md.append(f"**Extracted:** {result.extraction_date}")
        md.append("")
        md.append("---")
        md.append("")

        # Pass 1: Threads
        md.append("## Pass 1: Topic Segmentation")
        md.append("")
        md.append(f"**Found {len(result.threads)} topic threads:**")
        md.append("")

        for thread in result.threads:
            md.append(f"### Thread {thread.thread_id}: {thread.title}")
            md.append(f"- **Lines:** {thread.start_line}-{thread.end_line}")
            md.append(f"- **Word Count:** {thread.word_count:,}")
            md.append(f"- **Keywords:** {', '.join(thread.keywords)}")
            if thread.breakthrough_moments:
                md.append(f"- **Breakthroughs:** {len(thread.breakthrough_moments)}")
                for bm in thread.breakthrough_moments:
                    md.append(f"  - \"{bm}\"")
            md.append("")

        md.append("---")
        md.append("")

        # Pass 2: Connections
        md.append("## Pass 2: Thread Connections")
        md.append("")
        md.append(f"**Identified {len(result.connections)} connections:**")
        md.append("")

        for conn in result.connections:
            md.append(f"- **Thread {conn.from_thread_id} → Thread {conn.to_thread_id}**")
            md.append(f"  - Type: `{conn.connection_type}`")
            md.append(f"  - {conn.explanation}")
            md.append(f"  - Evidence: \"{conn.evidence}...\"")
            md.append("")

        md.append("---")
        md.append("")

        # Pass 3: Learnings
        md.append("## Pass 3: Per-Thread Learnings")
        md.append("")
        md.append(f"**Extracted {len(result.learnings)} learnings:**")
        md.append("")

        # Group by category
        by_category = {}
        for learning in result.learnings:
            if learning.category not in by_category:
                by_category[learning.category] = []
            by_category[learning.category].append(learning)

        for category, learnings in by_category.items():
            md.append(f"### {category.title()}")
            md.append("")
            for learning in learnings:
                md.append(f"**Thread {learning.thread_id}:** {learning.summary}")
                md.append(f"- Details: {learning.details}")
                md.append(f"- Confidence: {learning.confidence}")
                md.append("")

        md.append("---")
        md.append("")

        # Pass 4: Cross-Thread Insights
        md.append("## Pass 4: Cross-Thread Insights")
        md.append("")
        md.append(f"**Discovered {len(result.cross_thread_insights)} insights:**")
        md.append("")

        for insight in result.cross_thread_insights:
            md.append(f"### {insight.insight_type.replace('_', ' ').title()}")
            md.append(f"- **Threads Involved:** {', '.join(map(str, insight.involved_threads))}")
            md.append(f"- **Description:** {insight.description}")
            md.append(f"- **Significance:** {insight.significance}")
            md.append("")

        md.append("---")
        md.append("")

        # Pass 5: Thinking Patterns
        md.append("## Pass 5: Thinking Patterns")
        md.append("")

        for pattern_type, pattern_desc in result.thinking_patterns.items():
            md.append(f"**{pattern_type.replace('_', ' ').title()}:** {pattern_desc}")
            md.append("")

        md.append("---")
        md.append("")
        md.append("*Generated by Multi-Pass Learning Extraction Tool*")

        return '\n'.join(md)

    def to_json(self, result: ExtractionResult) -> str:
        """Convert extraction result to JSON"""
        # Convert dataclasses to dicts
        data = asdict(result)
        return json.dumps(data, indent=2)


def main():
    """Main entry point for command-line usage"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python multipass_extract.py <conversation_file.md>")
        print("       python multipass_extract.py <conversation_file.md> --output output.md")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '--output' else None

    if len(sys.argv) > 3 and sys.argv[2] == '--output':
        output_file = sys.argv[3]

    # Read conversation file
    with open(input_file, 'r', encoding='utf-8') as f:
        conversation_text = f.read()

    # Extract conversation topic from filename
    topic = Path(input_file).stem.replace('-', ' ').replace('_', ' ').title()

    # Run extraction
    extractor = MultiPassExtractor()
    result = extractor.extract(conversation_text, topic=topic)

    # Generate markdown report
    markdown_report = extractor.to_markdown(result)

    # Save or print
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_report)
        print(f"Extraction report saved to: {output_file}")
    else:
        print(markdown_report)

    # Also save JSON version
    json_file = output_file.replace('.md', '.json') if output_file else None
    if json_file:
        with open(json_file, 'w', encoding='utf-8') as f:
            f.write(extractor.to_json(result))
        print(f"JSON data saved to: {json_file}")


if __name__ == "__main__":
    main()
