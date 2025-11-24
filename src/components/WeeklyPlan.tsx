import { useState, useEffect, useCallback } from 'react';
import { Check, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { WeekProgress } from '../lib/storage';
import type { StorageBackend } from '../lib/storageBackend';
import { ResentmentReview } from './ResentmentReview';

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
    try {
      const current = getWeekProgress(weekNumber);
      await storage.updateWeekProgress(weekNumber, { completed: !current.completed });
      await loadWeekProgress();
    } catch (error: any) {
      console.error('Error toggling week completion:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      alert(`Error updating week progress: ${errorMessage}\n\nIf using Supabase, make sure you've run the migration to add the resentment_entries column.`);
    }
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
    <div>
      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-semibold text-black mb-2">12-Week Plan</h2>
        <p className="text-base text-slate-600 leading-relaxed mb-4">
          Your flexible, self-guided journey through the 12 Steps over 12 weeks. Steps 1–3 are completed together 
          in Week 1 to establish foundation. Steps 4 and 9 receive two weeks each for deep work.
        </p>
        
        {/* Progress Indicator */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Weekly Progress</span>
            <span className="text-base font-medium text-black">{completedWeeks} of 12</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${(completedWeeks / 12) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        {weeklyPlan.map((week) => {
          const progress = getWeekProgress(week.number);
          const isExpanded = expandedWeek === week.number;
          
          return (
            <div key={week.number} className="border-b border-slate-200">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.number)}
                className="w-full px-4 py-4 flex items-center justify-between active:bg-slate-50"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    progress.completed
                      ? 'bg-blue-600'
                      : 'border-2 border-slate-300'
                  }`}>
                    {progress.completed ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-base text-slate-600">{week.number}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-black mb-1">Week {week.number}: {week.steps}</h3>
                    <p className="text-sm text-slate-600 truncate">{week.theme}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              {/* Complete Button */}
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWeekComplete(week.number);
                  }}
                  className="text-sm text-blue-600 active:opacity-50"
                >
                  {progress.completed ? 'Mark as incomplete' : 'Mark as complete'}
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 py-4 space-y-4 bg-slate-50">
                  {/* Resentment Review for Step 4 (Weeks 2 and 3) */}
                  {(week.number === 2 || week.number === 3) && (
                    <ResentmentReview weekNumber={week.number} storage={storage} />
                  )}

                  {/* Personal Notes Section */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-medium text-black">Week Notes</h4>
                      {editingNotes !== week.number && (
                        <button
                          onClick={() => startEditingNotes(week.number)}
                          className="text-sm text-blue-600 active:opacity-50"
                        >
                          {progress.notes ? 'Edit' : 'Add'}
                        </button>
                      )}
                    </div>
                    
                    {editingNotes === week.number ? (
                      <div className="space-y-3">
                        <textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Write your personal reflections, progress, insights, or goals for this week..."
                          className="w-full min-h-[120px] px-3 py-3 border-b border-slate-300 text-base text-black focus:outline-none focus:border-blue-600 resize-y bg-white"
                          style={{ fontSize: '16px' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNotes(week.number)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg active:opacity-80 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingNotes}
                            className="px-4 py-2 text-slate-600 active:opacity-50 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : progress.notes ? (
                      <p className="text-base text-black whitespace-pre-wrap leading-relaxed">{progress.notes}</p>
                    ) : (
                      <p className="text-sm text-slate-500">No notes yet.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-medium text-black mb-2">Emotional Focus</h4>
                    <p className="text-base text-slate-600 leading-relaxed">{week.emotionalFocus}</p>
                  </div>

                  <div>
                    <h4 className="text-base font-medium text-black mb-2">Daily Practice</h4>
                    <p className="text-base text-slate-600 leading-relaxed mb-2">{week.dailyPractice}</p>
                    {(week.dailyPractice.includes('lullaby') || week.dailyPractice.includes('revision') || week.dailyPractice.includes('mental diet')) && (
                      <p className="text-xs text-slate-500 italic mt-2">
                        💡 These techniques are explained in detail in the Workbook section. Check the corresponding step for full instructions.
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                    <h4 className="text-base font-medium text-black mb-2">This Week's Affirmation</h4>
                    <p className="text-base text-slate-600 leading-relaxed mb-2">"{week.affirmation}"</p>
                    <p className="text-xs text-slate-500 italic">
                      Use this daily, or choose from the affirmations in the Workbook for this step. Both approaches support your healing.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="text-base font-medium text-black mb-2">Grounding Exercise</h4>
                    <p className="text-base text-slate-600 leading-relaxed mb-2">{week.grounding}</p>
                    <p className="text-xs text-slate-500 italic">
                      This complements the meditation practices in the Workbook. Use grounding whenever you feel overwhelmed or need to return to the present moment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
