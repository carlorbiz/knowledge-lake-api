"""
Knowledge Lake Database Layer
Handles PostgreSQL persistence for conversations, entities, and relationships

Supports: Supabase, Railway PostgreSQL, any PostgreSQL database
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from contextlib import contextmanager

logger = logging.getLogger('database')


class Database:
    """PostgreSQL database connection and operations."""

    def __init__(self, database_url: Optional[str] = None):
        """
        Initialize database connection.

        Args:
            database_url: PostgreSQL connection string (postgres://user:pass@host:port/db)
                         Falls back to DATABASE_URL environment variable
        """
        self.database_url = database_url or os.getenv('DATABASE_URL')

        if not self.database_url:
            raise ValueError(
                "DATABASE_URL is required. Set it in .env or Railway environment variables.\n"
                "Format: postgres://user:password@host:port/database"
            )

        self._test_connection()
        logger.info("✅ Database connection established")

    def _test_connection(self):
        """Test database connection on initialization."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise

    def ensure_schema(self):
        """Create database schema if it doesn't exist."""
        schema_sql = """
-- Users table (for multi-tenant support)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255),
    name VARCHAR(255)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    topic TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_for_learning BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    archived_at TIMESTAMP,
    archive_type VARCHAR(50),
    delete_after TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_agent ON conversations(user_id, agent);
CREATE INDEX IF NOT EXISTS idx_date ON conversations(date);
CREATE INDEX IF NOT EXISTS idx_processed ON conversations(processed_for_learning);
CREATE INDEX IF NOT EXISTS idx_archived ON conversations(archived_at);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    confidence DECIMAL(3,2),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversation ON entities(conversation_id);
CREATE INDEX IF NOT EXISTS idx_entity_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_name ON entities(name);

-- Relationships table
CREATE TABLE IF NOT EXISTS relationships (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    from_entity VARCHAR(255) NOT NULL,
    to_entity VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    confidence DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversation_rel ON relationships(conversation_id);
CREATE INDEX IF NOT EXISTS idx_relationship_type ON relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_from_entity ON relationships(from_entity);
CREATE INDEX IF NOT EXISTS idx_to_entity ON relationships(to_entity);

-- Insert default user (Carla)
INSERT INTO users (id, name, email)
VALUES (1, 'Carla', 'carla@aae.ai')
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to conversations table
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(schema_sql)
            logger.info("[OK] Database schema created/verified")
        except Exception as e:
            logger.error(f"[ERROR] Schema creation failed: {e}")
            raise

    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        conn = psycopg2.connect(self.database_url)
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()

    # ============= CONVERSATIONS =============

    def create_conversation(
        self,
        user_id: int,
        agent: str,
        date: str,
        topic: str,
        content: str,
        metadata: Dict = None
    ) -> int:
        """Create a new conversation and return its ID."""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO conversations (user_id, agent, date, topic, content, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (user_id, agent, date, topic, content, Json(metadata or {})))

                conversation_id = cur.fetchone()[0]
                logger.info(f"Created conversation #{conversation_id}")
                return conversation_id

    def get_conversations(
        self,
        user_id: int,
        query: str = None,
        agent_filter: str = None,
        entity_type_filter: str = None,
        limit: int = 20
    ) -> List[Dict]:
        """Query conversations with optional filters."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                sql = """
                    SELECT id, user_id, agent, date, topic, content, metadata,
                           created_at, processed_for_learning
                    FROM conversations
                    WHERE user_id = %s
                """
                params = [user_id]

                if agent_filter:
                    sql += " AND LOWER(agent) = LOWER(%s)"
                    params.append(agent_filter)

                if query:
                    sql += " AND (LOWER(topic) LIKE %s OR LOWER(content) LIKE %s)"
                    search_term = f"%{query.lower()}%"
                    params.extend([search_term, search_term])

                if entity_type_filter:
                    sql += """
                        AND id IN (
                            SELECT DISTINCT conversation_id
                            FROM entities
                            WHERE entity_type = %s
                        )
                    """
                    params.append(entity_type_filter)

                sql += " ORDER BY date DESC, created_at DESC LIMIT %s"
                params.append(limit)

                cur.execute(sql, params)
                return [dict(row) for row in cur.fetchall()]

    def search_conversations(
        self,
        user_id: int,
        query: str = None,
        agent: str = None,
        limit: int = 50
    ) -> List[Dict]:
        """
        Search conversations by text query.
        Wrapper for get_conversations() with simplified parameters for search endpoint.
        """
        return self.get_conversations(
            user_id=user_id,
            query=query,
            agent_filter=agent,
            limit=limit
        )

    def get_unprocessed_conversations(
        self,
        user_id: int,
        agent_filter: str = None,
        date_from: str = None,
        date_to: str = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get conversations not yet processed for learning extraction."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                sql = """
                    SELECT id, agent, date, topic,
                           SUBSTRING(content, 1, 200) as summary
                    FROM conversations
                    WHERE user_id = %s
                      AND (processed_for_learning = FALSE OR processed_for_learning IS NULL)
                      AND (archived_at IS NULL)
                """
                params = [user_id]

                if agent_filter:
                    sql += " AND LOWER(agent) = LOWER(%s)"
                    params.append(agent_filter)

                if date_from:
                    sql += " AND date >= %s"
                    params.append(date_from)

                if date_to:
                    sql += " AND date <= %s"
                    params.append(date_to)

                sql += " ORDER BY date ASC LIMIT %s"
                params.append(limit)

                cur.execute(sql, params)
                return [dict(row) for row in cur.fetchall()]

    def archive_conversations(
        self,
        user_id: int,
        conversation_ids: List[int],
        archive_type: str = "soft_delete",
        retention_days: int = 30
    ) -> int:
        """Archive/delete conversations after learning extraction."""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                if archive_type == "hard_delete":
                    cur.execute("""
                        UPDATE conversations
                        SET metadata = jsonb_set(
                                metadata,
                                '{deleted}',
                                'true'::jsonb
                            ),
                            metadata = jsonb_set(
                                metadata,
                                '{deleted_at}',
                                to_jsonb(CURRENT_TIMESTAMP::text)
                            ),
                            processed_for_learning = TRUE,
                            processed_at = CURRENT_TIMESTAMP
                        WHERE user_id = %s AND id = ANY(%s)
                    """, (user_id, conversation_ids))
                else:
                    cur.execute("""
                        UPDATE conversations
                        SET archived_at = CURRENT_TIMESTAMP,
                            archive_type = %s,
                            delete_after = CURRENT_TIMESTAMP + INTERVAL '%s days',
                            processed_for_learning = TRUE,
                            processed_at = CURRENT_TIMESTAMP
                        WHERE user_id = %s AND id = ANY(%s)
                    """, (archive_type, retention_days, user_id, conversation_ids))

                return cur.rowcount

    def get_stats(self, user_id: int) -> Dict[str, Any]:
        """Get statistics about conversations and entities."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Count conversations
                cur.execute("""
                    SELECT COUNT(*) as total,
                           agent,
                           COUNT(*) as count
                    FROM conversations
                    WHERE user_id = %s
                    GROUP BY agent
                """, (user_id,))

                agent_counts = {row['agent']: row['count'] for row in cur.fetchall()}
                total_conversations = sum(agent_counts.values())

                # Count entities
                cur.execute("""
                    SELECT COUNT(*) as total FROM entities
                    WHERE conversation_id IN (
                        SELECT id FROM conversations WHERE user_id = %s
                    )
                """, (user_id,))
                total_entities = cur.fetchone()['total']

                # Entity type distribution
                cur.execute("""
                    SELECT entity_type, COUNT(*) as count
                    FROM entities
                    WHERE conversation_id IN (
                        SELECT id FROM conversations WHERE user_id = %s
                    )
                    GROUP BY entity_type
                """, (user_id,))
                entity_distribution = {row['entity_type']: row['count'] for row in cur.fetchall()}

                # Count relationships
                cur.execute("""
                    SELECT COUNT(*) as total FROM relationships
                    WHERE conversation_id IN (
                        SELECT id FROM conversations WHERE user_id = %s
                    )
                """, (user_id,))
                total_relationships = cur.fetchone()['total']

                return {
                    'totalConversations': total_conversations,
                    'userConversations': total_conversations,
                    'conversationsByAgent': agent_counts,
                    'totalEntities': total_entities,
                    'userEntities': total_entities,
                    'entityTypeDistribution': entity_distribution,
                    'totalRelationships': total_relationships
                }

    # ============= ENTITIES =============

    def create_entity(
        self,
        conversation_id: int,
        name: str,
        entity_type: str,
        confidence: float = None,
        description: str = None,
        metadata: Dict = None
    ) -> int:
        """Create a new entity."""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO entities
                    (conversation_id, name, entity_type, confidence, description, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (conversation_id, name, entity_type, confidence, description, Json(metadata or {})))

                return cur.fetchone()[0]

    def get_entities_by_conversation(self, conversation_id: int) -> List[Dict]:
        """Get all entities for a conversation."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, name, entity_type, confidence, description, metadata
                    FROM entities
                    WHERE conversation_id = %s
                """, (conversation_id,))

                return [dict(row) for row in cur.fetchall()]

    # ============= RELATIONSHIPS =============

    def create_relationship(
        self,
        conversation_id: int,
        from_entity: str,
        to_entity: str,
        relationship_type: str,
        confidence: float = None,
        metadata: Dict = None
    ) -> int:
        """Create a new relationship."""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO relationships
                    (conversation_id, from_entity, to_entity, relationship_type, confidence, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (conversation_id, from_entity, to_entity, relationship_type, confidence, Json(metadata or {})))

                return cur.fetchone()[0]

    def get_relationships_by_conversation(self, conversation_id: int) -> List[Dict]:
        """Get all relationships for a conversation."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, from_entity, to_entity, relationship_type, confidence, metadata
                    FROM relationships
                    WHERE conversation_id = %s
                """, (conversation_id,))

                return [dict(row) for row in cur.fetchall()]


# Global database instance (initialized once)
db: Optional[Database] = None


def init_database(database_url: Optional[str] = None) -> Database:
    """Initialize the global database instance and ensure schema exists."""
    global db
    if db is None:
        db = Database(database_url)
        db.ensure_schema()
    return db


def get_db() -> Database:
    """Get the global database instance."""
    if db is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    return db
