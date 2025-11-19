import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          prompt: string | null;
          content: string;
          type: 'daily' | 'weekly' | 'free';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          date?: string;
          prompt?: string | null;
          content: string;
          type: 'daily' | 'weekly' | 'free';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          prompt?: string | null;
          content?: string;
          type?: 'daily' | 'weekly' | 'free';
          created_at?: string;
          updated_at?: string;
        };
      };
    step_progress: {
      Row: {
        id: string;
        user_id: string;
        step_number: number;
        completed: boolean;
        notes: string;
        reflection_answers: { [key: string]: string };
        updated_at: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        step_number: number;
        completed?: boolean;
        notes?: string;
        reflection_answers?: { [key: string]: string };
        updated_at?: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        step_number?: number;
        completed?: boolean;
        notes?: string;
        reflection_answers?: { [key: string]: string };
        updated_at?: string;
        created_at?: string;
      };
    };
      weekly_progress: {
        Row: {
          id: string;
          user_id: string;
          week_number: number;
          completed: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_number: number;
          completed?: boolean;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_number?: number;
          completed?: boolean;
          updated_at?: string;
          created_at?: string;
        };
      };
    };
  };
}


