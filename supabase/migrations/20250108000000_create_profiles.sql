-- Chapters (ID assigned in frontmatter)
CREATE TABLE chapters (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (linked to Clerk user IDs - TEXT not UUID)
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

-- Reading time per chapter
CREATE TABLE reading_time_per_chapter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  seconds_spent INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Logins
CREATE TABLE logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (for admin access)
CREATE TABLE user_roles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student'
);

-- Create indexes for user_id lookups
CREATE INDEX idx_reading_time_user_id ON reading_time_per_chapter(user_id);
CREATE INDEX idx_logins_user_id ON logins(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
