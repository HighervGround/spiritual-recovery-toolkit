-- Add reflection_answers column to step_progress table
ALTER TABLE public.step_progress 
ADD COLUMN IF NOT EXISTS reflection_answers JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.step_progress.reflection_answers IS 'Stores user answers to reflection questions as key-value pairs';

