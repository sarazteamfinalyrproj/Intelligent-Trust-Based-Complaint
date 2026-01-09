-- Allow students to view their own anonymous mappings
CREATE POLICY "Students can view their own mappings" ON anonymous_map
  FOR SELECT USING (user_id = auth.uid());
