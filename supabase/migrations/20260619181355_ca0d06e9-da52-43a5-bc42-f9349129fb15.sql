
CREATE TABLE public.sales_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  color TEXT NOT NULL DEFAULT 'default',
  pinned BOOLEAN NOT NULL DEFAULT false,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_notes TO authenticated;
GRANT ALL ON public.sales_notes TO service_role;

ALTER TABLE public.sales_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leadership full access" ON public.sales_notes
  FOR ALL TO authenticated
  USING (public.is_leadership(auth.uid()))
  WITH CHECK (public.is_leadership(auth.uid()));

CREATE POLICY "Owners read own" ON public.sales_notes
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Owners insert own" ON public.sales_notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners update own" ON public.sales_notes
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners delete own" ON public.sales_notes
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE TRIGGER sales_notes_touch_updated_at
  BEFORE UPDATE ON public.sales_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_notes;
