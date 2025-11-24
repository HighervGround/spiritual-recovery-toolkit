// Supabase storage layer - cloud-based data persistence

import { supabase } from './supabase';

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

import type { ResentmentEntry } from './storage';

export interface WeekProgress {
  weekNumber: number;
  completed: boolean;
  notes: string;
  resentmentEntries?: ResentmentEntry[];
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
      title: entry.title || '',
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
          title: entry.title,
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
          title: entry.title,
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
        reflectionAnswers: existing?.reflection_answers || {},
        lastUpdated: existing?.updated_at || new Date().toISOString(),
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

    const updateData: any = {};

    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.reflectionAnswers !== undefined) updateData.reflection_answers = updates.reflectionAnswers;

    if (existing) {
      // Update existing - don't include updated_at in the update data
      const { error } = await supabase
        .from('step_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('step_number', stepNumber);

      if (error) throw error;
    } else {
      // Insert new - include all fields for insert
      const { error } = await supabase
        .from('step_progress')
        .insert({
          user_id: user.id,
          step_number: stepNumber,
          completed: updates.completed ?? false,
          notes: updates.notes ?? '',
          reflection_answers: updates.reflectionAnswers ?? {},
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

  async getWeekProgress(): Promise<WeekProgress[]> {
    const user = await this.getCurrentUser();
    if (!user) {
      // Return default progress if not authenticated
      return Array.from({ length: 12 }, (_, i) => ({
        weekNumber: i + 1,
        completed: false,
        notes: '',
        resentmentEntries: [],
        lastUpdated: new Date().toISOString(),
      }));
    }

    const { data, error } = await supabase
      .from('weekly_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    // Create a map of existing progress
    const progressMap = new Map(
      (data || []).map(w => [w.week_number, w])
    );

    // Return all 12 weeks, filling in defaults for missing ones
    return Array.from({ length: 12 }, (_, i) => {
      const weekNumber = i + 1;
      const existing = progressMap.get(weekNumber);
      return {
        weekNumber,
        completed: existing?.completed || false,
        notes: existing?.notes || '',
        resentmentEntries: existing?.resentment_entries 
          ? (typeof existing.resentment_entries === 'string' 
              ? JSON.parse(existing.resentment_entries) 
              : existing.resentment_entries)
          : [],
        lastUpdated: existing?.updated_at || new Date().toISOString(),
      };
    });
  },

  async updateWeekProgress(weekNumber: number, updates: Partial<WeekProgress>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if week progress exists (use maybeSingle to avoid error if not found)
    const { data: existing, error: fetchError } = await supabase
      .from('weekly_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_number', weekNumber)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
      throw fetchError;
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are being updated
    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
    if (updates.resentmentEntries !== undefined) {
      updateData.resentment_entries = JSON.stringify(updates.resentmentEntries);
    }

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('weekly_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('week_number', weekNumber);

      if (error) {
        // If error is about missing column, try without resentment_entries
        if (error.message?.includes('resentment_entries') || error.code === '42703') {
          const updateDataWithoutResentment = { ...updateData };
          delete updateDataWithoutResentment.resentment_entries;
          const { error: retryError } = await supabase
            .from('weekly_progress')
            .update(updateDataWithoutResentment)
            .eq('user_id', user.id)
            .eq('week_number', weekNumber);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
    } else {
      // Insert new
      const insertData: any = {
        user_id: user.id,
        week_number: weekNumber,
        completed: updates.completed ?? false,
        notes: updates.notes ?? '',
        updated_at: new Date().toISOString(),
      };

      if (updates.resentmentEntries !== undefined) {
        insertData.resentment_entries = JSON.stringify(updates.resentmentEntries);
      }

      const { error } = await supabase
        .from('weekly_progress')
        .insert(insertData);

      if (error) {
        // If error is about missing column, try without resentment_entries
        if (error.message?.includes('resentment_entries') || error.code === '42703') {
          const insertDataWithoutResentment = { ...insertData };
          delete insertDataWithoutResentment.resentment_entries;
          const { error: retryError } = await supabase
            .from('weekly_progress')
            .insert(insertDataWithoutResentment);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
    }
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
          updated_at: new Date().toISOString(),
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
          updated_at: new Date().toISOString(),
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


