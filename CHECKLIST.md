# 🚀 Pre-Launch Checklist

Use this checklist to ensure everything is set up correctly before launching.

## ☑️ Initial Setup

- [ ] Node.js 18+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Supabase account created
- [ ] Supabase project created

## ☑️ Database Configuration

- [ ] Opened Supabase SQL Editor
- [ ] Executed `supabase/schema.sql`
- [ ] Verified `vendors` table exists
- [ ] Checked Row Level Security is enabled
- [ ] Verified policies are active

## ☑️ Environment Variables

- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Values match Supabase project settings
- [ ] No trailing slashes in URL

## ☑️ Authentication Setup

- [ ] Email provider enabled in Supabase (default)
- [ ] Email templates configured (optional)
- [ ] Google OAuth enabled (if needed)
- [ ] Google OAuth credentials added (if needed)
- [ ] Redirect URLs configured correctly

## ☑️ Local Testing

- [ ] Dev server starts (`npm run dev`)
- [ ] Landing page loads at http://localhost:3000
- [ ] Signup page accessible at /signup
- [ ] Login page accessible at /login
- [ ] No console errors
- [ ] No build errors

## ☑️ Signup Flow Test

- [ ] Can access signup page
- [ ] Email/password signup works
- [ ] Redirects to onboarding after signup
- [ ] Onboarding form appears
- [ ] Can submit onboarding form
- [ ] Store name accepted
- [ ] WhatsApp number accepted
- [ ] Redirects to dashboard
- [ ] Dashboard shows vendor info
- [ ] Unique slug generated correctly

## ☑️ Login Flow Test

- [ ] Can access login page
- [ ] Email/password login works
- [ ] Redirects to dashboard (if onboarding complete)
- [ ] Shows vendor info on dashboard
- [ ] Logout button works
- [ ] Redirects to login after logout

## ☑️ Google OAuth Test (if enabled)

- [ ] Google button appears
- [ ] Clicking redirects to Google
- [ ] Can authorize with Google account
- [ ] Redirects back to app
- [ ] Creates user session
- [ ] Redirects to onboarding (first time)
- [ ] Redirects to dashboard (subsequent)

## ☑️ Route Protection Test

- [ ] Cannot access /dashboard without login
- [ ] Cannot access /onboarding without login
- [ ] Redirects to /login when unauthenticated
- [ ] Cannot access /login when logged in
- [ ] Cannot access /signup when logged in
- [ ] Redirects work correctly

## ☑️ Database Test

- [ ] Vendor record created in database
- [ ] User ID matches auth.users
- [ ] Slug is unique and URL-friendly
- [ ] Store name saved correctly
- [ ] WhatsApp number saved correctly
- [ ] Description saved (if provided)
- [ ] Timestamps populated
- [ ] Can view vendor in Supabase Table Editor

## ☑️ Error Handling Test

- [ ] Invalid email shows error
- [ ] Short password shows error
- [ ] Wrong password shows error
- [ ] Non-existent user shows error
- [ ] Required fields validated
- [ ] Network errors handled
- [ ] Error messages user-friendly

## ☑️ Mobile Responsiveness

- [ ] Landing page mobile-friendly
- [ ] Signup form mobile-friendly
- [ ] Login form mobile-friendly
- [ ] Onboarding form mobile-friendly
- [ ] Dashboard mobile-friendly
- [ ] Buttons clickable on mobile
- [ ] Text readable on mobile

## ☑️ Production Preparation

- [ ] Environment variables ready for production
- [ ] Supabase production URL configured
- [ ] OAuth redirect URLs updated
- [ ] Google OAuth credentials production-ready
- [ ] Vercel project created (if deploying to Vercel)
- [ ] Domain configured (if custom domain)

## ☑️ Deployment (Vercel)

- [ ] Code pushed to GitHub
- [ ] Vercel project connected
- [ ] Environment variables added to Vercel
- [ ] Build successful
- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] Signup flow tested on production
- [ ] Login flow tested on production
- [ ] OAuth tested on production

## ☑️ Post-Deployment

- [ ] Production URL added to Supabase redirect URLs
- [ ] Google OAuth redirect URL updated (if using)
- [ ] Test complete user flow on production
- [ ] Monitor for errors
- [ ] Check database for test records
- [ ] Email delivery working (check spam)

## ☑️ Security Review

- [ ] No API keys in frontend code
- [ ] RLS policies tested
- [ ] Can't access other vendors' data
- [ ] Server actions properly secured
- [ ] Middleware protecting routes
- [ ] No sensitive data in logs

## ☑️ Performance Check

- [ ] Pages load quickly
- [ ] No unnecessary re-renders
- [ ] Images optimized (when added later)
- [ ] Database queries optimized
- [ ] No console warnings

## 🐛 Common Issues Solutions

### Issue: "Not authenticated" error
- Check if session exists in cookies
- Verify middleware is working
- Clear cookies and try again

### Issue: OAuth redirect fails
- Check redirect URL matches exactly
- Verify Google OAuth credentials
- Check Supabase OAuth settings

### Issue: Slug conflicts
- System should auto-increment (store-1, store-2)
- Check generateUniqueSlug function
- Verify database constraint

### Issue: Can't save vendor data
- Check RLS policies
- Verify user is authenticated
- Check required fields filled
- View Supabase logs

### Issue: Build fails
- Check all imports correct
- Verify environment variables
- Run `npm install` again
- Check TypeScript errors

---

**Pro Tip**: Test each section thoroughly before moving to the next!

**Status**: Ready when all boxes checked ✅
