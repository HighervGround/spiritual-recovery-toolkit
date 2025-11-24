import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, HelpCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
// Removed HandwritingCanvas - using iPad native handwriting-to-text instead
import type { ResentmentEntry } from '../lib/storage';
import type { StorageBackend } from '../lib/storageBackend';

// Helpful prompts from Step 4 worksheets
const PEOPLE_PROMPTS = [
  'Father', 'Mother', 'Sisters', 'Brothers', 'Aunts', 'Uncles', 'Cousins',
  'Clergy', 'Police', 'Lawyers', 'Judges', 'Doctors', 'Employers', 'Employees',
  'Co-Workers', 'In-Laws', 'Husbands', 'Wives', 'Creditors', 'Teachers',
  'Childhood Friends', 'School Friends', 'Life Long Friends', 'Best Friends'
];

const INSTITUTIONS_PROMPTS = [
  'Marriage', 'Bible', 'Church', 'Religion', 'Law', 'Authority', 'Government',
  'Education System', 'Correctional System', 'Mental Health System',
  'Nationality', 'Races'
];

const PRINCIPLES_PROMPTS = [
  'God-Deity', 'Retribution', 'Ten Commandments', 'Jesus Christ', 'Satan',
  'Death', 'Life After Death', 'Heaven', 'Hell', 'Sin', 'Adultery',
  'Golden Rule', 'Original Sin', 'Seven Deadly Sins'
];

interface ResentmentReviewProps {
  weekNumber: number;
  storage: StorageBackend;
}

export function ResentmentReview({ weekNumber, storage }: ResentmentReviewProps) {
  const [entries, setEntries] = useState<ResentmentEntry[]>([]);
  const [activeColumn, setActiveColumn] = useState<1 | 2 | 3 | 4>(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    loadEntries();
  }, [weekNumber]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadEntries = async () => {
    try {
      isInitialLoad.current = true;
      const weekProgress = await storage.getWeekProgress();
      const week = weekProgress.find(w => w.weekNumber === weekNumber);
      const entries = week?.resentmentEntries || [];
      setEntries(Array.isArray(entries) ? entries : []);
      setSaved(true);
    } catch (error: any) {
      console.error('Error loading entries:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      alert(`Error loading entries: ${errorMessage}`);
    } finally {
      isInitialLoad.current = false;
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(async (newEntries: ResentmentEntry[]) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after 800ms of no typing
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        setSaved(false);
        await storage.updateWeekProgress(weekNumber, {
          resentmentEntries: newEntries,
        });
        setSaved(true);
        // Hide saved indicator after 2 seconds
        setTimeout(() => setSaved(false), 2000);
      } catch (error: any) {
        console.error('Error saving entries:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        const isColumnError = errorMessage.includes('resentment_entries') || errorMessage.includes('column');
        const helpfulMessage = isColumnError 
          ? 'The database column for resentment entries is missing. Please run the migration SQL in Supabase.'
          : errorMessage;
        alert(`Error saving entries: ${helpfulMessage}`);
        // Reload on error
        await loadEntries();
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [weekNumber, storage]);

  // Update entry immediately in local state, then debounce save
  const updateEntry = useCallback((id: string, updates: Partial<ResentmentEntry>) => {
    setEntries(prevEntries => {
      const updated = prevEntries.map(e =>
        e.id === id ? { ...e, ...updates } : e
      );
      // Don't save on initial load
      if (!isInitialLoad.current) {
        debouncedSave(updated);
      }
      return updated;
    });
  }, [debouncedSave]);

  const updateColumn1 = useCallback((id: string, value: string) => {
    updateEntry(id, { column1: value });
  }, [updateEntry]);

  const updateColumn2 = useCallback((id: string, value: string) => {
    updateEntry(id, { column2: value });
  }, [updateEntry]);


  const updateColumn3 = useCallback((
    id: string,
    category: 'socialInstinct' | 'securityInstinct' | 'sexInstinct' | 'ambitions',
    field?: string,
    value?: boolean
  ) => {
    setEntries(prevEntries => {
      const entry = prevEntries.find(e => e.id === id);
      if (!entry) return prevEntries;

      const updated = { ...entry.column3 };
      if (category === 'ambitions') {
        updated.ambitions = value ?? !updated.ambitions;
      } else if (field) {
        updated[category] = {
          ...updated[category],
          [field]: value ?? !(updated[category] as any)[field],
        };
      }

      const newEntries = prevEntries.map(e =>
        e.id === id ? { ...e, column3: updated } : e
      );
      
      if (!isInitialLoad.current) {
        debouncedSave(newEntries);
      }
      
      return newEntries;
    });
  }, [debouncedSave]);

  const updateColumn4 = useCallback((id: string, field: string, value: boolean | string) => {
    setEntries(prevEntries => {
      const newEntries = prevEntries.map(e =>
        e.id === id ? {
          ...e,
          column4: {
            ...e.column4,
            [field]: value,
          },
        } : e
      );
      
      if (!isInitialLoad.current) {
        debouncedSave(newEntries);
      }
      
      return newEntries;
    });
  }, [debouncedSave]);

  const addEntry = async () => {
    try {
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
          whereWasIToBlame: '',
        },
      };
      const newEntries = [...entries, newEntry];
      setEntries(newEntries);
      await debouncedSave(newEntries);
    } catch (error: any) {
      console.error('Error adding entry:', error);
      alert(`Error adding entry: ${error?.message || error?.toString() || 'Unknown error'}`);
    }
  };

  const deleteEntry = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    const entryNumber = entries.findIndex(e => e.id === id) + 1;
    const hasContent = entry && (
      (entry.column1 || entry.column1Text || '').trim().length > 0 ||
      (entry.column2 || entry.column2Text || '').trim().length > 0
    );
    
    const message = hasContent 
      ? `Are you sure you want to delete Entry #${entryNumber}? This will permanently remove all the work you've done on this entry.`
      : `Delete Entry #${entryNumber}?`;
    
    if (confirm(message)) {
      try {
        const newEntries = entries.filter(e => e.id !== id);
        setEntries(newEntries);
        await debouncedSave(newEntries);
      } catch (error: any) {
        console.error('Error deleting entry:', error);
        alert(`Error deleting entry: ${error?.message || error?.toString() || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Review of Resentments</h3>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-slate-500">Saving...</span>
            )}
            {saved && !saving && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-sm text-slate-600 hover:text-slate-900"
              aria-label={showInstructions ? 'Hide instructions' : 'Show instructions'}
            >
              {showInstructions ? 'Hide' : 'Help'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions - Collapsible */}
      {showInstructions && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-sm text-slate-700">
          <p className="mb-2"><strong>Work column by column:</strong> Complete Column 1 for all entries, then Column 2, then 3, then 4.</p>
          <p className="text-xs text-slate-600">Column 1: Who/what are you resentful at? • Column 2: Why? • Column 3: Which part of self affected? • Column 4: What were your wrongs?</p>
        </div>
      )}

      {/* Column Selector - Simplified */}
      {entries.length > 0 && (
        <div className="sticky top-[57px] z-10 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((col) => {
              // Calculate completion count for guidance (but don't block access)
              const completionCount = col === 1 ? entries.filter(e => {
                const val = e.column1 || e.column1Text || '';
                return val.trim().length > 0;
              }).length :
              col === 2 ? entries.filter(e => {
                const val = e.column2 || e.column2Text || '';
                return val.trim().length > 0;
              }).length :
              col === 3 ? entries.filter(e => {
                const col2Done = (e.column2 || e.column2Text || '').trim().length > 0;
                return col2Done && (
                  e.column3.socialInstinct.selfEsteem || e.column3.socialInstinct.personalRelationships ||
                  e.column3.socialInstinct.material || e.column3.socialInstinct.emotional ||
                  e.column3.securityInstinct.social || e.column3.securityInstinct.security ||
                  e.column3.sexInstinct.acceptableSexRelations || e.column3.sexInstinct.hiddenSexRelations ||
                  e.column3.sexInstinct.sexual || e.column3.ambitions
                );
              }).length :
              entries.filter(e => {
                const col3Done = (e.column2 || e.column2Text || '').trim().length > 0 && (
                  e.column3.socialInstinct.selfEsteem || e.column3.socialInstinct.personalRelationships ||
                  e.column3.socialInstinct.material || e.column3.socialInstinct.emotional ||
                  e.column3.securityInstinct.social || e.column3.securityInstinct.security ||
                  e.column3.sexInstinct.acceptableSexRelations || e.column3.sexInstinct.hiddenSexRelations ||
                  e.column3.sexInstinct.sexual || e.column3.ambitions
                );
                return col3Done && (
                  e.column4.selfish || e.column4.dishonest ||
                  e.column4.selfSeekingAndFrightened || e.column4.inconsiderate
                );
              }).length;

              const isComplete = completionCount === entries.length && entries.length > 0;
              const showProgress = completionCount > 0 && completionCount < entries.length;

              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => setActiveColumn(col as 1 | 2 | 3 | 4)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    activeColumn === col
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Column {col}</span>
                    {isComplete && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  {showProgress && (
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {completionCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {activeColumn < 4 && (
            <button
              type="button"
              onClick={() => setActiveColumn((activeColumn + 1) as 1 | 2 | 3 | 4)}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-all"
            >
              <span>Continue to Column {activeColumn + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Entries - Show Only Active Column */}
      <div className="p-4 space-y-4 pb-24">
        {entries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-600 mb-4">Tap "Add Entry" below to begin</p>
          </div>
        ) : (
          entries.map((entry, index) => {
            // Check completion: either the current mode has content, or the other mode has content
            const col1Complete = (entry.column1 || entry.column1Text || '').trim().length > 0;
            const col2Complete = (entry.column2 || entry.column2Text || '').trim().length > 0;
            const col3Complete = col2Complete && (
              entry.column3.socialInstinct.selfEsteem || entry.column3.socialInstinct.personalRelationships ||
              entry.column3.socialInstinct.material || entry.column3.socialInstinct.emotional ||
              entry.column3.securityInstinct.social || entry.column3.securityInstinct.security ||
              entry.column3.sexInstinct.acceptableSexRelations || entry.column3.sexInstinct.hiddenSexRelations ||
              entry.column3.sexInstinct.sexual || entry.column3.ambitions
            );
            const col4Complete = col3Complete && (
              entry.column4.selfish || entry.column4.dishonest ||
              entry.column4.selfSeekingAndFrightened || entry.column4.inconsiderate
            );

            return (
              <div key={entry.id} className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 shadow-sm">
                {/* Entry Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <h4 className="text-base font-semibold text-slate-700">Entry #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label={`Delete entry ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* COLUMN 1 - Only show if activeColumn === 1 */}
                {activeColumn === 1 && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Column 1: I'm resentful at
                    </label>
                    <Textarea
                      value={entry.column1 || entry.column1Text || ''}
                      onChange={(e) => updateColumn1(entry.id, e.target.value)}
                      placeholder="Who or what are you resentful at? (You can type or write with Apple Pencil - iPad will convert handwriting automatically)"
                      className="w-full min-h-[100px] text-base resize-y"
                      rows={3}
                      inputMode="text"
                    />
                  </div>
                )}

                {/* COLUMN 2 - Only show if activeColumn === 2 */}
                {activeColumn === 2 && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Column 2: The cause
                    </label>
                    <Textarea
                      value={entry.column2 || entry.column2Text || ''}
                      onChange={(e) => updateColumn2(entry.id, e.target.value)}
                      placeholder="Why was I angry? What specifically caused the resentment? (You can type or write with Apple Pencil - iPad will convert handwriting automatically)"
                      className="w-full min-h-[100px] text-base resize-y"
                      rows={3}
                      inputMode="text"
                    />
                  </div>
                )}

                {/* COLUMN 3 - AFFECTS MY - Only show if activeColumn === 3 */}
                {activeColumn === 3 && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold text-slate-700 mb-1">Column 3: Affects my</h5>
                      <p className="text-xs text-slate-500">Which part of self is affected?</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Social Instinct */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h6 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Social Instinct</h6>
                        <div className="grid grid-cols-2 gap-3">
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
                              <span className="text-base font-semibold text-slate-900 block">Self-Esteem</span>
                              <span className="text-xs text-slate-600">How I think of myself</span>
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
                              <span className="text-base font-semibold text-slate-900 block">Personal Relationships</span>
                              <span className="text-xs text-slate-600">Our relations with other people</span>
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
                              <span className="text-base font-semibold text-slate-900 block">Material</span>
                              <span className="text-xs text-slate-600">Money, property, possessions</span>
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
                              <span className="text-base font-semibold text-slate-900 block">Emotional Security</span>
                              <span className="text-xs text-slate-600">General sense of personal well being</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Security Instinct */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h6 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Security Instinct</h6>
                        <div className="grid grid-cols-2 gap-3">
                          <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                            entry.column3.securityInstinct.social
                              ? 'bg-blue-100 border-blue-500 shadow-md'
                              : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                            <Checkbox
                              checked={entry.column3.securityInstinct.social}
                              onCheckedChange={(checked) =>
                                updateColumn3(entry.id, 'securityInstinct', 'social', checked as boolean)
                              }
                              className="w-6 h-6"
                            />
                            <span className="text-base font-semibold text-slate-900">Social</span>
                          </label>
                          <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                            entry.column3.securityInstinct.security
                              ? 'bg-blue-100 border-blue-500 shadow-md'
                              : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                            <Checkbox
                              checked={entry.column3.securityInstinct.security}
                              onCheckedChange={(checked) =>
                                updateColumn3(entry.id, 'securityInstinct', 'security', checked as boolean)
                              }
                              className="w-6 h-6"
                            />
                            <span className="text-base font-semibold text-slate-900">Security</span>
                          </label>
                        </div>
                      </div>

                      {/* Sex Instinct */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h6 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Sex Instinct</h6>
                        <div className="grid grid-cols-1 gap-3">
                          <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                            entry.column3.sexInstinct.acceptableSexRelations
                              ? 'bg-blue-100 border-blue-500 shadow-md'
                              : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                            <Checkbox
                              checked={entry.column3.sexInstinct.acceptableSexRelations}
                              onCheckedChange={(checked) =>
                                updateColumn3(entry.id, 'sexInstinct', 'acceptableSexRelations', checked as boolean)
                              }
                              className="w-6 h-6"
                            />
                            <span className="text-base font-semibold text-slate-900">Acceptable Sex Relations</span>
                          </label>
                          <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                            entry.column3.sexInstinct.hiddenSexRelations
                              ? 'bg-blue-100 border-blue-500 shadow-md'
                              : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                            <Checkbox
                              checked={entry.column3.sexInstinct.hiddenSexRelations}
                              onCheckedChange={(checked) =>
                                updateColumn3(entry.id, 'sexInstinct', 'hiddenSexRelations', checked as boolean)
                              }
                              className="w-6 h-6"
                            />
                            <span className="text-base font-semibold text-slate-900">Hidden Sex Relations</span>
                          </label>
                          <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                            entry.column3.sexInstinct.sexual
                              ? 'bg-blue-100 border-blue-500 shadow-md'
                              : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                            <Checkbox
                              checked={entry.column3.sexInstinct.sexual}
                              onCheckedChange={(checked) =>
                                updateColumn3(entry.id, 'sexInstinct', 'sexual', checked as boolean)
                              }
                              className="w-6 h-6"
                            />
                            <span className="text-base font-semibold text-slate-900">Sexual</span>
                          </label>
                        </div>
                      </div>

                      {/* Ambitions */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h6 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Ambitions</h6>
                        <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all border-2 ${
                          entry.column3.ambitions
                            ? 'bg-blue-100 border-blue-500 shadow-md'
                            : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}>
                          <Checkbox
                            checked={entry.column3.ambitions}
                            onCheckedChange={(checked) =>
                              updateColumn3(entry.id, 'ambitions', undefined, checked as boolean)
                            }
                            className="w-6 h-6"
                          />
                          <span className="text-base font-semibold text-slate-900">Ambitions</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* COLUMN 4 - Nature of My Wrongs - Only show if activeColumn === 4 */}
                {activeColumn === 4 && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-700 mb-1">Column 4: Nature of my wrongs</h5>
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
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Where was I to blame?
                      </label>
                      <p className="text-xs text-slate-500 mb-2">What's the truth here? Where was my responsibility?</p>
                      <Textarea
                        value={entry.column4.whereWasIToBlame || ''}
                        onChange={(e) => updateColumn4(entry.id, 'whereWasIToBlame', e.target.value)}
                        placeholder="What was my part? What could I have done differently? (You can type or write with Apple Pencil - iPad will convert handwriting automatically)"
                        className="w-full min-h-[100px] text-base resize-y"
                        rows={3}
                        inputMode="text"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Entry Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addEntry();
          }}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:opacity-80 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>
    </div>
  );
}
