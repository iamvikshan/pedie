-- Rename sync_log to admin_log and extend for audit logging

ALTER TABLE public.sync_log RENAME TO admin_log;

ALTER TABLE public.admin_log
  ADD COLUMN actor_id uuid REFERENCES public.profiles(id),
  ADD COLUMN action text,
  ADD COLUMN entity_type text,
  ADD COLUMN entity_id text,
  ADD COLUMN details jsonb;

ALTER POLICY sync_log_admin_read ON public.admin_log RENAME TO admin_log_admin_read;

-- Service role already bypasses RLS; explicit grant documents intent
GRANT INSERT ON public.admin_log TO service_role;
