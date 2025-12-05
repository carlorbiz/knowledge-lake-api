"""
Enhanced Knowledge Lake API Server with Agent-Specific Endpoints
Supports cross-agent memory access and workflow orchestration
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from mem0 import Memory
import os
from datetime import datetime
from dotenv import load_dotenv
from waitress import serve
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Initialize Mem0
try:
    memory = Memory()
    logger.info("Mem0 Memory initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Mem0: {e}")
    memory = None

# Agent registry with capabilities
AGENTS = {
    "grok": {
        "name": "Grok",
        "role": "System Architecture & Risk Analysis",
        "strengths": ["architecture_analysis", "risk_identification", "troubleshooting"]
    },
    "manus": {
        "name": "Manus",
        "role": "Documentation & Technical Precision",
        "strengths": ["documentation", "api_specification", "traceability"]
    },
    "fred": {
        "name": "Fred",
        "role": "Deep Research & Evidence Synthesis",
        "strengths": ["research", "evidence_synthesis", "compliance"]
    },
    "penny": {
        "name": "Penny",
        "role": "Content Creation & Educational Design",
        "strengths": ["content_creation", "educational_design", "visual_content"]
    },
    "gemini": {
        "name": "Gemini",
        "role": "Multimodal Analysis & Visual Intelligence",
        "strengths": ["multimodal_analysis", "visual_intelligence", "code_optimization"]
    },
    "claude_code": {
        "name": "Claude Code",
        "role": "Multi-Agent Orchestration",
        "strengths": ["orchestration", "task_decomposition", "integration"]
    }
}

# ============================================
# CORE KNOWLEDGE ENDPOINTS
# ============================================

@app.route('/knowledge/search', methods=['GET'])
def search_knowledge():
    """Search the knowledge lake with optional agent context"""
    query = request.args.get('query')
    user_id = request.args.get('user_id', 'carla_knowledge_lake')
    limit = int(request.args.get('limit', 10))

    if not query:
        return jsonify({'error': 'query parameter required'}), 400

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        results = memory.search(query=query, user_id=user_id, limit=limit)
        logger.info(f"Search by {user_id}: '{query}' returned {len(results)} results")
        return jsonify({
            'results': results,
            'query': query,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/knowledge/add', methods=['POST'])
def add_knowledge():
    """Add knowledge to the lake with metadata"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'content field required'}), 400

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        user_id = data.get('user_id', 'carla_knowledge_lake')
        metadata = data.get('metadata', {})
        metadata['timestamp'] = datetime.now().isoformat()

        # Add agent information if user_id matches known agent
        if user_id in AGENTS:
            metadata['agent_name'] = AGENTS[user_id]['name']
            metadata['agent_role'] = AGENTS[user_id]['role']

        result = memory.add(
            messages=data['content'],
            user_id=user_id,
            metadata=metadata
        )

        logger.info(f"Knowledge added by {user_id}: {data['content'][:100]}...")
        return jsonify({
            'status': 'added',
            'user_id': user_id,
            'timestamp': metadata['timestamp'],
            'memory_id': result.get('id') if isinstance(result, dict) else None
        })
    except Exception as e:
        logger.error(f"Add knowledge error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/knowledge/context/<topic>', methods=['GET'])
def get_context(topic):
    """Get focused context for a specific topic"""
    user_id = request.args.get('user_id', 'carla_knowledge_lake')
    limit = int(request.args.get('limit', 5))

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        results = memory.search(query=topic, user_id=user_id, limit=limit)
        return jsonify({
            'context': results,
            'topic': topic,
            'user_id': user_id
        })
    except Exception as e:
        logger.error(f"Context retrieval error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# AGENT-SPECIFIC ENDPOINTS
# ============================================

@app.route('/agent/register', methods=['POST'])
def register_agent():
    """Register or update agent profile in knowledge lake"""
    data = request.get_json()
    required = ['agent_id', 'name', 'role']

    if not all(field in data for field in required):
        return jsonify({'error': f'Required fields: {required}'}), 400

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        agent_profile = f"""
Agent Profile: {data['name']}
Agent ID: {data['agent_id']}
Role: {data['role']}
Strengths: {', '.join(data.get('strengths', []))}
Optimal Prompt: {data.get('prompt', 'Not provided')}
Status: Active
Registered: {datetime.now().isoformat()}
"""

        memory.add(
            messages=agent_profile,
            user_id='system',
            metadata={
                'type': 'agent_profile',
                'agent_id': data['agent_id'],
                'agent_name': data['name']
            }
        )

        logger.info(f"Agent registered: {data['name']} ({data['agent_id']})")
        return jsonify({'status': 'registered', 'agent_id': data['agent_id']})
    except Exception as e:
        logger.error(f"Agent registration error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/agent/list', methods=['GET'])
def list_agents():
    """List all registered agents"""
    return jsonify({'agents': AGENTS})

@app.route('/agent/<agent_id>/history', methods=['GET'])
def agent_history(agent_id):
    """Get agent's interaction history"""
    limit = int(request.args.get('limit', 20))

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        results = memory.search(
            query=f"agent:{agent_id}",
            user_id=agent_id,
            limit=limit
        )
        return jsonify({
            'agent_id': agent_id,
            'history': results,
            'count': len(results)
        })
    except Exception as e:
        logger.error(f"History retrieval error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/agent/<agent_id>/insights', methods=['POST'])
def add_agent_insights(agent_id):
    """Add agent-specific insights to knowledge lake"""
    data = request.get_json()

    if not data or 'insights' not in data:
        return jsonify({'error': 'insights field required'}), 400

    if agent_id not in AGENTS:
        return jsonify({'error': f'Unknown agent: {agent_id}'}), 404

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        metadata = {
            'type': 'agent_insights',
            'agent_id': agent_id,
            'agent_name': AGENTS[agent_id]['name'],
            'task_id': data.get('task_id'),
            'timestamp': datetime.now().isoformat()
        }

        memory.add(
            messages=data['insights'],
            user_id=agent_id,
            metadata=metadata
        )

        logger.info(f"Insights added by {agent_id}")
        return jsonify({'status': 'added', 'agent_id': agent_id})
    except Exception as e:
        logger.error(f"Add insights error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# WORKFLOW COORDINATION ENDPOINTS
# ============================================

@app.route('/workflow/handoff', methods=['POST'])
def workflow_handoff():
    """Coordinate handoff between agents with context transfer"""
    data = request.get_json()
    required = ['from_agent', 'to_agent', 'task', 'context']

    if not all(field in data for field in required):
        return jsonify({'error': f'Required fields: {required}'}), 400

    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        handoff_record = f"""
WORKFLOW HANDOFF
From: {data['from_agent']} ({AGENTS.get(data['from_agent'], {}).get('name', 'Unknown')})
To: {data['to_agent']} ({AGENTS.get(data['to_agent'], {}).get('name', 'Unknown')})
Task: {data['task']}
Context: {data['context']}
Timestamp: {datetime.now().isoformat()}
"""

        memory.add(
            messages=handoff_record,
            user_id='workflow_coordinator',
            metadata={
                'type': 'workflow_handoff',
                'from_agent': data['from_agent'],
                'to_agent': data['to_agent'],
                'task_id': data.get('task_id')
            }
        )

        logger.info(f"Workflow handoff: {data['from_agent']} → {data['to_agent']}")
        return jsonify({'status': 'handoff_recorded'})
    except Exception as e:
        logger.error(f"Workflow handoff error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/workflow/status/<task_id>', methods=['GET'])
def workflow_status(task_id):
    """Get workflow status for a specific task"""
    if memory is None:
        return jsonify({'error': 'Memory system not initialized'}), 503

    try:
        results = memory.search(
            query=f"task_id:{task_id}",
            user_id='workflow_coordinator',
            limit=50
        )
        return jsonify({
            'task_id': task_id,
            'workflow_events': results,
            'count': len(results)
        })
    except Exception as e:
        logger.error(f"Workflow status error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# SYSTEM ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    mem0_status = 'initialized' if memory else 'not_initialized'
    return jsonify({
        'status': 'healthy',
        'service': 'enhanced_knowledge_lake',
        'mem0_status': mem0_status,
        'agents_registered': len(AGENTS),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get knowledge lake statistics"""
    return jsonify({
        'agents': len(AGENTS),
        'agent_list': list(AGENTS.keys()),
        'endpoints': {
            'knowledge': ['/knowledge/search', '/knowledge/add', '/knowledge/context/<topic>'],
            'agents': ['/agent/register', '/agent/list', '/agent/<id>/history', '/agent/<id>/insights'],
            'workflow': ['/workflow/handoff', '/workflow/status/<task_id>'],
            'system': ['/health', '/stats']
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def index():
    """API documentation endpoint"""
    return jsonify({
        'service': 'Enhanced Knowledge Lake API',
        'version': '2.0',
        'description': 'Cross-agent memory and workflow coordination for AAE',
        'documentation': 'See AGENT_KNOWLEDGE_LAKE_ACCESS.md',
        'endpoints': {
            'health': 'GET /health',
            'stats': 'GET /stats',
            'search': 'GET /knowledge/search?query=<q>&user_id=<agent>',
            'add': 'POST /knowledge/add',
            'agents': 'GET /agent/list',
            'register_agent': 'POST /agent/register'
        }
    })

# ============================================
# SERVER STARTUP
# ============================================

if __name__ == '__main__':
    # Use port 8000 for Knowledge Lake (separate from AI Brain on 5002)
    port = int(os.getenv('KNOWLEDGE_LAKE_PORT', 8000))
    host = os.getenv('KNOWLEDGE_LAKE_HOST', '0.0.0.0')

    logger.info(f"Starting Enhanced Knowledge Lake API on {host}:{port}")
    logger.info(f"Registered agents: {', '.join(AGENTS.keys())}")
    logger.info(f"Production server: Waitress with {4} threads")
    logger.info("Press Ctrl+C to stop")

    # Use waitress for production (NOT Flask development server)
    try:
        serve(app, host=host, port=port, threads=4)
    except KeyboardInterrupt:
        logger.info("Shutting down Enhanced Knowledge Lake API")
