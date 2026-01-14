# Developer Quick Reference

## 📂 File Structure Overview

### Authentication Files
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components & actions
- `lib/supabase/middleware.ts` - Client for middleware session refresh
- `middleware.ts` - Route protection and authentication checks

### Server Actions
- `app/actions/auth.ts` - Sign up, login, Google OAuth, logout
- `app/actions/onboarding.ts` - Complete onboarding, save vendor data

### Pages
- `app/page.tsx` - Landing page (public)
- `app/signup/page.tsx` - Vendor signup (public)
- `app/login/page.tsx` - Vendor login (public)
- `app/onboarding/page.tsx` - Vendor onboarding (protected)
- `app/dashboard/page.tsx` - Vendor dashboard (protected)

### API Routes
- `app/auth/callback/route.ts` - OAuth callback handler

### Database
- `supabase/schema.sql` - PostgreSQL schema for vendors table
- `types/database.ts` - TypeScript types for database

## 🔑 Key Functions

### Authentication (`app/actions/auth.ts`)
```typescript
signupWithEmail(formData)      // Email/password signup
loginWithEmail(formData)       // Email/password login
getGoogleOAuthUrl()            // Get Google OAuth URL
logout()                       // Sign out user
```

### Onboarding (`app/actions/onboarding.ts`)
```typescript
completeOnboarding(formData)   // Save vendor info & generate slug
```

## 🛣️ Route Protection Logic

### Middleware Rules (`middleware.ts`)

1. **Unauthenticated user → Protected route**
   - Redirect to `/login`

2. **Authenticated user → Auth route** (`/login`, `/signup`)
   - Check if onboarding complete
   - Redirect to `/dashboard` (complete) or `/onboarding` (incomplete)

3. **Authenticated user → `/onboarding`**
   - Check if already completed onboarding
   - Redirect to `/dashboard` if complete

## 🗃️ Database Helpers

### Check if vendor has completed onboarding:
```typescript
const { data: vendor } = await supabase
  .from('vendors')
  .select('id')
  .eq('user_id', user.id)
  .single()

const hasCompletedOnboarding = !!vendor
```

### Get vendor data:
```typescript
const { data: vendor } = await supabase
  .from('vendors')
  .select('*')
  .eq('user_id', user.id)
  .single()
```

## 🎨 Design Tokens

### Colors
- Primary Green: `green-600` (#10b981)
- Hover Green: `green-700`
- Light Green: `green-50`
- Error: `red-600`
- Gray text: `gray-600`

### Common Classes
```css
/* Buttons */
.btn-primary: bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg
.btn-secondary: border-2 border-green-600 text-green-600 hover:bg-green-50

/* Cards */
.card: bg-white rounded-2xl shadow-lg p-8

/* Inputs */
.input: border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500
```

## 🔧 Common Tasks

### Add a new protected route:
1. Add route to `protectedRoutes` array in `middleware.ts`
2. Create page component
3. Fetch user session in component

### Add a new field to vendors table:
1. Add column in Supabase SQL editor
2. Update `types/database.ts`
3. Update onboarding form and action

### Update Google OAuth settings:
1. Supabase Dashboard → Authentication → Providers
2. Add/update redirect URLs
3. Update Google Cloud Console OAuth settings

## 🐛 Common Issues & Solutions

### "Not authenticated" error
- Check if user session exists
- Verify middleware is refreshing session
- Check RLS policies in Supabase

### OAuth redirect fails
- Verify redirect URL in Supabase settings
- Check Google OAuth credentials
- Ensure callback route exists at `/auth/callback`

### User stuck on onboarding
- Check if vendor record was created
- Verify RLS policies allow insert
- Check for unique constraint violations (slug)

### Slug conflicts
- The system auto-appends numbers (e.g., store-1, store-2)
- Check `generateUniqueSlug()` in `app/actions/onboarding.ts`

## 📊 Environment Variables

Required:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 🚀 Deployment Checklist

- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Enable Google OAuth (if needed)
- [ ] Add environment variables to Vercel
- [ ] Add production URL to Supabase redirect URLs
- [ ] Update Google OAuth redirect URLs (if using)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test onboarding flow
- [ ] Verify route protection works

## 📝 Next Features to Build

1. **Product Management**
   - Add products table
   - Image upload (Supabase Storage)
   - CRUD operations

2. **Customer Catalog View**
   - Public catalog page at `/:slug`
   - Product listing
   - Search/filter

3. **Shopping Cart**
   - Cart state management
   - Cart sharing via WhatsApp
   - Order summary

4. **WhatsApp Integration**
   - Direct WhatsApp link with pre-filled message
   - Share catalog button
   - Order confirmation messages
