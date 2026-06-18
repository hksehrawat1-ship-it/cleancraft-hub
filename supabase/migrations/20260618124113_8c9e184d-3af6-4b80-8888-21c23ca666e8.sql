
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_leadership(UUID) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;

-- storage policies for task-proofs bucket
CREATE POLICY "Auth can upload task proofs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-proofs');
CREATE POLICY "Auth can read task proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'task-proofs');
CREATE POLICY "Owners can update task proofs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'task-proofs' AND owner = auth.uid());
CREATE POLICY "Owners can delete task proofs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'task-proofs' AND owner = auth.uid());
