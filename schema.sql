-- Knowledge Lake API Database Schema
-- PostgreSQL / Supabase

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

    -- Learning Extraction Layer flags
    processed_for_learning BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    archived_at TIMESTAMP,
    archive_type VARCHAR(50),
    delete_after TIMESTAMP,

    INDEX idx_user_agent (user_id, agent),
    INDEX idx_date (date),
    INDEX idx_processed (processed_for_learning),
    INDEX idx_archived (archived_at)
);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    confidence DECIMAL(3,2),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_conversation (conversation_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_name (name)
);

-- Relationships table
CREATE TABLE IF NOT EXISTS relationships (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    from_entity VARCHAR(255) NOT NULL,
    to_entity VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    confidence DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_conversation (conversation_id),
    INDEX idx_relationship_type (relationship_type),
    INDEX idx_from_entity (from_entity),
    INDEX idx_to_entity (to_entity)
);

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
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
