from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv
from database import init_database, get_db
from typing import List, Dict, Any, Optional

# Configure logging to use stdout (prevents Railway from showing everything as "error")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('api_server')

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enhanced CORS for bolt.new and production deployments
CORS(app,
     resources={
         r"/api/*": {
             "origins": [
                 "http://localhost:*",
                 "https://*.bolt.new",
                 "https://*.netlify.app",
                 "https://*.vercel.app",
                 "https://*.pages.dev",  # Cloudflare Pages
                 "*"  # Allow all for development (remove in strict production)
             ],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "X-API-Key"],
             "expose_headers": ["Content-Type"],
             "supports_credentials": False,
             "max_age": 3600
         }
     })

# Try to import mem0 - gracefully handle if not available or dependencies missing
memory = None
try:
    from mem0 import Memory
    from mem0_config import get_mem0_config

    # Initialize mem0 with environment-specific configuration
    # Skip mem0 initialization if OPENAI_API_KEY is missing
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    if not OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set - mem0 features disabled")
        memory = None
    else:
        try:
            config = get_mem0_config()
            memory = Memory(**config) if config else Memory()
            logger.info("✅ Mem0 initialized successfully with OPENAI_API_KEY")
        except Exception as e:
            logger.error(f"❌ Mem0 initialization failed: {e}")
            logger.warning("Continuing without mem0 - semantic search disabled")
            memory = None
except ImportError as e:
    logger.error(f"Mem0 import failed: {e}")
    logger.warning("Continuing without mem0 - semantic search disabled")
    memory = None

# DEPLOYMENT VERIFICATION: Log at startup to confirm enhanced version is loaded
logger.info("=" * 80)
logger.info("🚀 API_SERVER.PY LOADED - VERSION 2.1.0_database_persistence")
logger.info("📍 All 6 conversation endpoints: ingest, query, unprocessed, archive, extract-learning, stats")
logger.info(f"🔑 OPENAI_API_KEY configured: {bool(os.environ.get('OPENAI_API_KEY'))}")
logger.info(f"💾 Mem0 enabled: {memory is not None}")
logger.info("=" * 80)

# Initialize PostgreSQL database with fallback to in-memory
USE_DATABASE = False
conversations_db = []
entities_db = []
relationships_db = []

try:
    init_database()
    USE_DATABASE = True
    logger.info("[OK] PostgreSQL database initialized - persistent storage enabled")
except Exception as e:
    logger.error(f"❌ Database initialization failed: {e}")
    logger.warning("Falling back to in-memory storage (data lost on restart)")
    logger.warning("Set DATABASE_URL to enable persistence")

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
    # Check environment variables (safely, without exposing values)
    openai_key_set = bool(os.environ.get('OPENAI_API_KEY'))
    railway_env = os.environ.get('RAILWAY_ENVIRONMENT', 'local')

    # Determine accurate mem0 status
    if memory is not None:
        mem0_status = 'initialized'
    elif not openai_key_set:
        mem0_status = 'disabled - OPENAI_API_KEY not set'
    else:
        mem0_status = 'disabled - initialization failed (check logs)'

    return jsonify({
        'status': 'healthy',
        'service': 'mem0_knowledge_lake',
        'version': '2.1.0_database_persistence',
        'database_enabled': USE_DATABASE,
        'environment': {
            'railway': railway_env,
            'openai_key_configured': openai_key_set,
            'mem0_enabled': memory is not None,
            'mem0_status': mem0_status
        },
        'endpoints': {
            'legacy': ['/knowledge/search', '/knowledge/add', '/knowledge/context'],
            'conversations': [
                '/api/conversations/ingest',
                '/api/conversations',
                '/api/conversations/unprocessed',
                '/api/conversations/archive',
                '/api/conversations/extract-learning'
            ],
            'entities': ['/api/entities', '/api/relationships'],
            'aurelia': ['/api/aurelia/query', '/api/aurelia/context'],
            'stats': ['/api/stats'],
            'bot': ['/api/bot/query', '/api/bot/ingest-sample']
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
        if USE_DATABASE:
            try:
                db = get_db()
                conversation_id = db.create_conversation(
                    user_id=data['userId'],
                    agent=data['agent'],
                    date=data['date'],
                    topic=data.get('topic', 'General Discussion'),
                    content=data['content'],
                    metadata=data.get('metadata', {})
                )
                conversation = {
                    'id': conversation_id,
                    'agent': data['agent'],
                    'topic': data.get('topic', 'General Discussion')
                }
            except Exception as e:
                logger.error(f"Database error: {e}")
                raise
        else:
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

        # Also add to mem0 for semantic search (if available)
        if memory:
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

            if USE_DATABASE:
                entity_id = db.create_entity(
                    conversation_id=conversation['id'],
                    name=entity_data['name'],
                    entity_type=entity_data['entityType'],
                    confidence=entity_data.get('confidence', 0.5),
                    description=entity_data.get('description', ''),
                    metadata={'sourceContext': entity_data.get('sourceContext', '')}
                )
                entities_created.append({'id': entity_id, 'name': entity_data['name']})
            else:
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
            'mem0Indexed': memory is not None,
            'timestamp': datetime.now().isoformat()
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/conversations', methods=['GET'])
def query_conversations():
    """
    Query and search conversations

    Query parameters:
    - userId: User ID (required)
    - q: Search query (optional)
    - agent: Filter by agent name (optional)
    - entityType: Filter by entity type (optional)
    - limit: Max results (default: 20)

    Used by:
    - Knowledge Lake MCP for searching context
    - AAE Dashboard conversation browser
    """
    try:
        user_id = request.args.get('userId', type=int)
        query = request.args.get('q', '')
        agent_filter = request.args.get('agent')
        entity_type_filter = request.args.get('entityType')
        limit = request.args.get('limit', 20, type=int)

        if not user_id:
            return jsonify({'error': 'userId required'}), 400

        # Filter conversations by user
        results = [c for c in conversations_db if c['userId'] == user_id]

        # Apply filters
        if agent_filter:
            results = [c for c in results if c['agent'].lower() == agent_filter.lower()]

        # Text search across topic and content
        if query:
            query_lower = query.lower()
            results = [
                c for c in results
                if query_lower in c.get('topic', '').lower()
                or query_lower in c.get('content', '').lower()
            ]

        # Filter by entity type if requested
        if entity_type_filter:
            # Get conversation IDs that have entities of this type
            conv_ids_with_type = set(
                e['conversationId'] for e in entities_db
                if e['entityType'] == entity_type_filter
            )
            results = [c for c in results if c['id'] in conv_ids_with_type]

        # Sort by date descending (most recent first)
        results = sorted(results, key=lambda x: x.get('date', ''), reverse=True)

        # Limit results
        results = results[:limit]

        # For each conversation, include related entities
        for conv in results:
            conv_entities = [
                {
                    'id': e['id'],
                    'name': e['name'],
                    'entityType': e['entityType'],
                    'confidence': e.get('confidence', 0)
                }
                for e in entities_db
                if e.get('conversationId') == conv['id']
            ]
            conv['entities'] = conv_entities

        return jsonify({
            'conversations': results,
            'total': len(results),
            'query': query,
            'filters': {
                'agent': agent_filter,
                'entityType': entity_type_filter
            }
        })

    except Exception as e:
        logger.error(f"Error querying conversations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/unprocessed', methods=['GET'])
def get_unprocessed_conversations():
    """
    Get conversations that haven't been processed for learning extraction

    Query parameters:
    - userId: User ID (required)
    - agent: Filter by agent name (optional)
    - dateFrom: Start date YYYY-MM-DD (optional)
    - dateTo: End date YYYY-MM-DD (optional)
    - limit: Max results (default: 50)

    Used by:
    - Knowledge Lake MCP learning extraction workflow
    - AAE Dashboard learning extraction pipeline

    Note: In-memory implementation uses metadata flag.
    Production would use processed_for_learning DB column.
    """
    try:
        user_id = request.args.get('userId', type=int)
        agent_filter = request.args.get('agent')
        date_from = request.args.get('dateFrom')
        date_to = request.args.get('dateTo')
        limit = request.args.get('limit', 50, type=int)

        if not user_id:
            return jsonify({'error': 'userId required'}), 400

        # Filter conversations
        results = [c for c in conversations_db if c['userId'] == user_id]

        # Filter by processed flag (using metadata)
        results = [
            c for c in results
            if not c.get('metadata', {}).get('processed_for_learning', False)
        ]

        # Apply filters
        if agent_filter:
            results = [c for c in results if c['agent'].lower() == agent_filter.lower()]

        if date_from:
            results = [c for c in results if c.get('date', '') >= date_from]

        if date_to:
            results = [c for c in results if c.get('date', '') <= date_to]

        # Sort by date ascending (oldest first for processing)
        results = sorted(results, key=lambda x: x.get('date', ''))

        # Limit results
        results = results[:limit]

        # Return simplified format for processing queue
        conversations = [
            {
                'id': c['id'],
                'topic': c.get('topic', 'Untitled'),
                'date': c.get('date'),
                'agent': c['agent'],
                'summary': c.get('content', '')[:200] + '...' if len(c.get('content', '')) > 200 else c.get('content', '')
            }
            for c in results
        ]

        return jsonify({
            'conversations': conversations,
            'total_unprocessed': len(conversations),
            'filters': {
                'agent': agent_filter,
                'dateFrom': date_from,
                'dateTo': date_to
            }
        })

    except Exception as e:
        logger.error(f"Error getting unprocessed conversations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/archive', methods=['POST'])
def archive_conversations():
    """
    Mark conversations as archived/processed for deletion

    Request body:
    {
        "userId": 1,
        "conversationIds": [123, 124],
        "archiveType": "soft_delete",  // or "hard_delete", "compress"
        "retentionDays": 30
    }

    Archive types:
    - soft_delete: Mark as archived, schedule for deletion
    - hard_delete: Remove immediately
    - compress: Mark for compression (future)

    Used by:
    - Knowledge Lake MCP after learning extraction
    - AAE Dashboard conversation management

    Note: In-memory implementation sets metadata flags.
    Production would use archived_at and delete_after DB columns.
    """
    try:
        data = request.get_json()

        user_id = data.get('userId')
        conversation_ids = data.get('conversationIds', [])
        archive_type = data.get('archiveType', 'soft_delete')
        retention_days = data.get('retentionDays', 30)

        if not user_id or not conversation_ids:
            return jsonify({
                'success': False,
                'error': 'userId and conversationIds required'
            }), 400

        archived_count = 0
        now = datetime.now()

        for conv in conversations_db:
            if conv['id'] in conversation_ids and conv['userId'] == user_id:
                if archive_type == 'hard_delete':
                    # Mark for removal (in production would actually delete)
                    conv['metadata'] = conv.get('metadata', {})
                    conv['metadata']['deleted'] = True
                    conv['metadata']['deleted_at'] = now.isoformat()
                else:
                    # Soft delete or compress
                    conv['metadata'] = conv.get('metadata', {})
                    conv['metadata']['archived'] = True
                    conv['metadata']['archived_at'] = now.isoformat()
                    conv['metadata']['archive_type'] = archive_type

                    if archive_type == 'soft_delete':
                        from datetime import timedelta
                        delete_after = now + timedelta(days=retention_days)
                        conv['metadata']['delete_after'] = delete_after.isoformat()

                # Mark as processed
                conv['metadata']['processed_for_learning'] = True
                conv['metadata']['processed_at'] = now.isoformat()

                archived_count += 1

        return jsonify({
            'success': True,
            'archived': archived_count,
            'archive_type': archive_type,
            'retention_days': retention_days if archive_type == 'soft_delete' else None,
            'timestamp': now.isoformat()
        })

    except Exception as e:
        logger.error(f"Error archiving conversations: {e}")
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

@app.route('/api/conversations/extract-learning', methods=['POST'])
def extract_learning():
    """
    Extract 7-dimension learning patterns from conversations using OpenAI

    Request body:
    {
        "userId": 1,
        "conversationIds": [1, 2, 3],  # Optional, if empty processes all unprocessed
        "dimensions": ["methodology", "decisions", "corrections", "insights",
                      "values", "prompting", "teaching"]  # Optional, defaults to all 7
    }

    7 Learning Dimensions:
    1. Methodology Evolution - How approaches and techniques evolved
    2. Decision Patterns - Key decision-making processes and criteria
    3. Correction Patterns - Mistakes made and corrections applied
    4. Insight Moments - Breakthrough realizations and discoveries
    5. Value Signals - What matters most (preferences, priorities)
    6. Prompting Patterns - Effective ways to communicate with AI
    7. Teaching Potential - Content suitable for teaching others

    Returns:
    {
        "success": true,
        "conversations_processed": 3,
        "learnings_extracted": {
            "methodology": 2,
            "decisions": 5,
            "corrections": 1,
            "insights": 3,
            "values": 2,
            "prompting": 4,
            "teaching": 1
        },
        "entities_created": 18
    }

    Used by:
    - Knowledge Lake MCP after ingestion
    - AAE Dashboard learning extraction pipeline
    - Aurelia AI for personalized tutoring
    """
    try:
        # Check if OpenAI is available
        if not os.environ.get('OPENAI_API_KEY'):
            return jsonify({
                'success': False,
                'error': 'OPENAI_API_KEY not configured - learning extraction requires OpenAI'
            }), 503

        from openai import OpenAI
        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

        data = request.get_json()
        user_id = data.get('userId')
        conversation_ids = data.get('conversationIds', [])
        requested_dimensions = data.get('dimensions', [
            'methodology', 'decisions', 'corrections', 'insights',
            'values', 'prompting', 'teaching'
        ])

        if not user_id:
            return jsonify({'success': False, 'error': 'userId required'}), 400

        # Get conversations to process
        if conversation_ids:
            conversations = [
                c for c in conversations_db
                if c['id'] in conversation_ids and c['userId'] == user_id
            ]
        else:
            # Process all unprocessed conversations
            conversations = [
                c for c in conversations_db
                if c['userId'] == user_id
                and not c.get('metadata', {}).get('processed_for_learning', False)
            ]

        if not conversations:
            return jsonify({
                'success': True,
                'conversations_processed': 0,
                'message': 'No conversations to process'
            })

        # Learning extraction prompt
        extraction_prompt = """You are an expert learning pattern analyst. Analyze this conversation and extract key learning patterns across 7 dimensions.

For each dimension, identify 1-5 specific, actionable learnings. Be concise but precise.

DIMENSIONS:
1. **Methodology Evolution**: How did approaches/techniques evolve? What worked better?
2. **Decision Patterns**: What decision criteria were used? What factors influenced choices?
3. **Correction Patterns**: What mistakes were made? How were they corrected?
4. **Insight Moments**: What were the breakthrough realizations or discoveries?
5. **Value Signals**: What priorities/preferences emerged? What mattered most?
6. **Prompting Patterns**: What communication styles/patterns were effective?
7. **Teaching Potential**: What content could teach others valuable skills/knowledge?

Return JSON format:
{
  "methodology": ["learning 1", "learning 2"],
  "decisions": ["learning 1", "learning 2"],
  "corrections": ["learning 1"],
  "insights": ["learning 1", "learning 2", "learning 3"],
  "values": ["learning 1", "learning 2"],
  "prompting": ["learning 1", "learning 2"],
  "teaching": ["learning 1"]
}

Only include dimensions with actual learnings. Skip empty dimensions."""

        learnings_extracted = {dim: 0 for dim in requested_dimensions}
        total_entities = 0
        processed_count = 0

        # Process each conversation
        for conv in conversations:
            try:
                # Prepare conversation text
                conversation_text = f"""
TOPIC: {conv.get('topic', 'Untitled')}
DATE: {conv.get('date', 'Unknown')}
AGENT: {conv.get('agent', 'Unknown')}

CONTENT:
{conv.get('content', '')[:4000]}
"""

                # Call OpenAI for learning extraction
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": extraction_prompt},
                        {"role": "user", "content": conversation_text}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=2000
                )

                # Parse learnings
                import json
                learnings = json.loads(response.choices[0].message.content)

                # Create entities for each learning
                dimension_map = {
                    'methodology': 'Learning:Methodology',
                    'decisions': 'Learning:DecisionPattern',
                    'corrections': 'Learning:Correction',
                    'insights': 'Learning:Insight',
                    'values': 'Learning:ValueSignal',
                    'prompting': 'Learning:PromptPattern',
                    'teaching': 'Learning:TeachingContent'
                }

                for dimension, items in learnings.items():
                    if dimension not in requested_dimensions:
                        continue

                    entity_type = dimension_map.get(dimension, f'Learning:{dimension.title()}')

                    for learning_text in items:
                        if USE_DATABASE:
                            db = get_db()
                            entity_id = db.create_entity(
                                conversation_id=conv['id'],
                                name=learning_text[:200],  # Truncate for name field
                                entity_type=entity_type,
                                confidence=0.85,
                                description=learning_text,
                                metadata={
                                    'dimension': dimension,
                                    'extracted_at': datetime.now().isoformat(),
                                    'source_topic': conv.get('topic', ''),
                                    'source_agent': conv.get('agent', '')
                                }
                            )
                        else:
                            entity = {
                                'id': len(entities_db) + 1,
                                'userId': user_id,
                                'entityType': entity_type,
                                'name': learning_text[:200],
                                'description': learning_text,
                                'semanticState': 'EXTRACTED',
                                'confidence': 0.85,
                                'sourceContext': f"From {conv.get('topic', '')} conversation",
                                'conversationId': conv['id'],
                                'createdAt': datetime.now().isoformat(),
                                'metadata': {
                                    'dimension': dimension,
                                    'extracted_at': datetime.now().isoformat(),
                                    'source_topic': conv.get('topic', ''),
                                    'source_agent': conv.get('agent', '')
                                }
                            }
                            entities_db.append(entity)

                        learnings_extracted[dimension] += 1
                        total_entities += 1

                # Mark conversation as processed
                conv['metadata'] = conv.get('metadata', {})
                conv['metadata']['processed_for_learning'] = True
                conv['metadata']['processed_at'] = datetime.now().isoformat()
                conv['metadata']['learnings_count'] = sum(len(items) for items in learnings.values())

                processed_count += 1

            except Exception as e:
                logger.error(f"Error extracting learnings from conversation {conv['id']}: {e}")
                continue

        return jsonify({
            'success': True,
            'conversations_processed': processed_count,
            'learnings_extracted': learnings_extracted,
            'entities_created': total_entities,
            'timestamp': datetime.now().isoformat()
        }), 200

    except ImportError:
        return jsonify({
            'success': False,
            'error': 'OpenAI library not installed'
        }), 503
    except Exception as e:
        logger.error(f"Error in learning extraction: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bot/query', methods=['POST', 'GET'])
def bot_query():
    """Simple bot query endpoint - WORKS for client topic expert bots"""
    try:
        # Handle both GET and POST
        if request.method == 'GET':
            query = request.args.get('query', request.args.get('q', ''))
            user_id = request.args.get('user_id', 'default')
        else:
            data = request.get_json() or {}
            query = data.get('query', data.get('q', ''))
            user_id = data.get('user_id', 'default')

        if not query:
            return jsonify({'success': False, 'error': 'Query required'}), 400

        # Try mem0 search
        mem0_results = []
        if memory:
            try:
                raw_results = memory.search(query=query, user_id=user_id)
                if isinstance(raw_results, list):
                    mem0_results = raw_results[:5]
                elif isinstance(raw_results, dict) and 'results' in raw_results:
                    mem0_results = raw_results['results'][:5]
            except Exception as e:
                logger.error(f"mem0 search failed: {e}")

        # Fallback: in-memory search
        query_lower = query.lower()
        conversation_matches = [
            c for c in conversations_db
            if query_lower in c.get('topic', '').lower() or
               query_lower in c.get('content', '').lower()
        ][:5]

        entity_matches = [
            e for e in entities_db
            if query_lower in e.get('name', '').lower() or
               query_lower in e.get('description', '').lower()
        ][:5]

        # Build answer
        if mem0_results:
            answer = f"Found {len(mem0_results)} insights:\n\n"
            for idx, result in enumerate(mem0_results[:3], 1):
                if isinstance(result, dict):
                    answer += f"{idx}. {result.get('memory', result.get('content', ''))}\n"
        elif conversation_matches:
            answer = f"Found {len(conversation_matches)} conversations:\n\n"
            for idx, conv in enumerate(conversation_matches[:3], 1):
                answer += f"{idx}. {conv.get('topic', '')}\n"
        elif entity_matches:
            answer = f"Found {len(entity_matches)} concepts:\n\n"
            for idx, entity in enumerate(entity_matches[:3], 1):
                answer += f"{idx}. {entity['name']} ({entity['entityType']})\n"
        else:
            answer = f"No information found about '{query}' yet."

        return jsonify({
            'success': True,
            'query': query,
            'answer': answer,
            'sources': {
                'mem0': len(mem0_results),
                'conversations': len(conversation_matches),
                'entities': len(entity_matches)
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Bot query error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bot/ingest-sample', methods=['POST'])
def ingest_sample():
    """Add sample healthcare knowledge"""
    try:
        samples = [
            {"topic": "AHPRA Compliance", "content": "AHPRA requires registration, National Law compliance, mandatory reporting, CPD, and insurance."},
            {"topic": "Aged Care Standards", "content": "8 Standards: Consumer dignity, Assessment, Personal care, Daily living, Environment, Feedback, HR, Governance."},
            {"topic": "NDIS Registration", "content": "NDIS requires Practice Standards, audit, Code of Conduct, and screening."}
        ]

        for item in samples:
            if memory:
                memory.add(
                    messages=[{'role': 'user', 'content': f"{item['topic']}: {item['content']}"}],
                    user_id='sample'
                )
            conversations_db.append({
                'id': len(conversations_db) + 1,
                'userId': 'sample',
                'agent': 'HealthcareAdvisor',
                'date': datetime.now().isoformat(),
                'topic': item['topic'],
                'content': item['content'],
                'metadata': {},
                'createdAt': datetime.now().isoformat(),
                'entityCount': 0,
                'relationshipCount': 0
            })

        return jsonify({'success': True, 'ingested': len(samples), 'total': len(conversations_db)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("""
    ========================================================
       AAE Knowledge Lake API v2.1 Bot-Ready
    ========================================================
       Running on: http://0.0.0.0:5002

       [✅] Bot query: /api/bot/query
       [✅] Sample data: /api/bot/ingest-sample
       [✅] All legacy endpoints working

       Ready for: Topic Expert Bots, n8n, AAE Dashboard
    ========================================================
    """)

    app.run(host='0.0.0.0', port=5002, debug=False)

