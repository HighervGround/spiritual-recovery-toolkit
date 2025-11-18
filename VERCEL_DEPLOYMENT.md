# 🚀 Deploy to Vercel - Complete Guide

Deploy your Spiritual Recovery Toolkit to Vercel in minutes!

## Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at [vercel.com](https://vercel.com))
- [x] Your code pushed to GitHub
- [x] Supabase project set up (optional but recommended)

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Spiritual Recovery Toolkit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/spiritual-recovery-toolkit.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**:
   - Select your GitHub account
   - Find "spiritual-recovery-toolkit"
   - Click "Import"

### Step 3: Configure Environment Variables

⚠️ **Important**: Add your Supabase credentials in Vercel

1. In the Vercel import screen, click **"Environment Variables"**
2. Add these variables:

```
VITE_SUPABASE_URL = https://qrgjmxxlqlazebthkylc.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZ2pteHhscWxhemVidGhreWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mzc0MjUsImV4cCI6MjA3OTAxMzQyNX0.LOxTq8shbHe5Cn0ZgZuDgK7fIxLJzemr5lEJY5M4ToU
```

3. Make sure to add them for **all environments** (Production, Preview, Development)

### Step 4: Deploy!

1. Click **"Deploy"**
2. ☕ Wait 2-3 minutes for the build
3. 🎉 Your app is live!

## After Deployment

Your app will be available at: `https://your-project-name.vercel.app`

### What to Do Next:

1. **Test your live app**
   - Try creating an account
   - Add a journal entry
   - Test all features

2. **Set up a custom domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain

3. **Configure Supabase** (if using)
   - Add your Vercel domain to Supabase allowed URLs
   - Go to Authentication → URL Configuration
   - Add `https://your-project-name.vercel.app`

## Build Configuration

The project is already configured for Vercel:

- ✅ `vercel.json` - Routing configuration
- ✅ `vite.config.ts` - Build settings
- ✅ `package.json` - Build scripts

### Build Settings (Auto-detected by Vercel):

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes (for cloud storage) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes (for cloud storage) |

⚠️ **Note**: If you don't set these variables, the app will automatically use localStorage instead.

## Troubleshooting

### Build Fails

**Check the build logs in Vercel**:
- Common issue: Missing dependencies
- Solution: Make sure `package.json` has all dependencies

### Environment Variables Not Working

**Make sure you:**
- Added them to ALL environments (Production, Preview, Development)
- Named them exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeployed after adding them

### "Network Error" or Can't Login

**Check Supabase settings:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add your Vercel URL to "Redirect URLs"

### App Shows localStorage Mode Instead of Supabase

**This means environment variables aren't set:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy: Deployments → Click "..." → "Redeploy"

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:

✅ **Deploy on every push to main** - Production deployment
✅ **Deploy preview for PRs** - Test before merging
✅ **Build previews for branches** - See changes live

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd "/Users/cole.guyton/Downloads/Spiritual Recovery Toolkit"
vercel

# Follow the prompts
# Add environment variables when asked
```

## Custom Domain Setup

1. **Buy a domain** (from Namecheap, Google Domains, etc.)
2. **In Vercel**:
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain name
   - Follow the DNS setup instructions
3. **Update Supabase**:
   - Add your custom domain to Supabase URL Configuration

## Security Best Practices

✅ **Environment Variables**: Never commit `.env` to git (already in `.gitignore`)
✅ **HTTPS**: Vercel provides automatic HTTPS
✅ **Supabase RLS**: Row Level Security protects your data
✅ **API Keys**: Anon key is safe to expose (it's public)

## Monitoring & Analytics

Vercel provides:
- 📊 Analytics (visits, performance)
- 📈 Web Vitals (Core Web Vitals)
- 🔍 Logs (real-time deployment logs)
- 🚨 Error tracking

Access them in: Dashboard → Your Project → Analytics

## Production Checklist

Before going live:

- [ ] Supabase database schema is set up
- [ ] Environment variables added in Vercel
- [ ] Test account creation works
- [ ] Test journal entry creation
- [ ] Test progress tracking
- [ ] Test data export/import
- [ ] Add your custom domain (optional)
- [ ] Update Supabase URL configuration
- [ ] Test on mobile devices

## Cost

### Vercel:
- **Free Tier**: Perfect for personal use
  - Unlimited deployments
  - Automatic HTTPS
  - 100GB bandwidth/month
  - Built-in CI/CD

### Supabase:
- **Free Tier**: Great for personal apps
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - 2GB bandwidth

Both free tiers are more than enough for personal use! 🎉

## Updating Your Deployment

### Push Changes:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel automatically redeploys! ✨

### Force Redeploy:
1. Go to Vercel Dashboard
2. Click your project
3. Deployments → Latest → "..." → "Redeploy"

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **Issues?**: Check deployment logs in Vercel dashboard

## Summary

Your deployment is:
- 🚀 **Fast**: Global CDN, instant loading
- 🔒 **Secure**: Automatic HTTPS, environment variables
- 🆓 **Free**: Hobby tier perfect for personal use
- 🔄 **Automatic**: Deploy on every git push
- 📱 **Responsive**: Works on all devices

---

**You're all set!** Push to GitHub and deploy to Vercel. Your spiritual journey goes live! 💙

