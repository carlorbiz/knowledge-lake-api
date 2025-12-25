#!/usr/bin/env python3
"""
Knowledge Lake API Client for Manus MCP Server

Provides integration with Knowledge Lake API for conversation management
and multi-pass extraction workflow.
"""

import logging
from typing import List, Dict, Optional
import requests

logger = logging.getLogger(__name__)

# Knowledge Lake API configuration
KNOWLEDGE_LAKE_API = "https://knowledge-lake-api-production.up.railway.app"


class KnowledgeLakeClient:
    """Client for interacting with Knowledge Lake API"""

    def __init__(self, api_url: str = KNOWLEDGE_LAKE_API):
        self.api_url = api_url
        self.timeout = 30

    def health_check(self) -> bool:
        """Check if Knowledge Lake API is healthy"""
        try:
            response = requests.get(
                f"{self.api_url}/health",
                timeout=self.timeout
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False

    def query_conversations(
        self,
        query: str = "",
        limit: int = 10,
        user_id: int = 1
    ) -> List[Dict]:
        """Query conversations from Knowledge Lake

        Args:
            query: Search query (empty string returns all)
            limit: Maximum number of results (default: 10)
            user_id: User ID for filtering (default: 1)

        Returns:
            List of conversation dictionaries
        """
        try:
            response = requests.post(
                f"{self.api_url}/api/conversations/search",
                json={
                    "userId": user_id,
                    "query": query,
                    "limit": limit
                },
                timeout=self.timeout
            )
            response.raise_for_status()

            data = response.json()
            conversations = data.get('results', [])

            logger.info(f"Retrieved {len(conversations)} conversations from Knowledge Lake")
            return conversations

        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying Knowledge Lake: {e}")
            return []

    def get_complex_conversations(
        self,
        only_pending: bool = True,
        limit: int = 100
    ) -> List[Dict]:
        """Get complex conversations requiring multi-pass extraction

        Args:
            only_pending: If True, only return conversations not yet extracted
            limit: Maximum number of results

        Returns:
            List of complex conversation dictionaries
        """
        conversations = self.query_conversations(query="", limit=limit)

        # Filter for complex conversations
        complex_convs = [
            conv for conv in conversations
            if conv.get('complexity_classification') == 'complex'
            and conv.get('requires_multipass') is True
        ]

        # Optionally filter for pending only
        if only_pending:
            complex_convs = [
                conv for conv in complex_convs
                if conv.get('multipass_extracted') is not True
            ]

        logger.info(f"Found {len(complex_convs)} complex conversations (pending: {only_pending})")
        return complex_convs

    def get_conversation(self, conversation_id: int) -> Optional[Dict]:
        """Get a specific conversation by ID

        Args:
            conversation_id: The Knowledge Lake conversation ID

        Returns:
            Conversation dictionary or None if not found
        """
        conversations = self.query_conversations(query="", limit=200)

        for conv in conversations:
            if conv.get('id') == conversation_id:
                return conv

        logger.warning(f"Conversation {conversation_id} not found")
        return None

    def update_conversation_extracted(
        self,
        conversation_id: int,
        extraction_results: Dict
    ) -> bool:
        """Update conversation after multi-pass extraction

        Args:
            conversation_id: The Knowledge Lake conversation ID
            extraction_results: Dictionary with thread_count, connection_count, etc.

        Returns:
            True if update successful, False otherwise

        Note:
            This endpoint may need to be added to Knowledge Lake API
        """
        try:
            # This endpoint doesn't exist yet in Knowledge Lake API
            # This is a placeholder for future implementation
            response = requests.patch(
                f"{self.api_url}/api/conversations/{conversation_id}",
                json={
                    "multipass_extracted": True,
                    "extraction_metadata": extraction_results
                },
                timeout=self.timeout
            )
            response.raise_for_status()

            logger.info(f"Updated conversation {conversation_id} as extracted")
            return True

        except requests.exceptions.RequestException as e:
            logger.error(f"Error updating conversation {conversation_id}: {e}")
            logger.info("This endpoint may not be implemented yet in Knowledge Lake API")
            return False

    def get_stats(self) -> Optional[Dict]:
        """Get Knowledge Lake statistics

        Returns:
            Stats dictionary with total conversations, entities, etc.
        """
        try:
            response = requests.get(
                f"{self.api_url}/api/stats",
                timeout=self.timeout
            )
            response.raise_for_status()

            stats = response.json()
            logger.info(f"Knowledge Lake stats: {stats.get('total_conversations', 0)} conversations")
            return stats

        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting stats: {e}")
            return None


# Singleton instance
_client_instance = None


def get_knowledge_lake_client() -> KnowledgeLakeClient:
    """Get or create Knowledge Lake client singleton"""
    global _client_instance
    if _client_instance is None:
        _client_instance = KnowledgeLakeClient()
    return _client_instance
