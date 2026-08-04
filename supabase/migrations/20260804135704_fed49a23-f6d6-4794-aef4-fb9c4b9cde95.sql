
-- 1. Readable codes
CREATE SEQUENCE IF NOT EXISTS public.lead_code_seq;
CREATE SEQUENCE IF NOT EXISTS public.franchise_code_seq;
CREATE SEQUENCE IF NOT EXISTS public.project_code_seq;
CREATE SEQUENCE IF NOT EXISTS public.store_code_seq;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_code text;
ALTER TABLE public.franchise_bookings ADD COLUMN IF NOT EXISTS franchise_code text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_code text;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS store_code text;

-- 2. Lineage links
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS franchise_booking_id uuid REFERENCES public.franchise_bookings(id) ON DELETE SET NULL;

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS franchise_booking_id uuid REFERENCES public.franchise_bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- 3. Backfill codes for existing rows
UPDATE public.leads SET lead_code = 'LEAD-' || lpad(nextval('public.lead_code_seq')::text, 6, '0') WHERE lead_code IS NULL;
UPDATE public.franchise_bookings SET franchise_code = 'FR-' || lpad(nextval('public.franchise_code_seq')::text, 6, '0') WHERE franchise_code IS NULL;
UPDATE public.projects SET project_code = 'PRJ-' || lpad(nextval('public.project_code_seq')::text, 6, '0') WHERE project_code IS NULL;
UPDATE public.stores SET store_code = 'STR-' || lpad(nextval('public.store_code_seq')::text, 6, '0') WHERE store_code IS NULL;

-- 4. Code assignment triggers
CREATE OR REPLACE FUNCTION public.assign_lineage_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'leads' AND NEW.lead_code IS NULL THEN
    NEW.lead_code := 'LEAD-' || lpad(nextval('public.lead_code_seq')::text, 6, '0');
  ELSIF TG_TABLE_NAME = 'franchise_bookings' AND NEW.franchise_code IS NULL THEN
    NEW.franchise_code := 'FR-' || lpad(nextval('public.franchise_code_seq')::text, 6, '0');
  ELSIF TG_TABLE_NAME = 'projects' AND NEW.project_code IS NULL THEN
    NEW.project_code := 'PRJ-' || lpad(nextval('public.project_code_seq')::text, 6, '0');
  ELSIF TG_TABLE_NAME = 'stores' AND NEW.store_code IS NULL THEN
    NEW.store_code := 'STR-' || lpad(nextval('public.store_code_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_assign_code ON public.leads;
CREATE TRIGGER leads_assign_code BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.assign_lineage_code();
DROP TRIGGER IF EXISTS franchise_assign_code ON public.franchise_bookings;
CREATE TRIGGER franchise_assign_code BEFORE INSERT ON public.franchise_bookings FOR EACH ROW EXECUTE FUNCTION public.assign_lineage_code();
DROP TRIGGER IF EXISTS projects_assign_code ON public.projects;
CREATE TRIGGER projects_assign_code BEFORE INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.assign_lineage_code();
DROP TRIGGER IF EXISTS stores_assign_code ON public.stores;
CREATE TRIGGER stores_assign_code BEFORE INSERT ON public.stores FOR EACH ROW EXECUTE FUNCTION public.assign_lineage_code();

-- 5. Uniqueness: one record per stage, no duplicates on handover
CREATE UNIQUE INDEX IF NOT EXISTS leads_lead_code_key ON public.leads(lead_code);
CREATE UNIQUE INDEX IF NOT EXISTS franchise_bookings_code_key ON public.franchise_bookings(franchise_code);
CREATE UNIQUE INDEX IF NOT EXISTS projects_code_key ON public.projects(project_code);
CREATE UNIQUE INDEX IF NOT EXISTS stores_code_key ON public.stores(store_code);
CREATE UNIQUE INDEX IF NOT EXISTS franchise_bookings_one_per_lead ON public.franchise_bookings(lead_id) WHERE lead_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS projects_one_per_franchise ON public.projects(franchise_booking_id) WHERE franchise_booking_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS stores_one_per_project ON public.stores(project_id) WHERE project_id IS NOT NULL;

-- 6. Idempotent handover functions
CREATE OR REPLACE FUNCTION public.handover_lead_to_franchise(_lead_id uuid, _booking_amount numeric DEFAULT 0)
RETURNS public.franchise_bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l public.leads; fb public.franchise_bookings;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO l FROM public.leads WHERE id = _lead_id;
  IF l.id IS NULL THEN RAISE EXCEPTION 'Lead not found'; END IF;

  SELECT * INTO fb FROM public.franchise_bookings WHERE lead_id = _lead_id;
  IF fb.id IS NOT NULL THEN RETURN fb; END IF;

  INSERT INTO public.franchise_bookings(lead_id, franchisee_name, city, booking_amount, created_by, notes)
  VALUES (l.id, l.name, l.city, COALESCE(_booking_amount, 0), auth.uid(), l.remarks)
  RETURNING * INTO fb;

  UPDATE public.leads
     SET converted_to_franchise_at = COALESCE(converted_to_franchise_at, now()),
         lead_stage = 'Handover Done'
   WHERE id = l.id;

  RETURN fb;
END;
$$;

CREATE OR REPLACE FUNCTION public.handover_franchise_to_project(_franchise_booking_id uuid, _project_name text DEFAULT NULL)
RETURNS public.projects LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE fb public.franchise_bookings; p public.projects;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO fb FROM public.franchise_bookings WHERE id = _franchise_booking_id;
  IF fb.id IS NULL THEN RAISE EXCEPTION 'Franchise booking not found'; END IF;

  SELECT * INTO p FROM public.projects WHERE franchise_booking_id = fb.id;
  IF p.id IS NOT NULL THEN RETURN p; END IF;

  INSERT INTO public.projects(name, status, lead_id, franchise_booking_id, notes)
  VALUES (COALESCE(NULLIF(_project_name, ''), COALESCE(fb.city, fb.franchisee_name, 'New') || ' Store Setup'),
          'planning', fb.lead_id, fb.id, fb.notes)
  RETURNING * INTO p;

  RETURN p;
END;
$$;

CREATE OR REPLACE FUNCTION public.handover_project_to_store(_project_id uuid, _store_name text DEFAULT NULL)
RETURNS public.stores LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.projects; fb public.franchise_bookings; l public.leads; s public.stores;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO p FROM public.projects WHERE id = _project_id;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Project not found'; END IF;

  SELECT * INTO s FROM public.stores WHERE project_id = p.id;
  IF s.id IS NOT NULL THEN RETURN s; END IF;

  SELECT * INTO fb FROM public.franchise_bookings WHERE id = p.franchise_booking_id;
  SELECT * INTO l FROM public.leads WHERE id = p.lead_id;

  INSERT INTO public.stores(name, city, owner_name, owner_phone, status, created_by,
                            lead_id, franchise_booking_id, project_id)
  VALUES (COALESCE(NULLIF(_store_name, ''), p.name), COALESCE(fb.city, l.city),
          COALESCE(fb.franchisee_name, l.name), l.phone, 'setup', auth.uid(),
          p.lead_id, p.franchise_booking_id, p.id)
  RETURNING * INTO s;

  UPDATE public.projects SET store_id = s.id WHERE id = p.id AND store_id IS NULL;

  RETURN s;
END;
$$;

-- 7. Journey view
CREATE OR REPLACE VIEW public.record_lineage
WITH (security_invoker = true) AS
SELECT
  l.id AS lead_id, l.lead_code, l.name AS lead_name, l.city AS lead_city, l.lead_stage,
  fb.id AS franchise_booking_id, fb.franchise_code, fb.franchisee_name, fb.booking_amount, fb.booked_at,
  p.id AS project_id, p.project_code, p.name AS project_name, p.status AS project_status,
  s.id AS store_id, s.store_code, s.name AS store_name, s.status AS store_status
FROM public.leads l
LEFT JOIN public.franchise_bookings fb ON fb.lead_id = l.id
LEFT JOIN public.projects p ON p.franchise_booking_id = fb.id
LEFT JOIN public.stores s ON s.project_id = p.id;

GRANT SELECT ON public.record_lineage TO authenticated;
GRANT ALL ON public.record_lineage TO service_role;
