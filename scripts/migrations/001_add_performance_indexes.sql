-- Migration 001: Add Performance Indexes for Knowledge Lake
-- Purpose: Dramatically improve search performance and reduce Manus MCP timeouts
-- Date: 2025-01-01
-- Expected Impact: 10-50x faster queries on large conversation datasets

-- ==============================================================================
-- ANALYZE CURRENT STATE
-- ==============================================================================

-- Check current index usage
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename = 'conversations'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ==============================================================================
-- PART 1: FULL-TEXT SEARCH INDEX
-- ==============================================================================

-- Problem: LIKE queries on content column cause full table scans
-- Solution: Add GIN index for PostgreSQL full-text search
-- Expected speedup: 10-50x for content searches

-- Add tsvector column for full-text search
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS content_search tsvector;

-- Populate the search column
UPDATE conversations
SET content_search = to_tsvector('english', COALESCE(topic, '') || ' ' || COALESCE(content, ''));

-- Create GIN index on the tsvector column
CREATE INDEX IF NOT EXISTS idx_conversations_content_fts
ON conversations
USING GIN(content_search);

-- Create trigger to keep content_search updated
CREATE OR REPLACE FUNCTION update_conversations_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_search = to_tsvector('english', COALESCE(NEW.topic, '') || ' ' || COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversations_search ON conversations;
CREATE TRIGGER trigger_update_conversations_search
BEFORE INSERT OR UPDATE OF topic, content ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_conversations_search();

-- ==============================================================================
-- PART 2: METADATA JSONB INDEX
-- ==============================================================================

-- Problem: Queries filtering by metadata fields (businessArea, keyTopics, etc.) are slow
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

-- This is a partial index (only on unarchived conversations)
-- Much smaller than full index, faster queries

-- ==============================================================================
-- PART 5: TOPIC PREFIX SEARCH INDEX
-- ==============================================================================

-- Problem: Topic searches often use prefix matching ("Blog post about...")
-- Solution: Add text_pattern_ops index for LIKE 'prefix%' queries
-- Expected speedup: 5-10x for topic prefix searches

CREATE INDEX IF NOT EXISTS idx_conversations_topic_prefix
ON conversations(topic text_pattern_ops);

-- ==============================================================================
-- VERIFY INDEXES CREATED
-- ==============================================================================

-- List all indexes on conversations table
SELECT
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
JOIN pg_stat_user_indexes USING(indexname)
WHERE tablename = 'conversations'
ORDER BY indexname;

-- ==============================================================================
-- USAGE EXAMPLES
-- ==============================================================================

-- Example 1: Full-text search (NEW - much faster than LIKE)
-- Old way (slow): WHERE LOWER(content) LIKE '%knowledge lake%'
-- New way (fast):
SELECT id, topic, date, agent
FROM conversations
WHERE content_search @@ to_tsquery('english', 'knowledge & lake')
LIMIT 20;

-- Example 2: Metadata query (now indexed)
-- Find all conversations in specific business area
SELECT id, topic, date
FROM conversations
WHERE metadata @> '{"businessArea": "AAE Development"}'::jsonb
LIMIT 20;

-- Example 3: Active conversations by date (uses new composite index)
SELECT id, topic, date, agent
FROM conversations
WHERE user_id = 1
  AND archived_at IS NULL
ORDER BY date DESC
LIMIT 50;

-- ==============================================================================
-- PERFORMANCE MONITORING
-- ==============================================================================

-- Check index usage statistics (run after deployment)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename = 'conversations'
ORDER BY idx_scan DESC;

-- Check for unused indexes (run after 1 week)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename = 'conversations'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ==============================================================================
-- ROLLBACK (if needed)
-- ==============================================================================

-- DROP INDEX IF EXISTS idx_conversations_content_fts;
-- DROP INDEX IF EXISTS idx_conversations_metadata_gin;
-- DROP INDEX IF EXISTS idx_conversations_agent;
-- DROP INDEX IF EXISTS idx_conversations_active_by_date;
-- DROP INDEX IF EXISTS idx_conversations_topic_prefix;
-- DROP TRIGGER IF EXISTS trigger_update_conversations_search ON conversations;
-- DROP FUNCTION IF EXISTS update_conversations_search();
-- ALTER TABLE conversations DROP COLUMN IF EXISTS content_search;
