# 🚀 Supabase Quick Start Guide

Get your Spiritual Recovery Toolkit running with cloud storage in 10 minutes!

## Step 1: Create Supabase Account (2 min)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

## Step 2: Create Project (3 min)

1. Click "New Project"
2. Fill in:
   - **Name**: `spiritual-recovery-toolkit`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is perfect
3. Click "Create new project"
4. ☕ Wait 2-3 minutes for setup

## Step 3: Run Database Schema (1 min)

1. In Supabase dashboard, click **SQL Editor** (sidebar)
2. Click **"+ New query"**
3. Open `supabase-schema.sql` from this project
4. Copy ALL the SQL and paste into the editor
5. Click **"Run"** (or Cmd/Ctrl + Enter)
6. ✅ Should see "Success. No rows returned"

## Step 4: Get Your Credentials (1 min)

1. Click **Settings** (gear icon in sidebar)
2. Click **API**
3. Copy two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon key**: Long string under "anon public"

## Step 5: Create .env File (1 min)

1. In your project root, create a file named `.env`
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 6: Start the App (1 min)

```bash
npm run dev
```

🎉 **Done!** The app will now:
- Show a sign-up/login screen
- Store all data in Supabase
- Sync across devices
- Keep your data secure with authentication

## What You Get

✅ **Cloud Storage** - Access from any device
✅ **Authentication** - Secure user accounts
✅ **Data Sync** - Real-time synchronization  
✅ **Backups** - Automatic database backups
✅ **Privacy** - Row-level security (only you see your data)

## Troubleshooting

### "Can't connect to Supabase"
- Check `.env` file has correct URL and key
- Restart dev server: stop (Ctrl+C) and run `npm run dev` again

### "Tables don't exist"
- Go to Supabase → SQL Editor
- Run the `supabase-schema.sql` again

### "Can't sign up"
- Check Authentication → Providers in Supabase
- Make sure Email provider is enabled

## Switch Back to localStorage

Want to go back to local storage?

1. Delete or rename the `.env` file
2. Restart the dev server

The app automatically detects which mode to use!

## Next Steps

- [x] ✅ Create Supabase project
- [x] ✅ Run database schema
- [x] ✅ Configure `.env` file
- [x] ✅ Start the app
- [ ] Create your account
- [ ] Start journaling!

## Need Help?

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Full Setup Guide**: See `SUPABASE_SETUP.md`
- **Issues?**: Check browser console for errors

---

**Remember**: Your `.env` file contains sensitive credentials. Never commit it to git!


