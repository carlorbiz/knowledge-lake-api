#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract Bespoke Persona Mapping from Fred Conversations

Specifically extracts conversations #24 (AAE architecture review) and
#46 (AI Automation Ecosystem) to find agent persona information.
"""

import sys
import io
import json
import re
from pathlib import Path
from typing import Dict, List

# Ensure UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def extract_conversation_text(conv: Dict) -> str:
    """Extract full conversation text from Fred conversation object"""
    messages = []

    if 'mapping' in conv:
        # Sort by create_time to get chronological order
        msg_items = []
        for msg_id, msg_data in conv.get('mapping', {}).items():
            if not msg_data or 'message' not in msg_data:
                continue
            message = msg_data['message']
            if message and message.get('create_time'):
                msg_items.append((message.get('create_time', 0), message))

        msg_items.sort(key=lambda x: x[0])

        for _, message in msg_items:
            role = message.get('author', {}).get('role', 'unknown')
            content_parts = message.get('content', {}).get('parts', [])
            if content_parts:
                content = '\n'.join(str(part) for part in content_parts if part)
                if content.strip():
                    messages.append(f"\n{'='*80}\n{role.upper()}:\n{content}\n")

    return '\n'.join(messages)


def find_persona_patterns(text: str) -> Dict[str, List[str]]:
    """Find patterns related to agent personas in the text"""
    patterns = {
        'agent_names': [],
        'platforms': [],
        'capabilities': [],
        'roles': [],
        'routing': []
    }

    # Look for agent name mentions (case insensitive)
    agent_keywords = ['Fred', 'Gemini', 'Claude', 'Penny', 'Colin', 'Pete', 'Callum',
                     'Manus', 'Jan', 'Notebook LM', 'Fredo', 'Grok']

    for agent in agent_keywords:
        if re.search(rf'\b{agent}\b', text, re.IGNORECASE):
            patterns['agent_names'].append(agent)

    # Look for platform mentions
    platform_keywords = ['OpenAI', 'ChatGPT', 'GPT-4', 'Anthropic', 'Google', 'Gemini',
                        'Perplexity', 'Sonar']

    for platform in platform_keywords:
        if re.search(rf'\b{platform}\b', text, re.IGNORECASE):
            patterns['platforms'].append(platform)

    # Look for capability descriptions
    capability_keywords = ['technical', 'strategy', 'research', 'code generation',
                          'documentation', 'fast response', 'teaching']

    for capability in capability_keywords:
        if re.search(rf'\b{capability}\b', text, re.IGNORECASE):
            patterns['capabilities'].append(capability)

    # Look for role descriptions
    role_keywords = ['primary role', 'specialized', 'expertise', 'best for']

    for role_kw in role_keywords:
        if re.search(rf'\b{role_kw}\b', text, re.IGNORECASE):
            patterns['roles'].append(role_kw)

    # Look for routing logic
    routing_keywords = ['route to', 'assign to', 'delegate', 'workflow', 'orchestration']

    for routing in routing_keywords:
        if re.search(rf'\b{routing}\b', text, re.IGNORECASE):
            patterns['routing'].append(routing)

    return patterns


def extract_agent_mapping_sections(text: str) -> List[str]:
    """Extract sections that explicitly map agents to platforms"""
    sections = []

    # Split into paragraphs
    paragraphs = text.split('\n\n')

    for para in paragraphs:
        # Look for paragraphs mentioning both agent names and platforms
        has_agent = any(agent in para for agent in ['Fred', 'Gemini', 'Colin', 'Claude', 'Penny'])
        has_platform = any(platform in para for platform in ['OpenAI', 'Google', 'ChatGPT', 'Gemini 2.5', 'Anthropic'])

        if has_agent and has_platform and len(para) > 50:
            sections.append(para.strip())

    return sections


def main():
    """Main entry point"""
    print("\n" + "="*80)
    print("EXTRACTING BESPOKE PERSONA MAPPING")
    print("="*80)

    # Load Fred conversations
    fred_file = Path("agent-conversations/fred/fredconversations.json")

    if not fred_file.exists():
        print(f"❌ Fred conversations file not found: {fred_file}")
        return 1

    print(f"\n📂 Loading {fred_file.name}...")
    with open(fred_file, 'r', encoding='utf-8') as f:
        convs = json.load(f)

    print(f"✅ Loaded {len(convs)} Fred conversations")

    # Extract conversations #24 and #46
    target_convs = {
        24: "AAE architecture review",
        46: "AI Automation Ecosystem"
    }

    results = {}

    for idx, expected_title in target_convs.items():
        array_idx = idx - 1  # Convert to 0-indexed

        if array_idx >= len(convs):
            print(f"\n⚠️  Conversation #{idx} not found (only {len(convs)} conversations)")
            continue

        conv = convs[array_idx]
        title = conv.get('title', 'Untitled')

        print(f"\n{'='*80}")
        print(f"CONVERSATION #{idx}")
        print(f"{'='*80}")
        print(f"Title: {title}")
        print(f"Expected: {expected_title}")

        if title != expected_title:
            print(f"⚠️  Title mismatch - proceeding anyway")

        # Extract full text
        full_text = extract_conversation_text(conv)
        word_count = len(full_text.split())

        print(f"📊 Word count: {word_count:,}")

        # Find persona patterns
        patterns = find_persona_patterns(full_text)

        print(f"\n🔍 Pattern Analysis:")
        print(f"  Agent names mentioned: {', '.join(set(patterns['agent_names']))}")
        print(f"  Platforms mentioned: {', '.join(set(patterns['platforms']))}")
        print(f"  Capabilities: {', '.join(set(patterns['capabilities']))}")

        # Extract mapping sections
        mapping_sections = extract_agent_mapping_sections(full_text)

        print(f"\n📋 Found {len(mapping_sections)} potential mapping sections:")
        for i, section in enumerate(mapping_sections[:5], 1):  # Show first 5
            preview = section[:200] + "..." if len(section) > 200 else section
            print(f"\n  [{i}] {preview}")

        # Save full conversation text for manual review
        output_file = Path(f"logs/persona_extraction_conv{idx}.txt")
        output_file.parent.mkdir(exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"CONVERSATION #{idx}: {title}\n")
            f.write("="*80 + "\n\n")
            f.write(full_text)

        print(f"\n💾 Saved full conversation to: {output_file}")

        results[idx] = {
            'title': title,
            'word_count': word_count,
            'patterns': patterns,
            'mapping_sections': mapping_sections,
            'output_file': str(output_file)
        }

    # Summary
    print("\n" + "="*80)
    print("EXTRACTION SUMMARY")
    print("="*80)

    for idx, result in results.items():
        print(f"\nConversation #{idx}:")
        print(f"  Title: {result['title']}")
        print(f"  Word count: {result['word_count']:,}")
        print(f"  Mapping sections found: {len(result['mapping_sections'])}")
        print(f"  Output file: {result['output_file']}")

    print("\n✅ Extraction complete - review logs/persona_extraction_conv*.txt for details")
    print("="*80)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
