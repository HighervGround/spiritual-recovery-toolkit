import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, HelpCircle, Lightbulb, ChevronRight, X, Heart, Pause, Search, ChevronLeft } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import type { ResentmentEntry, FearEntry, SexualConductEntry } from '../lib/storage';
import type { StorageBackend } from '../lib/storageBackend';

// Hook to auto-resize textarea based on content
function useAutoResizeTextarea(value: string, minHeightWhenEmpty: number = 100, minHeightWhenFilled: number = 40) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Use smaller min-height if there's content, larger if empty
      const minH = value.trim().length > 0 ? minHeightWhenFilled : minHeightWhenEmpty;
      const newHeight = Math.max(textarea.scrollHeight, minH);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, minHeightWhenEmpty, minHeightWhenFilled]);

  return textareaRef;
}

// Helpful prompts from Step 4 worksheets
const PEOPLE_PROMPTS = [
  'Father', 'Mother', 'Sisters', 'Brothers', 'Aunts', 'Uncles', 'Cousins',
  'Clergy', 'Police', 'Lawyers', 'Judges', 'Doctors', 'Employers', 'Employees',
  'Co-Workers', 'In-Laws', 'Husbands', 'Wives', 'Creditors', 'Teachers',
  'Childhood Friends', 'School Friends', 'Life Long Friends', 'Best Friends',
  'Acquaintances', 'Girl Friends', 'Boy Friends', 'Parole Officers',
  'Probation Officers', 'A.A. Friends', 'C.A. Friends', 'N.A. Friends',
  'U.S. Service Friends'
];

const INSTITUTIONS_PROMPTS = [
  'Marriage', 'Bible', 'Church', 'Religion', 'Law', 'Authority', 'Government',
  'Education System', 'Correctional System', 'Mental Health System',
  'Nationality', 'Races', 'Philosophy'
];

const PRINCIPLES_PROMPTS = [
  'God-Deity', 'Retribution', 'Ten Commandments', 'Jesus Christ', 'Satan',
  'Death', 'Life After Death', 'Heaven', 'Hell', 'Sin', 'Adultery',
  'Golden Rule', 'Original Sin', 'Seven Deadly Sins'
];

const FEAR_PROMPTS = [
  'Fear of God', 'Fear of Dying', 'Fear of Insanity', 'Fear of Insecurity',
  'Fear of Rejection', 'Fear of Loneliness', 'Fear of Diseases', 'Fear of Alcohol',
  'Fear of Drugs', 'Fear of Relapse', 'Fear of Sex', 'Fear of Sin',
  'Fear of Self-Expression', 'Fear of Authority', 'Fear of Heights',
  'Fear of Unemployment', 'Fear of Employment', 'Fear of Parents',
  'Fear of Losing A Wife', 'Fear of Losing A Husband', 'Fear of Losing A Child',
  'Fear of Animals', 'Fear of Insects', 'Fear of Police', 'Fear of Jail',
  'Fear of Doctors', 'Fear of Stealing', 'Fear of Creditors',
  'Fear of Being Found Out', 'Fear of Homosexuals & Lesbians',
  'Fear of Failure', 'Fear of Success', 'Fear of Responsibility',
  'Fear of Physical Pain', 'Fear of Fear', 'Fear of Drowning',
  'Fear of Men', 'Fear of Women', 'Fear of Being Alone', 'Fear of People',
  'Fear of Crying', 'Fear of Poverty', 'Fear of Races', 'Fear of The Unknown',
  'Fear of Abandonment', 'Fear of Intimacy', 'Fear of Disapproval',
  'Fear of Confrontation', 'Fear of Sobriety', 'Fear of Hospitals',
  'Fear of Feelings', 'Fear of Getting Old', 'Fear of Hurting Others',
  'Fear of Violence', 'Fear of Writing Inventory', 'Fear of Being Alive',
  'Fear of Government', 'Fear of Gangs', 'Fear of Gossip',
  'Fear of Wealthy People', 'Fear of Guns', 'Fear of Change'
];

// Seven Parts of Self (from PDF)
const SEVEN_PARTS_OF_SELF = [
  { value: 'selfEsteem', label: 'Self Esteem', description: 'How I think of myself' },
  { value: 'pride', label: 'Pride', description: 'How I think others view me' },
  { value: 'pocketbook', label: 'Pocketbook', description: 'Basic desire for money, property, possessions, etc.' },
  { value: 'personalRelations', label: 'Personal Relations', description: 'Our relations with other people' },
  { value: 'ambition', label: 'Ambition', description: 'Our goals, plans and designs for the future' },
  { value: 'emotionalSecurity', label: 'Emotional Security', description: 'General sense of personal well being' },
  { value: 'sexRelations', label: 'Sex Relations', description: 'Basic drive for sexual intimacy' }
];

type TabType = 'resentments' | 'fears' | 'sexualConduct';

interface Step4InventoryProps {
  weekNumber: number;
  storage: StorageBackend;
}

export function Step4Inventory({ weekNumber, storage }: Step4InventoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resentments');
  const [resentmentEntries, setResentmentEntries] = useState<ResentmentEntry[]>([]);
  const [fearEntries, setFearEntries] = useState<FearEntry[]>([]);
  const [sexualConductEntries, setSexualConductEntries] = useState<SexualConductEntry[]>([]);
  const [activeColumn, setActiveColumn] = useState<1 | 2 | 3 | 4>(1);
  const [showPrompts, setShowPrompts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCompassionReminder, setShowCompassionReminder] = useState(true);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    loadAllEntries();
    // Check if compassion reminder was dismissed
    const dismissed = localStorage.getItem('step4-compassion-reminder-dismissed');
    if (dismissed === 'true') {
      setShowCompassionReminder(false);
    }
  }, [weekNumber]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const dismissCompassionReminder = () => {
    setShowCompassionReminder(false);
    localStorage.setItem('step4-compassion-reminder-dismissed', 'true');
  };

  const handleTakeBreak = async () => {
    // Force immediate save
    try {
      setSaving(true);
      await storage.updateWeekProgress(weekNumber, {
        resentmentEntries,
        fearEntries,
        sexualConductEntries,
      });
      setSaved(true);
    } catch (error: any) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
    setShowBreakDialog(true);
  };

  const loadAllEntries = async () => {
    try {
      isInitialLoad.current = true;
      const weekProgress = await storage.getWeekProgress();
      const week = weekProgress.find(w => w.weekNumber === weekNumber);
      setResentmentEntries(Array.isArray(week?.resentmentEntries) ? week.resentmentEntries : []);
      setFearEntries(Array.isArray(week?.fearEntries) ? week.fearEntries : []);
      setSexualConductEntries(Array.isArray(week?.sexualConductEntries) ? week.sexualConductEntries : []);
      setSaved(true);
    } catch (error: any) {
      console.error('Error loading entries:', error);
      alert(`Error loading entries: ${error?.message || 'Unknown error'}`);
    } finally {
      isInitialLoad.current = false;
    }
  };

  const debouncedSave = useCallback(async (updates: {
    resentmentEntries?: ResentmentEntry[];
    fearEntries?: FearEntry[];
    sexualConductEntries?: SexualConductEntry[];
  }) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        setSaved(false);
        await storage.updateWeekProgress(weekNumber, updates);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error: any) {
        console.error('Error saving entries:', error);
        alert(`Error saving entries: ${error?.message || 'Unknown error'}`);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [weekNumber, storage]);

  // Resentment functions
  const addResentmentEntry = () => {
    const newEntry: ResentmentEntry = {
      id: Date.now().toString(),
      column1: '',
      column2: '',
      column3: {
        socialInstinct: {
          selfEsteem: false,
          personalRelationships: false,
          material: false,
          emotional: false,
        },
        securityInstinct: {
          social: false,
          security: false,
        },
        sexInstinct: {
          acceptableSexRelations: false,
          hiddenSexRelations: false,
          sexual: false,
        },
        ambitions: false,
      },
      column4: {
        selfish: false,
        dishonest: false,
        selfSeekingAndFrightened: false,
        inconsiderate: false,
      },
    };
    const updated = [...resentmentEntries, newEntry];
    setResentmentEntries(updated);
    debouncedSave({ resentmentEntries: updated });
  };

  const deleteResentmentEntry = (id: string) => {
    const entry = resentmentEntries.find(e => e.id === id);
    const hasContent = entry && (
      entry.column1?.trim() || entry.column2?.trim() ||
      entry.column4?.whereWasIToBlame?.trim()
    );
    
    if (hasContent && !confirm('This entry has content. Are you sure you want to delete it?')) {
      return;
    }
    
    const updated = resentmentEntries.filter(e => e.id !== id);
    setResentmentEntries(updated);
    debouncedSave({ resentmentEntries: updated });
  };

  const checkForDuplicateResentment = (column1Text: string, currentEntryId?: string): string | null => {
    const normalized = column1Text.trim().toLowerCase();
    if (normalized.length < 3) return null; // Don't check very short entries
    
    const existing = resentmentEntries.find(e => {
      if (e.id === currentEntryId) return false; // Don't check against self
      const existingText = (e.column1 || '').trim().toLowerCase();
      if (!existingText) return false;
      
      // Check for exact match
      if (existingText === normalized) return true;
      
      // Simple similarity check - if one contains the other or vice versa
      const longer = normalized.length > existingText.length ? normalized : existingText;
      const shorter = normalized.length > existingText.length ? existingText : normalized;
      // If shorter is at least 80% of longer and contained in longer, consider it a duplicate
      if (shorter.length / longer.length >= 0.8 && longer.includes(shorter)) {
        return true;
      }
      return false;
    });
    return existing ? existing.column1 || null : null;
  };

  const updateResentmentColumn1 = (id: string, value: string) => {
    const updated = resentmentEntries.map(e =>
      e.id === id ? { ...e, column1: value } : e
    );
    setResentmentEntries(updated);
    debouncedSave({ resentmentEntries: updated });
  };

  const updateResentmentColumn2 = (id: string, value: string) => {
    const updated = resentmentEntries.map(e =>
      e.id === id ? { ...e, column2: value } : e
    );
    setResentmentEntries(updated);
    debouncedSave({ resentmentEntries: updated });
  };

  const updateResentmentColumn3 = (id: string, category: string, subcategory: string | undefined, value: boolean) => {
    const updated = resentmentEntries.map(e => {
      if (e.id !== id) return e;
      const newEntry = { ...e };
      if (category === 'socialInstinct' && subcategory) {
        newEntry.column3.socialInstinct = { ...newEntry.column3.socialInstinct, [subcategory]: value };
      } else if (category === 'securityInstinct' && subcategory) {
        newEntry.column3.securityInstinct = { ...newEntry.column3.securityInstinct, [subcategory]: value };
      } else if (category === 'sexInstinct' && subcategory) {
        newEntry.column3.sexInstinct = { ...newEntry.column3.sexInstinct, [subcategory]: value };
      } else if (category === 'ambitions') {
        newEntry.column3.ambitions = value;
      }
      return newEntry;
    });
    setResentmentEntries(updated);
    debouncedSave({ resentmentEntries: updated });
  };

  const updateResentmentColumn4 = (id: string, field: string, value: boolean | string) => {
    const updated = resentmentEntries.map(e => {
      if (e.id !== id) return e;
      if (field === 'whereWasIToBlame') {
        return { ...e, column4: { ...e.column4, whereWasIToBlame: value as string } };
      }
      return { ...e, column4: { ...e.column4, [field]: value } };
    });
    setResentmentEntries(updated);
    debouncedSave({ resentmentEntries: updated });
  };

  // Fear functions
  const addFearEntry = () => {
    const newEntry: FearEntry = {
      id: Date.now().toString(),
      fear: '',
      partOfSelfFailed: '',
    };
    const updated = [...fearEntries, newEntry];
    setFearEntries(updated);
    debouncedSave({ fearEntries: updated });
  };

  const deleteFearEntry = (id: string) => {
    const entry = fearEntries.find(e => e.id === id);
    if (entry && (entry.fear?.trim() || entry.partOfSelfFailed?.trim()) && !confirm('This entry has content. Delete it?')) {
      return;
    }
    const updated = fearEntries.filter(e => e.id !== id);
    setFearEntries(updated);
    debouncedSave({ fearEntries: updated });
  };

  const checkForDuplicateFear = (fearText: string, currentEntryId?: string): string | null => {
    const normalized = fearText.trim().toLowerCase();
    if (normalized.length < 3) return null;
    
    const existing = fearEntries.find(e => {
      if (e.id === currentEntryId) return false;
      const existingText = (e.fear || '').trim().toLowerCase();
      if (!existingText) return false;
      if (existingText === normalized) return true;
      if (normalized.length > 0 && existingText.length > 0) {
        const longer = normalized.length > existingText.length ? normalized : existingText;
        const shorter = normalized.length > existingText.length ? existingText : normalized;
        if (shorter.length / longer.length >= 0.8 && longer.includes(shorter)) {
          return true;
        }
      }
      return false;
    });
    return existing ? existing.fear || null : null;
  };

  const updateFearEntry = (id: string, field: 'fear' | 'partOfSelfFailed' | 'fearPrayer', value: string) => {
    const updated = fearEntries.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    );
    setFearEntries(updated);
    debouncedSave({ fearEntries: updated });
  };

  // Sexual Conduct functions
  const addSexualConductEntry = () => {
    const newEntry: SexualConductEntry = {
      id: Date.now().toString(),
      whomDidIHurt: '',
      whatDidIDo: '',
      didIUnjustifiablyAvoid: false,
      whereWasIAtFault: '',
      whatShouldIHaveDoneInstead: '',
    };
    const updated = [...sexualConductEntries, newEntry];
    setSexualConductEntries(updated);
    debouncedSave({ sexualConductEntries: updated });
  };

  const deleteSexualConductEntry = (id: string) => {
    const entry = sexualConductEntries.find(e => e.id === id);
    if (entry && (entry.whomDidIHurt?.trim() || entry.whatDidIDo?.trim()) && !confirm('This entry has content. Delete it?')) {
      return;
    }
    const updated = sexualConductEntries.filter(e => e.id !== id);
    setSexualConductEntries(updated);
    debouncedSave({ sexualConductEntries: updated });
  };

  const checkForDuplicateSexualConduct = (whomText: string, currentEntryId?: string): string | null => {
    const normalized = whomText.trim().toLowerCase();
    if (normalized.length < 3) return null;
    
    const existing = sexualConductEntries.find(e => {
      if (e.id === currentEntryId) return false;
      const existingText = (e.whomDidIHurt || '').trim().toLowerCase();
      if (!existingText) return false;
      if (existingText === normalized) return true;
      if (normalized.length > 0 && existingText.length > 0) {
        const longer = normalized.length > existingText.length ? normalized : existingText;
        const shorter = normalized.length > existingText.length ? existingText : normalized;
        if (shorter.length / longer.length >= 0.8 && longer.includes(shorter)) {
          return true;
        }
      }
      return false;
    });
    return existing ? existing.whomDidIHurt || null : null;
  };

  const updateSexualConductEntry = (id: string, field: keyof SexualConductEntry, value: string | boolean) => {
    const updated = sexualConductEntries.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    );
    setSexualConductEntries(updated);
    debouncedSave({ sexualConductEntries: updated });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Compassion Reminder Banner */}
      {showCompassionReminder && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-start gap-3">
          <Heart className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>This work takes courage.</strong> Be gentle with yourself. You can pause anytime. Your safety matters.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissCompassionReminder}
            className="text-blue-600 hover:text-blue-800 transition-colors shrink-0"
            aria-label="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Tabs */}
      <div className="border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Step 4 Inventory</h3>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-slate-500">Saving...</span>}
            {saved && <span className="text-xs text-green-600">Saved</span>}
            <button
              type="button"
              onClick={handleTakeBreak}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Take a Break</span>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('resentments')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'resentments'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Resentments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fears')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'fears'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Fears
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sexualConduct')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sexualConduct'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Sexual Conduct / Harm Done
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'resentments' && (
          <ResentmentsSection
            entries={resentmentEntries}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
            showPrompts={showPrompts}
            setShowPrompts={setShowPrompts}
            addEntry={addResentmentEntry}
            deleteEntry={deleteResentmentEntry}
            checkForDuplicate={checkForDuplicateResentment}
            updateColumn1={updateResentmentColumn1}
            updateColumn2={updateResentmentColumn2}
            updateColumn3={updateResentmentColumn3}
            updateColumn4={updateResentmentColumn4}
          />
        )}

        {activeTab === 'fears' && (
          <FearsSection
            entries={fearEntries}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showPrompts={showPrompts}
            setShowPrompts={setShowPrompts}
            addEntry={addFearEntry}
            deleteEntry={deleteFearEntry}
            checkForDuplicate={checkForDuplicateFear}
            updateEntry={updateFearEntry}
          />
        )}

        {activeTab === 'sexualConduct' && (
          <SexualConductSection
            entries={sexualConductEntries}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addEntry={addSexualConductEntry}
            deleteEntry={deleteSexualConductEntry}
            checkForDuplicate={checkForDuplicateSexualConduct}
            updateEntry={updateSexualConductEntry}
          />
        )}
      </div>

      {/* Take a Break Dialog */}
      {showBreakDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Take a Break</h3>
              <button
                type="button"
                onClick={() => setShowBreakDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm font-medium text-blue-800 mb-2">Grounding Exercise</p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Body scan meditation. Lie down and bring gentle awareness to each part of your body, thanking it for carrying you this far. Or walk slowly in nature or around your space. With each step, say: "I release." "I am free." "I am whole."
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Your progress has been saved. You can return to this inventory whenever you're ready.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakDialog(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Working
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBreakDialog(false);
                    // Could navigate to journal here if we had navigation prop
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  I'm Done for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Resentments Section Component
function ResentmentsSection({
  entries,
  searchQuery,
  setSearchQuery,
  activeColumn,
  setActiveColumn,
  showPrompts,
  setShowPrompts,
  addEntry,
  deleteEntry,
  checkForDuplicate,
  updateColumn1,
  updateColumn2,
  updateColumn3,
  updateColumn4,
}: {
  entries: ResentmentEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeColumn: 1 | 2 | 3 | 4;
  setActiveColumn: (col: 1 | 2 | 3 | 4) => void;
  showPrompts: boolean;
  setShowPrompts: (show: boolean) => void;
  addEntry: () => void;
  deleteEntry: (id: string) => void;
  checkForDuplicate: (text: string, currentEntryId?: string) => string | null;
  updateColumn1: (id: string, value: string) => void;
  updateColumn2: (id: string, value: string) => void;
  updateColumn3: (id: string, category: string, subcategory: string | undefined, value: boolean) => void;
  updateColumn4: (id: string, field: string, value: boolean | string) => void;
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number | null>(null);

  // Filter entries based on search query
  const filteredEntries = searchQuery.trim()
    ? entries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
          entry.column1?.toLowerCase().includes(query) ||
          entry.column2?.toLowerCase().includes(query) ||
          entry.column4?.whereWasIToBlame?.toLowerCase().includes(query)
        );
      })
    : entries;

  // Reset current entry index when filtered entries change
  useEffect(() => {
    if (currentEntryIndex !== null && currentEntryIndex >= filteredEntries.length) {
      setCurrentEntryIndex(null);
    }
  }, [filteredEntries.length, currentEntryIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't navigate when typing
      }
      if (e.key === 'ArrowLeft' && filteredEntries.length > 0) {
        e.preventDefault();
        setCurrentEntryIndex(prev => {
          if (prev === null) return filteredEntries.length - 1;
          return Math.max(0, prev - 1);
        });
      } else if (e.key === 'ArrowRight' && filteredEntries.length > 0) {
        e.preventDefault();
        setCurrentEntryIndex(prev => {
          if (prev === null) return 1;
          return Math.min(filteredEntries.length - 1, (prev || 0) + 1);
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredEntries.length]);

  return (
    <div>
      {/* Instructions */}
      <button
        type="button"
        onClick={() => setShowInstructions(!showInstructions)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4"
      >
        <span className="text-sm font-medium text-slate-700">Instructions</span>
        {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {showInstructions && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800 rounded-lg">
          <p className="mb-2"><strong>Work column by column:</strong> Complete Column 1 for all entries, then Column 2, then 3, then 4.</p>
          <p className="text-xs text-slate-600 mb-2">Column 1: Who/what are you resentful at? • Column 2: Why? • Column 3: Which part of self affected? • Column 4: What were your wrongs?</p>
          <p className="text-xs text-blue-700 italic">💡 Column 1 is always visible as your reference. The active column appears below it for focused work.</p>
        </div>
      )}

      {/* Prompt Lists */}
      <button
        type="button"
        onClick={() => setShowPrompts(!showPrompts)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4"
      >
        <span className="text-sm font-medium text-slate-700">Helpful Prompt Lists</span>
        {showPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showPrompts && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">People</h4>
            <div className="flex flex-wrap gap-2">
              {PEOPLE_PROMPTS.map(prompt => (
                <span key={prompt} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded">
                  {prompt}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Institutions</h4>
            <div className="flex flex-wrap gap-2">
              {INSTITUTIONS_PROMPTS.map(prompt => (
                <span key={prompt} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded">
                  {prompt}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Principles</h4>
            <div className="flex flex-wrap gap-2">
              {PRINCIPLES_PROMPTS.map(prompt => (
                <span key={prompt} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded">
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Potential Duplicates Check */}
      {entries.length > 1 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Check for Potential Duplicates</span>
            </div>
            {showInsights ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
          </button>
          {showInsights && (
            <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs text-amber-800 space-y-2">
                {(() => {
                  const duplicates: Array<{ entry1: string; entry2: string }> = [];
                  entries.forEach((e1, i) => {
                    const text1 = (e1.column1 || '').trim().toLowerCase();
                    if (!text1 || text1.length < 3) return;
                    entries.slice(i + 1).forEach(e2 => {
                      const text2 = (e2.column1 || '').trim().toLowerCase();
                      if (!text2 || text2.length < 3) return;
                      // Check for similarity
                      const longer = text1.length > text2.length ? text1 : text2;
                      const shorter = text1.length > text2.length ? text2 : text1;
                      if (shorter.length / longer.length >= 0.8 && longer.includes(shorter)) {
                        duplicates.push({
                          entry1: e1.column1 || '',
                          entry2: e2.column1 || '',
                        });
                      }
                    });
                  });
                  return duplicates.length > 0 ? (
                    <div>
                      <p className="font-semibold mb-2 text-amber-900">Possible duplicates found:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {duplicates.map((dup, idx) => (
                          <li key={idx} className="text-amber-800">
                            "{dup.entry1}" and "{dup.entry2}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-amber-700 italic">No potential duplicates found. All entries appear unique.</p>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Column Selector */}
      <div className="mb-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((col) => {
            const isColumnCompleteForAllEntries = 
              (col === 1 && entries.every(e => (e.column1 || '').trim().length > 0)) ||
              (col === 2 && entries.every(e => (e.column2 || '').trim().length > 0)) ||
              (col === 3 && entries.every(e => {
                return e.column3.socialInstinct.selfEsteem || e.column3.socialInstinct.personalRelationships ||
                       e.column3.socialInstinct.material || e.column3.socialInstinct.emotional ||
                       e.column3.securityInstinct.social || e.column3.securityInstinct.security ||
                       e.column3.sexInstinct.acceptableSexRelations || e.column3.sexInstinct.hiddenSexRelations ||
                       e.column3.sexInstinct.sexual || e.column3.ambitions;
              })) ||
              (col === 4 && entries.every(e => (e.column4.selfish || e.column4.dishonest || e.column4.selfSeekingAndFrightened || e.column4.inconsiderate)));

            const columnCompletionCount = col === 1 ? entries.filter(e => (e.column1 || '').trim().length > 0).length :
                                        col === 2 ? entries.filter(e => (e.column2 || '').trim().length > 0).length :
                                        col === 3 ? entries.filter(e => {
                                            return e.column3.socialInstinct.selfEsteem || e.column3.socialInstinct.personalRelationships ||
                                                   e.column3.socialInstinct.material || e.column3.socialInstinct.emotional ||
                                                   e.column3.securityInstinct.social || e.column3.securityInstinct.security ||
                                                   e.column3.sexInstinct.acceptableSexRelations || e.column3.sexInstinct.hiddenSexRelations ||
                                                   e.column3.sexInstinct.sexual || e.column3.ambitions;
                                        }).length :
                                        entries.filter(e => (e.column4.selfish || e.column4.dishonest || e.column4.selfSeekingAndFrightened || e.column4.inconsiderate)).length;

            return (
              <button
                key={col}
                type="button"
                onClick={() => setActiveColumn(col as 1 | 2 | 3 | 4)}
                className={`relative flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeColumn === col
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isColumnCompleteForAllEntries && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span className="whitespace-nowrap">Column {col}</span>
                </div>
                {entries.length > 0 && (
                  <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${activeColumn === col ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {columnCompletionCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-2">
              {filteredEntries.length === 0 ? 'No entries match' : `${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'} found`}
            </p>
          )}
        </div>
      )}

      {/* Entries */}
      <div className="space-y-6 pb-24">
        {filteredEntries.length === 0 && entries.length > 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-600 mb-4">No entries match your search.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-700 text-base mb-2 font-medium">Your first entry is the hardest. You've got this.</p>
            <p className="text-slate-500 text-sm">Take your time. There's no rush.</p>
          </div>
        ) : (
          <>
            {/* Entry Navigation */}
            {filteredEntries.length > 0 && (
              <div className="mb-4 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Entry {currentEntryIndex !== null ? currentEntryIndex + 1 : 1} of {filteredEntries.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentEntryIndex === null) {
                        setCurrentEntryIndex(filteredEntries.length - 1);
                      } else {
                        setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1));
                      }
                    }}
                    disabled={filteredEntries.length === 0 || (currentEntryIndex !== null && currentEntryIndex === 0)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                    title="Previous entry (←)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentEntryIndex === null) {
                        setCurrentEntryIndex(1);
                      } else {
                        setCurrentEntryIndex(Math.min(filteredEntries.length - 1, currentEntryIndex + 1));
                      }
                    }}
                    disabled={filteredEntries.length === 0 || (currentEntryIndex !== null && currentEntryIndex === filteredEntries.length - 1)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                    title="Next entry (→)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {filteredEntries.map((entry, index) => {
              const isHighlighted = currentEntryIndex === index || (currentEntryIndex === null && index === 0);
              return (
                <div key={entry.id} className={isHighlighted ? 'ring-2 ring-blue-400 rounded-xl' : ''}>
                  <ResentmentEntryCard
                    entry={entry}
                    index={index}
                    activeColumn={activeColumn}
                    deleteEntry={deleteEntry}
                    checkForDuplicate={checkForDuplicate}
                    updateColumn1={updateColumn1}
                    updateColumn2={updateColumn2}
                    updateColumn3={updateColumn3}
                    updateColumn4={updateColumn4}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Add Entry Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-10">
        <button
          type="button"
          onClick={addEntry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:opacity-80 font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>
    </div>
  );
}

// Resentment Entry Card Component (simplified - will need full implementation)
function ResentmentEntryCard({
  entry,
  index,
  activeColumn,
  deleteEntry,
  checkForDuplicate,
  updateColumn1,
  updateColumn2,
  updateColumn3,
  updateColumn4,
}: {
  entry: ResentmentEntry;
  index: number;
  activeColumn: 1 | 2 | 3 | 4;
  deleteEntry: (id: string) => void;
  checkForDuplicate: (text: string, currentEntryId?: string) => string | null;
  updateColumn1: (id: string, value: string) => void;
  updateColumn2: (id: string, value: string) => void;
  updateColumn3: (id: string, category: string, subcategory: string | undefined, value: boolean) => void;
  updateColumn4: (id: string, field: string, value: boolean | string) => void;
}) {
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleColumn1Change = (value: string) => {
    updateColumn1(entry.id, value);
    // Check for duplicates when user stops typing (debounced)
    if (value.trim().length > 3) {
      const duplicate = checkForDuplicate(value, entry.id);
      if (duplicate && duplicate.toLowerCase() !== value.trim().toLowerCase()) {
        setDuplicateWarning(duplicate);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };
  const column1Value = entry.column1 || entry.column1Text || '';
  const column2Value = entry.column2 || entry.column2Text || '';
  const column4Value = entry.column4.whereWasIToBlame || '';
  
  const column1Ref = useAutoResizeTextarea(
    column1Value, 
    activeColumn === 1 ? 180 : 100,  // min when empty
    activeColumn === 1 ? 60 : 40     // min when filled
  );
  const column2Ref = useAutoResizeTextarea(column2Value, 180, 60);
  const column4Ref = useAutoResizeTextarea(column4Value, 180, 60);

  return (
      <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <h4 className="text-base font-semibold text-slate-700">Entry #{index + 1}</h4>
        <button
          type="button"
          onClick={() => deleteEntry(entry.id)}
          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
          title="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Column 1 - Always visible */}
        <div className={`bg-white rounded-lg p-5 border-2 transition-all ${
          activeColumn === 1 
            ? 'border-blue-500 shadow-md' 
            : 'border-slate-200'
        }`}>
          <label className={`text-sm font-semibold mb-3 block flex items-center gap-2 ${
            activeColumn === 1 ? 'text-blue-700' : 'text-slate-600'
          }`}>
            <span>Column 1: I'm resentful at</span>
            {activeColumn === 1 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Focus</span>}
            {activeColumn !== 1 && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Reference</span>}
          </label>
          {duplicateWarning && (
            <div className="mb-2 p-2 bg-amber-50 border border-amber-300 rounded text-xs text-amber-800">
              <strong>Possible duplicate:</strong> This looks similar to "{duplicateWarning}"
            </div>
          )}
          <Textarea
            ref={column1Ref}
            value={column1Value}
            onChange={(e) => {
              handleColumn1Change(e.target.value);
              // Auto-resize on change
              const textarea = e.target;
              textarea.style.height = 'auto';
              // Use smaller min-height if there's content, larger if empty
              const minH = column1Value.trim().length > 0 
                ? (activeColumn === 1 ? 60 : 40) 
                : (activeColumn === 1 ? 180 : 100);
              const newHeight = Math.max(textarea.scrollHeight, minH);
              textarea.style.height = `${newHeight}px`;
            }}
            placeholder="Who or what are you resentful at? (You can type or write with Apple Pencil - iPad will convert handwriting automatically)"
            className={`w-full resize-y overflow-hidden ${
              activeColumn === 1 
                ? `${column1Value.trim().length > 0 ? '' : 'min-h-[180px]'} text-lg` 
                : `${column1Value.trim().length > 0 ? '' : 'min-h-[100px]'} text-base bg-slate-50`
            }`}
            rows={column1Value.trim().length > 0 ? 1 : (activeColumn === 1 ? 8 : 4)}
            inputMode="text"
          />
        </div>

        {/* Column 2 - Show only when activeColumn === 2 */}
        {activeColumn === 2 && (
          <div className="bg-white rounded-lg p-5 border-2 border-blue-500 shadow-md transition-all">
            <label className="text-sm font-semibold mb-3 block flex items-center gap-2 text-blue-700">
              <span>Column 2: The cause</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Focus</span>
            </label>
            <Textarea
              ref={column2Ref}
              value={column2Value}
              onChange={(e) => {
                updateColumn2(entry.id, e.target.value);
                // Auto-resize on change
                const textarea = e.target;
                textarea.style.height = 'auto';
                const minH = column2Value.trim().length > 0 ? 60 : 180;
                const newHeight = Math.max(textarea.scrollHeight, minH);
                textarea.style.height = `${newHeight}px`;
              }}
              placeholder="Why was I angry? What specifically caused the resentment?"
              className={`w-full resize-y overflow-hidden ${column2Value.trim().length > 0 ? '' : 'min-h-[180px]'} text-lg`}
              rows={column2Value.trim().length > 0 ? 1 : 8}
              inputMode="text"
            />
          </div>
        )}

        {/* Column 3 - Show only when activeColumn === 3 */}
        {activeColumn === 3 && (
          <div className="bg-white rounded-lg p-5 border-2 border-blue-500 shadow-md transition-all">
            <div className="mb-5">
              <h5 className="text-base font-semibold mb-2 flex items-center gap-2 text-blue-700">
                <span>Column 3: Which part of me was affected?</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Focus</span>
              </h5>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-sm text-blue-800">
                <p className="font-medium mb-1">Think about:</p>
                <p className="text-xs">What part of yourself felt hurt, threatened, or damaged by this resentment? Check all that apply.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Social Instinct */}
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300">
                <h6 className="text-base font-bold text-slate-800 mb-2">Social Instinct</h6>
                <p className="text-xs text-slate-600 mb-4 italic">How I relate to others and my place in the world</p>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.socialInstinct.selfEsteem
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.socialInstinct.selfEsteem}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'socialInstinct', 'selfEsteem', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Self-Esteem</span>
                      <span className="text-xs text-slate-600">My sense of self-worth, how I see myself</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.socialInstinct.personalRelationships
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.socialInstinct.personalRelationships}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'socialInstinct', 'personalRelationships', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Personal Relationships</span>
                      <span className="text-xs text-slate-600">My connections with family, friends, or loved ones</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.socialInstinct.material
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.socialInstinct.material}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'socialInstinct', 'material', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Material</span>
                      <span className="text-xs text-slate-600">My money, property, possessions, or financial security</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.socialInstinct.emotional
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.socialInstinct.emotional}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'socialInstinct', 'emotional', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Emotional Security</span>
                      <span className="text-xs text-slate-600">My overall sense of safety and well-being</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Instinct */}
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300">
                <h6 className="text-base font-bold text-slate-800 mb-2">Security Instinct</h6>
                <p className="text-xs text-slate-600 mb-4 italic">My need for safety and stability</p>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.securityInstinct.social
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.securityInstinct.social}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'securityInstinct', 'social', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Social Security</span>
                      <span className="text-xs text-slate-600">My sense of belonging, acceptance, or social standing</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.securityInstinct.security
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.securityInstinct.security}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'securityInstinct', 'security', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Physical Security</span>
                      <span className="text-xs text-slate-600">My physical safety, health, or basic survival needs</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sex Instinct */}
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300">
                <h6 className="text-base font-bold text-slate-800 mb-2">Sex Instinct</h6>
                <p className="text-xs text-slate-600 mb-4 italic">My sexual relationships and intimacy needs</p>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.sexInstinct.acceptableSexRelations
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.sexInstinct.acceptableSexRelations}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'sexInstinct', 'acceptableSexRelations', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Acceptable Sex Relations</span>
                      <span className="text-xs text-slate-600">My healthy, consensual intimate relationships</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.sexInstinct.hiddenSexRelations
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.sexInstinct.hiddenSexRelations}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'sexInstinct', 'hiddenSexRelations', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Hidden Sex Relations</span>
                      <span className="text-xs text-slate-600">Secret or hidden intimate relationships</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                    entry.column3.sexInstinct.sexual
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <Checkbox
                      checked={entry.column3.sexInstinct.sexual}
                      onCheckedChange={(checked) =>
                        updateColumn3(entry.id, 'sexInstinct', 'sexual', checked as boolean)
                      }
                      className="w-6 h-6 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-slate-900 block mb-1">Sexual</span>
                      <span className="text-xs text-slate-600">My general sexual needs or desires</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Ambitions */}
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300">
                <h6 className="text-base font-bold text-slate-800 mb-2">Ambitions</h6>
                <p className="text-xs text-slate-600 mb-4 italic">My goals, dreams, and aspirations</p>
                <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                  entry.column3.ambitions
                    ? 'bg-blue-100 border-blue-500 shadow-md'
                    : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  <Checkbox
                    checked={entry.column3.ambitions}
                    onCheckedChange={(checked) =>
                      updateColumn3(entry.id, 'ambitions', undefined, checked as boolean)
                    }
                    className="w-6 h-6 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-slate-900 block mb-1">Ambitions</span>
                    <span className="text-xs text-slate-600">My career goals, personal achievements, or life aspirations</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Column 4 - Show only when activeColumn === 4 */}
        {activeColumn === 4 && (
          <div className="bg-white rounded-lg p-5 border-2 border-blue-500 shadow-md transition-all space-y-5">
            <div>
              <h5 className="text-sm font-semibold mb-1 flex items-center gap-2 text-blue-700">
                <span>Column 4: Nature of my wrongs</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Focus</span>
              </h5>
              <p className="text-xs text-slate-500">What is the exact nature of my wrongs, faults, mistakes, defects, shortcomings</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                  entry.column4.selfish
                    ? 'bg-purple-100 border-purple-500 shadow-md'
                    : 'bg-white border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                }`}>
                  <Checkbox
                    checked={entry.column4.selfish}
                    onCheckedChange={(checked) =>
                      updateColumn4(entry.id, 'selfish', checked as boolean)
                    }
                    className="w-6 h-6"
                  />
                  <span className="text-base font-semibold text-slate-900">Selfish</span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                  entry.column4.dishonest
                    ? 'bg-purple-100 border-purple-500 shadow-md'
                    : 'bg-white border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                }`}>
                  <Checkbox
                    checked={entry.column4.dishonest}
                    onCheckedChange={(checked) =>
                      updateColumn4(entry.id, 'dishonest', checked as boolean)
                    }
                    className="w-6 h-6"
                  />
                  <span className="text-base font-semibold text-slate-900">Dishonest</span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                  entry.column4.selfSeekingAndFrightened
                    ? 'bg-purple-100 border-purple-500 shadow-md'
                    : 'bg-white border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                }`}>
                  <Checkbox
                    checked={entry.column4.selfSeekingAndFrightened}
                    onCheckedChange={(checked) =>
                      updateColumn4(entry.id, 'selfSeekingAndFrightened', checked as boolean)
                    }
                    className="w-6 h-6"
                  />
                  <span className="text-base font-semibold text-slate-900">Self-seeking & frightened</span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                  entry.column4.inconsiderate
                    ? 'bg-purple-100 border-purple-500 shadow-md'
                    : 'bg-white border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                }`}>
                  <Checkbox
                    checked={entry.column4.inconsiderate}
                    onCheckedChange={(checked) =>
                      updateColumn4(entry.id, 'inconsiderate', checked as boolean)
                    }
                    className="w-6 h-6"
                  />
                  <span className="text-base font-semibold text-slate-900">Inconsiderate</span>
                </label>
              </div>
            </div>

            {/* Where Was I To Blame */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-blue-700">
                Where was I to blame?
              </label>
              <p className="text-xs text-slate-500 mb-2">What's the truth here? Where was my responsibility?</p>
              <Textarea
                ref={column4Ref}
                value={column4Value}
                onChange={(e) => {
                  updateColumn4(entry.id, 'whereWasIToBlame', e.target.value);
                  // Auto-resize on change
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  const minH = column4Value.trim().length > 0 ? 60 : 180;
                  const newHeight = Math.max(textarea.scrollHeight, minH);
                  textarea.style.height = `${newHeight}px`;
                }}
                placeholder="What was my part? What could I have done differently? (You can type or write with Apple Pencil - iPad will convert handwriting automatically)"
                className={`w-full resize-y overflow-hidden ${column4Value.trim().length > 0 ? '' : 'min-h-[180px]'} text-lg`}
                rows={column4Value.trim().length > 0 ? 1 : 8}
                inputMode="text"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fears Section Component
function FearsSection({
  entries,
  searchQuery,
  setSearchQuery,
  showPrompts,
  setShowPrompts,
  addEntry,
  deleteEntry,
  duplicateEntry,
  updateEntry,
}: {
  entries: FearEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showPrompts: boolean;
  setShowPrompts: (show: boolean) => void;
  addEntry: () => void;
  deleteEntry: (id: string) => void;
  duplicateEntry: (id: string) => void;
  updateEntry: (id: string, field: 'fear' | 'partOfSelfFailed' | 'fearPrayer', value: string) => void;
}) {
  const filteredEntries = searchQuery.trim()
    ? entries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
          entry.fear?.toLowerCase().includes(query) ||
          entry.partOfSelfFailed?.toLowerCase().includes(query) ||
          entry.fearPrayer?.toLowerCase().includes(query)
        );
      })
    : entries;

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800 rounded-lg">
        <p className="font-medium mb-1">Read the Big Book, page 67, last paragraph through first paragraph on page 68.</p>
        <p className="text-xs">List your fears. Then write about why you have each fear. Has self-reliance failed you?</p>
      </div>

      {/* Prompt Lists */}
      <button
        type="button"
        onClick={() => setShowPrompts(!showPrompts)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4"
      >
        <span className="text-sm font-medium text-slate-700">Fear Prompt List</span>
        {showPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showPrompts && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {FEAR_PROMPTS.map(prompt => (
              <span key={prompt} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded">
                {prompt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      {entries.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fears..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-2">
              {filteredEntries.length === 0 ? 'No entries match' : `${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'} found`}
            </p>
          )}
        </div>
      )}

      {/* Entries */}
      <div className="space-y-4 pb-24">
        {filteredEntries.length === 0 && entries.length > 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-600 mb-4">No entries match your search.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-700 text-base mb-2 font-medium">Acknowledging fears takes courage. Take your time.</p>
            <p className="text-slate-500 text-sm">There's no right or wrong way to do this.</p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <div key={entry.id} className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <h4 className="text-base font-semibold text-slate-700">Fear #{index + 1}</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Duplicate entry"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    What am I afraid of?
                  </label>
                  <Textarea
                    value={entry.fear || ''}
                    onChange={(e) => updateEntry(entry.id, 'fear', e.target.value)}
                    placeholder="List your fear..."
                    className="w-full min-h-[100px] text-base resize-y"
                    rows={3}
                    inputMode="text"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    What part of self have I been relying on which has failed me?
                  </label>
                  <select
                    value={entry.partOfSelfFailed || ''}
                    onChange={(e) => updateEntry(entry.id, 'partOfSelfFailed', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base bg-white"
                  >
                    <option value="">Select...</option>
                    {SEVEN_PARTS_OF_SELF.map(part => (
                      <option key={part.value} value={part.value}>{part.label} - {part.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Fear Prayer (Optional)
                  </label>
                  <Textarea
                    value={entry.fearPrayer || ''}
                    onChange={(e) => updateEntry(entry.id, 'fearPrayer', e.target.value)}
                    placeholder="God, please remove my fear of [fear] and direct my attention towards what you would have me be."
                    className="w-full min-h-[80px] text-base resize-y"
                    rows={3}
                    inputMode="text"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Entry Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-10">
        <button
          type="button"
          onClick={addEntry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:opacity-80 font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Fear Entry
        </button>
      </div>
    </div>
  );
}

// Sexual Conduct Section Component
function SexualConductSection({
  entries,
  searchQuery,
  setSearchQuery,
  addEntry,
  deleteEntry,
  checkForDuplicate,
  updateEntry,
}: {
  entries: SexualConductEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addEntry: () => void;
  deleteEntry: (id: string) => void;
  checkForDuplicate: (text: string, currentEntryId?: string) => string | null;
  updateEntry: (id: string, field: keyof SexualConductEntry, value: string | boolean) => void;
}) {
  const filteredEntries = searchQuery.trim()
    ? entries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
          entry.whomDidIHurt?.toLowerCase().includes(query) ||
          entry.whatDidIDo?.toLowerCase().includes(query) ||
          entry.whereWasIAtFault?.toLowerCase().includes(query) ||
          entry.whatShouldIHaveDoneInstead?.toLowerCase().includes(query)
        );
      })
    : entries;

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800 rounded-lg">
        <p className="font-medium mb-1">Read carefully Big Book pages 68-70.</p>
        <p className="text-xs">Again, make a list for yourself. What happened in each instance? How did it make you feel?</p>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-2">
              {filteredEntries.length === 0 ? 'No entries match' : `${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'} found`}
            </p>
          )}
        </div>
      )}

      {/* Entries */}
      <div className="space-y-4 pb-24">
        {filteredEntries.length === 0 && entries.length > 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-600 mb-4">No entries match your search.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-700 text-base mb-2 font-medium">This is important work. Be gentle with yourself.</p>
            <p className="text-slate-500 text-sm">You can take breaks whenever you need to.</p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <div key={entry.id} className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <h4 className="text-base font-semibold text-slate-700">Entry #{index + 1}</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Duplicate entry"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Whom did I hurt?
                  </label>
                  <Textarea
                    value={entry.whomDidIHurt || ''}
                    onChange={(e) => updateEntry(entry.id, 'whomDidIHurt', e.target.value)}
                    placeholder="Who was harmed?"
                    className="w-full min-h-[80px] text-base resize-y"
                    rows={2}
                    inputMode="text"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    What did I do to them?
                  </label>
                  <Textarea
                    value={entry.whatDidIDo || ''}
                    onChange={(e) => updateEntry(entry.id, 'whatDidIDo', e.target.value)}
                    placeholder="List each thing you did to them..."
                    className="w-full min-h-[120px] text-base resize-y"
                    rows={4}
                    inputMode="text"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 border-slate-300 bg-white">
                    <Checkbox
                      checked={entry.didIUnjustifiablyAvoid || false}
                      onCheckedChange={(checked) => updateEntry(entry.id, 'didIUnjustifiablyAvoid', checked as boolean)}
                      className="w-6 h-6"
                    />
                    <span className="text-base font-semibold text-slate-900">Did I unjustifiably avoid?</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Where was I at fault?
                  </label>
                  <Textarea
                    value={entry.whereWasIAtFault || ''}
                    onChange={(e) => updateEntry(entry.id, 'whereWasIAtFault', e.target.value)}
                    placeholder="What was my responsibility in this?"
                    className="w-full min-h-[120px] text-base resize-y"
                    rows={4}
                    inputMode="text"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    What should I have done instead?
                  </label>
                  <Textarea
                    value={entry.whatShouldIHaveDoneInstead || ''}
                    onChange={(e) => updateEntry(entry.id, 'whatShouldIHaveDoneInstead', e.target.value)}
                    placeholder="We asked God to mold our ideals and to help us live up to them..."
                    className="w-full min-h-[120px] text-base resize-y"
                    rows={4}
                    inputMode="text"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Entry Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-10">
        <button
          type="button"
          onClick={addEntry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:opacity-80 font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>
    </div>
  );
}

