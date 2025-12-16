-- Promote User to Admin
-- This script sets the 'role' claim in the user's app_metadata to 'admin'.
-- Replace 'michele.carmagnani@gmail.com' with the exact email address.

-- 1. Update auth.users metadata
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'michele.carmagnani@gmail.com';

-- 2. (Optional) If you have a public.users table with a role column, update it too
-- Uncomment the following lines if you have a public.users table:
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE email = 'michele.carmagnani@gmail.com';

-- 3. Verify the change
SELECT id, email, raw_app_meta_data 
FROM auth.users 
WHERE email = 'michele.carmagnani@gmail.com';
