-- Clean approach: just ensure RLS policies are correct
-- No views needed - application will select only safe columns

-- Verify that the current policies are restrictive enough
-- The policies already created ensure only active clients are visible