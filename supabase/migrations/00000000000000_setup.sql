-- ============================================
-- Database Setup for Data Analytics Textbook
-- ============================================
-- This is the complete schema setup.
-- Reset with: supabase db reset
-- ============================================

-- ============================================
-- CHAPTERS
-- ============================================
CREATE TABLE chapters (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  chapter_order INTEGER,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROFILES
-- Linked to Clerk user IDs (TEXT, not UUID)
-- ============================================
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  country TEXT,
  education_level TEXT,
  field_of_study TEXT,
  institution_type TEXT,
  statistics_use TEXT,
  referral_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER ROLES (for admin access)
-- ============================================
CREATE TABLE user_roles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student'
);

-- ============================================
-- LOGINS (for tracking user activity)
-- ============================================
CREATE TABLE logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- READING TIME (cumulative per chapter)
-- ============================================
CREATE TABLE reading_time_per_chapter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  seconds_spent INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- ============================================
-- READING TIME DAILY (for date-range analytics)
-- ============================================
CREATE TABLE reading_time_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  seconds_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id, date)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_reading_time_user_id ON reading_time_per_chapter(user_id);
CREATE INDEX idx_logins_user_id ON logins(user_id);
CREATE INDEX idx_reading_time_daily_date ON reading_time_daily(date);
CREATE INDEX idx_reading_time_daily_user_date ON reading_time_daily(user_id, date);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for reading_time_daily
CREATE TRIGGER update_reading_time_daily_updated_at
  BEFORE UPDATE ON reading_time_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
