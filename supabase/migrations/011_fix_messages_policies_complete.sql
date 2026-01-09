-- Drop ALL existing message policies first
DROP POLICY IF EXISTS "Users can view messages for their complaints" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Students can view messages for their complaints" ON messages;
DROP POLICY IF EXISTS "Students can send messages for their complaints" ON messages;
DROP POLICY IF EXISTS "Admins can view messages for assigned complaints" ON messages;
DROP POLICY IF EXISTS "Admins can send messages for assigned complaints" ON messages;
DROP POLICY IF EXISTS "Super admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Super admins can send all messages" ON messages;

-- Recreate all policies
CREATE POLICY "Students can view messages for their complaints" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM anonymous_map 
      WHERE anonymous_map.complaint_id = messages.complaint_id 
      AND anonymous_map.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can send messages for their complaints" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM anonymous_map 
      WHERE anonymous_map.complaint_id = messages.complaint_id 
      AND anonymous_map.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view messages for assigned complaints" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = messages.complaint_id 
      AND complaints.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Admins can send messages for assigned complaints" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = messages.complaint_id 
      AND complaints.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can send all messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Realtime already enabled for messages table
