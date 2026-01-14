# 🚀 Vercel Deployment Guide

## Prerequisites ✅
- Supabase project with database configured
- GitHub account
- Vercel account (free tier works)

---

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes ☕
8. Done! Your app is live 🎉

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts and add environment variables when asked.

---

## Environment Variables Setup

### Get Your Supabase Credentials
1. Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Add to Vercel
**Via Dashboard:**
- Project Settings → **Environment Variables**
- Add both variables
- Apply to: Production, Preview, Development

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Database Setup (Required Before First Use)

Run these SQL files in Supabase SQL Editor **in order**:

### 1. Core Schema
```bash
supabase/schema.sql
```

### 2. Products Schema
```bash
supabase/products_schema_complete.sql
```

### 3. Cart & Analytics
```bash
supabase/cart_and_analytics_schema.sql
```

### 4. Vendor Profile Fields
```bash
supabase/add_vendor_profile_fields.sql
```

### 5. Storage Bucket
```bash
supabase/fix_vendor_logos_bucket.sql
```

---

## Post-Deployment Checklist

### Verify Deployment ✅
- [ ] Visit your Vercel URL
- [ ] Sign up page loads
- [ ] Login works
- [ ] Dashboard accessible after login
- [ ] Product upload works
- [ ] Store page displays correctly
- [ ] Cart functionality works
- [ ] Vendor profile updates save

### Test Features ✅
- [ ] Create vendor account
- [ ] Upload business logo
- [ ] Add products
- [ ] View public store page
- [ ] Test cart recovery
- [ ] Check mobile responsiveness

### Monitor ✅
- [ ] Check Vercel deployment logs
- [ ] Check Supabase database logs
- [ ] Monitor error tracking
- [ ] Check storage usage

---

## Domain Setup (Optional)

### Custom Domain
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Update DNS records as shown
4. Wait for DNS propagation (5-30 min)
5. SSL auto-configured ✅

---

## Troubleshooting

### Build Fails
**Error:** "Module not found"
```bash
npm install
npm run build
```
Fix locally first, then push.

**Error:** "Environment variables not found"
- Add env vars in Vercel dashboard
- Redeploy

### Runtime Errors
**Supabase connection fails:**
- Check env vars are correct
- Verify Supabase project is active
- Check API keys haven't expired

**Images don't load:**
- Verify `vendor-logos` bucket exists
- Check bucket is public
- Run `fix_vendor_logos_bucket.sql`

**404 on routes:**
- Ensure middleware.ts is present
- Check next.config.ts is correct
- Redeploy

### Performance Issues
**Slow page loads:**
- Enable Vercel Edge caching
- Optimize images (already done)
- Check Supabase region (closer = faster)

**High bandwidth:**
- Images are compressed automatically
- Use Supabase CDN (already configured)

---

## Vercel-Specific Settings

### Recommended Configuration

**Framework:** Next.js  
**Node Version:** 18.x (default)  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`  
**Development Command:** `npm run dev`

### Performance Optimizations

**Edge Functions:** Enabled (automatic)  
**Image Optimization:** Enabled (automatic)  
**Compression:** Enabled (automatic)  
**Analytics:** Optional (free tier available)

---

## Continuous Deployment

### Auto-Deploy on Push
Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

**Preview URLs:**
- Every branch gets a preview URL
- PRs get automatic preview deployments
- Production deploys only from `main` branch

### Manual Deployment
```bash
vercel --prod
```

---

## Environment Types

### Production
- URL: `your-app.vercel.app` or custom domain
- Env: Production environment variables
- Branch: `main`

### Preview
- URL: `your-app-git-branch-name.vercel.app`
- Env: Preview environment variables
- Branch: Any non-main branch

### Development
- URL: `localhost:3000`
- Env: `.env.local` file
- Local machine only

---

## Cost Optimization

### Free Tier Includes:
✅ Unlimited deployments  
✅ 100GB bandwidth/month  
✅ Automatic HTTPS  
✅ Edge network (CDN)  
✅ Preview deployments  
✅ Analytics (basic)  

### Keep Costs Down:
- Compress images (already done)
- Use Supabase free tier (500MB database)
- Monitor bandwidth usage
- Optimize queries

---

## Security Checklist

### Before Going Live ✅
- [ ] Environment variables in Vercel (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase RLS policies enabled
- [ ] API keys are public `anon` key only
- [ ] No sensitive data in client code
- [ ] HTTPS enforced (automatic)
- [ ] CORS configured in Supabase

---

## Monitoring & Logs

### Vercel Logs
**View Real-time:**
- Dashboard → Deployments → Select deployment → View Function Logs

**CLI:**
```bash
vercel logs
```

### Supabase Logs
- Dashboard → Logs → Select log type
- Monitor API requests
- Track database queries
- Check storage access

---

## Rollback Strategy

### Revert to Previous Deployment
1. Vercel Dashboard → Deployments
2. Find working deployment
3. Click **"Promote to Production"**
4. Instant rollback ✅

### Git-Based Rollback
```bash
git revert HEAD
git push
```

---

## Support & Resources

### Official Docs
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Common Issues
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
- [Vercel Support](https://vercel.com/support)

---

## Summary

**Your app is ready for Vercel! ✅**

**What's configured:**
✅ Build command optimized  
✅ Production build successful  
✅ Suspense boundaries fixed  
✅ Environment variables template  
✅ Vercel config created  
✅ Git ignore proper  

**Next steps:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!
5. Run database migrations

**Total time:** ~10 minutes from code to live URL 🚀
