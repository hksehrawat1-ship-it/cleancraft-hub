
-- New columns on leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS buying_factor_profitability boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buying_factor_training boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buying_factor_technology boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buying_factor_support boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buying_factor_brand boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS next_action text,
  ADD COLUMN IF NOT EXISTS engagement_letter_sent_date date,
  ADD COLUMN IF NOT EXISTS engagement_letter_fee_status text,
  ADD COLUMN IF NOT EXISTS engagement_letter_fee_received_date date,
  ADD COLUMN IF NOT EXISTS engagement_letter_fee_amount numeric,
  ADD COLUMN IF NOT EXISTS booking_date date;

-- Activity timeline
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read lead_activities" ON public.lead_activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth insert lead_activities" ON public.lead_activities
  FOR INSERT TO authenticated WITH CHECK (
    actor_id = auth.uid() OR public.is_leadership(auth.uid())
  );

CREATE INDEX IF NOT EXISTS lead_activities_lead_id_created_at_idx
  ON public.lead_activities (lead_id, created_at DESC);

-- Auto-log lead changes
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, COALESCE(actor, NEW.created_by), 'Lead Created',
            jsonb_build_object('stage', NEW.lead_stage, 'classification', NEW.lead_classification));
    RETURN NEW;
  END IF;

  IF NEW.lead_stage IS DISTINCT FROM OLD.lead_stage THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Stage Changed: ' || NEW.lead_stage,
            jsonb_build_object('from', OLD.lead_stage, 'to', NEW.lead_stage));
  END IF;
  IF NEW.next_action IS DISTINCT FROM OLD.next_action AND NEW.next_action IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Next Action: ' || NEW.next_action, NULL);
  END IF;
  IF NEW.followup_date IS DISTINCT FROM OLD.followup_date AND NEW.followup_date IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Follow-up Scheduled: ' || NEW.followup_date::text, NULL);
  END IF;
  IF NEW.proposal_sent_date IS DISTINCT FROM OLD.proposal_sent_date AND NEW.proposal_sent_date IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Proposal Sent', jsonb_build_object('date', NEW.proposal_sent_date));
  END IF;
  IF NEW.meeting_date IS DISTINCT FROM OLD.meeting_date AND NEW.meeting_date IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Meeting Scheduled', jsonb_build_object('date', NEW.meeting_date));
  END IF;
  IF NEW.engagement_letter_sent_date IS DISTINCT FROM OLD.engagement_letter_sent_date AND NEW.engagement_letter_sent_date IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Engagement Letter Sent', jsonb_build_object('date', NEW.engagement_letter_sent_date));
  END IF;
  IF NEW.engagement_letter_fee_status IS DISTINCT FROM OLD.engagement_letter_fee_status AND NEW.engagement_letter_fee_status IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Engagement Fee: ' || NEW.engagement_letter_fee_status,
            jsonb_build_object('amount', NEW.engagement_letter_fee_amount));
  END IF;
  IF NEW.booking_date IS DISTINCT FROM OLD.booking_date AND NEW.booking_date IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Booking Received', jsonb_build_object('date', NEW.booking_date));
  END IF;
  IF NEW.converted_to_franchise_at IS DISTINCT FROM OLD.converted_to_franchise_at AND NEW.converted_to_franchise_at IS NOT NULL THEN
    INSERT INTO public.lead_activities(lead_id, actor_id, action, details)
    VALUES (NEW.id, actor, 'Handover Completed', NULL);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_lead_activity_trg ON public.leads;
CREATE TRIGGER log_lead_activity_trg
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();
