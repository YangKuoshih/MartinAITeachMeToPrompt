-- PromptWARS PostgreSQL Schema
-- Converted from DynamoDB single-table design

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    password_change_required BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_expires TIMESTAMP,
    reset_code VARCHAR(10),
    reset_expires TIMESTAMP,
    groups TEXT[] DEFAULT ARRAY['users'],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    quest_levels_completed INTEGER DEFAULT 0,
    completed_quests TEXT[] DEFAULT ARRAY[]::TEXT[],
    scores INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Topic progress table
CREATE TABLE topic_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,
    completed INTEGER DEFAULT 0,
    total INTEGER DEFAULT 8,
    completed_challenges TEXT[] DEFAULT ARRAY[]::TEXT[],
    difficulty_beginner INTEGER DEFAULT 0,
    difficulty_intermediate INTEGER DEFAULT 0,
    difficulty_advanced INTEGER DEFAULT 0,
    difficulty_expert INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic)
);

-- Badges table
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id VARCHAR(100) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(10),
    badge_description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    challenge_id VARCHAR(100),
    topic VARCHAR(100),
    difficulty VARCHAR(50),
    points INTEGER,
    success BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    challenge_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scenario TEXT,
    objective TEXT,
    constraints TEXT[],
    hints TEXT[],
    difficulty VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    topic VARCHAR(100),
    points INTEGER DEFAULT 100,
    estimated_time VARCHAR(50),
    tags TEXT[],
    created_by VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests table
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    quest_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    type VARCHAR(50),
    total_levels INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest levels table
CREATE TABLE quest_levels (
    id SERIAL PRIMARY KEY,
    quest_id VARCHAR(100) REFERENCES quests(quest_id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    story TEXT,
    objective TEXT,
    difficulty VARCHAR(50),
    hints TEXT[],
    hidden_answer TEXT,
    success_feedback TEXT,
    failure_feedback TEXT,
    points INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quest_id, level_number)
);

-- Quest progress table
CREATE TABLE quest_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(user_id) ON DELETE CASCADE,
    quest_id VARCHAR(100) REFERENCES quests(quest_id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1,
    completed_levels INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    level_responses JSONB DEFAULT '{}'::JSONB,
    points_earned INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quest_id)
);

-- LLM config table
CREATE TABLE llm_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    playground_temperature DECIMAL(3,2) DEFAULT 0.7,
    playground_top_k INTEGER DEFAULT 40,
    playground_top_p DECIMAL(3,2) DEFAULT 0.9,
    playground_max_tokens INTEGER DEFAULT 1000,
    generation_temperature DECIMAL(3,2) DEFAULT 0.8,
    generation_top_k INTEGER DEFAULT 50,
    generation_top_p DECIMAL(3,2) DEFAULT 0.95,
    generation_max_tokens INTEGER DEFAULT 2000,
    evaluation_temperature DECIMAL(3,2) DEFAULT 0.3,
    evaluation_top_k INTEGER DEFAULT 20,
    evaluation_top_p DECIMAL(3,2) DEFAULT 0.8,
    evaluation_max_tokens INTEGER DEFAULT 500,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_points ON user_progress(points DESC);
CREATE INDEX idx_topic_progress_user_id ON topic_progress(user_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_quest_progress_user_id ON quest_progress(user_id);
CREATE INDEX idx_quest_levels_quest_id ON quest_levels(quest_id);

-- Leaderboard view (optimized for queries)
CREATE VIEW leaderboard AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    up.points,
    up.level,
    up.streak,
    up.challenges_completed,
    up.quests_completed,
    RANK() OVER (ORDER BY up.points DESC) as rank
FROM users u
JOIN user_progress up ON u.user_id = up.user_id
ORDER BY up.points DESC;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topic_progress_updated_at BEFORE UPDATE ON topic_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quest_progress_updated_at BEFORE UPDATE ON quest_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();