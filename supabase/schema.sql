-- =====================================================
-- FitLife Health Tracker - MVP Database Schema
-- OPTIMIZED: Removed conversations table (5 tables)
-- Per MVP Requirements (500 Users) document
-- =====================================================

-- 1. Profiles
-- Stores user profile and daily goal
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  daily_goal INTEGER DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Step Records
-- Stores daily step counts (synced every 4 hours)
CREATE TABLE IF NOT EXISTS step_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. Messages (OPTIMIZED: Direct link to user, no conversations table)
-- Stores chat messages directly linked to user
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Summaries
-- AI-generated persistent memory (~500 words)
-- Per MVP: "Summary: Persistent memory of user's preferences, facts, and patterns"
CREATE TABLE IF NOT EXISTS user_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  summary TEXT NOT NULL,           -- ~500 words, preferences, patterns, achievements
  facts JSONB DEFAULT '{}',        -- Extracted important facts (structured)
  last_message_id UUID REFERENCES messages(id),  -- Last message included in summary
  messages_summarized INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Push Tokens
-- Stores device push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Step records: Query by user and date
CREATE INDEX IF NOT EXISTS idx_steps_user_date ON step_records(user_id, date DESC);

-- Messages: Query by user and time (OPTIMIZED: direct user lookup)
CREATE INDEX IF NOT EXISTS idx_messages_user_time ON messages(user_id, created_at DESC);

-- User summaries: Quick lookup by user
CREATE INDEX IF NOT EXISTS idx_summaries_user ON user_summaries(user_id);

-- Push tokens: Fast lookup by user
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);

-- =====================================================
-- Row Level Security (RLS) Policies
-- Per MVP: "Users can only access their own data"
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Step Records: Users can only access their own step records
CREATE POLICY "Users can view own step records" 
  ON step_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step records" 
  ON step_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own step records" 
  ON step_records FOR UPDATE 
  USING (auth.uid() = user_id);

-- Messages: Users can only access their own messages (OPTIMIZED: direct check)
CREATE POLICY "Users can view own messages" 
  ON messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- User Summaries: Users can only access their own summary
CREATE POLICY "Users can view own summary" 
  ON user_summaries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summary" 
  ON user_summaries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summary" 
  ON user_summaries FOR UPDATE 
  USING (auth.uid() = user_id);

-- Service role can manage summaries (for Edge Functions)
CREATE POLICY "Service role can manage summaries" 
  ON user_summaries FOR ALL 
  USING (auth.role() = 'service_role');

-- Push Tokens: Users can only access their own tokens
CREATE POLICY "Users can view own push tokens" 
  ON push_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens" 
  ON push_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens" 
  ON push_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for user_summaries updated_at
CREATE TRIGGER summaries_updated_at
  BEFORE UPDATE ON user_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, daily_goal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    10000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Schema Summary (5 tables, OPTIMIZED)
-- =====================================================
-- 
-- Tables:
-- 1. profiles      - User settings, daily goal (1 per user)
-- 2. step_records  - Backup of device step data (~365/year)
-- 3. messages      - Chat history (direct to user, no conversations)
-- 4. user_summaries - AI-generated persistent memory (1 per user)
-- 5. push_tokens   - Device notification tokens (1-3 per user)
--
-- Key Optimization:
-- - Removed conversations table (was 6 tables, now 5)
-- - Messages link directly to user_id (no joins needed)
-- - RLS policies are simpler (direct auth.uid() = user_id check)
--
-- JWT Configuration (per MVP doc):
-- - Access Token Expiry: 86400 seconds (24 hours)
-- - Refresh Token Expiry: 30 days
--
-- Go to Supabase Dashboard > Settings > Authentication to configure.
--
-- Edge Functions needed:
-- 1. ai-coach - Handles AI chat with GPT-3.5
-- 2. update-user-summary - Updates user summary after session
--
