-- Insert the missing user profile for the existing auth user
INSERT INTO users (id, email, role, trust_score)
VALUES ('059d016f-4875-474f-8c9d-625cca821545', 'student@test.com', 'student', 50)
ON CONFLICT (id) DO NOTHING;
