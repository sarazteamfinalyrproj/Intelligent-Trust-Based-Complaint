# Intelligent Complaint & Feedback Management System - Project Plan

## Project Overview
Trust-based, AI-assisted complaint management system with privacy-first architecture using Supabase.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Chart.js/Recharts
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL with RLS
- **Auth**: Supabase Auth
- **AI/NLP**: sentiment, natural (Node.js libraries)

---

## Phase 1: Core System Setup ⚙️

### 1.1 Project Initialization
- [x] Create React app with Vite
- [x] Install dependencies (Supabase client, Tailwind CSS)
- [x] Set up environment variables
- [ ] Initialize Supabase project

### 1.2 Database Schema
**Tables:**
```sql
users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  role text CHECK (role IN ('student', 'admin', 'super_admin')),
  trust_score int DEFAULT 50,
  created_at timestamptz DEFAULT now()
)

complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  title text,
  content text,
  severity text CHECK (severity IN ('low', 'medium', 'critical')),
  status text CHECK (status IN ('pending', 'in_progress', 'resolved', 'reopened')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
)

anonymous_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id),
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
)

departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  category text,
  authority_role text
)
```

### 1.3 Row Level Security (RLS) Policies
- **Admin**: Cannot view `anonymous_map` table
- **Super Admin**: Full access to `anonymous_map`
- **Students**: Can only view their own data

### 1.4 Authentication
- [ ] Implement Supabase Auth signup/login
- [ ] Role-based access control
- [ ] Protected routes (Student, Admin, Super Admin)

### 1.5 Complaint Submission
- [ ] Anonymous complaint form
- [ ] Category selection
- [ ] Auto-generate anonymous ID mapping
- [ ] Store in database

---

## Phase 2: AI Intelligence 🤖

### 2.1 Sentiment Analysis Edge Function
**File**: `supabase/functions/analyze-complaint/index.ts`
```typescript
- Accept complaint text
- Run sentiment analysis
- Assign severity based on score:
  * sentiment < -0.6 → Critical
  * -0.6 to -0.2 → Medium
  * else → Low
- Update complaint severity
```

### 2.2 Trust Score System
**Logic**:
- Initial score: 50
- Valid complaint: +5
- Spam detected: -10
- Repeated valid: +2

**Implementation**:
- [ ] Edge function to update trust scores
- [ ] Trigger on complaint resolution

### 2.3 Spam Detection
- [ ] Basic keyword filtering
- [ ] Repeated content detection
- [ ] Trust score threshold enforcement

---

## Phase 3: Automation & Routing 🔁

### 3.1 Smart Complaint Routing
**Rules**:
```javascript
{
  "Hostel": "Warden",
  "Exam": "COE",
  "Faculty": "HOD",
  "Ragging": "Principal"
}
```

**Implementation**:
- [ ] Edge function: `route-complaint`
- [ ] Auto-assign to department
- [ ] Notify assigned authority

### 3.2 Admin Performance Scoring
**Tables**:
```sql
admin_score (
  admin_id uuid REFERENCES users(id),
  total_resolved int DEFAULT 0,
  avg_rating decimal DEFAULT 0,
  score int DEFAULT 0
)
```

**Logic**:
- Track resolution time
- Track feedback ratings
- Update admin score

### 3.3 Feedback Loop
**Tables**:
```sql
feedback (
  id uuid PRIMARY KEY,
  complaint_id uuid REFERENCES complaints(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
)
```

**Features**:
- [ ] Student rates resolution (1-5 stars)
- [ ] If rating < 3 → Reopen complaint
- [ ] Update admin performance score

---

## Phase 4: Analytics & Learning 📊

### 4.1 SQL Views for Analytics
```sql
CREATE VIEW complaint_summary AS
SELECT 
  category, 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  AVG(CASE WHEN status = 'resolved' THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 END) as avg_resolution_hours
FROM complaints
GROUP BY category;

CREATE VIEW trend_analysis AS
SELECT 
  DATE_TRUNC('week', created_at) as week,
  category,
  COUNT(*) as count
FROM complaints
GROUP BY week, category
ORDER BY week DESC;
```

### 4.2 Pattern Detection
- [ ] Spike detection (40% increase in category)
- [ ] Repeated issue detection
- [ ] Time-based trends (exam season, etc.)

### 4.3 Solution Recommendation System
**Tables**:
```sql
solutions (
  id uuid PRIMARY KEY,
  category text,
  keywords text[],
  solution_text text,
  usage_count int DEFAULT 0
)
```

**Logic**:
- Match new complaint with past solutions
- Keyword similarity check
- Suggest top solution

### 4.4 Dashboard Components
- [ ] Chart: Complaints by category
- [ ] Chart: Resolution time trends
- [ ] Chart: Admin performance
- [ ] Alert: Pattern detection insights

---

## Phase 5: Messaging & Privacy 🛡️

### 5.1 Anonymous Messaging
**Tables**:
```sql
messages (
  id uuid PRIMARY KEY,
  complaint_id uuid REFERENCES complaints(id),
  sender_role text,
  message text,
  created_at timestamptz DEFAULT now()
)
```

**Features**:
- [ ] Student ↔ Admin chat (anonymous)
- [ ] Real-time updates (Supabase Realtime)
- [ ] RLS ensures privacy

### 5.2 Identity Protection
- [ ] Super Admin view for identity mapping
- [ ] Audit logs for identity access
- [ ] Encrypted storage considerations

---

## Supabase Edge Functions Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-complaint` | Submit new complaint |
| POST | `/analyze-complaint` | AI sentiment analysis |
| POST | `/route-complaint` | Auto-route to department |
| POST | `/respond-complaint` | Admin responds |
| POST | `/submit-feedback` | Student feedback |
| GET | `/analytics-summary` | Dashboard data |
| GET | `/suggest-solution` | Recommend past solutions |

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | Week 1-2 | Auth, DB schema, basic complaint submission |
| Phase 2 | Week 3 | AI sentiment, trust scoring |
| Phase 3 | Week 4 | Auto-routing, admin scoring, feedback loop |
| Phase 4 | Week 5 | Analytics dashboard, pattern detection |
| Phase 5 | Week 6 | Messaging, final polish |

---

## Directory Structure
```
complaint-management-system/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── complaints/
│   │   ├── dashboard/
│   │   └── messaging/
│   ├── pages/
│   │   ├── StudentDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── SuperAdminDashboard.jsx
│   ├── services/
│   │   └── supabase.js
│   └── App.jsx
├── supabase/
│   ├── functions/
│   │   ├── create-complaint/
│   │   ├── analyze-complaint/
│   │   ├── route-complaint/
│   │   └── analytics-summary/
│   └── migrations/
│       └── 001_initial_schema.sql
└── package.json
```

---

## Success Criteria
- ✅ Anonymous complaint submission with identity protection
- ✅ AI-based severity detection (>80% accuracy)
- ✅ Auto-routing to correct department (100% accuracy)
- ✅ Admin performance tracking with feedback loop
- ✅ Pattern detection with actionable insights
- ✅ Solution recommendation system
- ✅ Full privacy compliance (RLS enforced)

---

## Testing Strategy
- Unit tests for Edge Functions
- Integration tests for complaint workflow
- RLS policy testing
- Performance testing (1000+ complaints)
- Security testing (identity protection)
