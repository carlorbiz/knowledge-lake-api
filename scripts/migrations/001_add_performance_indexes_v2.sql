-- Migration 001 v2: Add Performance Indexes (Skip Full-Text Search for existing data)
-- Purpose: Dramatically improve search performance
-- Date: 2025-01-01
-- Note: Skips FTS population due to 1.8MB conversation exceeding PostgreSQL 1MB tsvector limit

-- ==============================================================================
-- PART 1: ADD COLUMN (but don't populate it yet)
-- ==============================================================================

-- Add tsvector column for full-text search
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS content_search tsvector;

-- ==============================================================================
-- PART 2: METADATA JSONB INDEX
-- ==============================================================================

-- Problem: Queries filtering by metadata fields are slow
-- Solution: Add GIN index on metadata JSONB column
-- Expected speedup: 5-10x for metadata queries

CREATE INDEX IF NOT EXISTS idx_conversations_metadata_gin
ON conversations
USING GIN(metadata jsonb_path_ops);

-- ==============================================================================
-- PART 3: AGENT FILTER INDEX
-- ==============================================================================

-- Problem: Existing index is (user_id, agent) but many queries filter by agent alone
-- Solution: Add standalone B-tree index on agent column
-- Expected speedup: 2-5x for agent-filtered queries

CREATE INDEX IF NOT EXISTS idx_conversations_agent
ON conversations(agent);

-- ==============================================================================
-- PART 4: COMPOSITE INDEX FOR COMMON QUERY PATTERN
-- ==============================================================================

-- Problem: Common query pattern is: WHERE user_id = X AND archived_at IS NULL ORDER BY date DESC
-- Solution: Add composite index optimized for this pattern
-- Expected speedup: 3-7x for unarchived conversation queries

CREATE INDEX IF NOT EXISTS idx_conversations_active_by_date
ON conversations(user_id, archived_at, date DESC)
WHERE archived_at IS NULL;

-- ==============================================================================
-- PART 5: TOPIC PREFIX SEARCH INDEX
-- ==============================================================================

-- Problem: Topic searches often use prefix matching
-- Solution: Add text_pattern_ops index for LIKE 'prefix%' queries
-- Expected speedup: 5-10x for topic prefix searches

CREATE INDEX IF NOT EXISTS idx_conversations_topic_prefix
ON conversations(topic text_pattern_ops);

-- ==============================================================================
-- PART 6: FTS TRIGGER (for NEW conversations only)
-- ==============================================================================

-- Create trigger function to auto-populate content_search for NEW conversations
-- This will work for future conversations (which are smaller)
CREATE OR REPLACE FUNCTION update_conversations_search()
RETURNS TRIGGER AS $$
BEGIN
    -- Only index if combined length is under 1MB (PostgreSQL tsvector limit)
    IF LENGTH(COALESCE(NEW.topic, '') || ' ' || COALESCE(NEW.content, '')) < 1000000 THEN
        NEW.content_search = to_tsvector('english', COALESCE(NEW.topic, '') || ' ' || COALESCE(NEW.content, ''));
    ELSE
        -- For large conversations, index only topic + first 500KB of content
        NEW.content_search = to_tsvector('english', COALESCE(NEW.topic, '') || ' ' || LEFT(COALESCE(NEW.content, ''), 500000));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversations_search ON conversations;
CREATE TRIGGER trigger_update_conversations_search
BEFORE INSERT OR UPDATE OF topic, content ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_conversations_search();

-- ==============================================================================
-- PART 7: POPULATE FTS FOR SMALL CONVERSATIONS (optional, commented out)
-- ==============================================================================

-- Uncomment this to populate FTS for conversations under 1MB
-- This will take a few minutes for 2,450 conversations

-- UPDATE conversations
-- SET content_search = to_tsvector('english', COALESCE(topic, '') || ' ' || COALESCE(content, ''))
-- WHERE LENGTH(COALESCE(topic, '') || ' ' || COALESCE(content, '')) < 1000000
--   AND content_search IS NULL;

-- For large conversations, index topic + first 500KB only
-- UPDATE conversations
-- SET content_search = to_tsvector('english', COALESCE(topic, '') || ' ' || LEFT(COALESCE(content, ''), 500000))
-- WHERE LENGTH(COALESCE(topic, '') || ' ' || COALESCE(content, '')) >= 1000000
--   AND content_search IS NULL;

-- ==============================================================================
-- SUMMARY
-- ==============================================================================

-- ✓ Metadata GIN index - 5-10x speedup
-- ✓ Agent B-tree index - 2-5x speedup
-- ✓ Active conversations composite index - 3-7x speedup
-- ✓ Topic prefix index - 5-10x speedup
-- ⏳ Full-text search - Infrastructure ready, population deferred
--
-- Expected overall speedup: 5-15x for most queries
-- Full-text search will work for NEW conversations automatically
-- Existing conversations can be indexed later if needed
