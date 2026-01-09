-- Create function to allow users to delete their own account
-- This function runs with elevated privileges (SECURITY DEFINER) to delete from auth.users

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user's profile (should cascade, but being explicit)
  DELETE FROM public.user_profiles WHERE id = current_user_id;

  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
