-- Promote a user to admin
-- Usage: Run in Supabase Dashboard SQL Editor

-- Step 1: Find the user's Clerk ID by looking at user_profiles
SELECT id, first_name, last_name, role, country FROM user_profiles;

-- Step 2: Once you have the Clerk user ID (starts with 'user_'), promote them to admin
-- Replace 'user_xxx' with the actual Clerk user ID from Step 1 or from Clerk Dashboard
-- UPDATE user_roles SET role = 'admin' WHERE user_id = 'user_xxx';

-- Alternative: If user doesn't have a user_roles entry yet, insert one
-- INSERT INTO user_roles (user_id, role) VALUES ('user_xxx', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
