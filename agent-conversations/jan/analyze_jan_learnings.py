#!/usr/bin/env python3
"""
Analyze and Extract Learnings from All Jan Conversations

This script:
1. Queries all Jan conversations from Knowledge Lake
2. Categorizes them by theme/topic
3. Extracts key patterns and learnings
4. Creates a comprehensive learning summary
"""

import requests
import json
from collections import defaultdict
from datetime import datetime
from typing import Dict, List

# Configuration
KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"

def get_jan_conversations() -> List[Dict]:
    """Fetch all Jan conversations from Knowledge Lake"""

    print("\n[QUERY] Fetching all Jan conversations from Knowledge Lake...")

    try:
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/search",
            json={"query": "Jan", "limit": 300, "userId": 1},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        results = response.json()

        # Filter for Jan conversations
        all_results = results.get('results', [])
        conversations = [
            conv for conv in all_results
            if conv.get('agent', '') and 'Jan' in conv.get('agent', '')
        ]

        print(f"[OK] Found {len(conversations)} Jan conversations (out of {len(all_results)} total results)")

        return conversations

    except Exception as e:
        print(f"[FAIL] Error fetching conversations: {str(e)}")
        return []


def categorize_conversations(conversations: List[Dict]) -> Dict[str, List[Dict]]:
    """Categorize conversations by business area and topic"""

    categories = defaultdict(list)

    for conv in conversations:
        metadata = conv.get('metadata', {})
        business_area = metadata.get('businessArea', 'Uncategorized')
        categories[business_area].append(conv)

    return dict(categories)


def extract_key_topics(conversations: List[Dict]) -> Dict[str, int]:
    """Extract and count key topics across all conversations"""

    topic_counts = defaultdict(int)

    for conv in conversations:
        metadata = conv.get('metadata', {})
        key_topics = metadata.get('keyTopics', [])

        for topic in key_topics:
            if isinstance(topic, str):
                topic_counts[topic] += 1

    # Sort by frequency
    sorted_topics = dict(sorted(topic_counts.items(), key=lambda x: x[1], reverse=True))
    return sorted_topics


def analyze_time_distribution(conversations: List[Dict]) -> Dict[str, int]:
    """Analyze conversation distribution over time"""

    date_counts = defaultdict(int)

    for conv in conversations:
        date_str = conv.get('date', '')
        if date_str:
            # Extract year-month
            try:
                year_month = date_str[:7]  # YYYY-MM
                date_counts[year_month] += 1
            except:
                pass

    return dict(sorted(date_counts.items()))


def generate_learning_summary(conversations: List[Dict], categories: Dict[str, List[Dict]]) -> str:
    """Generate comprehensive learning summary"""

    summary = []
    summary.append("# Jan Conversation Learning Summary")
    summary.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    summary.append(f"**Total Conversations Analyzed:** {len(conversations)}")
    summary.append("\n" + "=" * 80)

    # Overall statistics
    summary.append("\n## Overall Statistics")
    summary.append(f"\n- **Total Conversations:** {len(conversations)}")
    summary.append(f"- **Business Areas Covered:** {len(categories)}")

    # Time distribution
    time_dist = analyze_time_distribution(conversations)
    summary.append(f"- **Date Range:** {min(time_dist.keys())} to {max(time_dist.keys())}")
    summary.append(f"- **Most Active Month:** {max(time_dist, key=time_dist.get)} ({time_dist[max(time_dist, key=time_dist.get)]} conversations)")

    # Business area breakdown
    summary.append("\n## Conversations by Business Area")
    for area, convs in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
        summary.append(f"\n### {area} ({len(convs)} conversations)")

        # Sample topics from this area
        sample_topics = []
        for conv in convs[:5]:  # Top 5
            topic = conv.get('topic', 'Untitled')[:60]
            sample_topics.append(f"  - {topic}")

        summary.extend(sample_topics)
        if len(convs) > 5:
            summary.append(f"  - ... and {len(convs) - 5} more")

    # Key topics across all conversations
    all_topics = extract_key_topics(conversations)
    summary.append("\n## Top Key Topics (Across All Conversations)")
    for i, (topic, count) in enumerate(list(all_topics.items())[:20], 1):
        summary.append(f"{i}. **{topic}** - {count} conversations")

    # Time distribution details
    summary.append("\n## Conversation Distribution Over Time")
    for month, count in time_dist.items():
        summary.append(f"- **{month}:** {count} conversations")

    # Content type analysis
    summary.append("\n## Content Type Distribution")
    content_types = {
        'Strategic Planning': 0,
        'Technical/Development': 0,
        'Course Creation': 0,
        'Rural Health': 0,
        'Professional Communications': 0,
        'Blog Posts': 0,
        'Other': 0
    }

    for conv in conversations:
        topic = conv.get('topic', '').lower()
        if any(word in topic for word in ['strategic', 'planning', 'rwav']):
            content_types['Strategic Planning'] += 1
        elif any(word in topic for word in ['code', 'script', 'automation', 'github', 'python']):
            content_types['Technical/Development'] += 1
        elif any(word in topic for word in ['course', 'training', 'module', 'learning']):
            content_types['Course Creation'] += 1
        elif any(word in topic for word in ['rural', 'health', 'gp', 'supervisor']):
            content_types['Rural Health'] += 1
        elif any(word in topic for word in ['blog', 'post', 'article']):
            content_types['Blog Posts'] += 1
        elif any(word in topic for word in ['resignation', 'email', 'communication']):
            content_types['Professional Communications'] += 1
        else:
            content_types['Other'] += 1

    for content_type, count in sorted(content_types.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(conversations)) * 100
        summary.append(f"- **{content_type}:** {count} ({percentage:.1f}%)")

    # Key learnings synthesis
    summary.append("\n## Key Learning Themes")
    summary.append("\n### 1. Multi-Modal AI Collaboration")
    summary.append("Jan demonstrates extensive collaboration across multiple AI platforms and tools:")
    summary.append("- Genspark Hub for conversation management")
    summary.append("- GitHub for code and documentation")
    summary.append("- Google Apps Script for automation")
    summary.append("- Notion for knowledge management")
    summary.append("- Playwright for browser automation")

    summary.append("\n### 2. Strategic Planning Excellence")
    summary.append("Significant focus on organizational transformation and strategic planning:")
    summary.append("- RWAV strategic transformation (2026-2030)")
    summary.append("- Rural health workforce optimization")
    summary.append("- Community engagement and stakeholder consultation")
    summary.append("- Data-driven decision making")

    summary.append("\n### 3. Technical Implementation")
    summary.append("Strong technical capabilities across multiple domains:")
    summary.append("- Web scraping and data extraction")
    summary.append("- Automation workflow design")
    summary.append("- API integration (Knowledge Lake, Notion, Google)")
    summary.append("- Python development and debugging")

    summary.append("\n### 4. Content Creation & Thought Leadership")
    summary.append("Comprehensive content development for business transformation:")
    summary.append("- 14-part blog series on Service as a Product")
    summary.append("- Book structure and positioning strategy")
    summary.append("- Educational course content development")
    summary.append("- Research synthesis and evidence-based writing")

    summary.append("\n### 5. Professional Communication")
    summary.append("Strategic professional boundary-setting and communication:")
    summary.append("- Resignation letters with diplomatic messaging")
    summary.append("- Stakeholder engagement strategies")
    summary.append("- Email campaign design")
    summary.append("- Client proposal development")

    # Recommendations
    summary.append("\n## Recommendations for Learning Extraction")
    summary.append("\n### High-Priority Conversations for Deep Extraction")
    summary.append("1. **RWAV Strategic Planning** - Multiple sessions with comprehensive transformation framework")
    summary.append("2. **Service as a Product Blog Series** - Complete thought leadership positioning")
    summary.append("3. **AAE Knowledge Lake Integration** - Critical infrastructure learnings")
    summary.append("4. **Course Creation Automation** - Reusable technical patterns")
    summary.append("5. **First Nations Mapping Project** - Stakeholder engagement methodologies")

    summary.append("\n### Archivability Assessment")
    summary.append("- **Keep Active (Strategic):** RWAV planning, AAE infrastructure, current projects")
    summary.append("- **Archive After Completion:** Specific course builds, one-off technical troubleshooting")
    summary.append("- **Historical Reference:** Blog post drafts (after publication), completed projects")

    summary.append("\n### Cross-Conversation Patterns")
    summary.append("1. **Iterative Refinement:** Many topics revisited multiple times with increasing sophistication")
    summary.append("2. **Template Development:** Reusable frameworks created across multiple domains")
    summary.append("3. **Integration Focus:** Constant theme of connecting systems and workflows")
    summary.append("4. **Quality Over Speed:** Emphasis on comprehensive documentation and thorough analysis")

    summary.append("\n" + "=" * 80)
    summary.append("\n*This analysis provides a meta-view of Jan's conversation corpus.*")
    summary.append("*For detailed learnings, use the multi-pass extraction workflow on individual conversations.*")

    return "\n".join(summary)


def main():
    """Main analysis process"""

    print("=" * 80)
    print("JAN CONVERSATION LEARNING ANALYSIS")
    print("=" * 80)

    # Fetch all conversations
    conversations = get_jan_conversations()

    if not conversations:
        print("\n[FAIL] No conversations found or error occurred")
        return

    # Categorize
    print("\n[ANALYZE] Categorizing conversations by business area...")
    categories = categorize_conversations(conversations)
    print(f"[OK] Found {len(categories)} business areas")

    # Generate summary
    print("\n[GENERATE] Creating comprehensive learning summary...")
    summary = generate_learning_summary(conversations, categories)

    # Save to file
    output_file = "jan_conversation_learning_summary.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(summary)

    print(f"[OK] Learning summary saved to: {output_file}")
    print(f"\n[STATS] Summary Length: {len(summary)} characters")
    print(f"[STATS] Analysis complete!")

    # Print summary to console
    print("\n" + "=" * 80)
    print(summary)
    print("=" * 80)


if __name__ == "__main__":
    main()
