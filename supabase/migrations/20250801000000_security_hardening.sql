-- ===========================================================================
-- Security Hardening Migration
-- (a) Prevent non-admin users from changing their own role via profiles
-- (b) Add subscribed column to newsletter_subscribers
-- ===========================================================================

-- (a) Role immutability trigger --------------------------------------------------

CREATE FUNCTION enforce_role_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_setting('role') != 'service_role'
     AND NOT public.is_admin()
  THEN
    RAISE EXCEPTION 'role changes require admin privileges';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_role_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_role_immutability();

-- (b) Newsletter subscribed column -----------------------------------------------

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN subscribed boolean NOT NULL DEFAULT true;
