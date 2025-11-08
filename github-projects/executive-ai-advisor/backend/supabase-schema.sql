-- Executive AI Advisor Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from WordPress via JWT)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wordpress_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, premium, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
    currency_preference VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    sources JSONB, -- Array of {title, uri}
    suggested_prompts JSONB, -- Array of strings
    model_used VARCHAR(100), -- gemini-2.5-pro, gemini-2.5-flash, etc.
    tokens_used INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics/usage tracking table
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- message_sent, voice_used, search_used, etc.
    event_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User context summary (for personalization)
CREATE TABLE user_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_description TEXT,
    priorities TEXT,
    interests JSONB, -- Array of topics
    pain_points JSONB, -- Array of frustrations
    ai_experience_level VARCHAR(50), -- beginner, intermediate, advanced
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_created_at ON usage_analytics(created_at DESC);
CREATE INDEX idx_users_wordpress_id ON users(wordpress_user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = wordpress_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = wordpress_user_id);

-- Users can only access their own chat sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

CREATE POLICY "Users can create own sessions" ON chat_sessions
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

CREATE POLICY "Users can update own sessions" ON chat_sessions
    FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

CREATE POLICY "Users can delete own sessions" ON chat_sessions
    FOR DELETE USING (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

-- Users can only access messages in their own sessions
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (session_id IN (
        SELECT id FROM chat_sessions WHERE user_id IN (
            SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can create own messages" ON messages
    FOR INSERT WITH CHECK (session_id IN (
        SELECT id FROM chat_sessions WHERE user_id IN (
            SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text
        )
    ));

-- Users can only access their own analytics
CREATE POLICY "Users can view own analytics" ON usage_analytics
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

CREATE POLICY "Users can create own analytics" ON usage_analytics
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

-- Users can only access their own context
CREATE POLICY "Users can view own context" ON user_context
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

CREATE POLICY "Users can update own context" ON user_context
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE wordpress_user_id = auth.uid()::text));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update user last_active_at
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active_at = NOW() WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active_at on new messages
CREATE TRIGGER update_user_activity_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Admin view for monitoring (only accessible via service key)
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT
    u.id,
    u.email,
    u.name,
    u.subscription_tier,
    u.created_at,
    u.last_active_at,
    COUNT(DISTINCT cs.id) as total_sessions,
    COUNT(DISTINCT m.id) as total_messages,
    SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages,
    SUM(COALESCE(m.tokens_used, 0)) as total_tokens_used
FROM users u
LEFT JOIN chat_sessions cs ON cs.user_id = u.id
LEFT JOIN messages m ON m.session_id = cs.id
GROUP BY u.id, u.email, u.name, u.subscription_tier, u.created_at, u.last_active_at;
