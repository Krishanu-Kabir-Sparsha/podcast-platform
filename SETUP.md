# Podcast Platform - Complete Setup Guide

## Recommended Workflow

Use the Supabase CLI from the project folder for day-to-day development:

```bash
npm run supabase:login
npm run supabase:link
npm run supabase:db:push
```

That keeps schema changes in version control and lets you apply them without opening the Supabase dashboard every time.

You can also run the whole setup with one command:

```bash
npm run supabase:setup
```

That wrapper uses the linked project ref from `supabase/.temp/project-ref` when it exists, and you can override it with `--project-ref=<ref>` for a different target.
It only prompts for Supabase login if the CLI is not already authenticated.

For production troubleshooting, use the same migrations and verify the same tables in the live project. Do not hand-edit schema in production unless you are fixing an emergency and can immediately capture that change in a migration.

## 🚨 CRITICAL: Do This First!

### Step 1: Deploy Database Schema to Supabase

**This is required for the app to work.** Without this, you can sign up but podcasts/episodes won't save.

Best option:

1. Open a terminal in the project folder.
2. Run `npm run supabase:login`.
3. Run `npm run supabase:link` and point it at your project ref.
4. Run `npm run supabase:db:push`.
5. Confirm the tables appear in the Supabase Table Editor.

Manual fallback:

1. Go to **Supabase Dashboard** → Your project → **SQL Editor**
2. Click **+ New Query**
3. Copy & paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Repeat for `supabase/migrations/002_hardening_and_profiles.sql`
5. Click **Run** and confirm success

**What this does:**
- Creates `podcasts` table (for storing podcast metadata)
- Creates `episodes` table (for storing episodes)
- Creates `subscriptions` table (for tracking followers)
- Creates `episode_listens` table (for tracking plays)
- Sets up Row Level Security (RLS) policies for data protection
- Creates database indexes for performance

### Step 2: Verify Environment Variables

Check `.env.local` has these values (from Supabase Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://yycknhahebmjqcgxlrth.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For server-side setup tooling, also set `SUPABASE_SERVICE_ROLE_KEY` only in the backend environment. Never expose it to the browser.

### Step 3: Disable Email Confirmation (for testing)

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. Toggle **Require email confirmation** to **OFF**
3. This allows users to log in immediately after signup

---

## 🎯 How the Authentication Flow Works

### Signup Flow (Step by Step)

```
User fills form (email, password)
         ↓
Submit "Sign Up" button
         ↓
Frontend calls: supabase.auth.signUp({ email, password })
         ↓
Supabase Auth creates user in auth.users table
         ↓
Supabase automatically creates session (because email confirmation is disabled)
         ↓
Auth context detects session via onAuthStateChange event
         ↓
Auth state updates: session = user session, user = user data
         ↓
Signup page detects session exists and calls router.push("/dashboard")
         ↓
Dashboard page loads with authenticated user
         ↓
User sees their email and "My Podcasts" options
```

### What You Should See at Each Step

**1. Visit http://localhost:3000**
- See signup form ✅
- Auth context initializing → page shows "Loading..." briefly

**2. Enter email and password**
```
Email: test@example.com
Password: password123
```
- Form fields populate ✅

**3. Click "Sign Up"**
- Button shows "Creating Account..." (disabled) ✅
- Frontend logs show: "[Signup] Attempting signup with: test@example.com"

**4. In Supabase Console (Logs & Analytics)**
- You'll see auth request logs
- Status should show "200 OK" or "request completed"

**5. After signup**
- Page shows green message: "✅ Account created successfully! Redirecting to dashboard..."
- After 3 seconds → redirects to `/dashboard`

**6. Dashboard loads**
- Shows user email in sidebar ✅
- Shows "My Podcasts", "Create Podcast", etc. options ✅

---

## 🔍 Debugging: How to Check What's Happening

### 1. Browser Console (F12 → Console tab)

You'll see logs like:
```
[Auth] Initial session check: Found
[Signup] Attempting signup with: test@example.com
[Signup] User created: 123e4567-e89b-12d3-a456-426614174000
[Dashboard] Auth state: { isReady: true, loading: false, hasSession: true, hasUser: true }
```

**If you see errors:**
- Check `.env.local` is correct
- Check Supabase project URL matches
- Check ANON_KEY is valid (doesn't start with "ey..." alone, should be longer JWT)

### 2. Supabase Logs (Supabase Dashboard → Logs & Analytics)

You'll see:
- `POST /auth/v1/signup` - User signup request
- `200` status - Successful
- Timestamp matching when you clicked sign up

**If you see 400+ errors:**
- Email already exists
- Password too short
- Invalid email format

### 3. Network Tab (F12 → Network tab)

After signup, you should see:
- `POST` to `/auth/v1/signup` → status 200
- Session cookie set in response headers
- Auth token in response body

---

## 📊 What's Stored in Supabase

### After You Sign Up:

1. **auth.users table** (managed by Supabase)
   - Email: test@example.com
   - Password: (hashed, encrypted)
   - Session token: (generated automatically)

2. **Created tables (empty until you add data)**
   - `public.podcasts` - empty
   - `public.episodes` - empty
   - `public.subscriptions` - empty
   - `public.episode_listens` - empty

### When You Create a Podcast:

1. Click "Create Podcast"
2. Fill form → Click "Create"
3. Frontend calls:
   ```
   supabase.from("podcasts").insert({
     user_id: "logged-in-user-id",
     title: "My Podcast",
     description: "..."
   })
   ```
4. Row added to `podcasts` table with your user_id
5. You see it in "My Podcasts" list

### Viewing Your Data in Supabase:

1. **Supabase Dashboard** → **Table Editor**
2. Select `podcasts` table
3. You'll see your podcast data:
   - id (auto-generated UUID)
   - user_id (your user id)
   - title, description
   - created_at, updated_at

---

## ✅ Complete Checklist

- [ ] Copied SQL from `supabase/migrations/001_initial_schema.sql`
- [ ] Pasted into Supabase SQL Editor and ran it successfully
- [ ] Verified `.env.local` has SUPABASE_URL and ANON_KEY
- [ ] Disabled email confirmation in Auth → Policies
- [ ] Started dev server: `npm run dev`
- [ ] Visited http://localhost:3000
- [ ] Signed up with test email and password
- [ ] Saw redirect to dashboard (or check browser console for errors)
- [ ] Dashboard shows user email in sidebar
- [ ] Checked Supabase Logs & Analytics to see signup request

---

## 🚀 Next Steps After Setup Works

### Create Your First Podcast

1. Click "Create Podcast" on dashboard
2. Enter:
   - Title: "My First Podcast"
   - Description: "Testing the platform"
3. Click "Create Podcast"
4. Should see it listed in "My Podcasts"

### Check Data in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Select `podcasts` table
3. You should see your podcast as a row

### Upload an Episode

1. Click "Episodes" on dashboard
2. Click "Upload Episode"
3. Select your podcast from dropdown
4. Enter episode title and description
5. Click "Create Episode"
6. Go back to "Episodes" → should see it listed

### View Your Stats

1. Click "Statistics" on dashboard
2. Should show:
   - 1 Total Podcasts
   - 1 Total Episodes
   - 0 Subscribers (until other users subscribe)
   - 0 Listens (until others play episodes)

---

## 🛠️ Troubleshooting

### Production checklist for 404 REST errors

If the app shows 404s from Supabase REST endpoints in production, check these first:

1. The production Supabase project matches the `.env.local` or deployment environment values.
2. The `public` schema is the schema the app is reading from.
3. The migrations have been pushed to the production project.
4. The missing tables exist in Table Editor: `podcasts`, `episodes`, `subscriptions`, `episode_listens`, `profiles`.
5. RLS policies exist for the tables that require them.
6. The service role key is only used on the server, never in client code.

If production is missing tables, run the same CLI workflow against the production project ref and then refresh the setup-status page.

### Problem: "Stuck on signup page after clicking Sign Up"

**Causes:**
1. SQL schema not deployed
2. `.env.local` has wrong Supabase URL/key
3. Email confirmation is still enabled

**Fix:**
1. Check `.env.local` values are correct
2. Deploy SQL schema first (see Step 1)
3. Disable email confirmation in Supabase

### Problem: "No console logs appearing"

**Fix:**
1. Open Browser DevTools: Press **F12**
2. Click **Console** tab
3. Refresh page (F5)
4. Try signup again

### Problem: "User created but page doesn't redirect"

**Causes:**
1. Auth context not initialized yet
2. Router not working properly

**Fix:**
1. Check console logs for errors
2. Wait 5 seconds, then manually click browser back/forward
3. Restart dev server: `npm run dev`

### Problem: "Signup gives error: 'email rate limit exceeded'"

**Cause:** Too many signup attempts in short time

**Fix:**
1. Wait 60 seconds
2. Try with different email address
3. Check Supabase Logs for exact error

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/auth-context.tsx` | Manages authentication state |
| `src/lib/supabase.ts` | Supabase client setup |
| `app/page.tsx` | Signup page |
| `app/dashboard/page.tsx` | Dashboard after login |
| `supabase/migrations/001_initial_schema.sql` | Database schema (⚠️ MUST RUN) |
| `.env.local` | Supabase credentials (private, don't commit) |

---

## 🆘 Getting Help

### Check These Files:

1. **Browser Console** - Press F12 → Console tab
   - Look for red errors or blue logs starting with `[Auth]`, `[Signup]`, `[Dashboard]`

2. **Supabase Logs** - Dashboard → Logs & Analytics
   - Shows all API requests and responses

3. **Network Tab** - Press F12 → Network tab
   - Shows HTTP requests to Supabase

---

## 📝 Summary

**The app has 3 main parts:**

1. **Authentication (Auth Context)**
   - Manages login state globally
   - Detects when user signs up or logs out
   - Available to all pages via `useAuth()` hook

2. **Pages**
   - `/` - Signup page (redirects to dashboard if already logged in)
   - `/dashboard` - Home page (redirects to signup if not logged in)
   - `/podcasts` - List your podcasts
   - `/podcasts/new` - Create new podcast
   - `/episodes` - List episodes
   - `/episodes/new` - Upload episode
   - `/stats` - View your statistics

3. **Database**
   - `podcasts` - Your podcast metadata
   - `episodes` - Episodes in your podcasts
   - `subscriptions` - Track which users follow which podcasts
   - `episode_listens` - Track who listened to what

**Protected with Row Level Security (RLS):**
- Users can only see/edit their own podcasts
- Users can only see/edit their own subscriptions
- Public can view all podcasts and episodes

---

## ✨ You're All Set!

If you see the dashboard with your email after signup, everything is working correctly. Start creating podcasts! 🚀

