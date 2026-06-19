ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS exploration_completed_date date,
  ADD COLUMN IF NOT EXISTS final_meeting_type text,
  ADD COLUMN IF NOT EXISTS final_meeting_store_name text,
  ADD COLUMN IF NOT EXISTS meeting_link text;