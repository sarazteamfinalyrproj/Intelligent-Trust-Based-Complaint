-- Fix messages RLS policies for proper message display

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages for their complaints" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create simpler, more reliable policies
-- Allow students to view/send messages for complaints they created
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

-- Allow admins to view/send messages for complaints assigned to them
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

-- Allow super admins to view/send all messages
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
