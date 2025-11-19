-- Fix the last_updated auto-update for step_progress table

-- Drop any existing trigger if it exists
DROP TRIGGER IF EXISTS handle_updated_at ON public.step_progress;

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.handle_step_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated on UPDATE
CREATE TRIGGER handle_step_progress_updated_at
  BEFORE UPDATE ON public.step_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_step_progress_updated_at();

