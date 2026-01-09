-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Super admins can view all users" ON users;

-- Simple policy: authenticated users can view all user profiles
-- (We'll handle role-based restrictions in the application layer)
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);
