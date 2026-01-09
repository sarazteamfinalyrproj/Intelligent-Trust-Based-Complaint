-- Add trust history table
CREATE TABLE trust_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  complaint_id uuid REFERENCES complaints(id) ON DELETE SET NULL,
  action text NOT NULL,
  old_score int NOT NULL,
  new_score int NOT NULL,
  change int NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on trust_history
ALTER TABLE trust_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trust_history
CREATE POLICY "Users can view their own trust history" ON trust_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all trust history" ON trust_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "System can insert trust history" ON trust_history
  FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_trust_history_user_id ON trust_history(user_id);
CREATE INDEX idx_trust_history_created_at ON trust_history(created_at);

-- Update complaints table to track spam
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS spam_score int DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_spam boolean DEFAULT false;

-- Function to check user's recent complaint count
CREATE OR REPLACE FUNCTION get_user_complaint_count_24h(p_user_id uuid)
RETURNS int AS $$
DECLARE
  complaint_count int;
BEGIN
  SELECT COUNT(*)
  INTO complaint_count
  FROM anonymous_map am
  JOIN complaints c ON c.id = am.complaint_id
  WHERE am.user_id = p_user_id
    AND c.created_at > NOW() - INTERVAL '24 hours';
  
  RETURN complaint_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update trust score (can be called from triggers or functions)
CREATE OR REPLACE FUNCTION adjust_trust_score(
  p_user_id uuid,
  p_change int
)
RETURNS int AS $$
DECLARE
  new_score int;
BEGIN
  UPDATE users
  SET trust_score = GREATEST(0, LEAST(100, trust_score + p_change))
  WHERE id = p_user_id
  RETURNING trust_score INTO new_score;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- Update admin score trigger to also update trust score for students
CREATE OR REPLACE FUNCTION update_student_trust_on_feedback()
RETURNS TRIGGER AS $$
DECLARE
  student_id uuid;
  score_change int;
BEGIN
  SELECT user_id INTO student_id
  FROM anonymous_map
  WHERE complaint_id = NEW.complaint_id;
  
  IF NEW.rating >= 4 THEN
    score_change := 5;
  ELSIF NEW.rating = 3 THEN
    score_change := 2;
  ELSIF NEW.rating < 3 THEN
    score_change := -5;
  END IF;
  
  PERFORM adjust_trust_score(student_id, score_change);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trust_on_feedback
AFTER INSERT ON feedback
FOR EACH ROW
EXECUTE FUNCTION update_student_trust_on_feedback();

-- View for trust score statistics
CREATE VIEW trust_score_stats AS
SELECT 
  COUNT(*) as total_users,
  AVG(trust_score) as avg_score,
  MAX(trust_score) as max_score,
  MIN(trust_score) as min_score,
  COUNT(CASE WHEN trust_score >= 70 THEN 1 END) as high_trust_users,
  COUNT(CASE WHEN trust_score < 30 THEN 1 END) as low_trust_users
FROM users
WHERE role = 'student';

-- Grant select on new view
GRANT SELECT ON trust_score_stats TO authenticated;
