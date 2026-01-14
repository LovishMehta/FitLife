-- FatToFit AI Health Buddy - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  age INT,
  height_cm FLOAT,
  current_weight_kg FLOAT,
  gender VARCHAR(20),
  fitness_experience VARCHAR(20) CHECK (fitness_experience IN ('beginner', 'intermediate', 'advanced')),
  goal_weight_kg FLOAT,
  target_timeline_weeks INT,
  primary_goal VARCHAR(50) CHECK (primary_goal IN ('weight_loss', 'muscle_gain', 'endurance', 'general_health')),
  dietary_restrictions TEXT[] DEFAULT '{}',
  food_preferences TEXT[] DEFAULT '{}',
  equipment_available TEXT[] DEFAULT '{}',
  workout_frequency_per_week INT DEFAULT 3,
  available_workout_minutes INT DEFAULT 45,
  injuries_limitations TEXT,
  sleep_hours_target FLOAT DEFAULT 8,
  water_intake_target_ml INT DEFAULT 2500,
  daily_calorie_target INT,
  protein_target_g FLOAT,
  carbs_target_g FLOAT,
  fat_target_g FLOAT,
  onboarding_completed BOOLEAN DEFAULT false,
  openai_api_key_encrypted TEXT,
  notification_morning BOOLEAN DEFAULT true,
  notification_evening BOOLEAN DEFAULT true,
  notification_workout_reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH METRICS (Time-series data)
-- ============================================
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
    'steps', 'heart_rate', 'calories_burned', 'active_energy',
    'sleep_duration', 'sleep_quality', 'distance_km', 'flights_climbed',
    'resting_heart_rate', 'heart_rate_variability', 'blood_oxygen',
    'weight', 'body_fat_percentage', 'water_intake'
  )),
  value FLOAT NOT NULL,
  unit VARCHAR(20),
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('healthkit', 'manual', 'watch', 'device')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient time-series queries
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_time 
  ON health_metrics(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type_time 
  ON health_metrics(user_id, metric_type, recorded_at DESC);

-- ============================================
-- MEALS
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_time TIME,
  meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name VARCHAR(255) NOT NULL,
  description TEXT,
  calories INT NOT NULL DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fat_g FLOAT DEFAULT 0,
  fiber_g FLOAT DEFAULT 0,
  sugar_g FLOAT DEFAULT 0,
  sodium_mg FLOAT DEFAULT 0,
  serving_size VARCHAR(100),
  servings FLOAT DEFAULT 1,
  photo_url VARCHAR(500),
  barcode VARCHAR(50),
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'barcode', 'photo_estimate', 'template')),
  is_favorite BOOLEAN DEFAULT false,
  ai_confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date DESC);

-- ============================================
-- MEAL TEMPLATES (Saved/Favorite meals for quick logging)
-- ============================================
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(20),
  calories INT NOT NULL DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fat_g FLOAT DEFAULT 0,
  serving_size VARCHAR(100),
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKOUT PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  plan_name VARCHAR(255),
  plan_json JSONB NOT NULL,
  goal_focus VARCHAR(50) CHECK (goal_focus IN ('strength', 'hypertrophy', 'endurance', 'weight_loss', 'flexibility', 'general')),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  generated_by VARCHAR(20) DEFAULT 'ai' CHECK (generated_by IN ('ai', 'manual', 'template')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user_active 
  ON workout_plans(user_id, is_active, week_start_date DESC);

-- ============================================
-- WORKOUT LOGS (Completed workouts)
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  workout_date DATE NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  workout_name VARCHAR(255),
  duration_minutes INT,
  exercises JSONB DEFAULT '[]',
  calories_burned INT,
  avg_heart_rate INT,
  max_heart_rate INT,
  perceived_difficulty VARCHAR(20) CHECK (perceived_difficulty IN ('easy', 'moderate', 'hard', 'very_hard')),
  perceived_effort INT CHECK (perceived_effort BETWEEN 1 AND 10),
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  mood_before VARCHAR(20),
  mood_after VARCHAR(20),
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'healthkit', 'watch')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date DESC);

-- ============================================
-- EXERCISE LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'plyometric')),
  muscle_groups TEXT[] DEFAULT '{}',
  equipment_required TEXT[] DEFAULT '{}',
  difficulty_level VARCHAR(20),
  instructions TEXT,
  video_url VARCHAR(500),
  calories_per_minute FLOAT,
  is_compound BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  context_snapshot JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  model_used VARCHAR(50),
  response_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_time 
  ON chat_messages(user_id, created_at DESC);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id, achieved_at DESC);

-- ============================================
-- DAILY SUMMARIES (Pre-computed for performance)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_steps INT DEFAULT 0,
  total_calories_burned INT DEFAULT 0,
  total_calories_consumed INT DEFAULT 0,
  total_protein_g FLOAT DEFAULT 0,
  total_carbs_g FLOAT DEFAULT 0,
  total_fat_g FLOAT DEFAULT 0,
  total_water_ml INT DEFAULT 0,
  workout_completed BOOLEAN DEFAULT false,
  workout_duration_minutes INT DEFAULT 0,
  sleep_duration_hours FLOAT,
  sleep_quality_score FLOAT,
  avg_heart_rate INT,
  weight_kg FLOAT,
  coach_messages_count INT DEFAULT 0,
  goals_met JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date 
  ON daily_summaries(user_id, summary_date DESC);

-- ============================================
-- WEIGHT HISTORY (For tracking progress)
-- ============================================
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  weight_kg FLOAT NOT NULL,
  body_fat_percentage FLOAT,
  muscle_mass_kg FLOAT,
  notes TEXT,
  source VARCHAR(20) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_history_user_time 
  ON weight_history(user_id, recorded_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Health Metrics: Users can only access their own metrics
CREATE POLICY "Users can view own health metrics" ON health_metrics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health metrics" ON health_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health metrics" ON health_metrics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health metrics" ON health_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Meals: Users can only access their own meals
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

-- Meal Templates: Users can only access their own templates
CREATE POLICY "Users can view own meal templates" ON meal_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal templates" ON meal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal templates" ON meal_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal templates" ON meal_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Plans: Users can only access their own plans
CREATE POLICY "Users can view own workout plans" ON workout_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans" ON workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans" ON workout_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout plans" ON workout_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Workouts: Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages: Users can only access their own messages
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Users can only access their own achievements
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Summaries: Users can only access their own summaries
CREATE POLICY "Users can view own daily summaries" ON daily_summaries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily summaries" ON daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily summaries" ON daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Weight History: Users can only access their own weight history
CREATE POLICY "Users can view own weight history" ON weight_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight history" ON weight_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight history" ON weight_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight history" ON weight_history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for daily_summaries
CREATE TRIGGER update_daily_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


