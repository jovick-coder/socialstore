# 🔧 Fix Google Sign-In Redirect on Production

## Problem
Google Sign-In is redirecting to `localhost:3000` instead of your production Vercel URL.

**Root Cause:** The redirect URI is configured in **Google Cloud Console**, NOT Supabase.

---

## Solution: Update Google Cloud Console

### Step 1: Get Your Vercel URL
1. Go to [vercel.com](https://vercel.com) → Your Project
2. Copy your production URL (e.g., `https://socialstore.vercel.app`)

### Step 2: Update Google Cloud Console ⭐
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (type: Web application)
5. Click on it to edit
6. Under **Authorized redirect URIs**, you'll see:
   ```
   http://localhost:3000/auth/callback
   ```
7. **Add both URLs** (keep localhost for local testing):
   ```
   http://localhost:3000/auth/callback
   https://socialstore.vercel.app/auth/callback
   ```
   (Replace `socialstore` with your actual Vercel URL)
8. Click **SAVE**

### Step 3: Update Vercel Environment Variables
1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Update: `NEXT_PUBLIC_APP_URL`
   - **Old value:** `http://localhost:3000`
   - **New value:** `https://socialstore.vercel.app`
3. Click **SAVE**
4. **Trigger redeploy:**
   ```bash
   git push origin main
   ```
   OR manually click **Redeploy** on latest commit

---

## Step-by-Step with Pictures

### In Google Cloud Console:
1. **APIs & Services** → **Credentials**
2. Find your **OAuth 2.0 Client ID** (Web application)
3. Click to edit
4. Scroll to **Authorized redirect URIs**
5. Update to include BOTH:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-url.vercel.app/auth/callback`
6. **Click SAVE**

### In Vercel:
1. **Project Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Change value to your Vercel URL
4. **Click SAVE**
5. **Redeploy** (push to main or click Redeploy button)

---

## Testing

### Local Development
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
npm run dev
```
Google Sign-In → Should work and redirect to localhost ✅

### Production
```
Visit: https://your-vercel-url.vercel.app
Google Sign-In → Should work and redirect to your production URL ✅
```

---

## Checklist

- [ ] Get your Vercel production URL
- [ ] Open Google Cloud Console
- [ ] Find OAuth 2.0 Client ID
- [ ] Add/Update redirect URIs (both localhost and production)
- [ ] Click SAVE in Google Cloud
- [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel
- [ ] Redeploy (git push or manual redeploy)
- [ ] Wait 2-3 minutes for deployment
- [ ] Test Google Sign-In on production

---

## If Still Not Working

### Debug Checklist
1. **Verify Google Cloud changes saved:**
   - Google Cloud Console → Credentials → Click client ID
   - Confirm both URLs are listed
   - Refresh the page to double-check

2. **Check Vercel deployment:**
   - Vercel Deployments → Click latest
   - Status should say "Deployment Successful"
   - Check timestamp to confirm it's recent

3. **Verify environment variable:**
   - Vercel Settings → Environment Variables
   - Confirm `NEXT_PUBLIC_APP_URL` shows your production URL
   - If recently changed, click "Redeploy" button

4. **Clear browser cache:**
   - Open DevTools: F12
   - Right-click refresh button → "Empty cache and hard refresh"
   - Try Google Sign-In again

5. **Check callback route works:**
   - Visit: `https://your-vercel-url.vercel.app/auth/callback?code=test`
   - Should not show 404 error

---

## Common Issues

### Issue: "Redirect URI mismatch" Error
**Solution:** Make sure URLs match EXACTLY:
- ✅ Correct: `https://socialstore.vercel.app/auth/callback`
- ❌ Wrong: `https://socialstore.vercel.app/auth/callback/`
- ❌ Wrong: `https://socialstore.vercel.app/auth/` (missing callback)
- No trailing slashes
- Exact protocol (https for production)

### Issue: Still redirects to localhost after redeploy
**Solution:**
1. Hard clear browser cache (Ctrl+Shift+Delete)
2. Wait 5 minutes (Vercel cache)
3. Try incognito window (bypasses cache)
4. Refresh Google Cloud console to confirm save
5. Check Vercel deployment is complete

### Issue: Works on localhost but not on production
**Solution:**
1. Verify Vercel URL is correct in browser
2. Confirm Google Cloud has production URL added
3. Make sure latest Vercel deployment shows "Success"
4. Try different browser or incognito mode
5. Check `NEXT_PUBLIC_APP_URL` is set in Vercel

### Issue: OAuth Client ID not found
**Solution:**
1. Google Cloud Console → APIs & Services
2. Make sure you have **OAuth 2.0 Client IDs** listed
3. If not, go to **Create Credentials** → Create new OAuth 2.0 ID
4. Choose "Web application"
5. Add redirect URIs as above

---

## Summary

**The Issue:** Google's OAuth is configured to only accept `localhost:3000`  
**The Fix:** Add your production URL to Google Cloud Console  
**Location:** Google Cloud Console → APIs & Services → Credentials  

**Redirect URIs to add:**
```
http://localhost:3000/auth/callback          (development)
https://your-vercel-url.vercel.app/auth/callback    (production)
```

**Then:** Update Vercel env var and redeploy

**Time to fix:** ~5 minutes ⏱️
