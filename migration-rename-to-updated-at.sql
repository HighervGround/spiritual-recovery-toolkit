-- Rename last_updated to updated_at to match Supabase conventions
-- This fixes the trigger error: 'record "new" has no field "updated_at"'

ALTER TABLE public.step_progress 
RENAME COLUMN last_updated TO updated_at;

