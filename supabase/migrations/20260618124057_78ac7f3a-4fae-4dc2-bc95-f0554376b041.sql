
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM (
  'ceo','coo','sales_executive','sales_coordinator','project_coordinator',
  'project_manager','launch_training_executive','institute_head','relationship_manager',
  'performance_marketing_executive','btl_executive','crm_retention_executive',
  'supply_chain_logistics_executive','accountant','social_media_manager','video_editor'
);

CREATE TYPE public.lead_status AS ENUM ('new','hot','warm','cold','lost','converted');
CREATE TYPE public.store_status AS ENUM ('setup','opening','live','red','closed');
CREATE TYPE public.project_status AS ENUM ('planning','in_progress','delayed','completed','on_hold');
CREATE TYPE public.complaint_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE public.task_status AS ENUM ('pending','in_progress','blocked','completed','cancelled');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','overdue','cancelled');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ has_role ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_leadership(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('ceo','coo'))
$$;

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Auto-create profile + bootstrap first CEO ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''));

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'ceo');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Profile / Role policies ============
CREATE POLICY "Authenticated can read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Leadership can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_leadership(auth.uid()));

CREATE POLICY "Authenticated can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leadership can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_leadership(auth.uid()))
  WITH CHECK (public.is_leadership(auth.uid()));

-- ============ LEADS ============
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  city TEXT,
  source TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER leads_touch BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Auth read leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR public.is_leadership(auth.uid()));
CREATE POLICY "Owner/leadership update leads" ON public.leads FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = created_by OR public.is_leadership(auth.uid()));
CREATE POLICY "Leadership delete leads" ON public.leads FOR DELETE TO authenticated USING (public.is_leadership(auth.uid()));

-- ============ STORES ============
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  city TEXT,
  owner_name TEXT,
  owner_phone TEXT,
  status public.store_status NOT NULL DEFAULT 'setup',
  opening_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER stores_touch BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Auth read stores" ON public.stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert stores" ON public.stores FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update stores" ON public.stores FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leadership delete stores" ON public.stores FOR DELETE TO authenticated USING (public.is_leadership(auth.uid()));

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.project_status NOT NULL DEFAULT 'planning',
  planned_start DATE,
  planned_end DATE,
  actual_end DATE,
  delayed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Auth read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leadership delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_leadership(auth.uid()));

-- ============ COMPLAINTS ============
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity public.task_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'open',
  raised_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER complaints_touch BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Auth read complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update complaints" ON public.complaints FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leadership delete complaints" ON public.complaints FOR DELETE TO authenticated USING (public.is_leadership(auth.uid()));

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payments_touch BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Auth read payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update payments" ON public.payments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leadership delete payments" ON public.payments FOR DELETE TO authenticated USING (public.is_leadership(auth.uid()));

-- ============ FRANCHISE BOOKINGS ============
CREATE TABLE public.franchise_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  franchisee_name TEXT NOT NULL,
  city TEXT,
  booking_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.franchise_bookings TO authenticated;
GRANT ALL ON public.franchise_bookings TO service_role;
ALTER TABLE public.franchise_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read franchise" ON public.franchise_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert franchise" ON public.franchise_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update franchise" ON public.franchise_bookings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leadership delete franchise" ON public.franchise_bookings FOR DELETE TO authenticated USING (public.is_leadership(auth.uid()));

-- ============ TASKS ============
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT,
  related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  related_store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  due_date DATE,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'pending',
  blocker_reason TEXT,
  completion_proof_url TEXT,
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tasks_touch BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Auth read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth create tasks" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Assignee/creator/leadership update tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_to OR auth.uid() = created_by OR public.is_leadership(auth.uid()));
CREATE POLICY "Creator/leadership delete tasks" ON public.tasks FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_leadership(auth.uid()));
