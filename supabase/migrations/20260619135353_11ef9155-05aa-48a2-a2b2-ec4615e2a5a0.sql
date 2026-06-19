
-- Extend leads table with Sales CRM fields
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_source text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS decision_maker_status text,
  ADD COLUMN IF NOT EXISTS partnership_status text,
  ADD COLUMN IF NOT EXISTS location_status text,
  ADD COLUMN IF NOT EXISTS lead_classification text,
  ADD COLUMN IF NOT EXISTS lead_stage text NOT NULL DEFAULT 'New Lead',
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS proposal_sent_date date,
  ADD COLUMN IF NOT EXISTS followup_date date,
  ADD COLUMN IF NOT EXISTS meeting_date date,
  ADD COLUMN IF NOT EXISTS booking_amount_status text,
  ADD COLUMN IF NOT EXISTS remarks text,
  ADD COLUMN IF NOT EXISTS converted_to_franchise_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(lead_stage);
CREATE INDEX IF NOT EXISTS idx_leads_classification ON public.leads(lead_classification);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_followup_date ON public.leads(followup_date);
