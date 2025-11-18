import type { JournalEntry, StepProgress, WeekProgress } from './storage';

type MaybePromise<T> = T | Promise<T>;

export interface StorageBackend {
  getStepProgress: () => MaybePromise<StepProgress[]>;
  updateStepProgress: (stepNumber: number, updates: Partial<StepProgress>) => MaybePromise<void>;
  getWeekProgress: () => MaybePromise<WeekProgress[]>;
  updateWeekProgress: (weekNumber: number, updates: Partial<WeekProgress>) => MaybePromise<void>;
  getJournalEntries: () => MaybePromise<JournalEntry[]>;
  saveJournalEntry: (entry: JournalEntry) => MaybePromise<void>;
  deleteJournalEntry: (id: string) => MaybePromise<void>;
}
