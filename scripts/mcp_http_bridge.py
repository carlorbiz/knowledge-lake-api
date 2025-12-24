#!/usr/bin/env python3
"""
MCP HTTP Bridge for Genspark/Jan
Exposes Knowledge Lake MCP as HTTP/SSE endpoint for non-stdio clients
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import asyncio
import json
import sys
import time
from pathlib import Path
from datetime import datetime

# Add Knowledge Lake MCP to path
sys.path.insert(0, str(Path(__file__).parent.parent / "agent-conversations" / "claude" / "claude-knowledge-lake-mcp" / "claude-knowledge-lake-mcp"))

from knowledge_lake import KnowledgeLakeClient

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Genspark

# Initialize Knowledge Lake client
kl_client = KnowledgeLakeClient()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Knowledge Lake MCP HTTP Bridge",
        "version": "1.0.0",
        "mcp_protocol": "SSE",
        "supported_operations": [
            "ingest_conversation",
            "query_conversations",
            "extract_learning",
            "archive_conversations"
        ]
    })

@app.route('/mcp/ingest', methods=['POST'])
def ingest():
    """Ingest conversation to Knowledge Lake"""
    data = request.json

    try:
        result = asyncio.run(kl_client.ingest_conversation(
            topic=data.get('topic'),
            content=data.get('content'),
            conversation_date=data.get('date'),
            entities=data.get('entities', []),
            relationships=data.get('relationships', []),
            metadata=data.get('metadata', {})
        ))

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/mcp/query', methods=['POST'])
def query():
    """Query Knowledge Lake"""
    data = request.json

    try:
        result = asyncio.run(kl_client.query_conversations(
            query=data.get('query'),
            limit=data.get('limit', 20)
        ))

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/mcp/extract-learning', methods=['POST'])
def extract_learning():
    """Extract learning patterns from conversations"""
    data = request.json

    try:
        result = asyncio.run(kl_client.extract_learning(
            conversation_ids=data.get('conversationIds', []),
            dimensions=data.get('dimensions', [
                "methodology", "decisions", "corrections", "insights",
                "values", "prompting", "teaching"
            ])
        ))

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/mcp/archive', methods=['POST'])
def archive():
    """Archive conversations"""
    data = request.json

    try:
        result = asyncio.run(kl_client.archive_conversations(
            conversation_ids=data.get('conversationIds'),
            archive_type=data.get('archiveType', 'soft_delete'),
            retention_days=data.get('retentionDays', 30)
        ))

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/mcp/sse', methods=['GET'])
def sse_endpoint():
    """
    Server-Sent Events endpoint for Genspark/Jan
    Implements MCP protocol over SSE
    """
    def event_stream():
        # Send MCP server info on connection
        server_info = {
            "jsonrpc": "2.0",
            "method": "server/info",
            "params": {
                "name": "Knowledge Lake MCP",
                "version": "1.0.0",
                "protocolVersion": "0.1.0",
                "capabilities": {
                    "tools": True,
                    "resources": False
                }
            }
        }
        yield f"event: message\ndata: {json.dumps(server_info)}\n\n"

        # Send available tools listing
        tools_list = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {
                "tools": [
                    {
                        "name": "query_knowledge_lake",
                        "description": "Search Knowledge Lake for relevant conversations",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "Search query"
                                },
                                "limit": {
                                    "type": "number",
                                    "description": "Maximum results (default 20)",
                                    "default": 20
                                }
                            },
                            "required": ["query"]
                        }
                    },
                    {
                        "name": "ingest_conversation",
                        "description": "Add a new conversation to Knowledge Lake",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "topic": {
                                    "type": "string",
                                    "description": "Conversation topic"
                                },
                                "content": {
                                    "type": "string",
                                    "description": "Full conversation content"
                                },
                                "metadata": {
                                    "type": "object",
                                    "description": "Additional metadata"
                                }
                            },
                            "required": ["topic", "content"]
                        }
                    },
                    {
                        "name": "extract_learning",
                        "description": "Extract learning patterns from conversations",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "conversationIds": {
                                    "type": "array",
                                    "items": {"type": "number"},
                                    "description": "Conversation IDs to analyze"
                                },
                                "dimensions": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Learning dimensions to extract"
                                }
                            },
                            "required": ["conversationIds"]
                        }
                    }
                ]
            }
        }
        yield f"event: message\ndata: {json.dumps(tools_list)}\n\n"

        # Keep connection alive with periodic pings
        while True:
            ping = {
                "jsonrpc": "2.0",
                "method": "ping",
                "params": {
                    "timestamp": datetime.now().isoformat()
                }
            }
            yield f"event: ping\ndata: {json.dumps(ping)}\n\n"
            time.sleep(30)

    response = Response(event_stream(), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'
    return response

if __name__ == '__main__':
    print("=" * 80)
    print("Knowledge Lake MCP HTTP Bridge")
    print("=" * 80)
    print()
    print("Starting server on http://localhost:5001")
    print()
    print("Endpoints:")
    print("  GET  /health                - Health check")
    print("  POST /mcp/ingest            - Ingest conversation")
    print("  POST /mcp/query             - Query Knowledge Lake")
    print("  POST /mcp/extract-learning  - Extract learning patterns")
    print("  POST /mcp/archive           - Archive conversations")
    print("  GET  /mcp/sse               - Server-Sent Events stream")
    print()
    print("For Genspark/Jan MCP integration:")
    print("  Server Type: SSE")
    print("  Server URL: http://localhost:5001/mcp/sse")
    print()

    app.run(host='0.0.0.0', port=5001, debug=False)
