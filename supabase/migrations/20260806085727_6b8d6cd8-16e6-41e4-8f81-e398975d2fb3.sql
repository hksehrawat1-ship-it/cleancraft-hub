REVOKE EXECUTE ON FUNCTION public.log_work_item_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_work_item_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_department(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.manages_department(uuid, text) FROM PUBLIC, anon;