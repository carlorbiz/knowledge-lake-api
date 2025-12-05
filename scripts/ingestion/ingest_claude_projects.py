#!/usr/bin/env python3
"""
Ingest Claude Code projects and their documents to Knowledge Lake API
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List
import requests
from datetime import datetime

# Configuration
AAE_EXPORTS_PATH = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native/Claude")
KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"
USER_ID = 1  # Carla's user ID

# Stats tracking
stats = {
    "total_projects": 0,
    "total_documents": 0,
    "success": 0,
    "failed": 0,
    "mem0_indexed": 0,
    "errors": []
}

def extract_project_content(project: Dict[str, Any]) -> str:
    """Extract full content from Claude Code project including all documents"""
    content_parts = []

    # Add project header
    project_name = project.get('name', 'Untitled Project')
    content_parts.append(f"# Claude Code Project: {project_name}\n")

    # Add description
    if project.get('description'):
        content_parts.append(f"## Description\n{project['description']}\n")

    # Add prompt template if present
    if project.get('prompt_template'):
        content_parts.append(f"## Prompt Template\n{project['prompt_template']}\n")

    # Add all project documents
    docs = project.get('docs', [])
    if docs:
        content_parts.append(f"\n## Project Documents ({len(docs)} files)\n")

        for doc in docs:
            filename = doc.get('filename', 'Unknown File')
            doc_content = doc.get('content', '')
            created_at = doc.get('created_at', 'Unknown')

            content_parts.append(f"\n### File: {filename}\n")
            content_parts.append(f"*Created: {created_at}*\n\n")
            content_parts.append(f"```\n{doc_content}\n```\n")

    return "\n".join(content_parts)

def transform_project(project: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Claude Code project to Knowledge Lake format"""
    created_at = project.get('created_at', '')
    date_str = created_at.split('T')[0] if created_at else datetime.now().strftime('%Y-%m-%d')

    # Extract full project content
    content = extract_project_content(project)

    # Build Knowledge Lake payload
    payload = {
        'userId': USER_ID,
        'agent': 'Claude',
        'date': date_str,
        'topic': f"[PROJECT] {project.get('name', 'Untitled')}",
        'content': content,
        'metadata': {
            'uuid': project.get('uuid'),
            'created_at': project.get('created_at'),
            'updated_at': project.get('updated_at'),
            'is_private': project.get('is_private'),
            'is_starter_project': project.get('is_starter_project'),
            'document_count': len(project.get('docs', [])),
            'type': 'claude_code_project'
        }
    }

    return payload

def ingest_project(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Ingest single project to Knowledge Lake API"""
    try:
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
            json=payload,
            timeout=120  # Increased from 30s to 120s for mem0 indexing
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")

def main():
    print("=" * 70)
    print("CLAUDE CODE PROJECTS INGESTION TO KNOWLEDGE LAKE")
    print("=" * 70)

    # Load projects.json
    projects_file = AAE_EXPORTS_PATH / "projects.json"

    if not projects_file.exists():
        print(f"ERROR: Projects file not found: {projects_file}")
        sys.exit(1)

    print(f"\nLoading projects from: {projects_file}")
    with open(projects_file, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    stats['total_projects'] = len(projects)
    stats['total_documents'] = sum(len(p.get('docs', [])) for p in projects)

    print(f"Found {stats['total_projects']} projects")
    print(f"Total documents: {stats['total_documents']}")

    # Sort by date (oldest first)
    projects.sort(key=lambda p: p.get('created_at', ''))

    # Process each project
    print(f"\n{'-' * 70}")
    print("Starting ingestion...")
    print(f"{'-' * 70}\n")

    for idx, project in enumerate(projects, 1):
        project_name = project.get('name', 'Untitled')[:50]
        project_date = project.get('created_at', 'Unknown')[:10]
        doc_count = len(project.get('docs', []))

        print(f"[{idx}/{stats['total_projects']}] {project_date} - {project_name} ({doc_count} docs)...", end=" ")

        try:
            # Transform to Knowledge Lake format
            payload = transform_project(project)

            # Ingest to API
            result = ingest_project(payload)

            # Track success
            stats['success'] += 1
            if result.get('mem0Indexed'):
                stats['mem0_indexed'] += 1

            # Show result
            conv_id = result.get('conversation', {}).get('id', 'N/A')
            mem0_status = "mem0OK" if result.get('mem0Indexed') else "mem0SKIP"
            print(f"OK (ID:{conv_id}, {mem0_status})")

        except Exception as e:
            stats['failed'] += 1
            error_msg = str(e)[:100]
            stats['errors'].append({
                'project': project_name,
                'date': project_date,
                'error': error_msg
            })
            print(f"FAILED - {error_msg}")

    # Print summary
    print(f"\n{'=' * 70}")
    print("INGESTION SUMMARY")
    print(f"{'=' * 70}")
    print(f"Total projects:       {stats['total_projects']}")
    print(f"Total documents:      {stats['total_documents']}")
    print(f"Successfully ingested: {stats['success']}")
    print(f"Failed:               {stats['failed']}")
    print(f"mem0 indexed:         {stats['mem0_indexed']}")
    print(f"{'=' * 70}")

    if stats['errors']:
        print(f"\nErrors ({len(stats['errors'])}):")
        for err in stats['errors']:
            print(f"  - {err['date']} {err['project']}: {err['error']}")

    # Save detailed log
    log_file = Path("C:/Users/carlo/claude_projects_ingestion_log.json")
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'stats': stats
        }, f, indent=2)
    print(f"\nDetailed log saved to: {log_file}")

    # Exit code
    sys.exit(0 if stats['failed'] == 0 else 1)

if __name__ == "__main__":
    main()
