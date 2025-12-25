"""
Knowledge Lake API Client
Handles all HTTP communication with the Knowledge Lake API

Part of Carla's AI Automation Ecosystem (AAE)
"""

import json
import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime

from config import (
    KNOWLEDGE_LAKE_BASE_URL,
    DEFAULT_USER_ID,
    AGENT_NAME,
    REQUEST_TIMEOUT,
    CONNECT_TIMEOUT
)


class KnowledgeLakeError(Exception):
    """Custom exception for Knowledge Lake API errors."""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class KnowledgeLakeClient:
    """
    Async client for interacting with the Knowledge Lake API.
    
    Supports:
    - Conversation ingestion with entities and relationships
    - Querying stored conversations
    - Health and statistics checks
    """
    
    def __init__(self, base_url: str = KNOWLEDGE_LAKE_BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.ingest_endpoint = f"{self.base_url}/api/conversations/ingest"
        self.query_endpoint = f"{self.base_url}/api/conversations/search"
        self.stats_endpoint = f"{self.base_url}/api/stats"
        self.health_endpoint = f"{self.base_url}/health"
        
        self.timeout = httpx.Timeout(
            timeout=REQUEST_TIMEOUT,
            connect=CONNECT_TIMEOUT
        )
    
    async def _make_request(
        self,
        method: str,
        url: str,
        json_data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make an async HTTP request with error handling."""
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                if method.upper() == "GET":
                    response = await client.get(url, params=params)
                elif method.upper() == "POST":
                    response = await client.post(
                        url,
                        json=json_data,
                        headers={"Content-Type": "application/json"}
                    )
                else:
                    raise KnowledgeLakeError(f"Unsupported HTTP method: {method}")
                
                response.raise_for_status()
                return response.json()
                
            except httpx.HTTPStatusError as e:
                error_detail = self._parse_error_response(e.response)
                raise KnowledgeLakeError(
                    f"API request failed: {error_detail}",
                    status_code=e.response.status_code
                )
            except httpx.ConnectError:
                raise KnowledgeLakeError(
                    f"Could not connect to Knowledge Lake at {self.base_url}. "
                    "Ensure the API server is running (python api_server.py) or check Railway deployment."
                )
            except httpx.TimeoutException:
                raise KnowledgeLakeError(
                    f"Request timed out after {REQUEST_TIMEOUT}s. "
                    "The Knowledge Lake API may be under heavy load."
                )
            except Exception as e:
                raise KnowledgeLakeError(f"Unexpected error: {str(e)}")
    
    def _parse_error_response(self, response: httpx.Response) -> str:
        """Parse error details from API response."""
        try:
            error_data = response.json()
            if "error" in error_data:
                return error_data["error"]
            if "message" in error_data:
                return error_data["message"]
            return str(error_data)
        except Exception:
            return response.text or f"HTTP {response.status_code}"
    
    async def check_health(self) -> Dict[str, Any]:
        """
        Check if the Knowledge Lake API is healthy and available.
        
        Returns:
            Dict with status, service name, and version
        """
        return await self._make_request("GET", self.health_endpoint)
    
    async def ingest_conversation(
        self,
        topic: str,
        content: str,
        conversation_date: Optional[str] = None,
        entities: Optional[List[Dict]] = None,
        relationships: Optional[List[Dict]] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Ingest a conversation into the Knowledge Lake.
        
        Args:
            topic: Brief topic/title for the conversation
            content: Full conversation content
            conversation_date: Date in YYYY-MM-DD format (defaults to today)
            entities: List of entity dicts with name, entityType, confidence, etc.
            relationships: List of relationship dicts with from, to, relationshipType, etc.
            metadata: Additional metadata dict
        
        Returns:
            Dict with success status, conversation_id, entities_created, etc.
        """
        # Use today's date if not provided
        if conversation_date is None:
            conversation_date = datetime.now().strftime("%Y-%m-%d")
        
        # Build payload matching the API spec
        payload = {
            "userId": DEFAULT_USER_ID,
            "agent": AGENT_NAME,
            "date": conversation_date,
            "topic": topic,
            "content": content,
            "entities": entities or [],
            "relationships": relationships or [],
            "metadata": {
                "processingAgent": AGENT_NAME,
                **(metadata or {})
            }
        }
        
        result = await self._make_request("POST", self.ingest_endpoint, json_data=payload)
        
        # Normalise response format
        return {
            "success": result.get("success", True),
            "conversation_id": result.get("conversation", {}).get("id"),
            "topic": result.get("conversation", {}).get("topic", topic),
            "entities_created": result.get("entitiesCreated", 0),
            "relationships_created": result.get("relationshipsCreated", 0),
            "timestamp": result.get("timestamp", datetime.now().isoformat())
        }
    
    async def query_conversations(
        self,
        query: str,
        agent_filter: Optional[str] = None,
        entity_type_filter: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Search the Knowledge Lake for relevant conversations and entities.

        Args:
            query: Search query string
            agent_filter: Optional filter by agent name (supported by API)
            entity_type_filter: Optional filter by entity type (client-side filtering)
            limit: Maximum results to return

        Returns:
            Dict with conversations, entities, and relationships
        """
        payload = {
            "userId": DEFAULT_USER_ID,
            "query": query,
            "limit": limit
        }

        # The new /api/conversations/search endpoint supports agent filtering
        if agent_filter:
            payload["agent"] = agent_filter

        result = await self._make_request("POST", self.query_endpoint, json_data=payload)

        # Apply client-side entity type filtering if needed
        if entity_type_filter:
            results = result.get("results", [])
            filtered_results = []

            for item in results:
                # Apply entity type filter on entities in the result
                entities = item.get("entities", [])
                matching_entities = [e for e in entities if e.get("entityType") == entity_type_filter]
                if matching_entities:
                    filtered_results.append(item)

            result["results"] = filtered_results
            result["total"] = len(filtered_results)

        return result
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the Knowledge Lake.

        Returns:
            Dict with total counts, distributions by agent and entity type
        """
        params = {"userId": DEFAULT_USER_ID}
        return await self._make_request("GET", self.stats_endpoint, params=params)

    async def extract_learning(
        self,
        conversation_ids: Optional[List[int]] = None,
        dimensions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Extract 7-dimension learning patterns from conversations using OpenAI.

        Args:
            conversation_ids: List of conversation IDs to process. If empty, processes all unprocessed.
            dimensions: Learning dimensions to extract. Defaults to all 7:
                       ["methodology", "decisions", "corrections", "insights",
                        "values", "prompting", "teaching"]

        Returns:
            Dict with processing results and learning counts by dimension
        """
        payload = {
            "userId": DEFAULT_USER_ID,
            "conversationIds": conversation_ids or [],
            "dimensions": dimensions or [
                "methodology", "decisions", "corrections", "insights",
                "values", "prompting", "teaching"
            ]
        }

        extract_endpoint = f"{self.base_url}/api/conversations/extract-learning"
        return await self._make_request("POST", extract_endpoint, json_data=payload)

    async def archive_conversations(
        self,
        conversation_ids: List[int],
        archive_type: str = "soft_delete",
        retention_days: int = 30
    ) -> Dict[str, Any]:
        """
        Mark conversations as archived/processed for deletion.

        Args:
            conversation_ids: List of conversation IDs to archive
            archive_type: "soft_delete" (scheduled deletion), "hard_delete" (immediate),
                         or "compress" (future feature)
            retention_days: Days to retain before deletion (soft_delete only)

        Returns:
            Dict with archive confirmation and timestamp
        """
        payload = {
            "userId": DEFAULT_USER_ID,
            "conversationIds": conversation_ids,
            "archiveType": archive_type,
            "retentionDays": retention_days
        }

        archive_endpoint = f"{self.base_url}/api/conversations/archive"
        return await self._make_request("POST", archive_endpoint, json_data=payload)


# Formatting helpers for Markdown output
def format_ingest_result_markdown(result: Dict[str, Any]) -> str:
    """Format ingestion result as Markdown."""
    status = "✅ Success" if result.get("success") else "❌ Failed"
    
    return f"""## Knowledge Lake Ingestion Result

**Status:** {status}
**Conversation ID:** {result.get('conversation_id', 'N/A')}
**Topic:** {result.get('topic', 'N/A')}
**Entities Created:** {result.get('entities_created', 0)}
**Relationships Created:** {result.get('relationships_created', 0)}
**Timestamp:** {result.get('timestamp', 'N/A')}
"""


def format_query_result_markdown(result: Dict[str, Any]) -> str:
    """Format query results as Markdown."""
    output = ["## Knowledge Lake Query Results\n"]
    
    conversations = result.get("conversations", [])
    if conversations:
        output.append(f"### Conversations Found: {len(conversations)}\n")
        for conv in conversations[:10]:  # Limit display
            output.append(f"- **{conv.get('topic', 'Untitled')}** ({conv.get('agent', 'Unknown')} - {conv.get('date', 'No date')})")
            if conv.get('summary'):
                output.append(f"  > {conv['summary'][:200]}...")
    else:
        output.append("*No matching conversations found.*\n")
    
    entities = result.get("entities", [])
    if entities:
        output.append(f"\n### Related Entities: {len(entities)}\n")
        for entity in entities[:10]:
            output.append(f"- **{entity.get('name')}** [{entity.get('entityType')}] - {entity.get('description', 'No description')[:100]}")
    
    return "\n".join(output)


def format_stats_markdown(result: Dict[str, Any]) -> str:
    """Format statistics as Markdown."""
    output = ["## Knowledge Lake Statistics\n"]
    
    output.append(f"**Total Conversations:** {result.get('totalConversations', 0)}")
    output.append(f"**Total Entities:** {result.get('totalEntities', 0)}")
    output.append(f"**Total Relationships:** {result.get('totalRelationships', 0)}")
    
    by_agent = result.get("conversationsByAgent", {})
    if by_agent:
        output.append("\n### Conversations by Agent")
        for agent, count in by_agent.items():
            output.append(f"- {agent}: {count}")
    
    by_type = result.get("entityTypeDistribution", {})
    if by_type:
        output.append("\n### Entities by Type")
        for etype, count in by_type.items():
            output.append(f"- {etype}: {count}")
    
    return "\n".join(output)
