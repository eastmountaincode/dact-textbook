-- This migration is no longer needed with Clerk auth
-- RLS has been removed since auth.uid() doesn't work with Clerk
-- Keeping file as placeholder to avoid migration ordering issues

SELECT 1;
