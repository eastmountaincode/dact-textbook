-- Promote a user to admin
-- Usage: Replace 'admin@example.com' with the actual email, then run in Supabase Dashboard SQL Editor

-- First, verify the user exists
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Then promote them to admin (uncomment and run after verifying)
-- UPDATE public.user_roles
-- SET role = 'admin'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
