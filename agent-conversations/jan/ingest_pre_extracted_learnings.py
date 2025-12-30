#!/usr/bin/env python3
"""
Ingest Pre-Extracted Learning Summaries from Jan into Knowledge Lake

This script ingests conversation summaries that have already been processed
through the learning extraction template, bypassing the need for post-ingestion
extraction. The learnings are immediately available and indexed.

Usage:
    python ingest_pre_extracted_learnings.py

Features:
    - Parses structured markdown with pre-extracted learnings
    - Extracts metadata (topics, complexity, archivability)
    - Creates rich Knowledge Lake entries with indexed learnings
    - Marks as "pre-processed" to skip extraction queue
    - Validates structure before ingesting
"""

import os
import re
import json
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Configuration
KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"
AGENT_NAME = "Jan (Genspark)"
USER_ID = 1  # Carla's user ID

# File pattern for pre-extracted summaries
FILE_PATTERN = "*_pre-extracted.md"


class PreExtractedParser:
    """Parse pre-extracted learning summaries from markdown"""

    def __init__(self, content: str, filename: str):
        self.content = content
        self.filename = filename
        self.sections = self._split_sections()

    def _split_sections(self) -> Dict[str, str]:
        """Split markdown into sections by headers"""
        sections = {}
        current_section = "header"
        current_content = []

        for line in self.content.split('\n'):
            # Check for main section headers (##)
            if line.startswith('## '):
                if current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = line[3:].strip()
                current_content = []
            else:
                current_content.append(line)

        # Add last section
        if current_content:
            sections[current_section] = '\n'.join(current_content).strip()

        return sections

    def extract_metadata(self) -> Dict:
        """Extract metadata from the header section"""
        header = self.sections.get('header', '')
        metadata = {}

        # Extract date
        date_match = re.search(r'\*\*Date:\*\* (.+)', header)
        if date_match:
            metadata['date'] = date_match.group(1).strip()

        # Extract conversation ID
        conv_id_match = re.search(r'\*\*Conversation ID:\*\* (.+)', header)
        if conv_id_match:
            metadata['conversationId'] = conv_id_match.group(1).strip()

        # Extract business area
        business_match = re.search(r'\*\*Business Area:\*\* (.+)', header)
        if business_match:
            metadata['businessArea'] = business_match.group(1).strip()

        # Extract topic from first line (# header)
        topic_match = re.match(r'# (.+)', header.split('\n')[0])
        if topic_match:
            metadata['topic'] = topic_match.group(1).strip()

        return metadata

    def extract_key_topics(self) -> List[str]:
        """Extract key topics from metadata section"""
        meta_section = self.sections.get('📊 METADATA FOR INDEXING', '')
        topics_match = re.search(r'\*\*Key Topics:\*\* (.+)', meta_section)
        if topics_match:
            topics_str = topics_match.group(1).strip()
            # Split by comma and clean
            return [t.strip() for t in topics_str.strip('[]').split(',')]
        return []

    def extract_complexity(self) -> Optional[int]:
        """Extract complexity score"""
        meta_section = self.sections.get('📊 METADATA FOR INDEXING', '')
        complexity_match = re.search(r'\*\*Complexity Score:\*\* (\d+)', meta_section)
        if complexity_match:
            return int(complexity_match.group(1))
        return None

    def extract_archivability(self) -> str:
        """Extract archivability info"""
        meta_section = self.sections.get('📊 METADATA FOR INDEXING', '')
        archive_match = re.search(r'\*\*Archivable After:\*\* (.+)', meta_section)
        if archive_match:
            return archive_match.group(1).strip()
        return "Unknown"

    def extract_agents_involved(self) -> List[str]:
        """Extract agents involved"""
        meta_section = self.sections.get('📊 METADATA FOR INDEXING', '')
        agents_match = re.search(r'\*\*Agents Involved:\*\* (.+)', meta_section)
        if agents_match:
            agents_str = agents_match.group(1).strip()
            return [a.strip() for a in agents_str.strip('[]').split(',')]
        return [AGENT_NAME, "Carla"]

    def count_learnings(self) -> Dict[str, int]:
        """Count different types of learnings"""
        counts = {
            'decisions': 0,
            'technical_learnings': 0,
            'implementations': 0,
            'challenges': 0,
            'action_items': 0
        }

        # Count decisions
        decisions_section = self.sections.get('🔑 KEY DECISIONS', '')
        counts['decisions'] = len(re.findall(r'### Decision \d+:', decisions_section))

        # Count technical learnings
        learnings_section = self.sections.get('💡 TECHNICAL LEARNINGS', '')
        counts['technical_learnings'] = len(re.findall(r'### Learning \d+:', learnings_section))

        # Count implementations
        impl_section = self.sections.get('⚙️ IMPLEMENTATION DETAILS', '')
        counts['implementations'] = len(re.findall(r'### Component/Feature \d+:', impl_section))

        # Count challenges
        challenges_section = self.sections.get('🚧 CHALLENGES & RESOLUTIONS', '')
        counts['challenges'] = len(re.findall(r'### Challenge \d+:', challenges_section))

        # Count action items
        actions_section = self.sections.get('✅ ACTION ITEMS & NEXT STEPS', '')
        counts['action_items'] = len(re.findall(r'- \[.\]', actions_section))

        return counts

    def to_payload(self) -> Dict:
        """Convert to Knowledge Lake ingestion payload"""
        metadata = self.extract_metadata()
        learning_counts = self.count_learnings()

        payload = {
            "topic": metadata.get('topic', self.filename.replace('_pre-extracted.md', '').replace('_', ' ')),
            "content": self.content,
            "agent": AGENT_NAME,
            "userId": USER_ID,
            "date": metadata.get('date', datetime.now().strftime('%Y-%m-%d')),
            "metadata": {
                "businessArea": metadata.get('businessArea', 'AAE Development'),
                "processingAgent": "Claude Code",
                "source": "Jan Pre-Extracted Learning Summary",
                "filename": self.filename,
                "preProcessed": True,  # Mark as already processed
                "skipExtraction": True,  # Don't send to extraction queue
                "keyTopics": self.extract_key_topics(),
                "complexityScore": self.extract_complexity(),
                "archivableAfter": self.extract_archivability(),
                "agentsInvolved": self.extract_agents_involved(),
                "learningCounts": learning_counts,
                "totalLearnings": sum(learning_counts.values()),
                "conversationId": metadata.get('conversationId', ''),
                "extractionStatus": "pre-extracted",
                "extractionDate": datetime.now().isoformat()
            }
        }

        return payload


def validate_structure(content: str, filename: str) -> Tuple[bool, List[str]]:
    """Validate that the markdown follows the expected structure"""
    required_sections = [
        '🎯 PRIMARY OUTCOME',
        '🔑 KEY DECISIONS',
        '💡 TECHNICAL LEARNINGS',
        '📊 METADATA FOR INDEXING'
    ]

    warnings = []

    for section in required_sections:
        if f'## {section}' not in content:
            warnings.append(f"Missing required section: {section}")

    # Check for metadata fields
    if '**Key Topics:**' not in content:
        warnings.append("Missing Key Topics in metadata")

    if '**Date:**' not in content:
        warnings.append("Missing Date in header")

    # Validate it's not empty
    if len(content.strip()) < 500:
        warnings.append("Content seems too short (< 500 chars)")

    is_valid = len(warnings) == 0
    return is_valid, warnings


def ingest_file(file_path: Path) -> bool:
    """Ingest a single pre-extracted learning file"""
    print(f"\n{'='*70}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*70}")

    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Validate structure
        is_valid, warnings = validate_structure(content, file_path.name)

        if not is_valid:
            print(f"\n⚠️  WARNINGS for {file_path.name}:")
            for warning in warnings:
                print(f"   - {warning}")

            response = input("\nContinue with ingestion anyway? (y/n): ")
            if response.lower() != 'y':
                print("   [SKIPPED] User chose not to ingest")
                return False

        # Parse and create payload
        parser = PreExtractedParser(content, file_path.name)
        payload = parser.to_payload()

        # Show summary
        print(f"\n📝 Summary:")
        print(f"   Topic: {payload['topic'][:60]}")
        print(f"   Date: {payload['date']}")
        print(f"   Business Area: {payload['metadata']['businessArea']}")
        print(f"   Key Topics: {', '.join(payload['metadata']['keyTopics'][:3])}")

        learning_counts = payload['metadata']['learningCounts']
        print(f"\n📊 Learning Counts:")
        print(f"   Decisions: {learning_counts['decisions']}")
        print(f"   Technical Learnings: {learning_counts['technical_learnings']}")
        print(f"   Implementations: {learning_counts['implementations']}")
        print(f"   Challenges: {learning_counts['challenges']}")
        print(f"   Action Items: {learning_counts['action_items']}")
        print(f"   TOTAL LEARNINGS: {payload['metadata']['totalLearnings']}")

        # Ingest to Knowledge Lake
        print(f"\n🚀 Ingesting to Knowledge Lake...")
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()

        conv_id = result.get('conversationId', 'N/A')
        print(f"\n✅ SUCCESS!")
        print(f"   Conversation ID: {conv_id}")
        print(f"   Status: Pre-processed (skip extraction queue)")

        return True

    except requests.exceptions.RequestException as e:
        print(f"\n❌ FAILED!")
        print(f"   Network Error: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"   Response: {e.response.text}")
        return False

    except Exception as e:
        print(f"\n❌ FAILED!")
        print(f"   Error: {str(e)}")
        return False


def main():
    """Main ingestion process"""
    print("\n" + "="*70)
    print("PRE-EXTRACTED LEARNING SUMMARY INGESTION")
    print("="*70)
    print(f"\nSource: {AGENT_NAME}")
    print(f"Target: {KNOWLEDGE_LAKE_URL}")
    print(f"Pattern: {FILE_PATTERN}")

    # Find all pre-extracted files
    script_dir = Path(__file__).parent
    files = list(script_dir.glob(FILE_PATTERN))

    if not files:
        print(f"\n⚠️  No files matching pattern '{FILE_PATTERN}' found in {script_dir}")
        print("\nExpected filename format: YYYYMMDD_topic-slug_pre-extracted.md")
        print("Example: 20251230_notion_automation_workflow_pre-extracted.md")
        return

    print(f"\n📁 Found {len(files)} pre-extracted summary file(s)")

    # Confirm before proceeding
    print("\nFiles to ingest:")
    for i, f in enumerate(files, 1):
        print(f"   {i}. {f.name}")

    response = input(f"\nProceed with ingestion of {len(files)} file(s)? (y/n): ")
    if response.lower() != 'y':
        print("\n❌ Ingestion cancelled by user")
        return

    # Ingest each file
    success_count = 0
    fail_count = 0

    for file_path in files:
        if ingest_file(file_path):
            success_count += 1
        else:
            fail_count += 1

    # Final summary
    print(f"\n{'='*70}")
    print("INGESTION COMPLETE")
    print(f"{'='*70}")
    print(f"\n✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"📊 Total: {len(files)}")

    if success_count > 0:
        print(f"\n🎉 {success_count} pre-extracted learning summaries are now in Knowledge Lake")
        print("   These summaries are marked as 'pre-processed' and skip the extraction queue")
        print("   Learnings are immediately available for search and retrieval")

    print()


if __name__ == "__main__":
    main()
