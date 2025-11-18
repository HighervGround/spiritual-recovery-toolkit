# 🧘‍♂️ Cole's Spiritual Recovery Toolkit

A comprehensive, modern web application for spiritual recovery and personal growth, featuring trauma-informed guidance through the 12 Steps, weekly planning, and journaling capabilities.

## ✨ Features

### 📖 Twelve-Step Workbook
- **Complete 12-Step Program**: Detailed guidance through all 12 steps with modern, trauma-informed perspectives
- **Progress Tracking**: Mark steps as completed and track your journey with a visual progress bar
- **Personal Notes**: Add and edit private notes for each step to record your reflections and insights
- **Joseph Murphy Practices**: Includes affirmations, visualization, revision, mental diet, and self-concept work
- **Expandable Content**: Each step includes overview, core principles, reflection questions, and practices

### 🗓️ 12-Week Spiritual Plan
- **Structured Timeline**: Week-by-week breakdown of working through the steps over 12 weeks
- **Week Completion Tracking**: Mark weeks as completed with visual indicators
- **Daily Practices**: Specific guidance for morning and evening routines
- **Affirmations & Grounding**: Weekly affirmations and grounding exercises
- **Progress Visualization**: Track your weekly progress with a progress bar

### 📔 Spiritual Journal
- **Multiple Entry Types**: Free write, daily prompts, or weekly reflection prompts
- **Prompt Library**: 
  - 8 daily reflection prompts
  - 7 weekly reflection prompts
  - 15 healing affirmations
- **Entry Management**: Save, view, and delete journal entries with timestamps
- **Organized Display**: Entries sorted by date with color-coded types
- **Rich Text Support**: Preserve formatting with multi-line text support

### 💾 Data Management & Backup
- **Dual Storage Options**: Choose between localStorage (default) or Supabase (cloud)
- **Automatic Detection**: App automatically uses Supabase if configured
- **Cloud Sync**: With Supabase, access your data from any device
- **Export Data**: Download all your journal entries, notes, and progress as a JSON backup file
- **Import Data**: Restore your data from a backup file
- **Clear Data**: Option to reset and start fresh (with double confirmation)
- **Persistent Storage**: Your data persists across sessions

### 🎨 Modern UI/UX
- **Beautiful Design**: Gradient backgrounds, smooth animations, and thoughtful color coding
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Sticky Navigation**: Easy access to all sections with persistent header
- **Visual Feedback**: Completion indicators, hover effects, and state transitions
- **Accessible**: Semantic HTML and keyboard-friendly navigation

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Option 1: Run with Local Storage (Default)

```bash
npm run dev
```

The app will use localStorage for data persistence (no setup needed).

### Option 2: Run with Supabase Backend (Cloud Storage)

1. **Create a Supabase project** (see `SUPABASE_SETUP.md`)
2. **Create a `.env` file** in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. **Run the database schema** (copy `supabase-schema.sql` to Supabase SQL Editor)
4. **Start the app**:
```bash
npm run dev
```

The app automatically detects Supabase configuration and switches to cloud storage!

### Building for Production

```bash
npm run build
```

## 💡 How to Use

### 1. Working with the Workbook
- Click on any step to expand and read the full content
- Click the circle with the step number to mark it as complete
- Click "Add Notes" to record your personal reflections
- Your progress is automatically saved

### 2. Following the 12-Week Plan
- Click the week number circle to mark a week as complete
- Use the daily practices as a guide for your routine
- Completed weeks show a green checkmark

### 3. Journaling
- Choose between Free Write, Daily Prompt, or Weekly Prompt
- Select a prompt (if using prompts) or write freely
- Your entries are automatically saved with timestamps
- View all previous entries below the entry form

### 4. Managing Your Data
- Click "Settings" in the header to access data management
- **Export regularly** to keep backups of your work
- Import a backup file to restore previous data
- Clear all data if you want to start fresh

## 🔒 Privacy & Data Storage

### localStorage Mode (Default)
- **100% Private**: All data is stored locally in your browser
- **No Server**: Nothing is sent to any server or third party
- **Your Data, Your Control**: Export, import, or delete your data at any time
- **Secure**: Only accessible from your browser on your device

### Supabase Mode (Optional Cloud Storage)
- **Encrypted**: All data transmitted over HTTPS
- **Row Level Security**: Only you can access your data
- **Multi-Device**: Access from any device with your account
- **Automatic Backups**: Supabase handles database backups
- **Open Source**: Supabase is open source and transparent

👉 **Want cloud storage?** See `SUPABASE_SETUP.md` for setup instructions

## 🛠️ Technology Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Supabase** - Optional cloud backend (PostgreSQL + Auth)
- **localStorage** - Default client-side storage

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.tsx            # Authentication component
│   ├── Workbook.tsx        # 12-Step workbook component
│   ├── WeeklyPlan.tsx      # 12-Week plan component
│   ├── Journal.tsx         # Journaling component
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── storage.ts          # localStorage utilities
│   ├── supabase.ts         # Supabase client config
│   └── supabaseStorage.ts  # Supabase storage layer
├── App.tsx                 # Main app component with auth
└── main.tsx               # App entry point
```

## 🤝 Contributing

This is a personal toolkit, but you're welcome to fork it and customize it for your own use!

## 📄 License

This project is for personal use.

## 🙏 Acknowledgments

- Original design concept from [Figma](https://www.figma.com/design/FTp6lc5DcI4G3i7zW5koxV/Spiritual-Recovery-Toolkit)
- Inspired by traditional 12-Step programs with modern, trauma-informed adaptations
- Joseph Murphy's subconscious mind teachings

---

**Remember**: Recovery is a journey, not a destination. Be gentle with yourself. Take your time. You are worthy of healing and peace. 💙