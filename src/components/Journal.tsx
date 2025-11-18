import { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar as CalendarIcon, Edit2, X, Search, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { storage, JournalEntry } from '../lib/storage';

const dailyPrompts = [
  "How am I feeling physically, emotionally, and spiritually right now?",
  "What truth or emotion is asking to be felt today?",
  "What thought or pattern am I ready to reframe?",
  "What am I grateful for in this moment?",
  "What did I learn about myself today?",
  "Where did I feel aligned with my values? Where did I stumble?",
  "What boundary or support would help me tomorrow?",
  "What small sign of healing or growth did I notice today?"
];

const weeklyPrompts = [
  "What did I learn about myself this week?",
  "Where did I feel connection, guidance, or energy?",
  "What patterns or emotions showed up repeatedly?",
  "What am I proud of from this week?",
  "What do I want to release or let go of?",
  "What boundaries or supports will help me next week?",
  "How have I grown since beginning this journey?"
];

const affirmations = [
  "I allow healing energy to move through every part of me.",
  "I trust the quiet wisdom guiding my growth.",
  "My mind and body are allies in recovery.",
  "I release the need to control what I cannot change.",
  "I am safe enough to rest, trust, and receive.",
  "I am held by a loving force greater than my fear.",
  "I honor my pace and my process with compassion.",
  "I am worthy of peace, connection, and joy.",
  "I practice awareness without judgment.",
  "I choose love over fear, truth over hiding.",
  "I trust that I am being transformed with grace.",
  "My healing contributes to the healing of others.",
  "I speak my truth with courage and kindness.",
  "I forgive myself for what I didn't know before.",
  "I am becoming who I was always meant to be."
];

type ViewMode = 'list' | 'edit' | 'view' | 'resources';

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [entryType, setEntryType] = useState<'daily' | 'weekly' | 'free'>('free');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromptPicker, setShowPromptPicker] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    setEntries(storage.getJournalEntries().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) return;

    const entry: JournalEntry = {
      id: editingEntry?.id || Date.now().toString(),
      title: currentTitle.trim() || getDefaultTitle(currentEntry),
      date: editingEntry?.date || new Date().toISOString(),
      prompt: selectedPrompt,
      content: currentEntry,
      type: entryType,
    };

    storage.saveJournalEntry(entry);
    loadEntries();
    resetEditor();
    setViewMode('list');
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentTitle(entry.title);
    setCurrentEntry(entry.content);
    setSelectedPrompt(entry.prompt);
    setEntryType(entry.type);
    setViewMode('edit');
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewMode('view');
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      storage.deleteJournalEntry(id);
      loadEntries();
      if (selectedEntry?.id === id) {
        setViewMode('list');
      }
    }
  };

  const resetEditor = () => {
    setCurrentEntry('');
    setCurrentTitle('');
    setSelectedPrompt('');
    setEntryType('free');
    setEditingEntry(null);
  };

  const getDefaultTitle = (content: string): string => {
    const firstLine = content.split('\n')[0].trim();
    return firstLine.slice(0, 50) || 'Untitled Note';
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatFullDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getPreviewText = (content: string): string => {
    return content.slice(0, 100).replace(/\n/g, ' ');
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // List View - iPhone Notes style
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-slate-900">Notes</h1>
              <button
                onClick={() => setViewMode('resources')}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
              >
                Prompts
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="divide-y divide-slate-200">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No notes yet</h3>
              <p className="text-slate-600 mb-6">Start writing your first note</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleViewEntry(entry)}
                className="w-full bg-white hover:bg-slate-50 p-4 text-left transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {entry.title}
                      </h3>
                      {entry.type !== 'free' && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                          {entry.type === 'daily' ? 'Daily' : 'Weekly'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <span>{formatDate(entry.date)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="truncate">{getPreviewText(entry.content)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => {
            resetEditor();
            setViewMode('edit');
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // View Entry Mode
  if (viewMode === 'view' && selectedEntry) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-2 flex items-center justify-between sticky top-0 bg-white z-10">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Notes</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEditEntry(selectedEntry)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => handleDeleteEntry(selectedEntry.id)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {selectedEntry.title}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {formatFullDate(selectedEntry.date)}
          </p>
          
          {selectedEntry.prompt && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 italic">{selectedEntry.prompt}</p>
            </div>
          )}
          
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
              {selectedEntry.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Edit/Create Mode
  if (viewMode === 'edit') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-2 flex items-center justify-between sticky top-0 bg-white z-10">
          <button
            onClick={() => {
              resetEditor();
              setViewMode('list');
            }}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 p-2"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Cancel</span>
          </button>
          <button
            onClick={handleSaveEntry}
            disabled={!currentEntry.trim()}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed font-semibold p-2"
          >
            <Check className="w-5 h-5" />
            <span className="text-sm">Done</span>
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Title Input */}
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-3xl font-bold text-slate-900 placeholder-slate-400 border-0 focus:outline-none focus:ring-0 p-0 mb-4 bg-transparent"
          />

          {/* Date Display */}
          <p className="text-sm text-slate-500 mb-6">
            {formatFullDate(editingEntry?.date || new Date().toISOString())}
          </p>

          {/* Entry Type Selection */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setEntryType('free')}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                entryType === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Free Write
            </button>
            <button
              onClick={() => setEntryType('daily')}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                entryType === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily Prompt
            </button>
            <button
              onClick={() => setEntryType('weekly')}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                entryType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Weekly Prompt
            </button>
          </div>

          {/* Prompt Selection - Mobile First */}
          {entryType !== 'free' && (
            <>
              <button
                onClick={() => setShowPromptPicker(true)}
                className="w-full px-4 py-4 rounded-lg border-2 border-slate-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 bg-white flex items-center justify-between"
              >
                <span className={`text-lg ${selectedPrompt ? 'text-slate-900' : 'text-slate-500'}`}>
                  {selectedPrompt || 'Tap to select a prompt...'}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              {/* Prompt Picker Modal */}
              {showPromptPicker && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col">
                  <div className="border-b border-slate-200 p-3 flex items-center justify-between sticky top-0 bg-white">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {entryType === 'daily' ? 'Daily Prompts' : 'Weekly Prompts'}
                    </h2>
                    <button
                      onClick={() => setShowPromptPicker(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {(entryType === 'daily' ? dailyPrompts : weeklyPrompts).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPrompt(prompt);
                          setShowPromptPicker(false);
                        }}
                        className={`w-full px-4 py-5 text-left border-b border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                          selectedPrompt === prompt ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <p className="text-base leading-relaxed text-slate-700">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedPrompt && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 italic">{selectedPrompt}</p>
            </div>
          )}

          {/* Content Textarea */}
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[400px] text-lg text-slate-700 placeholder-slate-400 border-0 focus:outline-none focus:ring-0 p-0 resize-none bg-transparent"
            autoFocus
          />
        </div>
      </div>
    );
  }

  // Resources View
  if (viewMode === 'resources') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 p-3">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-2 p-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Notes</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900">Prompts & Resources</h1>
        </div>

        <div className="p-4 space-y-4">
          {/* Daily Prompts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                📝
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Daily Reflection Prompts</h3>
            </div>
            
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Use these prompts to check in with yourself each day. Choose what resonates.
            </p>

            <div className="space-y-3">
              {dailyPrompts.map((prompt, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-slate-700 text-sm">{prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Prompts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                📅
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Weekly Reflection Prompts</h3>
            </div>
            
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              At the end of each week, take 20-30 minutes to reflect more deeply.
            </p>

            <div className="space-y-3">
              {weeklyPrompts.map((prompt, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4 border-l-4 border-indigo-400">
                  <p className="text-slate-700 text-sm">{prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Affirmations */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                ✦
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Affirmations for Recovery</h3>
            </div>
            
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Choose one each morning to carry with you. Speak them with feeling and conviction.
            </p>

            <div className="grid gap-3">
              {affirmations.map((affirmation, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <p className="text-slate-700 text-sm italic">"{affirmation}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Journaling Tips */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">💡 Gentle Journaling Guidance</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                <strong>Write freely.</strong> Don't worry about grammar or structure. Let the words flow.
              </li>
              <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                <strong>Be honest.</strong> This is your private space. Write what's true.
              </li>
              <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                <strong>Practice self-compassion.</strong> If hard emotions arise, breathe.
              </li>
              <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                <strong>Take breaks.</strong> Pause if it feels overwhelming.
              </li>
              <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                <strong>Celebrate progress.</strong> Every step matters.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
