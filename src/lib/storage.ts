// Local storage utilities for persisting app data

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  prompt: string;
  content: string;
  type: 'daily' | 'weekly' | 'free';
}

export interface StepProgress {
  stepNumber: number;
  completed: boolean;
  notes: string;
  reflectionAnswers: { [question: string]: string };
  lastUpdated: string;
}

export interface ResentmentEntry {
  id: string;
  column1: string; // I'm resentful at (text)
  column1Text?: string; // Text version (when handwriting mode is active, this preserves typed text)
  column1IsHandwriting?: boolean; // true if currently in handwriting mode
  column2: string; // The cause (text)
  column2Text?: string; // Text version (when handwriting mode is active, this preserves typed text)
  column2IsHandwriting?: boolean; // true if currently in handwriting mode
  column3: {
    socialInstinct: {
      selfEsteem: boolean;
      personalRelationships: boolean;
      material: boolean;
      emotional: boolean;
    };
    securityInstinct: {
      social: boolean;
      security: boolean;
    };
    sexInstinct: {
      acceptableSexRelations: boolean;
      hiddenSexRelations: boolean;
      sexual: boolean;
    };
    ambitions: boolean;
  };
  column4: {
    selfish: boolean;
    dishonest: boolean;
    selfSeekingAndFrightened: boolean;
    inconsiderate: boolean;
    whereWasIToBlame?: string; // Text
    whereWasIToBlameText?: string; // Text version (when handwriting mode is active)
    whereWasIToBlameIsHandwriting?: boolean; // true if currently in handwriting mode
  };
}

export interface FearEntry {
  id: string;
  fear: string; // What am I afraid of?
  partOfSelfFailed: string; // Which part of self have I been relying on which has failed me?
  fearPrayer?: string; // Optional: personalized fear prayer
}

export interface SexualConductEntry {
  id: string;
  whomDidIHurt: string; // Whom did I hurt?
  whatDidIDo: string; // We list each thing we did to them
  didIUnjustifiablyAvoid: boolean; // Did I unjustifiably avoid?
  whereWasIAtFault: string; // Where was I at fault?
  whatShouldIHaveDoneInstead: string; // What should I have done instead?
}

export interface WeekProgress {
  weekNumber: number;
  completed: boolean;
  notes: string;
  resentmentEntries?: ResentmentEntry[];
  fearEntries?: FearEntry[];
  sexualConductEntries?: SexualConductEntry[];
  lastUpdated: string;
}

export interface AppData {
  journalEntries: JournalEntry[];
  stepProgress: StepProgress[];
  weeklyPlanProgress: { [weekNumber: number]: boolean };
  weekProgress: WeekProgress[];
}

const STORAGE_KEY = 'spiritual-recovery-toolkit-data';

export const storage = {
  // Get all data
  getData(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Migrate old data if needed
        if (!parsed.weekProgress) {
          parsed.weekProgress = Array.from({ length: 12 }, (_, i) => ({
            weekNumber: i + 1,
            completed: parsed.weeklyPlanProgress?.[i + 1] || false,
            notes: '',
            resentmentEntries: [],
            fearEntries: [],
            sexualConductEntries: [],
            lastUpdated: new Date().toISOString(),
          }));
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return {
      journalEntries: [],
      stepProgress: Array.from({ length: 12 }, (_, i) => ({
        stepNumber: i + 1,
        completed: false,
        notes: '',
        reflectionAnswers: {},
        lastUpdated: new Date().toISOString(),
      })),
      weeklyPlanProgress: {},
      weekProgress: Array.from({ length: 12 }, (_, i) => ({
        weekNumber: i + 1,
        completed: false,
        notes: '',
        resentmentEntries: [],
        fearEntries: [],
        sexualConductEntries: [],
        lastUpdated: new Date().toISOString(),
      })),
    };
  },

  // Save all data
  saveData(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  // Journal entries
  getJournalEntries(): JournalEntry[] {
    return this.getData().journalEntries;
  },

  saveJournalEntry(entry: JournalEntry): void {
    const data = this.getData();
    const existingIndex = data.journalEntries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      data.journalEntries[existingIndex] = entry;
    } else {
      data.journalEntries.push(entry);
    }
    
    this.saveData(data);
  },

  deleteJournalEntry(id: string): void {
    const data = this.getData();
    data.journalEntries = data.journalEntries.filter(e => e.id !== id);
    this.saveData(data);
  },

  // Step progress
  getStepProgress(): StepProgress[] {
    return this.getData().stepProgress;
  },

  updateStepProgress(stepNumber: number, updates: Partial<StepProgress>): void {
    const data = this.getData();
    const stepIndex = data.stepProgress.findIndex(s => s.stepNumber === stepNumber);
    
    if (stepIndex >= 0) {
      data.stepProgress[stepIndex] = {
        ...data.stepProgress[stepIndex],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      this.saveData(data);
    }
  },

  // Weekly plan progress
  getWeeklyPlanProgress(): { [weekNumber: number]: boolean } {
    // For backwards compatibility, also return from new structure
    const data = this.getData();
    const progress: { [key: number]: boolean } = {};
    data.weekProgress.forEach(week => {
      progress[week.weekNumber] = week.completed;
    });
    return progress;
  },

  getWeekProgress(): WeekProgress[] {
    return this.getData().weekProgress;
  },

  toggleWeekProgress(weekNumber: number): void {
    const data = this.getData();
    const weekIndex = data.weekProgress.findIndex(w => w.weekNumber === weekNumber);
    
    if (weekIndex >= 0) {
      data.weekProgress[weekIndex].completed = !data.weekProgress[weekIndex].completed;
      data.weekProgress[weekIndex].lastUpdated = new Date().toISOString();
    }
    
    // Also update old structure for backwards compatibility
    data.weeklyPlanProgress[weekNumber] = !data.weeklyPlanProgress[weekNumber];
    this.saveData(data);
  },

  updateWeekProgress(weekNumber: number, updates: Partial<WeekProgress>): void {
    const data = this.getData();
    const weekIndex = data.weekProgress.findIndex(w => w.weekNumber === weekNumber);
    
    if (weekIndex >= 0) {
      data.weekProgress[weekIndex] = {
        ...data.weekProgress[weekIndex],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      this.saveData(data);
    }
  },

  // Export/Import
  exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Clear all data
  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};


