-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('student', 'admin', 'super_admin')) DEFAULT 'student',
  trust_score int DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  authority_role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'critical')) DEFAULT 'low',
  status text CHECK (status IN ('pending', 'in_progress', 'resolved', 'reopened')) DEFAULT 'pending',
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Anonymous mapping table (restricted access)
CREATE TABLE anonymous_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(complaint_id)
);

-- Admin performance score table
CREATE TABLE admin_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_resolved int DEFAULT 0,
  avg_rating decimal DEFAULT 0,
  score int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Feedback table
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(complaint_id)
);

-- Messages table (anonymous chat)
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  sender_role text CHECK (sender_role IN ('student', 'admin')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Solutions recommendation table
CREATE TABLE solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  keywords text[],
  solution_text text NOT NULL,
  usage_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default departments
INSERT INTO departments (name, category, authority_role) VALUES
  ('Warden Office', 'Hostel', 'warden'),
  ('Examination Cell', 'Exam', 'coe'),
  ('Academic Department', 'Faculty', 'hod'),
  ('Principal Office', 'Ragging', 'principal'),
  ('Principal Office', 'Harassment', 'principal'),
  ('IT Department', 'Infrastructure', 'it_admin'),
  ('Library', 'Library', 'librarian');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for complaints table
CREATE POLICY "Students can view all complaints" ON complaints
  FOR SELECT USING (true);

CREATE POLICY "Students can create complaints" ON complaints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update assigned complaints" ON complaints
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- RLS Policies for anonymous_map (CRITICAL - Super Admin ONLY)
CREATE POLICY "Only super admin can view anonymous_map" ON anonymous_map
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "System can insert anonymous_map" ON anonymous_map
  FOR INSERT WITH CHECK (true);

-- RLS Policies for feedback
CREATE POLICY "Anyone can view feedback" ON feedback
  FOR SELECT USING (true);

CREATE POLICY "Students can submit feedback for their complaints" ON feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM anonymous_map 
      WHERE complaint_id = feedback.complaint_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their complaints" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM anonymous_map 
      WHERE complaint_id = messages.complaint_id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE id = messages.complaint_id 
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM anonymous_map 
      WHERE complaint_id = messages.complaint_id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE id = messages.complaint_id 
      AND assigned_to = auth.uid()
    )
  );

-- RLS Policies for departments (read-only for all)
CREATE POLICY "Everyone can view departments" ON departments
  FOR SELECT USING (true);

-- RLS Policies for solutions
CREATE POLICY "Everyone can view solutions" ON solutions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage solutions" ON solutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for admin_score
CREATE POLICY "Admins can view their own score" ON admin_score
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Super admin can view all scores" ON admin_score
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create views for analytics
CREATE VIEW complaint_summary AS
SELECT 
  category, 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  AVG(CASE WHEN status = 'resolved' THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 END) as avg_resolution_hours
FROM complaints
GROUP BY category;

CREATE VIEW trend_analysis AS
SELECT 
  DATE_TRUNC('week', created_at) as week,
  category,
  COUNT(*) as count,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count
FROM complaints
GROUP BY week, category
ORDER BY week DESC;

-- Function to automatically reopen complaint if rating < 3
CREATE OR REPLACE FUNCTION reopen_low_rated_complaint()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 3 THEN
    UPDATE complaints 
    SET status = 'reopened', resolved_at = NULL
    WHERE id = NEW.complaint_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_feedback_rating
AFTER INSERT ON feedback
FOR EACH ROW
EXECUTE FUNCTION reopen_low_rated_complaint();

-- Function to update admin score on complaint resolution
CREATE OR REPLACE FUNCTION update_admin_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    INSERT INTO admin_score (admin_id, total_resolved, score)
    VALUES (NEW.assigned_to, 1, 10)
    ON CONFLICT (admin_id) 
    DO UPDATE SET 
      total_resolved = admin_score.total_resolved + 1,
      score = admin_score.score + 10,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_performance
AFTER UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_admin_score();
