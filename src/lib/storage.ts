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
  lastUpdated: string;
}

export interface WeekProgress {
  weekNumber: number;
  completed: boolean;
  notes: string;
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
        lastUpdated: new Date().toISOString(),
      })),
      weeklyPlanProgress: {},
      weekProgress: Array.from({ length: 12 }, (_, i) => ({
        weekNumber: i + 1,
        completed: false,
        notes: '',
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


