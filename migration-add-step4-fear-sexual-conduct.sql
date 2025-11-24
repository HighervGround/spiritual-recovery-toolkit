-- Add fear_entries and sexual_conduct_entries columns to weekly_progress table
-- This migration extends Step 4 inventory to include Fears and Sexual Conduct sections

ALTER TABLE public.weekly_progress 
ADD COLUMN IF NOT EXISTS fear_entries JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.weekly_progress 
ADD COLUMN IF NOT EXISTS sexual_conduct_entries JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.weekly_progress.fear_entries IS 'Stores fear inventory entries for Step 4 as JSON array';
COMMENT ON COLUMN public.weekly_progress.sexual_conduct_entries IS 'Stores sexual conduct/harm done to others entries for Step 4 as JSON array';

