-- Add statistics_use column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS statistics_use TEXT;
