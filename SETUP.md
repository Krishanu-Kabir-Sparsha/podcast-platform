# Podcast Platform - Setup Guide

## What's Been Built

### ✅ Phase 1: Authentication & Core Infrastructure
- Signup page with validation
- Auth context for session management
- Dashboard with user greeting + quick actions
- Protected routes

### ✅ Phase 2: Database Schema
Created in `supabase/migrations/001_initial_schema.sql`:
- **podcasts** - Store podcast metadata
- **episodes** - Store episodes per podcast
- **subscriptions** - Track user subscriptions
- **episode_listens** - Track listen events
- Row Level Security (RLS) policies for data protection
- Performance indexes

### ✅ Phase 3: Core Pages
- **Dashboard** (`/dashboard`) - Home with quick access
- **My Podcasts** (`/podcasts`) - List and manage podcasts
- **Create Podcast** (`/podcasts/new`) - Form to create
- **Episodes** (`/episodes`) - List episodes by podcast
- **Upload Episode** (`/episodes/new`) - Form to upload
- **Statistics** (`/stats`) - View your platform metrics

## Setup Instructions

### 1. **Set Up Database Schema**

Go to your Supabase Dashboard → SQL Editor and run the SQL from:
```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, policies, and indexes.

### 2. **Verify Environment Variables**

Check `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://yycknhahebmjqcgxlrth.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 3. **Run the App**

```bash
npm run dev
```

Open http://localhost:3000

### 4. **Test the Flow**

1. Sign up with a new email
2. You should land on `/dashboard`
3. Click "My Podcasts" to create your first podcast
4. Create a podcast with title + description
5. Go to "Episodes" and upload an episode
6. Check "Statistics" for dashboard metrics

## Database Tables

### podcasts
- id (UUID) - Primary key
- user_id (UUID) - Podcast owner
- title (VARCHAR) - Podcast name
- description (TEXT) - About the podcast
- image_url (VARCHAR) - Cover image
- created_at, updated_at

### episodes
- id (UUID)
- podcast_id (UUID) - Which podcast
- title (VARCHAR)
- description (TEXT)
- audio_url (VARCHAR) - Link to MP3/audio file
- duration_seconds (INT)
- episode_number (INT)
- created_at, updated_at

### subscriptions
- id (UUID)
- user_id (UUID) - Subscriber
- podcast_id (UUID) - Subscribed podcast
- subscribed_at (TIMESTAMP)

### episode_listens
- id (UUID)
- user_id (UUID) - Listener
- episode_id (UUID) - Episode listened
- listened_at (TIMESTAMP)
- duration_listened (INT) - Seconds listened

## File Structure

```
app/
├── layout.tsx               # Root layout with auth provider
├── providers.tsx            # Auth provider wrapper
├── page.tsx                 # Signup page
├── dashboard/
│   └── page.tsx             # Dashboard home
├── podcasts/
│   ├── page.tsx             # List podcasts
│   ├── new/page.tsx         # Create podcast
│   └── [id]/page.tsx        # Podcast detail (optional)
├── episodes/
│   ├── page.tsx             # List episodes
│   └── new/page.tsx         # Upload episode
└── stats/
    └── page.tsx             # Statistics

src/
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── auth-context.tsx     # Auth context hook
```

## Next Steps (Phase 4 - Features)

- [ ] Add audio file upload to Supabase Storage
- [ ] Create podcast detail page with edit
- [ ] Add episode player/playback
- [ ] Build podcast discovery page
- [ ] Add search functionality
- [ ] Implement subscription system
- [ ] Add user profile/settings
- [ ] Create API endpoints for mobile apps
- [ ] Add analytics dashboard

## Environment Setup

Already configured:
- ✅ Next.js 16.2.3
- ✅ React 19.2.4
- ✅ Tailwind CSS 4
- ✅ TypeScript
- ✅ Supabase auth
- ✅ React Context for state

## Troubleshooting

### "Cannot find module" errors
- Run: `npm install`
- Restart dev server

### Dashboard redirects to signup
- Make sure email is verified in Supabase
- Or disable email confirmation in Authentication settings

### Database queries return empty
- Verify RLS policies are enabled
- Check Row Level Security policies in Supabase

### Audio upload not working
- Next step: Add Supabase Storage bucket
- Configure storage policies

## Questions?

Refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
