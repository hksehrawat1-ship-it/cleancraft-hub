-- ============ ENUMS ============
CREATE TYPE public.work_status AS ENUM (
  'draft','submitted','assigned','accepted','in_progress','submitted_for_review',
  'approved','completed','closed','information_required','returned','blocked',
  'correction_required','reassigned','cancelled','reopened'
);

CREATE TYPE public.work_record_type AS ENUM (
  'task','request','ticket','handover','content','payment_request','clearance','dispatch','packing','training','survey','marketing','hr','support'
);

CREATE TYPE public.work_master_type AS ENUM ('lead','franchise','project','store','employee','none');

CREATE TYPE public.handover_state AS ENUM ('not_applicable','sent','accepted','returned');

CREATE TYPE public.notification_type AS ENUM (
  'new_assignment','assignment_returned','deadline_approaching','work_overdue',
  'information_requested','submitted_for_review','work_approved','correction_requested',
  'handover_sent','handover_accepted','handover_returned','work_reopened'
);

-- ============ DEPARTMENTS ============
CREATE TABLE public.departments (
  code text PRIMARY KEY,
  name text NOT NULL,
  manager_role public.app_role,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leadership manage departments" ON public.departments FOR ALL TO authenticated
  USING (public.is_leadership(auth.uid())) WITH CHECK (public.is_leadership(auth.uid()));

INSERT INTO public.departments (code, name, manager_role, sort_order) VALUES
  ('content','Content & Social Media','social_media_manager',10),
  ('sales','Sales','sales_executive',20),
  ('projects','Projects','project_coordinator',30),
  ('finance','Accounts & Finance','accountant',40),
  ('logistics','Supply Chain & Logistics','supply_chain_logistics_executive',50),
  ('tech','Tech Engine','crm_retention_executive',60),
  ('launch','Training & Launch','launch_training_executive',70),
  ('store_success','Store Success','relationship_manager',80),
  ('marketing','Performance Marketing','performance_marketing_executive',90),
  ('hr','Human Resources','hr_head',100),
  ('admin_support','Support Staff','coo',110),
  ('leadership','Leadership','ceo',120);

-- ============ PROFILE DEPARTMENT HELPERS ============
CREATE OR REPLACE FUNCTION public.user_department(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.department FROM public.profiles p WHERE p.id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.manages_department(_user_id uuid, _dept text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_leadership(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.departments d
        JOIN public.user_roles ur ON ur.user_id = _user_id AND ur.role = d.manager_role
        WHERE d.code = _dept
      )
$$;

-- ============ WORK ITEMS ============
CREATE SEQUENCE public.work_item_code_seq;

CREATE TABLE public.work_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_code text UNIQUE,
  record_type public.work_record_type NOT NULL DEFAULT 'task',
  title text NOT NULL,
  description text,
  master_type public.work_master_type NOT NULL DEFAULT 'none',
  master_id uuid,
  master_code text,
  parent_item_id uuid REFERENCES public.work_items(id),
  created_by uuid REFERENCES auth.users(id),
  from_department text REFERENCES public.departments(code),
  to_department text REFERENCES public.departments(code),
  assigned_role public.app_role,
  assigned_user uuid REFERENCES auth.users(id),
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.work_status NOT NULL DEFAULT 'draft',
  required_action text,
  next_action text,
  start_date date,
  due_at timestamptz,
  notes_internal text,
  approval_required boolean NOT NULL DEFAULT false,
  handover_status public.handover_state NOT NULL DEFAULT 'not_applicable',
  completion_summary text,
  issues_remaining text,
  completed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  is_test boolean NOT NULL DEFAULT false,
  cancelled_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX work_items_assigned_idx ON public.work_items(assigned_user, status);
CREATE INDEX work_items_dept_idx ON public.work_items(to_department, status);
CREATE INDEX work_items_master_idx ON public.work_items(master_type, master_id);

GRANT SELECT, INSERT, UPDATE ON public.work_items TO authenticated;
GRANT ALL ON public.work_items TO service_role;
GRANT USAGE ON SEQUENCE public.work_item_code_seq TO authenticated, service_role;
ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own or department work" ON public.work_items FOR SELECT TO authenticated
USING (
  assigned_user = auth.uid()
  OR created_by = auth.uid()
  OR public.is_leadership(auth.uid())
  OR public.manages_department(auth.uid(), to_department)
  OR public.manages_department(auth.uid(), from_department)
  OR public.user_department(auth.uid()) IN (to_department, from_department)
);

CREATE POLICY "Create work items" ON public.work_items FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update own or managed work" ON public.work_items FOR UPDATE TO authenticated
USING (
  assigned_user = auth.uid()
  OR created_by = auth.uid()
  OR public.is_leadership(auth.uid())
  OR public.manages_department(auth.uid(), to_department)
  OR public.manages_department(auth.uid(), from_department)
);

CREATE OR REPLACE FUNCTION public.assign_work_item_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.record_code IS NULL THEN
    NEW.record_code := CASE NEW.record_type
      WHEN 'payment_request' THEN 'PAY-'
      WHEN 'clearance' THEN 'CLR-'
      WHEN 'dispatch' THEN 'DSP-'
      WHEN 'ticket' THEN 'TKT-'
      WHEN 'content' THEN 'CNT-'
      WHEN 'handover' THEN 'HND-'
      ELSE 'TSK-'
    END || lpad(nextval('public.work_item_code_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER work_items_assign_code BEFORE INSERT ON public.work_items
FOR EACH ROW EXECUTE FUNCTION public.assign_work_item_code();

CREATE TRIGGER work_items_touch BEFORE UPDATE ON public.work_items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ WORK ASSIGNMENTS ============
CREATE TABLE public.work_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id uuid NOT NULL REFERENCES public.work_items(id) ON DELETE CASCADE,
  from_user uuid REFERENCES auth.users(id),
  to_user uuid REFERENCES auth.users(id),
  to_role public.app_role,
  assigned_by uuid REFERENCES auth.users(id),
  accepted_at timestamptz,
  returned_at timestamptz,
  return_reason text,
  missing_information text,
  reassign_reason text,
  superseded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX work_assignments_item_idx ON public.work_assignments(work_item_id);
GRANT SELECT, INSERT, UPDATE ON public.work_assignments TO authenticated;
GRANT ALL ON public.work_assignments TO service_role;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read assignments of visible work" ON public.work_assignments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.work_items w WHERE w.id = work_item_id));
CREATE POLICY "Create assignments" ON public.work_assignments FOR INSERT TO authenticated
WITH CHECK (assigned_by = auth.uid() OR to_user = auth.uid());
CREATE POLICY "Update own assignment" ON public.work_assignments FOR UPDATE TO authenticated
USING (to_user = auth.uid() OR assigned_by = auth.uid() OR public.is_leadership(auth.uid()));

-- ============ WORK HANDOVERS ============
CREATE TABLE public.work_handovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id uuid NOT NULL REFERENCES public.work_items(id) ON DELETE CASCADE,
  from_department text REFERENCES public.departments(code),
  to_department text REFERENCES public.departments(code),
  sent_by uuid REFERENCES auth.users(id),
  accepted_by uuid REFERENCES auth.users(id),
  decision public.handover_state NOT NULL DEFAULT 'sent',
  reason text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX work_handovers_item_idx ON public.work_handovers(work_item_id);
GRANT SELECT, INSERT, UPDATE ON public.work_handovers TO authenticated;
GRANT ALL ON public.work_handovers TO service_role;
ALTER TABLE public.work_handovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read handovers of visible work" ON public.work_handovers FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.work_items w WHERE w.id = work_item_id));
CREATE POLICY "Send handovers" ON public.work_handovers FOR INSERT TO authenticated
WITH CHECK (sent_by = auth.uid());
CREATE POLICY "Decide handovers" ON public.work_handovers FOR UPDATE TO authenticated
USING (public.manages_department(auth.uid(), to_department) OR public.user_department(auth.uid()) = to_department);

-- ============ WORK EVENTS (audit, insert-only) ============
CREATE TABLE public.work_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id uuid NOT NULL REFERENCES public.work_items(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  from_value text,
  to_value text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX work_events_item_idx ON public.work_events(work_item_id, created_at);
GRANT SELECT, INSERT ON public.work_events TO authenticated;
GRANT ALL ON public.work_events TO service_role;
ALTER TABLE public.work_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read events of visible work" ON public.work_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.work_items w WHERE w.id = work_item_id));
CREATE POLICY "Write events" ON public.work_events FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- ============ WORK ATTACHMENTS ============
CREATE TABLE public.work_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id uuid NOT NULL REFERENCES public.work_items(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'document',
  label text,
  storage_path text,
  external_url text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX work_attachments_item_idx ON public.work_attachments(work_item_id);
GRANT SELECT, INSERT ON public.work_attachments TO authenticated;
GRANT ALL ON public.work_attachments TO service_role;
ALTER TABLE public.work_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read attachments of visible work" ON public.work_attachments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.work_items w WHERE w.id = work_item_id));
CREATE POLICY "Add attachments" ON public.work_attachments FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- ============ NOTIFICATIONS (in-app only) ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_item_id uuid REFERENCES public.work_items(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, read_at);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own notifications" ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Create notifications" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);
CREATE POLICY "Mark own notifications read" ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- ============ AUDIT + NOTIFICATION TRIGGERS ============
CREATE OR REPLACE FUNCTION public.log_work_item_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.work_events(work_item_id, actor_id, event_type, to_value)
    VALUES (NEW.id, COALESCE(actor, NEW.created_by), 'created', NEW.status::text);
    IF NEW.assigned_user IS NOT NULL THEN
      INSERT INTO public.work_events(work_item_id, actor_id, event_type, to_value)
      VALUES (NEW.id, actor, 'assigned', NEW.assigned_user::text);
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.assigned_user, NEW.id, 'new_assignment', 'New work assigned: ' || NEW.title, NEW.required_action);
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.work_events(work_item_id, actor_id, event_type, from_value, to_value)
    VALUES (NEW.id, actor, 'status_changed', OLD.status::text, NEW.status::text);

    IF NEW.status = 'returned' AND NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.created_by, NEW.id, 'assignment_returned', 'Work returned: ' || NEW.title, NEW.notes_internal);
    ELSIF NEW.status = 'information_required' AND NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.created_by, NEW.id, 'information_requested', 'Information requested: ' || NEW.title, NEW.notes_internal);
    ELSIF NEW.status = 'submitted_for_review' AND NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.created_by, NEW.id, 'submitted_for_review', 'Ready for review: ' || NEW.title, NEW.completion_summary);
    ELSIF NEW.status = 'correction_required' AND NEW.assigned_user IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.assigned_user, NEW.id, 'correction_requested', 'Correction required: ' || NEW.title, NEW.notes_internal);
    ELSIF NEW.status IN ('approved','completed') AND NEW.assigned_user IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.assigned_user, NEW.id, 'work_approved', 'Work approved: ' || NEW.title, NEW.completion_summary);
    ELSIF NEW.status = 'reopened' AND NEW.assigned_user IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.assigned_user, NEW.id, 'work_reopened', 'Work reopened: ' || NEW.title, NEW.notes_internal);
    END IF;
  END IF;

  IF NEW.assigned_user IS DISTINCT FROM OLD.assigned_user THEN
    INSERT INTO public.work_events(work_item_id, actor_id, event_type, from_value, to_value)
    VALUES (NEW.id, actor, 'reassigned', OLD.assigned_user::text, NEW.assigned_user::text);
    IF NEW.assigned_user IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, work_item_id, type, title, body)
      VALUES (NEW.assigned_user, NEW.id, 'new_assignment', 'New work assigned: ' || NEW.title, NEW.required_action);
    END IF;
  END IF;

  IF NEW.due_at IS DISTINCT FROM OLD.due_at THEN
    INSERT INTO public.work_events(work_item_id, actor_id, event_type, from_value, to_value)
    VALUES (NEW.id, actor, 'deadline_changed', OLD.due_at::text, NEW.due_at::text);
  END IF;

  IF NEW.handover_status IS DISTINCT FROM OLD.handover_status THEN
    INSERT INTO public.work_events(work_item_id, actor_id, event_type, from_value, to_value)
    VALUES (NEW.id, actor, 'handover_' || NEW.handover_status::text, OLD.handover_status::text, NEW.handover_status::text);
  END IF;

  IF NEW.completed_at IS DISTINCT FROM OLD.completed_at AND NEW.completed_at IS NOT NULL THEN
    INSERT INTO public.work_events(work_item_id, actor_id, event_type, to_value, reason)
    VALUES (NEW.id, actor, 'completed', NEW.completed_at::text, NEW.completion_summary);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER work_items_audit AFTER INSERT OR UPDATE ON public.work_items
FOR EACH ROW EXECUTE FUNCTION public.log_work_item_event();