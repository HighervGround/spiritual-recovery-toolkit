import { useState, useRef, useEffect } from 'react';
import { Workbook } from './components/Workbook';
import { WeeklyPlan } from './components/WeeklyPlan';
import { Journal } from './components/Journal';
import { Auth } from './components/Auth';
import { BookOpen, Calendar, NotebookPen, Download, Upload, Settings, Trash2, X, LogOut, Cloud, HardDrive } from 'lucide-react';
import { storage } from './lib/storage';
import { supabaseStorage } from './lib/supabaseStorage';
import { supabase } from './lib/supabase';

export default function App() {
  const [activeSection, setActiveSection] = useState<'workbook' | 'plan' | 'journal'>('workbook');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the appropriate storage based on mode
  const storageBackend = useSupabase ? supabaseStorage : storage;

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-slate-800">
                Cole's Spiritual Recovery Toolkit
              </h1>
              {useSupabase && user && (
                <p className="text-sm text-slate-500 mt-1">
                  <Cloud className="w-4 h-4 inline mr-1" />
                  Synced to cloud
                </p>
              )}
              {!useSupabase && (
                <p className="text-sm text-slate-500 mt-1">
                  <HardDrive className="w-4 h-4 inline mr-1" />
                  Local storage
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {useSupabase && user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveSection('workbook')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeSection === 'workbook'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>🧘‍♂️ Twelve-Step Workbook</span>
            </button>
            
            <button
              onClick={() => setActiveSection('plan')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeSection === 'plan'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>🗓️ 12-Week Plan</span>
            </button>
            
            <button
              onClick={() => setActiveSection('journal')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeSection === 'journal'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <NotebookPen className="w-5 h-5" />
              <span>📔 Spiritual Journal</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-800">Settings & Data Management</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Export Data */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-slate-800 mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Export Your Data
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Download all your journal entries, notes, and progress as a backup file.
                </p>
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Backup
                </button>
              </div>

              {/* Import Data */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-slate-800 mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  Import Data
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Restore your data from a previously exported backup file.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Choose File to Import
                </button>
              </div>

              {/* Clear All Data */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="text-slate-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  Clear All Data
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Permanently delete all your data. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearData}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Everything
                </button>
              </div>

              {/* Info */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-2">
                  {useSupabase ? (
                    <>
                      <Cloud className="w-4 h-4 inline mr-1" />
                      <strong>Cloud Storage Active:</strong> Your data is synced to Supabase and accessible from any device.
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4 inline mr-1" />
                      <strong>Local Storage Active:</strong> Your data is stored locally in your browser. Export regularly to keep backups!
                    </>
                  )}
                </p>
                {useSupabase && user && (
                  <p className="text-xs text-slate-500">
                    Logged in as: {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeSection === 'workbook' && <Workbook storage={storageBackend} />}
        {activeSection === 'plan' && <WeeklyPlan storage={storageBackend} />}
        {activeSection === 'journal' && <Journal storage={storageBackend} />}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>A personal toolkit for spiritual recovery and growth</p>
      </footer>
    </div>
  );
}
