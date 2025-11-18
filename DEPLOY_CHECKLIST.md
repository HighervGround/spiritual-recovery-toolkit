# 🚀 Vercel Deployment Checklist

Follow these steps in order for a smooth deployment!

## Before You Deploy

### 1. Prepare Your Code
- [ ] All changes committed to git
- [ ] Code is working locally (`npm run dev`)
- [ ] No console errors
- [ ] Supabase database schema is set up

### 2. Create GitHub Repository
```bash
# If not already done:
git init
git add .
git commit -m "Initial commit"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/spiritual-recovery-toolkit.git
git branch -M main
git push -u origin main
```

## Deploy to Vercel

### 3. Sign Up & Import
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository

### 4. Configure Environment Variables

**⚠️ CRITICAL**: Add these in Vercel before deploying

```
Name: VITE_SUPABASE_URL
Value: https://qrgjmxxlqlazebthkylc.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZ2pteHhscWxhemVidGhreWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mzc0MjUsImV4cCI6MjA3OTAxMzQyNX0.LOxTq8shbHe5Cn0ZgZuDgK7fIxLJzemr5lEJY5M4ToU
```

✅ Add to: Production, Preview, and Development

### 5. Deploy
- Click "Deploy"
- Wait for build (2-3 minutes)
- 🎉 Your app is live!

## After Deployment

### 6. Update Supabase Configuration
1. Go to [Supabase Dashboard](https://app.supabase.com/project/qrgjmxxlqlazebthkylc)
2. Navigate to: **Authentication** → **URL Configuration**
3. Add your Vercel URL:
   - **Site URL**: `https://your-project-name.vercel.app`
   - **Redirect URLs**: `https://your-project-name.vercel.app/**`

### 7. Test Your Deployment
- [ ] Visit your live URL
- [ ] Create a test account
- [ ] Add a journal entry
- [ ] Mark a step complete
- [ ] Test export functionality
- [ ] Sign out and sign back in
- [ ] Test on mobile device

## Troubleshooting

### Build Failed?
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Try building locally: `npm run build`

### Can't Login?
- Check environment variables are set
- Check Supabase URL configuration
- Look at browser console for errors

### Shows localStorage Instead of Supabase?
- Environment variables not set correctly
- Redeploy after adding variables
- Check variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Your URLs

- **Local Dev**: http://localhost:3000
- **Vercel URL**: https://your-project-name.vercel.app (get this after deploying)
- **Supabase**: https://qrgjmxxlqlazebthkylc.supabase.co

## Quick Commands

```bash
# Test build locally
npm run build

# Preview production build locally
npm run preview

# Push changes (triggers auto-deploy)
git add .
git commit -m "Update message"
git push
```

## Support

See `VERCEL_DEPLOYMENT.md` for detailed instructions and troubleshooting.

---

**Ready to deploy?** Follow the checklist above! 🚀

