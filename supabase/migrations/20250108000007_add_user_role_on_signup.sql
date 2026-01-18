-- Update handle_new_user trigger to also create a default user_roles entry
-- Auto-promotes contact@thephilomath.org to admin

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);

  -- Determine role: admin for specific email, student for everyone else
  IF NEW.email = 'contact@thephilomath.org' THEN
    user_role := 'admin';
  ELSE
    user_role := 'student';
  END IF;

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: add roles for any existing users without one
-- (promotes contact@thephilomath.org to admin if they already signed up)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id,
  CASE WHEN u.email = 'contact@thephilomath.org' THEN 'admin' ELSE 'student' END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id
);

-- Also update existing role if contact@thephilomath.org is already a student
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'contact@thephilomath.org')
  AND role = 'student';
