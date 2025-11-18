# 🚀 Supabase Setup Guide

This guide will help you set up Supabase as the backend for your Spiritual Recovery Toolkit.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in the project details:
   - **Name**: `spiritual-recovery-toolkit` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier works great for personal use
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be set up

## Step 3: Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"+ New query"**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

## Step 4: Get Your API Credentials

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. You'll need two values:
   - **Project URL**: Copy the URL under "Project URL"
   - **Anon/Public Key**: Copy the key under "Project API keys" → "anon public"

## Step 5: Configure Your App

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 6: Enable Email Authentication (Optional)

If you want email/password authentication:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (it's usually enabled by default)
3. Optionally configure email templates under **Authentication** → **Email Templates**

## Step 7: Test Your Setup

1. Restart your dev server:
```bash
npm run dev
```

2. Open the app in your browser
3. You should see a login/signup screen
4. Create an account to test
5. Try adding a journal entry or marking a step complete
6. Check your Supabase dashboard → **Table Editor** to see the data!

## Verification Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] API credentials copied to `.env` file
- [ ] Dev server restarted
- [ ] Can create an account
- [ ] Can add journal entries
- [ ] Can mark steps complete
- [ ] Data appears in Supabase dashboard

## Database Tables Overview

Your Supabase database now has these tables:

1. **profiles** - User profile information
2. **journal_entries** - All journal entries with prompts and content
3. **step_progress** - Progress tracking for the 12 steps
4. **weekly_progress** - Progress tracking for the 12-week plan

## Security Features

✅ **Row Level Security (RLS)** - Users can only see and modify their own data
✅ **Authentication** - Secure user authentication via Supabase Auth
✅ **Encrypted Connections** - All data transmitted over HTTPS
✅ **Automatic Backups** - Supabase automatically backs up your database

## Troubleshooting

### Can't connect to Supabase?
- Double-check your `.env` file has the correct URL and key
- Make sure you restarted the dev server after adding credentials
- Verify the credentials in Supabase dashboard → Settings → API

### Tables not created?
- Go to Supabase → SQL Editor
- Run the `supabase-schema.sql` again
- Check for any error messages in the SQL editor

### Can't sign up?
- Check that Email authentication is enabled in Authentication → Providers
- Check browser console for errors
- Verify your internet connection

### Data not saving?
- Check browser console for errors
- Verify you're logged in
- Check Supabase dashboard → Authentication to see if user exists
- Try the Table Editor to manually verify data

## Migration from localStorage

If you have existing data in localStorage:

1. Before updating the app, export your data using the Settings menu
2. After Supabase is set up, you can manually import data or write a migration script
3. The old localStorage data remains accessible if you need it

## Next Steps

Once setup is complete, you can:

- [ ] Invite others to use the app (each gets their own private data)
- [ ] Access your data from any device
- [ ] Set up automatic daily backups
- [ ] Customize authentication (email templates, social auth, etc.)
- [ ] Deploy to production (Vercel, Netlify, etc.)

## Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **Project Issues**: Check the browser console for errors

---

**Important**: Keep your `.env` file secure and never commit it to git. The `.gitignore` file is already configured to exclude it.



