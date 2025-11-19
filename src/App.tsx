import { useState, useRef, useEffect } from 'react';
import { Workbook } from './components/Workbook';
import { WeeklyPlan } from './components/WeeklyPlan';
import { Journal } from './components/Journal';
import { Auth } from './components/Auth';
import { BookOpen, Calendar, NotebookPen, Download, Upload, Settings, Trash2, X, LogOut, Cloud, HardDrive } from 'lucide-react';
import { storage } from './lib/storage';
import { supabaseStorage } from './lib/supabaseStorage';
import { supabase } from './lib/supabase';
import type { StorageBackend } from './lib/storageBackend';

export default function App() {
  const [activeSection, setActiveSection] = useState<'workbook' | 'plan' | 'journal'>('workbook');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the appropriate storage based on mode
  const storageBackend: StorageBackend = useSupabase ? supabaseStorage : storage;

  // Check for Supabase configuration and auth state
  useEffect(() => {
    const checkAuth = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Check if Supabase is configured
      if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url') {
        setUseSupabase(true);
        
        // Check current auth state
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // No Supabase config, use localStorage
        setUseSupabase(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleExport = async () => {
    try {
      const data = useSupabase ? await supabaseStorage.exportData() : storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spiritual-recovery-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting data. Please try again.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const success = useSupabase 
          ? await supabaseStorage.importData(content)
          : storage.importData(content);
        if (success) {
          alert('Data imported successfully! Please refresh the page to see your imported data.');
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        alert('Error reading file. Please try again.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to delete ALL your data? This action cannot be undone. Consider exporting your data first as a backup.')) {
      if (confirm('This will permanently delete all journal entries, notes, and progress. Are you absolutely sure?')) {
        try {
          if (useSupabase) {
            await supabaseStorage.clearAllData();
          } else {
            storage.clearAllData();
          }
          alert('All data has been cleared. The page will now refresh.');
          window.location.reload();
        } catch (error) {
          alert('Error clearing data. Please try again.');
        }
      }
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await supabaseStorage.signOut();
        setUser(null);
      } catch (error) {
        alert('Error signing out. Please try again.');
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if using Supabase and not logged in
  if (useSupabase && !user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-semibold text-black">
            Recovery Toolkit
          </h1>
          <div className="flex gap-2">
            {useSupabase && user && (
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-600 active:opacity-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-600 active:opacity-50"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - iOS Tab Bar Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveSection('workbook')}
            className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeSection === 'workbook'
                ? 'text-blue-600'
                : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-6 h-6" />
            {activeSection === 'workbook' && (
              <div className="absolute top-1 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveSection('plan')}
            className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeSection === 'plan'
                ? 'text-blue-600'
                : 'text-slate-500'
            }`}
          >
            <Calendar className="w-6 h-6" />
            {activeSection === 'plan' && (
              <div className="absolute top-1 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveSection('journal')}
            className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeSection === 'journal'
                ? 'text-blue-600'
                : 'text-slate-500'
            }`}
          >
            <NotebookPen className="w-6 h-6" />
            {activeSection === 'journal' && (
              <div className="absolute top-1 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* Settings - iOS Style Full Screen */}
      {showSettings && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-black">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-blue-600 active:opacity-50"
              >
                Done
              </button>
            </div>

            <div className="px-4 py-2">
              {/* Storage Info */}
              <div className="py-3 border-b border-slate-200">
                <p className="text-sm text-slate-600 mb-1">
                  {useSupabase ? (
                    <>
                      <Cloud className="w-4 h-4 inline mr-1" />
                      Cloud Storage Active
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4 inline mr-1" />
                      Local Storage
                    </>
                  )}
                </p>
                {useSupabase && user && (
                  <p className="text-xs text-slate-500">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Export Data */}
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between py-4 border-b border-slate-200 active:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-base text-black">Export Data</span>
                </div>
                <span className="text-sm text-slate-500">Download backup</span>
              </button>

              {/* Import Data */}
              <div className="border-b border-slate-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between py-4 active:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-base text-black">Import Data</span>
                  </div>
                  <span className="text-sm text-slate-500">Restore backup</span>
                </button>
              </div>

              {/* Clear All Data */}
              <button
                onClick={handleClearData}
                className="w-full flex items-center justify-between py-4 border-b border-slate-200 active:bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="text-base text-red-600">Clear All Data</span>
                </div>
                <span className="text-sm text-slate-500">Delete everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {activeSection === 'workbook' && <Workbook storage={storageBackend} />}
        {activeSection === 'plan' && <WeeklyPlan storage={storageBackend} />}
        {activeSection === 'journal' && <Journal storage={storageBackend} />}
      </main>
    </div>
  );
}
