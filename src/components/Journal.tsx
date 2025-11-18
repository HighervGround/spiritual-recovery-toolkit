import { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar as CalendarIcon } from 'lucide-react';
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

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [entryType, setEntryType] = useState<'daily' | 'weekly' | 'free'>('free');

  useEffect(() => {
    setEntries(storage.getJournalEntries().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, []);

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      prompt: selectedPrompt,
      content: currentEntry,
      type: entryType,
    };

    storage.saveJournalEntry(newEntry);
    setEntries([newEntry, ...entries]);
    setCurrentEntry('');
    setSelectedPrompt('');
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      storage.deleteJournalEntry(id);
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-slate-800 mb-4">📔 Cole's Spiritual Recovery Journal</h2>
        <p className="text-slate-600 leading-relaxed">
          This journal is your sacred space for reflection, processing, and integration. Use these prompts as often as you need—daily, 
          weekly, or whenever you feel called to write. There is no right way to journal. Let your words flow without judgment.
        </p>
      </div>

      {/* New Journal Entry */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-slate-800">New Journal Entry</h3>
        </div>

        <div className="space-y-4">
          {/* Entry Type Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setEntryType('free')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                entryType === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Free Write
            </button>
            <button
              onClick={() => setEntryType('daily')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                entryType === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily Prompt
            </button>
            <button
              onClick={() => setEntryType('weekly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                entryType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Weekly Prompt
            </button>
          </div>

          {/* Prompt Selection */}
          {entryType !== 'free' && (
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a prompt...</option>
              {(entryType === 'daily' ? dailyPrompts : weeklyPrompts).map((prompt, idx) => (
                <option key={idx} value={prompt}>
                  {prompt}
                </option>
              ))}
            </select>
          )}

          {selectedPrompt && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-slate-700">{selectedPrompt}</p>
            </div>
          )}

          {/* Text Area */}
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />

          {/* Save Button */}
          <button
            onClick={handleSaveEntry}
            disabled={!currentEntry.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Saved Entries */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-slate-800">Previous Entries ({entries.length})</h3>
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">{formatDate(entry.date)}</p>
                    {entry.type !== 'free' && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                        {entry.type === 'daily' ? 'Daily Reflection' : 'Weekly Reflection'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              {entry.prompt && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-600 italic">{entry.prompt}</p>
                </div>
              )}
              
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Daily Reflection Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            📝
          </div>
          <h3 className="text-slate-800">Daily Reflection Prompts</h3>
        </div>
        
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use these prompts to check in with yourself each day. You don't need to answer all of them—choose what resonates.
        </p>

        <div className="space-y-3">
          {dailyPrompts.map((prompt, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-400">
              <p className="text-slate-700">{prompt}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h4 className="text-slate-800 mb-2">Today's Affirmation or Visualization Focus</h4>
          <p className="text-slate-600 italic">Write or speak one affirmation that feels true for you today. Return to it throughout the day.</p>
        </div>
      </div>

      {/* Weekly Reflection Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
            📅
          </div>
          <h3 className="text-slate-800">Weekly Reflection Prompts</h3>
        </div>
        
        <p className="text-slate-600 mb-4 leading-relaxed">
          At the end of each week, take 20-30 minutes to reflect more deeply. Look back at your daily entries if you kept them.
        </p>

        <div className="space-y-3">
          {weeklyPrompts.map((prompt, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-4 border-l-4 border-indigo-400">
              <p className="text-slate-700">{prompt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Affirmations Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            ✦
          </div>
          <h3 className="text-slate-800">Affirmations for Recovery & Healing</h3>
        </div>
        
        <p className="text-slate-600 mb-4 leading-relaxed">
          These affirmations blend 12-Step principles, trauma recovery wisdom, and subconscious mind work. 
          Choose one each morning to carry with you, or use several throughout the day. Speak them with feeling and conviction.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {affirmations.map((affirmation, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-slate-700 italic">"{affirmation}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journaling Tips */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-slate-800 mb-3">💡 Gentle Journaling Guidance</h3>
        <ul className="space-y-2 text-slate-600">
          <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
            <strong>Write freely.</strong> Don't worry about grammar, structure, or "doing it right." Let the words flow.
          </li>
          <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
            <strong>Be honest.</strong> This is your private space. Write what's true, even if it's difficult.
          </li>
          <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
            <strong>Practice self-compassion.</strong> If hard emotions arise, breathe. You're not doing anything wrong.
          </li>
          <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
            <strong>Take breaks.</strong> If it feels overwhelming, pause. Return when you're ready.
          </li>
          <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
            <strong>Celebrate progress.</strong> Notice small shifts. Healing isn't linear, and every step matters.
          </li>
          <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
            <strong>Use other formats.</strong> If writing feels hard, try voice notes, art, or movement. Expression takes many forms.
          </li>
        </ul>
      </div>

      {/* Closing Note */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border border-slate-200">
        <p className="text-slate-700 leading-relaxed text-center italic">
          "Your story is sacred. Your healing matters. Every word you write is an act of courage and self-love. 
          Keep going, Cole. You are not alone on this path."
        </p>
      </div>
    </div>
  );
}
