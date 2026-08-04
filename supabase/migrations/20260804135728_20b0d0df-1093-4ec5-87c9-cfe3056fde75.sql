
REVOKE ALL ON FUNCTION public.handover_lead_to_franchise(uuid, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handover_franchise_to_project(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handover_project_to_store(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handover_lead_to_franchise(uuid, numeric) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handover_franchise_to_project(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handover_project_to_store(uuid, text) TO authenticated, service_role;
