-- Braids by Helen Row Level Security Policies
-- Migration: 002_rls_policies.sql

-- 1. Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- 2. Services Policies
-- Public anonymous users can read active services
CREATE POLICY "Public clients can read active services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Authenticated admins can manage all services
CREATE POLICY "Admins have full access to services"
ON public.services
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Bookings Policies
-- Public anonymous users can submit booking requests with PENDING status
CREATE POLICY "Public clients can insert pending bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'PENDING');

-- Authenticated admins can view, update, and manage all bookings
CREATE POLICY "Admins have full access to bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Availability Policies
-- Public anonymous users can view availability and blocked dates
CREATE POLICY "Public clients can read availability"
ON public.availability
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated admins can manage availability
CREATE POLICY "Admins have full access to availability"
ON public.availability
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Booking Status History Policies
-- Only authenticated admins can read and append history
CREATE POLICY "Admins have full access to status history"
ON public.booking_status_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Media Gallery Policies
-- Public anonymous users can view published media items
CREATE POLICY "Public clients can read published media"
ON public.media
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Authenticated admins can manage media items
CREATE POLICY "Admins have full access to media"
ON public.media
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Business Settings Policies
-- Public anonymous users can read business settings
CREATE POLICY "Public clients can read business settings"
ON public.business_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated admins can update business settings
CREATE POLICY "Admins can update business settings"
ON public.business_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Storage bucket setup for salon-media
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-media', 'salon-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images and videos in salon-media bucket
CREATE POLICY "Public can view salon media assets"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'salon-media');

-- Authenticated admins can upload, update, and delete media files
CREATE POLICY "Admins can upload salon media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'salon-media');

CREATE POLICY "Admins can update salon media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'salon-media');

CREATE POLICY "Admins can delete salon media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'salon-media');
