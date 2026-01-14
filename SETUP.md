# WhatsApp Vendor Catalog - Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

## 1. Supabase Setup

### Create a Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be ready

### Set up the Database
1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create the vendors table

### Enable Google OAuth (Optional)
1. Go to Authentication > Providers in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

### Get Your Supabase Credentials
1. Go to Project Settings > API
2. Copy your `Project URL` and `anon public` key

## 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-url` and `your-anon-key` with your actual Supabase credentials.

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## Application Flow

### For New Vendors:
1. Visit `/signup` or click "Create Free Catalog" on landing page
2. Sign up with email/password or Google
3. Complete onboarding at `/onboarding`
4. Get redirected to `/dashboard`

### For Existing Vendors:
1. Visit `/login`
2. Log in with email/password or Google
3. Get redirected to `/dashboard`

## Routes

- `/` - Landing page
- `/signup` - Vendor signup
- `/login` - Vendor login
- `/onboarding` - First-time setup (protected)
- `/dashboard` - Vendor dashboard (protected)

## Database Schema

### `vendors` table
- `id` - UUID primary key
- `user_id` - References auth.users (Supabase Auth)
- `store_name` - Store display name
- `slug` - Unique URL-friendly identifier
- `whatsapp_number` - Contact number
- `store_description` - Optional description
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

## Security

- Row Level Security (RLS) enabled on all tables
- Vendors can only read/write their own data
- Protected routes use middleware authentication
- OAuth callback properly exchanges codes for sessions

## Next Steps

1. Customize the landing page copy in `app/page.tsx`
2. Build the vendor catalog management interface
3. Create customer-facing catalog pages
4. Add product management features
5. Implement cart functionality
