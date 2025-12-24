-- Migration: Add conversation classification columns
-- Date: 2025-12-22
-- Purpose: Enable hybrid architecture with targeted multi-pass extraction

-- Add classification columns to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS complexity_classification VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS requires_multipass BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS multipass_status VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS multipass_assignee VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS word_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS topic_shift_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS complexity_score INT DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN conversations.complexity_classification IS 'Classification: simple | complex | manual_review | pending';
COMMENT ON COLUMN conversations.requires_multipass IS 'Whether this conversation needs multi-pass extraction';
COMMENT ON COLUMN conversations.multipass_status IS 'Multi-pass processing status: NULL | queued | in_progress | completed | skipped';
COMMENT ON COLUMN conversations.multipass_assignee IS 'Agent assigned to multi-pass: claude_gui | manus | NULL';
COMMENT ON COLUMN conversations.word_count IS 'Word count for classification algorithm';
COMMENT ON COLUMN conversations.topic_shift_count IS 'Number of topic shifts detected';
COMMENT ON COLUMN conversations.complexity_score IS 'Calculated complexity score (0-100)';

-- Create index on complexity_classification for efficient filtering
CREATE INDEX IF NOT EXISTS idx_conversations_complexity ON conversations(complexity_classification);
CREATE INDEX IF NOT EXISTS idx_conversations_multipass_status ON conversations(multipass_status);
CREATE INDEX IF NOT EXISTS idx_conversations_requires_multipass ON conversations(requires_multipass);

-- Migration verification
DO $$
BEGIN
    RAISE NOTICE 'Classification columns added successfully';
    RAISE NOTICE 'Indexes created for efficient querying';
    RAISE NOTICE 'Existing conversations default to classification=pending';
END $$;
