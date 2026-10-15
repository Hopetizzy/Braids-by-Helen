-- Migration 006: Fix Table Permissions and RLS Policies for Bookings
-- Resolves "permission denied for table bookings"

-- 1. Grant schema usage to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant table permissions across public salon tables
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.booking_status_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.availability TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.media TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.business_settings TO anon, authenticated, service_role;

-- 3. Grant sequence permissions for any auto-incrementing / serial identifiers
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Set future table default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 5. Update RLS policies on public.bookings
DROP POLICY IF EXISTS "Public clients can insert pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Enable all access for bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public and admin bookings policy" ON public.bookings;

CREATE POLICY "Public and admin bookings policy"
ON public.bookings
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Update RLS policies on public.booking_status_history
DROP POLICY IF EXISTS "Admins have full access to status history" ON public.booking_status_history;
DROP POLICY IF EXISTS "Public and admin status history policy" ON public.booking_status_history;

CREATE POLICY "Public and admin status history policy"
ON public.booking_status_history
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
