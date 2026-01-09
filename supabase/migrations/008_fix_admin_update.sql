-- Drop old restrictive policy
DROP POLICY IF EXISTS "Admins can update assigned complaints" ON complaints;

-- Allow authenticated users to update complaints (role enforcement in app layer)
CREATE POLICY "Authenticated users can update complaints" ON complaints
  FOR UPDATE USING (auth.uid() IS NOT NULL);
