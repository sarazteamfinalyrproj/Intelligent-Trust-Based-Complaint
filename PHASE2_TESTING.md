# Phase 2 - AI Intelligence Testing Guide

## ✅ Implemented Features

### 1. Sentiment Analysis
- **Location**: `supabase/functions/analyze-complaint/index.ts`
- **Purpose**: Automatically detect complaint severity based on content
- **Algorithm**: Keyword-based sentiment scoring

### 2. Spam Detection
- **Location**: `supabase/functions/detect-spam/index.ts`
- **Checks**:
  - Keyword spam (test, asdf, etc.)
  - Duplicate content (within 24 hours)
  - Submission rate limit (5 complaints/24 hours)
  - Minimum length (20 characters)

### 3. Trust Score System
- **Location**: `supabase/functions/update-trust-score/index.ts`
- **Auto-updates**:
  - Valid complaint resolved: +5
  - High feedback rating (4-5): +5
  - Medium rating (3): +2
  - Low rating (<3): -5
  - Spam detected: -10

---

## 🧪 Test Scenarios

### Test Case 1: Critical Severity Detection
**Input**:
```
Title: "Urgent Hostel Safety Issue"
Content: "The hostel food is terrible and unhygienic. This is completely unacceptable and disgusting. We are facing serious health threats and this is an emergency situation."
```

**Expected**:
- ✅ Severity: **Critical**
- ✅ No spam detected
- ✅ Complaint submitted successfully

---

### Test Case 2: Medium Severity Detection
**Input**:
```
Title: "Library Hours Problem"
Content: "The library hours are insufficient for students. We need better access during exam periods. This is causing difficulties for many students."
```

**Expected**:
- ✅ Severity: **Medium**
- ✅ No spam detected
- ✅ Complaint submitted successfully

---

### Test Case 3: Low Severity Detection
**Input**:
```
Title: "Request for Better WiFi"
Content: "I would like to request improved WiFi connectivity in the academic block. It would be great if we could have faster internet speeds. Thank you for considering this."
```

**Expected**:
- ✅ Severity: **Low**
- ✅ No spam detected
- ✅ Complaint submitted successfully

---

### Test Case 4: Spam Detection - Keywords
**Input**:
```
Title: "test"
Content: "test test test asdf"
```

**Expected**:
- ❌ **REJECTED**: Spam keywords detected
- ❌ Trust score: -10
- ❌ Error message shown

---

### Test Case 5: Spam Detection - Too Short
**Input**:
```
Title: "Issue"
Content: "Bad service"
```

**Expected**:
- ❌ **REJECTED**: Content too short (minimum 20 characters)
- ❌ Trust score: -10
- ❌ Error message shown

---

### Test Case 6: Duplicate Content Detection
**Input**: Submit same complaint twice within 24 hours

**Expected**:
- ✅ First submission: Success
- ❌ Second submission: Duplicate detected
- ❌ Trust score: -10

---

### Test Case 7: Rate Limit (5 complaints/24 hours)
**Input**: Submit 6 valid complaints in quick succession

**Expected**:
- ✅ First 5 submissions: Success
- ❌ 6th submission: Rate limit exceeded
- ❌ Trust score: -10

---

### Test Case 8: Trust Score Increase
**Flow**:
1. Student submits valid complaint
2. Admin resolves complaint
3. Student rates resolution with 5 stars

**Expected**:
- ✅ Initial score: 50
- ✅ After resolution: 55 (+5)
- ✅ After high rating: 60 (+5)
- ✅ Total change: +10

---

### Test Case 9: Trust Score Decrease
**Flow**:
1. Student submits spam
2. Spam detected

**Expected**:
- ✅ Initial score: 50
- ✅ After spam: 40 (-10)

---

## 🔧 How to Test

### Prerequisites
1. **Supabase Setup**:
   - Create Supabase project
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_ai_features.sql`
   - Deploy Edge Functions (see deployment section)

2. **Environment Variables**:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

### Manual Testing Steps

1. **Start Development Server**:
   ```bash
   cd complaintsys
   npm run dev
   ```

2. **Create Test Accounts**:
   - Student account: `student@test.com`
   - Admin account: `admin@test.com`
   - Super Admin: `superadmin@test.com`

3. **Test Sentiment Analysis**:
   - Log in as student
   - Submit complaints from test cases 1-3
   - Check if severity is correctly detected

4. **Test Spam Detection**:
   - Submit spam complaints from test cases 4-7
   - Verify rejection and trust score decrease

5. **Test Trust Score Updates**:
   - Complete full workflow (submit → resolve → rate)
   - Check trust score changes in sidebar

---

## 📊 Deploying Edge Functions to Supabase

### Option 1: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy analyze-complaint
supabase functions deploy detect-spam
supabase functions deploy update-trust-score
```

### Option 2: Manual Deployment

1. Go to Supabase Dashboard → Edge Functions
2. Click "New Function"
3. Copy code from:
   - `supabase/functions/analyze-complaint/index.ts`
   - `supabase/functions/detect-spam/index.ts`
   - `supabase/functions/update-trust-score/index.ts`
4. Deploy each function

---

## 🐛 Troubleshooting

### Issue: Edge Functions not working
**Solution**:
- Ensure functions are deployed
- Check Supabase logs
- Verify CORS headers are correct

### Issue: Spam detection too strict
**Solution**:
- Adjust keywords in `detect-spam/index.ts`
- Modify minimum length requirement
- Change rate limit threshold

### Issue: Severity always showing "low"
**Solution**:
- Check if `analyze-complaint` function is deployed
- Verify sentiment keywords are matching
- Add console logs to debug scoring

---

## 📈 Expected Results Summary

| Test Case | Severity | Spam | Trust Change |
|-----------|----------|------|--------------|
| Critical complaint | Critical | No | 0 |
| Medium complaint | Medium | No | 0 |
| Low complaint | Low | No | 0 |
| Spam keywords | N/A | Yes | -10 |
| Too short | N/A | Yes | -10 |
| Duplicate | N/A | Yes | -10 |
| Rate limit | N/A | Yes | -10 |
| Valid + resolved + high rating | Any | No | +10 |

---

## 🎯 Success Criteria

- ✅ 90% accuracy on severity detection
- ✅ 100% spam keyword blocking
- ✅ 100% duplicate detection within 24h
- ✅ Trust scores update correctly
- ✅ UI shows real-time score changes
- ✅ Edge functions respond within 2 seconds

---

## 🔜 Next Steps (Phase 3)

After testing Phase 2:
1. Smart routing based on category
2. Admin performance scoring
3. Automatic complaint assignment
4. Email notifications

**Current Status**: Phase 2 implementation complete, ready for testing!
