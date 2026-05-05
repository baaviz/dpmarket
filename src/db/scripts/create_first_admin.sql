-- ============================================================================
-- First Admin Creation Script
-- ============================================================================
-- Run this MANUALLY in the Supabase SQL Editor AFTER creating a user
-- via the Supabase dashboard (Authentication > Users > Add User).
--
-- Step 1: Go to Supabase Dashboard > Authentication > Users > Add User
--         Use email/password. Note the user ID (UUID).
-- Step 2: Replace 'YOUR_USER_UUID_HERE' below with the actual UUID.
-- Step 3: Run this SQL in the SQL Editor.
-- ============================================================================

INSERT INTO admin_profiles (id, role, full_name, is_active)
VALUES (
  'YOUR_USER_UUID_HERE'::UUID,  -- Replace with actual auth.users UUID
  'owner',                       -- First admin gets owner role
  'Admin',                       -- Display name
  TRUE
);

-- Verify the admin was created:
-- SELECT * FROM admin_profiles WHERE role = 'owner';
