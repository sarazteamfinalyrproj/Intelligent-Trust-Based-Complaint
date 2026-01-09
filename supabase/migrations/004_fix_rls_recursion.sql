-- Drop problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Simple, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For now, we'll handle admin access through service role key in backend
-- Trying to check role within RLS causes recursion since we need to query users table
