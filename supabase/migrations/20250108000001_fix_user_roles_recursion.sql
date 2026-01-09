-- Fix infinite recursion in user_roles policy
-- The "Admins can view all roles" policy queries user_roles to check admin status,
-- which triggers the same policy, causing infinite recursion.

-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Recreate with the security definer function
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Update other admin policies to use the function (optional but consistent)
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all reading time" ON reading_time_per_chapter;
CREATE POLICY "Admins can view all reading time"
  ON reading_time_per_chapter FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all logins" ON logins;
CREATE POLICY "Admins can view all logins"
  ON logins FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
CREATE POLICY "Admins can manage chapters"
  ON chapters FOR ALL
  TO authenticated
  USING (public.is_admin());
