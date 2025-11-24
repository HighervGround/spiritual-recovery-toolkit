-- Migration: Add resentment_entries column to weekly_progress table
-- Run this SQL in your Supabase SQL Editor

-- Add resentment_entries column as JSONB to store the resentment review data
ALTER TABLE public.weekly_progress 
ADD COLUMN IF NOT EXISTS resentment_entries JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.weekly_progress.resentment_entries IS 'Stores resentment review entries for Step 4 (weeks 2-3) as JSON array';

