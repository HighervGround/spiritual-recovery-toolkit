import { useState, useEffect, useCallback } from 'react';
import { Check, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { WeekProgress } from '../lib/storage';
import type { StorageBackend } from '../lib/storageBackend';

interface Week {
  number: number;
  steps: string;
  theme: string;
  emotionalFocus: string;
  dailyPractice: string;
  affirmation: string;
  grounding: string;
}

const weeklyPlan: Week[] = [
  {
    number: 1,
    steps: "Steps 1–3",
    theme: "Foundation: Honesty, Hope, Decision",
    emotionalFocus: "Opening to change and releasing control",
    dailyPractice: "Morning affirmation upon waking. Evening reflection: journal one moment of surrender or trust. Gentle breathwork for 5 minutes before bed.",
    affirmation: "I am safe enough to release control and invite healing.",
    grounding: "Place one hand on your heart, one on your belly. Breathe slowly for 3 minutes. Say aloud: 'I am here. I am safe. I am ready.'"
  },
  {
    number: 2,
    steps: "Step 4 (Part 1)",
    theme: "Self-Awareness: Beginning Inventory",
    emotionalFocus: "Curiosity and compassion toward patterns",
    dailyPractice: "Write for 15 minutes each morning: What patterns am I noticing? Where do I see fear, resentment, or shame? Use the lullaby technique each night to soften self-judgment.",
    affirmation: "I look at my past with compassion and courage.",
    grounding: "Body scan meditation. Lie down and bring gentle awareness to each part of your body, thanking it for carrying you this far."
  },
  {
    number: 3,
    steps: "Step 4 (Part 2)",
    theme: "Self-Awareness: Deepening Inventory",
    emotionalFocus: "Honoring survival strategies and grieving what no longer serves",
    dailyPractice: "Continue journaling. Add: What protected me once but limits me now? What strengths do I also carry? Practice revision technique for one painful memory.",
    affirmation: "I am more than my mistakes; I am a soul learning and growing.",
    grounding: "Walk slowly in nature or around your space. With each step, say: 'I release.' 'I am free.' 'I am whole.'"
  },
  {
    number: 4,
    steps: "Step 5",
    theme: "Vulnerability: Speaking Truth",
    emotionalFocus: "Courage to be witnessed with compassion",
    dailyPractice: "Identify a safe person to share with. Prepare by writing what you want to say. Practice self-compassion affirmations before and after. Visualize being held with love as you speak.",
    affirmation: "Speaking my truth releases shame and invites healing.",
    grounding: "Sit quietly with a warm drink. Place both hands around the cup and breathe in warmth. You are safe to be seen."
  },
  {
    number: 5,
    steps: "Step 6",
    theme: "Willingness: Readiness to Change",
    emotionalFocus: "Honoring resistance while inviting transformation",
    dailyPractice: "Morning practice: Name one pattern you're ready to release. Evening practice: Imagine your life without it. Use mental diet technique throughout the day to notice and replace old thought loops.",
    affirmation: "I am willing to release what no longer serves me.",
    grounding: "Hold something in your hands (a stone, a cup, etc.). Feel its weight. Set it down. Notice the freedom in your hands. This is letting go."
  },
  {
    number: 6,
    steps: "Step 7",
    theme: "Humility: Asking for Help",
    emotionalFocus: "Trust in grace and collaborative healing",
    dailyPractice: "Each morning, speak or write a humble request: 'Please remove what limits me. Help me become who I'm meant to be.' Throughout the day, notice signs of change, even small ones.",
    affirmation: "I humbly ask for help, and I trust I am heard.",
    grounding: "Kneel, sit, or stand with palms open. Speak your request aloud. Feel the relief of not carrying everything alone."
  },
  {
    number: 7,
    steps: "Step 8",
    theme: "Accountability: Preparing to Repair",
    emotionalFocus: "Acknowledging impact with discernment and boundaries",
    dailyPractice: "Create your amends list. For each name, note: What harm was done? Is it safe to approach? What amends do I owe myself? Practice self-compassion throughout.",
    affirmation: "I am willing to acknowledge the harm I have caused.",
    grounding: "Write each name on a slip of paper. Hold each one, breathe, and say: 'I see you. I honor this.' Place them gently in a safe container."
  },
  {
    number: 8,
    steps: "Step 9 (Part 1)",
    theme: "Integrity: Making Amends",
    emotionalFocus: "Courage to repair without attachment to outcome",
    dailyPractice: "Prepare for conversations. Write what you'll say. Practice with a trusted person. Use visualization to calm your nervous system. Make 1-2 amends this week if safe.",
    affirmation: "I approach amends with courage, humility, and love.",
    grounding: "Before each amends conversation, breathe deeply 10 times. Place your hand on your heart and say: 'I am doing my part.'"
  },
  {
    number: 9,
    steps: "Step 9 (Part 2)",
    theme: "Integrity: Continuing Repairs",
    emotionalFocus: "Honoring the process, releasing perfectionism",
    dailyPractice: "Continue making amends where appropriate. Journal about how it feels. Practice self-compassion for any responses you receive. Use revision technique if conversations don't go as hoped.",
    affirmation: "I take responsibility for my actions without attachment to outcomes.",
    grounding: "After each amends, rest. Place your hands over your heart and say: 'I have done what I can. I release the rest.'"
  },
  {
    number: 10,
    steps: "Step 10",
    theme: "Daily Practice: Ongoing Awareness",
    emotionalFocus: "Living with integrity and self-compassion",
    dailyPractice: "Each evening, do a gentle review: Where was I aligned? Where did I stumble? What repairs do I need to make? Celebrate growth. Use lullaby technique to affirm your commitment to awareness.",
    affirmation: "I practice daily awareness with compassion and honesty.",
    grounding: "End each day by placing your hand on your heart and saying: 'I did my best today. I am learning. I am growing.'"
  },
  {
    number: 11,
    steps: "Step 11",
    theme: "Spiritual Connection: Deepening Practice",
    emotionalFocus: "Listening for guidance and aligning with highest good",
    dailyPractice: "Morning: 10 minutes of meditation, prayer, or stillness. Ask: 'What do I need to know today?' Listen. Evening: Reflect on moments of guidance or connection. Practice gratitude.",
    affirmation: "I am deeply connected to the wisdom guiding my life.",
    grounding: "Sit in silence. Light a candle if you wish. Ask a question. Listen for the answer—it may come as a feeling, an image, or a knowing."
  },
  {
    number: 12,
    steps: "Step 12 – Integration & Gratitude",
    theme: "Service & Living the Principles",
    emotionalFocus: "Celebrating transformation and committing to ongoing practice",
    dailyPractice: "Reflect on your journey: How have I changed? What truths do I now carry? How do I want to be of service? Write a letter to your past self. Practice all 12 principles daily.",
    affirmation: "I have been transformed, and I live with new awareness.",
    grounding: "Sit quietly and place both hands over your heart. Feel gratitude for how far you've come. Say: 'I am awakened. I am of service. I live with love.'"
  }
];

interface WeeklyPlanProps {
  storage: StorageBackend;
}

export function WeeklyPlan({ storage }: WeeklyPlanProps) {
  const [weekProgress, setWeekProgress] = useState<WeekProgress[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');

  const loadWeekProgress = useCallback(async () => {
    const progress = await storage.getWeekProgress();
    setWeekProgress(progress);
  }, [storage]);

  useEffect(() => {
    loadWeekProgress();
  }, [loadWeekProgress]);

  const getWeekProgress = (weekNumber: number): WeekProgress => {
    return weekProgress.find(w => w.weekNumber === weekNumber) || {
      weekNumber,
      completed: false,
      notes: '',
      lastUpdated: new Date().toISOString(),
    };
  };

  const toggleWeekComplete = async (weekNumber: number) => {
    const current = getWeekProgress(weekNumber);
    await storage.updateWeekProgress(weekNumber, { completed: !current.completed });
    await loadWeekProgress();
  };

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  const startEditingNotes = (weekNumber: number) => {
    const current = getWeekProgress(weekNumber);
    setCurrentNotes(current.notes);
    setEditingNotes(weekNumber);
  };

  const saveNotes = async (weekNumber: number) => {
    await storage.updateWeekProgress(weekNumber, { notes: currentNotes });
    await loadWeekProgress();
    setEditingNotes(null);
    setCurrentNotes('');
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setCurrentNotes('');
  };

  const completedWeeks = weekProgress.filter(w => w.completed).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-slate-800 mb-4">🗓️ Cole's 12-Week Spiritual Step Plan</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          This is your flexible, self-guided journey through the 12 Steps over 12 weeks. Steps 1–3 are completed together 
          in Week 1 to establish foundation. Steps 4 and 9 receive two weeks each for deep work. The final week is for integration 
          and gratitude.
        </p>
        <p className="text-slate-600 leading-relaxed mb-6">
          Honor your pace. If you need more time with any step, take it. This plan is a guide, not a rule. Be gentle with yourself.
        </p>

        {/* Progress Indicator */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-700">Weekly Progress</span>
            <span className="text-blue-700">{completedWeeks} of 12 weeks completed</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
              style={{ width: `${(completedWeeks / 12) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {weeklyPlan.map((week) => {
          const progress = getWeekProgress(week.number);
          const isExpanded = expandedWeek === week.number;
          
          return (
            <div
              key={week.number}
              className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow ${
                progress.completed ? 'border-green-300 bg-green-50/30' : 'border-slate-200'
              }`}
            >
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.number)}
                className="w-full px-6 py-4 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWeekComplete(week.number);
                    }}
                    className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition-colors ${
                      progress.completed
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                    }`}
                    title={progress.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {progress.completed ? <Check className="w-7 h-7" /> : week.number}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-slate-800">Week {week.number}: {week.steps}</h3>
                      {progress.completed && (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                          Completed
                        </span>
                      )}
                      {progress.notes && (
                        <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">
                          📝 Notes
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 text-sm">{week.theme}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4 border-t border-slate-100">
                  {/* Personal Notes Section */}
                  <div className="pt-4 bg-amber-50 rounded-lg p-5 border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-slate-800">📝 Your Week Notes</h4>
                      {editingNotes !== week.number && (
                        <button
                          onClick={() => startEditingNotes(week.number)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          {progress.notes ? 'Edit' : 'Add Notes'}
                        </button>
                      )}
                    </div>
                    
                    {editingNotes === week.number ? (
                      <div className="space-y-3">
                        <textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Write your personal reflections, progress, insights, or goals for this week..."
                          className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNotes(week.number)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEditingNotes}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : progress.notes ? (
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{progress.notes}</p>
                    ) : (
                      <p className="text-slate-500 italic text-sm">No notes yet. Click "Add Notes" to record your thoughts and progress for this week.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-slate-700 mb-1 text-sm font-semibold">Emotional Focus</h4>
                    <p className="text-slate-600 text-sm">{week.emotionalFocus}</p>
                  </div>

                  <div>
                    <h4 className="text-slate-700 mb-1 text-sm font-semibold">Daily Practice</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{week.dailyPractice}</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="text-slate-700 mb-1 text-sm font-semibold">This Week's Affirmation</h4>
                    <p className="text-slate-800 italic text-sm">"{week.affirmation}"</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-slate-700 mb-1 text-sm font-semibold">Grounding Exercise</h4>
                    <p className="text-slate-600 text-sm">{week.grounding}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-200">
        <h3 className="text-slate-800 mb-3">Moving Forward</h3>
        <p className="text-slate-600 leading-relaxed mb-4">
          After Week 12, the journey continues. Recovery is a lifelong practice of awareness, connection, and service. 
          Return to any step when you need to. Keep practicing the principles. Stay connected to your spiritual center.
        </p>
        <p className="text-slate-700 italic">
          You are not who you were. You are not who you will become. You are here, now, growing—and that is enough.
        </p>
      </div>
    </div>
  );
}
