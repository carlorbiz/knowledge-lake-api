"""
AAE Knowledge Lake API - Enhanced Version
Combines mem0 knowledge storage with structured entity/relationship tracking
Serves: n8n workflows, AAE Dashboard, Aurelia avatar, MCP servers
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from mem0 import Memory
import os
from datetime import datetime
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Initialize mem0 Memory
memory = Memory()

# In-memory storage for structured data (will persist to database later)
# In production, replace with PostgreSQL/Supabase
conversations_db = []
entities_db = []
relationships_db = []

# ============================================================================
# EXISTING ENDPOINTS (Preserved for backwards compatibility)
# ============================================================================

@app.route('/knowledge/search', methods=['GET'])
def search_knowledge():
    """Legacy endpoint - generic knowledge search"""
    query = request.args.get('query')
    user_id = request.args.get('user_id', 'carla_knowledge_lake')
    results = memory.search(query=query, user_id=user_id, limit=10)
    return jsonify({'results': results, 'timestamp': datetime.now().isoformat()})

@app.route('/knowledge/add', methods=['POST'])
def add_knowledge():
    """Legacy endpoint - add unstructured knowledge"""
    data = request.get_json()
    memory.add(
        messages=data['content'],
        user_id=data.get('user_id', 'carla_knowledge_lake'),
        metadata=data.get('metadata', {})
    )
    return jsonify({'status': 'added', 'timestamp': datetime.now().isoformat()})

@app.route('/knowledge/context/<topic>', methods=['GET'])
def get_context(topic):
    """Legacy endpoint - get context for topic"""
    results = memory.search(query=topic, user_id='carla_knowledge_lake', limit=5)
    return jsonify({'context': results, 'topic': topic})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'mem0_knowledge_lake',
        'version': '2.0_enhanced',
        'endpoints': {
            'legacy': ['/knowledge/search', '/knowledge/add', '/knowledge/context'],
            'conversations': ['/api/conversations/ingest', '/api/conversations'],
            'entities': ['/api/entities', '/api/relationships'],
            'aurelia': ['/api/aurelia/query']
        }
    })

# ============================================================================
# NEW ENDPOINTS - Structured Conversation & Entity Management
# ============================================================================

@app.route('/api/conversations/ingest', methods=['POST'])
def ingest_conversation():
    """
    Ingest a conversation with extracted entities and relationships

    Called by:
    - n8n workflows (after AI processing)
    - AAE Dashboard ingestion scripts
    - Manus MCP autonomous processing

    Request body:
    {
        "userId": 1,
        "agent": "Claude",
        "date": "2024-11-30",
        "topic": "Database Schema Design",
        "content": "Full conversation text...",
        "entities": [
            {
                "name": "Notion",
                "entityType": "Technology",
                "confidence": 0.95,
                "description": "...",
                "sourceContext": "..."
            }
        ],
        "relationships": [
            {
                "from": "Notion",
                "to": "GitHub",
                "relationshipType": "integrates_with",
                "weight": 3
            }
        ],
        "metadata": {
            "sourceFile": "...",
            "processingAgent": "n8n-anthropic",
            "priority": "High"
        }
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['userId', 'agent', 'date', 'content']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing)}'
            }), 400

        # Create conversation record
        conversation = {
            'id': len(conversations_db) + 1,
            'userId': data['userId'],
            'agent': data['agent'],
            'date': data['date'],
            'topic': data.get('topic', 'General Discussion'),
            'content': data['content'],
            'metadata': data.get('metadata', {}),
            'createdAt': datetime.now().isoformat(),
            'entityCount': len(data.get('entities', [])),
            'relationshipCount': len(data.get('relationships', []))
        }
        conversations_db.append(conversation)

        # Add conversation content to mem0 for semantic search
        memory.add(
            messages=[{
                'role': 'user',
                'content': f"Conversation with {data['agent']} about {conversation['topic']}: {data['content']}"
            }],
            user_id=f"user_{data['userId']}",
            metadata={
                'conversationId': conversation['id'],
                'agent': data['agent'],
                'date': data['date'],
                'topic': conversation['topic'],
                **data.get('metadata', {})
            }
        )

        # Store entities
        entities_created = []
        entity_id_map = {}  # Map entity names to IDs for relationships

        for entity_data in data.get('entities', []):
            # Check for duplicates (fuzzy matching would be better)
            existing = next(
                (e for e in entities_db if
                 e['name'].lower() == entity_data['name'].lower() and
                 e['userId'] == data['userId']),
                None
            )

            if existing:
                entity_id_map[entity_data['name']] = existing['id']
                continue

            entity = {
                'id': len(entities_db) + 1,
                'userId': data['userId'],
                'entityType': entity_data['entityType'],
                'name': entity_data['name'],
                'description': entity_data.get('description', ''),
                'semanticState': 'RAW',
                'properties': {
                    'confidence': entity_data.get('confidence', 0.5),
                    'sourceContext': entity_data.get('sourceContext', ''),
                    'conversationId': conversation['id']
                },
                'sourceType': 'conversation',
                'sourceId': str(conversation['id']),
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            entities_db.append(entity)
            entities_created.append(entity)
            entity_id_map[entity_data['name']] = entity['id']

        # Store relationships
        relationships_created = []
        for rel_data in data.get('relationships', []):
            from_id = entity_id_map.get(rel_data['from'])
            to_id = entity_id_map.get(rel_data['to'])

            if not from_id or not to_id:
                print(f"Skipping relationship {rel_data['from']} -> {rel_data['to']}: entities not found")
                continue

            relationship = {
                'id': len(relationships_db) + 1,
                'fromEntityId': from_id,
                'toEntityId': to_id,
                'relationshipType': rel_data['relationshipType'],
                'weight': rel_data.get('weight', 1),
                'semanticState': 'RAW',
                'properties': {
                    'confidence': rel_data.get('confidence', 0.5),
                    'sourceContext': rel_data.get('sourceContext', ''),
                    'conversationId': conversation['id']
                },
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            relationships_db.append(relationship)
            relationships_created.append(relationship)

        return jsonify({
            'success': True,
            'conversation': {
                'id': conversation['id'],
                'agent': conversation['agent'],
                'topic': conversation['topic'],
                'date': conversation['date']
            },
            'entitiesCreated': len(entities_created),
            'relationshipsCreated': len(relationships_created),
            'timestamp': datetime.now().isoformat()
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """
    Get all conversations for a user
    Query params: userId, limit, offset
    """
    user_id = request.args.get('userId', type=int)
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)

    if not user_id:
        return jsonify({'error': 'userId required'}), 400

    user_conversations = [
        c for c in conversations_db
        if c['userId'] == user_id
    ]

    # Sort by date descending
    user_conversations.sort(key=lambda x: x['date'], reverse=True)

    # Paginate
    paginated = user_conversations[offset:offset + limit]

    return jsonify({
        'conversations': paginated,
        'total': len(user_conversations),
        'limit': limit,
        'offset': offset
    })

@app.route('/api/entities', methods=['GET'])
def get_entities():
    """
    Get all entities for a user
    Query params: userId, entityType, limit, offset
    """
    user_id = request.args.get('userId', type=int)
    entity_type = request.args.get('entityType')
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)

    if not user_id:
        return jsonify({'error': 'userId required'}), 400

    # Filter by user
    user_entities = [e for e in entities_db if e['userId'] == user_id]

    # Filter by type if specified
    if entity_type:
        user_entities = [e for e in user_entities if e['entityType'] == entity_type]

    # Sort by creation date
    user_entities.sort(key=lambda x: x['createdAt'], reverse=True)

    # Paginate
    paginated = user_entities[offset:offset + limit]

    return jsonify({
        'entities': paginated,
        'total': len(user_entities),
        'limit': limit,
        'offset': offset
    })

@app.route('/api/entities/<int:entity_id>', methods=['GET'])
def get_entity(entity_id):
    """Get a specific entity by ID"""
    entity = next((e for e in entities_db if e['id'] == entity_id), None)

    if not entity:
        return jsonify({'error': 'Entity not found'}), 404

    # Get relationships for this entity
    entity_relationships = [
        r for r in relationships_db
        if r['fromEntityId'] == entity_id or r['toEntityId'] == entity_id
    ]

    return jsonify({
        'entity': entity,
        'relationships': entity_relationships
    })

@app.route('/api/relationships', methods=['GET'])
def get_relationships():
    """
    Get all relationships for a user
    Query params: userId, limit, offset
    """
    user_id = request.args.get('userId', type=int)
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)

    if not user_id:
        return jsonify({'error': 'userId required'}), 400

    # Get user's entities first
    user_entity_ids = [e['id'] for e in entities_db if e['userId'] == user_id]

    # Filter relationships by user's entities
    user_relationships = [
        r for r in relationships_db
        if r['fromEntityId'] in user_entity_ids or r['toEntityId'] in user_entity_ids
    ]

    # Enrich with entity names
    enriched_relationships = []
    for rel in user_relationships:
        from_entity = next((e for e in entities_db if e['id'] == rel['fromEntityId']), None)
        to_entity = next((e for e in entities_db if e['id'] == rel['toEntityId']), None)

        enriched_relationships.append({
            **rel,
            'fromEntity': from_entity['name'] if from_entity else None,
            'toEntity': to_entity['name'] if to_entity else None
        })

    # Sort by creation date
    enriched_relationships.sort(key=lambda x: x['createdAt'], reverse=True)

    # Paginate
    paginated = enriched_relationships[offset:offset + limit]

    return jsonify({
        'relationships': paginated,
        'total': len(user_relationships),
        'limit': limit,
        'offset': offset
    })

# ============================================================================
# AURELIA INTELLIGENCE ENDPOINTS
# ============================================================================

@app.route('/api/aurelia/query', methods=['POST'])
def aurelia_query():
    """
    Intelligent query endpoint for Aurelia avatar

    Combines:
    - Semantic search via mem0
    - Entity/relationship knowledge
    - User context and history

    Request body:
    {
        "query": "How should I approach the board about AI budget?",
        "userId": 1,
        "context": {
            "currentPWA": "ai-leadership-academy",
            "moduleProgress": {...},
            "previousQuestions": [...]
        }
    }

    Response:
    {
        "spokenResponse": "Based on your previous discussions...",
        "detailedResponse": "Full markdown response...",
        "relevantEntities": [...],
        "suggestedActions": [...],
        "confidence": 0.85
    }
    """
    try:
        data = request.get_json()

        if not data.get('query'):
            return jsonify({'error': 'query required'}), 400

        user_id = data.get('userId', 1)
        query = data['query']
        context = data.get('context', {})

        # 1. Semantic search via mem0
        mem0_results = memory.search(
            query=query,
            user_id=f"user_{user_id}",
            limit=5
        )

        # 2. Find relevant entities
        query_lower = query.lower()
        relevant_entities = [
            e for e in entities_db
            if e['userId'] == user_id and (
                query_lower in e['name'].lower() or
                query_lower in e.get('description', '').lower()
            )
        ][:5]

        # 3. Get related relationships
        relevant_entity_ids = [e['id'] for e in relevant_entities]
        relevant_relationships = [
            r for r in relationships_db
            if r['fromEntityId'] in relevant_entity_ids or
               r['toEntityId'] in relevant_entity_ids
        ][:5]

        # 4. Generate intelligent response
        # In production, this would call Claude API for synthesis
        # For now, we'll return structured data

        spoken_response = f"Based on your knowledge base, I found {len(mem0_results)} relevant insights"
        if relevant_entities:
            spoken_response += f" and {len(relevant_entities)} related concepts"

        detailed_response = f"""# Response to: {query}

## Key Insights from Your Knowledge Base

"""

        if mem0_results:
            detailed_response += "### Recent Conversations:\n"
            for result in mem0_results[:3]:
                if isinstance(result, dict) and 'memory' in result:
                    detailed_response += f"- {result['memory']}\n"

        if relevant_entities:
            detailed_response += "\n### Related Concepts:\n"
            for entity in relevant_entities:
                detailed_response += f"- **{entity['name']}** ({entity['entityType']})\n"

        # Suggest next actions based on context
        suggested_actions = []
        if context.get('currentPWA') == 'ai-leadership-academy':
            suggested_actions.append({
                'action': 'Continue to next module',
                'description': 'Build on this foundation'
            })

        return jsonify({
            'success': True,
            'spokenResponse': spoken_response,
            'detailedResponse': detailed_response,
            'relevantEntities': relevant_entities,
            'relevantRelationships': relevant_relationships,
            'suggestedActions': suggested_actions,
            'confidence': 0.75,  # Would be calculated based on result quality
            'sources': {
                'mem0Results': len(mem0_results),
                'entities': len(relevant_entities),
                'relationships': len(relevant_relationships)
            },
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/aurelia/context', methods=['GET'])
def aurelia_get_context():
    """
    Get comprehensive context for Aurelia to initialize
    Used when starting a new conversation session
    """
    user_id = request.args.get('userId', 1, type=int)

    # Get user's recent activity
    recent_conversations = [
        c for c in conversations_db
        if c['userId'] == user_id
    ][-10:]  # Last 10 conversations

    # Get entity type distribution
    user_entities = [e for e in entities_db if e['userId'] == user_id]
    entity_types = {}
    for entity in user_entities:
        entity_type = entity['entityType']
        entity_types[entity_type] = entity_types.get(entity_type, 0) + 1

    return jsonify({
        'userId': user_id,
        'totalConversations': len([c for c in conversations_db if c['userId'] == user_id]),
        'totalEntities': len(user_entities),
        'totalRelationships': len([r for r in relationships_db
                                    if r['fromEntityId'] in [e['id'] for e in user_entities]]),
        'recentActivity': recent_conversations,
        'entityDistribution': entity_types,
        'lastActivity': recent_conversations[-1]['date'] if recent_conversations else None,
        'timestamp': datetime.now().isoformat()
    })

# ============================================================================
# STATISTICS & ANALYTICS
# ============================================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system-wide statistics"""
    user_id = request.args.get('userId', type=int)

    stats = {
        'totalConversations': len(conversations_db),
        'totalEntities': len(entities_db),
        'totalRelationships': len(relationships_db),
        'timestamp': datetime.now().isoformat()
    }

    if user_id:
        user_entities = [e for e in entities_db if e['userId'] == user_id]
        user_entity_ids = [e['id'] for e in user_entities]

        stats.update({
            'userConversations': len([c for c in conversations_db if c['userId'] == user_id]),
            'userEntities': len(user_entities),
            'userRelationships': len([r for r in relationships_db
                                       if r['fromEntityId'] in user_entity_ids]),
            'entityTypeDistribution': {}
        })

        # Entity type distribution
        for entity in user_entities:
            entity_type = entity['entityType']
            stats['entityTypeDistribution'][entity_type] = \
                stats['entityTypeDistribution'].get(entity_type, 0) + 1

    return jsonify(stats)

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║   AAE Knowledge Lake API v2.0 - Enhanced Edition          ║
    ╠═══════════════════════════════════════════════════════════╣
    ║   Serving on: http://0.0.0.0:5002                         ║
    ║                                                            ║
    ║   Endpoints:                                               ║
    ║   - Legacy: /knowledge/*                                   ║
    ║   - Conversations: /api/conversations/*                    ║
    ║   - Entities: /api/entities, /api/relationships            ║
    ║   - Aurelia: /api/aurelia/query, /api/aurelia/context      ║
    ║   - Health: /health                                        ║
    ║   - Stats: /api/stats                                      ║
    ╚═══════════════════════════════════════════════════════════╝
    """)

    # Use port 5002 to match existing n8n workflow configuration
    app.run(host='0.0.0.0', port=5002, debug=True)
