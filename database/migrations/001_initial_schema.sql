-- Migration: Initial Schema Setup
-- Date: 2025-01-XX
-- Description: Create all tables, indexes, and views for PromptWARS

\i ../schema.sql

-- Insert default LLM config
INSERT INTO llm_config (config_key) VALUES ('default')
ON CONFLICT (config_key) DO NOTHING;

-- Insert default topics for topic_progress
-- These will be auto-created when users complete challenges