-- Rename 'status' column to 'role' in user_profiles table
-- This better reflects that it represents the user's role (student, educator, researcher, etc.)

ALTER TABLE user_profiles RENAME COLUMN status TO role;
