from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Try to import mem0 - gracefully handle if not available or dependencies missing
memory = None
try:
    from mem0 import Memory
    from mem0_config import get_mem0_config

    # Initialize mem0 with environment-specific configuration
    # Skip mem0 initialization if OPENAI_API_KEY is missing
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    if not OPENAI_API_KEY:
        print("[WARNING] OPENAI_API_KEY not set - mem0 features disabled")
        memory = None
    else:
        try:
            config = get_mem0_config()
            memory = Memory(**config) if config else Memory()
            print("[SUCCESS] Mem0 initialized successfully")
        except Exception as e:
            print(f"[WARNING] Mem0 initialization failed: {e}")
            print("[WARNING] Continuing without mem0 - semantic search disabled")
            memory = None
except ImportError as e:
    print(f"[WARNING] Mem0 import failed: {e}")
    print("[WARNING] Continuing without mem0 - semantic search disabled")
    memory = None

# DEPLOYMENT VERIFICATION: Print at startup to confirm enhanced version is loaded
print("=" * 80)
print("[STARTUP] API_SERVER.PY LOADED - VERSION 2.0.1_enhanced")
print("[STARTUP] Enhanced endpoints: /api/conversations/ingest, /api/entities, /api/aurelia/query")
print("=" * 80)

# In-memory storage for structured entity/relationship data
# TODO: Migrate to PostgreSQL/Supabase for production persistence
conversations_db = []
entities_db = []
relationships_db = []

@app.route('/knowledge/search', methods=['GET'])
def search_knowledge():
    query = request.args.get('query')
    user_id = request.args.get('user_id', 'carla_knowledge_lake')
    results = memory.search(query=query, user_id=user_id, limit=10)
    return jsonify({'results': results, 'timestamp': datetime.now().isoformat()})

@app.route('/knowledge/add', methods=['POST'])
def add_knowledge():
    data = request.get_json()
    memory.add(
        messages=data['content'], 
        user_id=data.get('user_id', 'carla_knowledge_lake'),
        metadata=data.get('metadata', {})
    )
    return jsonify({'status': 'added', 'timestamp': datetime.now().isoformat()})

@app.route('/knowledge/context/<topic>', methods=['GET'])
def get_context(topic):
    results = memory.search(query=topic, user_id='carla_knowledge_lake', limit=5)
    return jsonify({'context': results, 'topic': topic})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'mem0_knowledge_lake',
        'version': '2.0.1_enhanced',
        'endpoints': {
            'legacy': ['/knowledge/search', '/knowledge/add', '/knowledge/context'],
            'conversations': ['/api/conversations/ingest', '/api/conversations'],
            'entities': ['/api/entities', '/api/relationships'],
            'aurelia': ['/api/aurelia/query', '/api/aurelia/context']
        }
    })

# ============================================================================
# NEW STRUCTURED ENDPOINTS - For n8n, AAE Dashboard, Aurelia
# ============================================================================

@app.route('/api/conversations/ingest', methods=['POST'])
def ingest_conversation():
    """
    Ingest a conversation with structured entities and relationships

    Called by:
    - n8n workflows (after AI entity extraction)
    - AAE Dashboard ingestion scripts
    - Manus MCP autonomous processing

    Expected format:
    {
        "userId": 1,
        "agent": "Claude",
        "date": "2024-11-30",
        "topic": "Database Schema Design",
        "content": "Full conversation text...",
        "entities": [
            {"name": "Notion", "entityType": "Technology", "confidence": 0.95}
        ],
        "relationships": [
            {"from": "Notion", "to": "GitHub", "relationshipType": "integrates_with"}
        ]
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required = ['userId', 'agent', 'date', 'content']
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({
                'success': False,
                'error': f'Missing fields: {", ".join(missing)}'
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

        # Also add to mem0 for semantic search
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
                'topic': conversation['topic']
            }
        )

        # Store entities
        entities_created = []
        entity_id_map = {}

        for entity_data in data.get('entities', []):
            # Check for duplicates
            existing = next(
                (e for e in entities_db
                 if e['name'].lower() == entity_data['name'].lower()
                 and e['userId'] == data['userId']),
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
                'confidence': entity_data.get('confidence', 0.5),
                'sourceContext': entity_data.get('sourceContext', ''),
                'conversationId': conversation['id'],
                'createdAt': datetime.now().isoformat()
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
                continue

            relationship = {
                'id': len(relationships_db) + 1,
                'fromEntityId': from_id,
                'toEntityId': to_id,
                'relationshipType': rel_data['relationshipType'],
                'weight': rel_data.get('weight', 1),
                'semanticState': 'RAW',
                'conversationId': conversation['id'],
                'createdAt': datetime.now().isoformat()
            }
            relationships_db.append(relationship)
            relationships_created.append(relationship)

        return jsonify({
            'success': True,
            'conversation': {
                'id': conversation['id'],
                'agent': conversation['agent'],
                'topic': conversation['topic']
            },
            'entitiesCreated': len(entities_created),
            'relationshipsCreated': len(relationships_created),
            'timestamp': datetime.now().isoformat()
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/entities', methods=['GET'])
def get_entities():
    """Get entities for a user (for AAE Dashboard visualization)"""
    user_id = request.args.get('userId', type=int)
    entity_type = request.args.get('entityType')
    limit = request.args.get('limit', 100, type=int)

    if not user_id:
        return jsonify({'error': 'userId required'}), 400

    # Filter by user
    user_entities = [e for e in entities_db if e['userId'] == user_id]

    # Filter by type if specified
    if entity_type:
        user_entities = [e for e in user_entities if e['entityType'] == entity_type]

    # Sort by confidence descending
    user_entities.sort(key=lambda x: x.get('confidence', 0), reverse=True)

    return jsonify({
        'entities': user_entities[:limit],
        'total': len(user_entities)
    })

@app.route('/api/relationships', methods=['GET'])
def get_relationships():
    """Get relationships for a user (for AAE Dashboard graph)"""
    user_id = request.args.get('userId', type=int)

    if not user_id:
        return jsonify({'error': 'userId required'}), 400

    # Get user's entity IDs
    user_entity_ids = [e['id'] for e in entities_db if e['userId'] == user_id]

    # Filter relationships
    user_relationships = [
        r for r in relationships_db
        if r['fromEntityId'] in user_entity_ids
    ]

    # Enrich with entity names
    enriched = []
    for rel in user_relationships:
        from_entity = next((e for e in entities_db if e['id'] == rel['fromEntityId']), None)
        to_entity = next((e for e in entities_db if e['id'] == rel['toEntityId']), None)

        enriched.append({
            **rel,
            'fromEntity': from_entity['name'] if from_entity else None,
            'toEntity': to_entity['name'] if to_entity else None
        })

    return jsonify({
        'relationships': enriched,
        'total': len(user_relationships)
    })

@app.route('/api/aurelia/query', methods=['POST'])
def aurelia_query():
    """
    Intelligent query for Aurelia avatar
    Combines mem0 semantic search + entity knowledge
    """
    try:
        data = request.get_json()

        if not data.get('query'):
            return jsonify({'error': 'query required'}), 400

        user_id = data.get('userId', 1)
        query = data['query']

        # Semantic search via mem0
        mem0_results = memory.search(
            query=query,
            user_id=f"user_{user_id}",
            limit=5
        )

        # Find relevant entities
        query_lower = query.lower()
        relevant_entities = [
            e for e in entities_db
            if e['userId'] == user_id and (
                query_lower in e['name'].lower() or
                query_lower in e.get('description', '').lower()
            )
        ][:5]

        # Build response
        spoken = f"Based on your knowledge base, I found {len(mem0_results)} relevant insights"
        if relevant_entities:
            spoken += f" and {len(relevant_entities)} related concepts"

        detailed = f"# Response to: {query}\n\n"

        if mem0_results:
            detailed += "## Recent Insights:\n"
            for result in mem0_results[:3]:
                if isinstance(result, dict) and 'memory' in result:
                    detailed += f"- {result['memory']}\n"

        if relevant_entities:
            detailed += "\n## Related Concepts:\n"
            for entity in relevant_entities:
                detailed += f"- **{entity['name']}** ({entity['entityType']})\n"

        return jsonify({
            'success': True,
            'spokenResponse': spoken,
            'detailedResponse': detailed,
            'relevantEntities': relevant_entities,
            'confidence': 0.75,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get knowledge lake statistics"""
    user_id = request.args.get('userId', type=int)

    stats = {
        'totalConversations': len(conversations_db),
        'totalEntities': len(entities_db),
        'totalRelationships': len(relationships_db)
    }

    if user_id:
        user_entities = [e for e in entities_db if e['userId'] == user_id]
        entity_types = {}
        for e in user_entities:
            entity_types[e['entityType']] = entity_types.get(e['entityType'], 0) + 1

        stats.update({
            'userConversations': len([c for c in conversations_db if c['userId'] == user_id]),
            'userEntities': len(user_entities),
            'entityTypeDistribution': entity_types
        })

    return jsonify(stats)

if __name__ == '__main__':
    print("""
    ========================================================
       AAE Knowledge Lake API v2.0 Enhanced
    ========================================================
       Running on: http://0.0.0.0:5002

       [OK] Legacy endpoints working
       [OK] New structured endpoints added

       Ready for: n8n, AAE Dashboard, Aurelia
    ========================================================
    """)

    # Use port 5002 to match existing n8n workflow configuration
    # Debug mode disabled to avoid qdrant lock issues on Windows
    app.run(host='0.0.0.0', port=5002, debug=False)

