# Intelligent Complaint & Feedback Management System

A trust-based, AI-assisted complaint management system with privacy-first architecture built with React and Supabase.

## Features

### Phase 1 (Completed) ✅
- **Anonymous Complaint System**: Students can submit complaints anonymously
- **Trust-Based Identity Protection**: Identity mapping accessible only to Super Admins
- **Role-Based Authentication**: Student, Admin, and Super Admin roles
- **Complaint Management**: Create, view, and manage complaints
- **Smart Status Tracking**: Pending → In Progress → Resolved → Reopened workflow

### Upcoming Features
- **Phase 2**: AI sentiment analysis and severity detection
- **Phase 3**: Smart routing, admin performance scoring, feedback loop
- **Phase 4**: Analytics dashboard, pattern detection
- **Phase 5**: Anonymous messaging system

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

### 2. Local Setup

1. Clone/navigate to the project directory:
   ```bash
   cd complaintsys
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

- Submit anonymous complaints
- View personal complaint history
- Track complaint status
- View trust score

### Admin Features

- View all complaints
- Filter by status (Pending, In Progress, Resolved)
- Update complaint status
- Dashboard with statistics

### Super Admin Features

- All admin features
- View student identity for any complaint (logged for audit)
- Full system oversight
- Access to anonymous_map table

## Database Schema

### Key Tables

- **users**: User profiles with roles and trust scores
- **complaints**: All complaint records
- **anonymous_map**: Maps complaints to users (Super Admin only)
- **departments**: Auto-routing configuration
- **feedback**: Student feedback on resolutions
- **messages**: Anonymous communication (coming in Phase 5)

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
│   │   └── complaints/
│   │       ├── ComplaintForm.jsx
│   │       └── ComplaintList.jsx
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
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
└── PROJECT_PLAN.md
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Development Roadmap

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed implementation plan.

- ✅ Phase 1: Core System (Authentication, Complaints, RLS)
- ⏳ Phase 2: AI Intelligence (Sentiment analysis, Trust scores)
- ⏳ Phase 3: Automation (Smart routing, Admin scoring)
- ⏳ Phase 4: Analytics (Dashboards, Pattern detection)
- ⏳ Phase 5: Messaging (Anonymous chat)

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
