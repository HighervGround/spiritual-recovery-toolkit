// Supabase storage layer - cloud-based data persistence

import { supabase } from './supabase';

export interface JournalEntry {
  id: string;
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

export const supabaseStorage = {
  // Authentication helpers
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Journal entries
  async getJournalEntries(): Promise<JournalEntry[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      date: entry.date,
      prompt: entry.prompt || '',
      content: entry.content,
      type: entry.type,
    }));
  },

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if entry exists
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('id', entry.id)
      .single();

    if (existing) {
      // Update existing entry
      const { error } = await supabase
        .from('journal_entries')
        .update({
          content: entry.content,
          prompt: entry.prompt,
          type: entry.type,
          date: entry.date,
        })
        .eq('id', entry.id);

      if (error) throw error;
    } else {
      // Insert new entry
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          id: entry.id,
          user_id: user.id,
          content: entry.content,
          prompt: entry.prompt,
          type: entry.type,
          date: entry.date,
        });

      if (error) throw error;
    }
  },

  async deleteJournalEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Step progress
  async getStepProgress(): Promise<StepProgress[]> {
    const user = await this.getCurrentUser();
    if (!user) {
      // Return default progress if not authenticated
      return Array.from({ length: 12 }, (_, i) => ({
        stepNumber: i + 1,
        completed: false,
        notes: '',
        lastUpdated: new Date().toISOString(),
      }));
    }

    const { data, error } = await supabase
      .from('step_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    // Create a map of existing progress
    const progressMap = new Map(
      (data || []).map(p => [p.step_number, p])
    );

    // Return all 12 steps, filling in defaults for missing ones
    return Array.from({ length: 12 }, (_, i) => {
      const stepNumber = i + 1;
      const existing = progressMap.get(stepNumber);
      return {
        stepNumber,
        completed: existing?.completed || false,
        notes: existing?.notes || '',
        lastUpdated: existing?.last_updated || new Date().toISOString(),
      };
    });
  },

  async updateStepProgress(stepNumber: number, updates: Partial<StepProgress>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if step progress exists
    const { data: existing } = await supabase
      .from('step_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('step_number', stepNumber)
      .single();

    const updateData = {
      completed: updates.completed,
      notes: updates.notes,
      last_updated: new Date().toISOString(),
    };

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('step_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('step_number', stepNumber);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('step_progress')
        .insert({
          user_id: user.id,
          step_number: stepNumber,
          ...updateData,
        });

      if (error) throw error;
    }
  },

  // Weekly plan progress
  async getWeeklyPlanProgress(): Promise<{ [weekNumber: number]: boolean }> {
    const user = await this.getCurrentUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('weekly_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const progress: { [key: number]: boolean } = {};
    (data || []).forEach(week => {
      progress[week.week_number] = week.completed;
    });

    return progress;
  },

  async toggleWeekProgress(weekNumber: number): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get current status
    const { data: existing } = await supabase
      .from('weekly_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_number', weekNumber)
      .single();

    const newCompleted = !existing?.completed;

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('weekly_progress')
        .update({
          completed: newCompleted,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('week_number', weekNumber);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('weekly_progress')
        .insert({
          user_id: user.id,
          week_number: weekNumber,
          completed: newCompleted,
          last_updated: new Date().toISOString(),
        });

      if (error) throw error;
    }
  },

  // Export/Import functionality
  async exportData(): Promise<string> {
    const [journalEntries, stepProgress, weeklyProgress] = await Promise.all([
      this.getJournalEntries(),
      this.getStepProgress(),
      this.getWeeklyPlanProgress(),
    ]);

    return JSON.stringify({
      journalEntries,
      stepProgress,
      weeklyPlanProgress: weeklyProgress,
      exportDate: new Date().toISOString(),
      version: '2.0-supabase',
    }, null, 2);
  },

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Import journal entries
      if (data.journalEntries && Array.isArray(data.journalEntries)) {
        for (const entry of data.journalEntries) {
          await this.saveJournalEntry(entry);
        }
      }

      // Import step progress
      if (data.stepProgress && Array.isArray(data.stepProgress)) {
        for (const step of data.stepProgress) {
          if (step.completed || step.notes) {
            await this.updateStepProgress(step.stepNumber, step);
          }
        }
      }

      // Import weekly progress
      if (data.weeklyPlanProgress) {
        for (const [weekNum, completed] of Object.entries(data.weeklyPlanProgress)) {
          if (completed) {
            const weekNumber = parseInt(weekNum);
            await this.toggleWeekProgress(weekNumber);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Clear all user data
  async clearAllData(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await Promise.all([
      supabase.from('journal_entries').delete().eq('user_id', user.id),
      supabase.from('step_progress').delete().eq('user_id', user.id),
      supabase.from('weekly_progress').delete().eq('user_id', user.id),
    ]);
  },
};

