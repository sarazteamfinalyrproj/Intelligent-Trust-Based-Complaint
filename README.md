# Intelligent Complaint & Feedback Management System

A trust-based, AI-assisted complaint management system with privacy-first architecture built with React and Supabase.

## Features - All Phases Complete! ✅

### Phase 1: Core System ✅
- **Anonymous Complaint System**: Students can submit complaints anonymously
- **Trust-Based Identity Protection**: Identity mapping accessible only to Super Admins
- **Role-Based Authentication**: Student, Admin, and Super Admin roles
- **Complaint Management**: Create, view, and manage complaints
- **Smart Status Tracking**: Pending → In Progress → Resolved → Reopened workflow

### Phase 2: AI Intelligence ✅
- **AI Sentiment Analysis**: Automatic emotion detection (positive, neutral, negative) via OpenAI
- **Smart Spam Detection**: ML-powered spam filtering using Hugging Face models
- **Dynamic Trust Scoring**: Real-time trust score updates based on complaint quality
- **Trust Score History**: Complete audit trail of all trust score changes
- **Edge Functions**: Three deployed AI services (analyze-complaint, detect-spam, update-trust-score)

### Phase 3: Automation & Routing ✅
- **Smart Complaint Routing**: Auto-assignment to correct department based on category
- **Admin Performance Scoring**: Automatic +10 points per resolved complaint
- **Feedback System**: 1-5 star rating with comments for resolved complaints
- **Auto-Reopen Logic**: Low-rated complaints (< 3 stars) automatically reopened
- **Department Mapping**: Hostel→Warden, Exam→COE, Ragging→Principal, etc.

### Phase 4: Analytics & Learning ✅
- **Visual Analytics Dashboard**: Interactive charts with Recharts library
- **Complaints by Category**: Bar charts showing Total/Resolved/Pending/Critical breakdown
- **Severity Distribution**: Pie chart visualization
- **Status Overview**: Real-time status distribution charts
- **Key Insights Cards**: Resolution rate %, total resolved, critical pending counts
- **Pattern Detection**: Visual trend analysis across categories

### Phase 5: Messaging & Privacy ✅
- **Real-Time Anonymous Chat**: Live messaging between students and admins
- **Supabase Realtime**: Instant message delivery using Postgres subscriptions
- **Identity Protection**: Complete anonymity maintained in chat
- **Role-Based Messaging**: Separate views for students, admins, and super admins
- **Optimistic Updates**: Messages appear instantly with auto-scroll

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   ```sql
   -- Copy and paste contents from supabase/migrations/001_initial_schema.sql
   ```
3. Get your project credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → Project API keys → anon/public

### 2. Database Migrations

Run all migrations in order in Supabase SQL Editor:

1. **001_initial_schema.sql** - Core tables and RLS policies
2. **002_add_trust_history.sql** - Trust score tracking
3. **003_fix_user_insert.sql** - User signup RLS fix
4. **004_fix_rls_recursion.sql** - Remove recursive policies
5. **005_simple_user_policies.sql** - Simplified user access
6. **006_fix_anonymous_map_policy.sql** - Student complaint viewing
7. **007_fix_super_admin_access.sql** - Super admin permissions
8. **008_fix_admin_update.sql** - Admin complaint updates
9. **011_fix_messages_policies_complete.sql** - Message RLS policies for all roles

Then run this constraint fix:
```sql
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_role_check;
ALTER TABLE messages ADD CONSTRAINT messages_sender_role_check 
  CHECK (sender_role IN ('student', 'admin', 'super_admin'));
```

### 3. Deploy Edge Functions

```bash
# Login to Supabase
npx supabase login

# Deploy all Edge Functions
npx supabase functions deploy analyze-complaint --project-ref your_project_ref
npx supabase functions deploy detect-spam --project-ref your_project_ref
npx supabase functions deploy update-trust-score --project-ref your_project_ref
npx supabase functions deploy route-complaint --project-ref your_project_ref
```

### 4. Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sarazteamfinalyrproj/Intelligent-Trust-Based-Complaint.git
   cd Intelligent-Trust-Based-Complaint
   ```

2. Create `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Usage

### Creating Accounts

1. **Student Account**:
   - Sign up with email/password
   - Select "Student" role
   - Default trust score: 50

2. **Admin Account**:
   - Sign up with email/password
   - Select "Admin" role
   - Can view and manage all complaints

3. **Super Admin Account**:
   - Sign up with email/password
   - Select "Super Admin" role
   - Full access including identity mapping

### Student Features

- **Submit Complaints**: Anonymous submission with AI analysis
- **View History**: Personal complaint dashboard with status tracking
- **Trust Score**: Real-time trust score with history
- **Rate Resolutions**: 1-5 star feedback on resolved complaints
- **Anonymous Chat**: Message admins while maintaining anonymity
- **Auto-Routing**: Complaints automatically assigned to correct department

### Admin Features

- **View Complaints**: All complaints with advanced filtering
- **Status Management**: Update complaint status (Pending → In Progress → Resolved)
- **Dashboard Statistics**: Real-time metrics and performance scores
- **Performance Tracking**: Automatic scoring (+10 per resolved complaint)
- **Anonymous Chat**: Communicate with students anonymously
- **"Start Working" Button**: One-click to mark complaint in progress

### Super Admin Features

- **Full Access**: All admin features plus system oversight
- **Identity Viewing**: Access to student identities (logged for audit)
- **Analytics Dashboard**: Visual charts and trend analysis
- **Tabbed Interface**: Switch between Complaints and Analytics views
- **Chat Access**: Message capability on all complaints
- **Pattern Detection**: Identify trends across categories and severity

## Database Schema

### Key Tables

- **users**: User profiles with roles and trust scores
- **complaints**: All complaint records with AI sentiment/severity
- **anonymous_map**: Maps complaints to users (Super Admin only)
- **departments**: Auto-routing configuration with authority roles
- **feedback**: Student feedback on resolutions (triggers auto-reopen)
- **messages**: Real-time anonymous messaging with Realtime enabled
- **trust_history**: Complete audit trail of all trust score changes
- **admin_score**: Admin performance tracking and leaderboard data
- **solutions**: ML-powered solution recommendation system (foundation)

### Row Level Security (RLS)

- Students can only view their own complaints
- Admins cannot access identity mapping
- Super Admins have full access
- All policies enforced at database level

## Project Structure

```
complaintsys/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   ├── complaints/
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── ComplaintList.jsx
│   │   │   ├── TrustScoreCard.jsx
│   │   │   └── FeedbackModal.jsx
│   │   ├── dashboard/
│   │   │   └── AnalyticsCharts.jsx
│   │   └── messaging/
│   │       └── MessageThread.jsx
│   ├── pages/
│   │   ├── StudentDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── SuperAdminDashboard.jsx
│   ├── services/
│   │   └── supabase.js
│   ├── App.jsx
│   └── index.css
├── supabase/
│   ├── functions/
│   │   ├── analyze-complaint/
│   │   ├── detect-spam/
│   │   ├── update-trust-score/
│   │   └── route-complaint/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_add_trust_history.sql
│       ├── 003-008_*.sql (RLS fixes)
│       └── 009-011_*.sql (Message policies)
├── .env
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Test Accounts

For testing purposes, you can create these accounts:

- **Student**: student@test.com / password123
- **Admin**: admin@test.com / password123
- **Super Admin**: super@test.com / password123

## Known Issues & Solutions

### Messages Not Appearing
**Issue**: Messages sent but not displayed  
**Solution**: Apply migration 011 and enable Realtime for messages table

### Super Admin Can't Send Messages
**Issue**: Constraint violation error  
**Solution**: Run the constraint fix SQL to add 'super_admin' to allowed roles

### RLS Policy Errors
**Issue**: Users can't access data due to RLS policies  
**Solution**: Run all migrations 003-008 in order to fix RLS recursion and permissions

## Development Roadmap

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed implementation plan.

- ✅ Phase 1: Core System (Authentication, Complaints, RLS)
- ✅ Phase 2: AI Intelligence (Sentiment analysis, Trust scores)
- ✅ Phase 3: Automation (Smart routing, Admin scoring, Feedback)
- ✅ Phase 4: Analytics (Dashboards, Pattern detection, Charts)
- ✅ Phase 5: Messaging (Real-time anonymous chat)

## Security Features

1. **Anonymous Complaints**: Student identity never exposed to regular admins
2. **Row Level Security**: Database-level access control
3. **Audit Logging**: Identity access tracked (Super Admin only)
4. **Trust Score System**: Prevents spam and abuse
5. **Encrypted Communication**: All data transmitted over HTTPS

## Contributing

This is a student project for educational purposes.

## License

MIT License - feel free to use for learning purposes.

## Support

For issues or questions, please check:
1. Supabase project is properly set up
2. Environment variables are correctly configured
3. Database migrations have been run
4. RLS policies are enabled

## Credits

Built with ❤️ using modern web technologies:
- React + Vite
- Supabase
- Tailwind CSS
