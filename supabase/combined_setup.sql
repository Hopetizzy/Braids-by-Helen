-- Braids by Helen Initial PostgreSQL Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    starting_price INTEGER NOT NULL DEFAULT 0,
    duration_estimate TEXT NOT NULL,
    styles JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    tag TEXT,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_phone_clean TEXT NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    style_choice TEXT,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    time_period TEXT,
    customer_note TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'CONFIRMED', 'RESCHEDULE_PROPOSED', 'REJECTED', 'CANCELLED', 'COMPLETED')
    ),
    proposed_date DATE,
    proposed_time_slot TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_slot_status ON public.bookings(booking_date, time_slot, status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON public.bookings(customer_phone_clean);

-- 3. Availability & Blocked Slots Table
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unavailable_date DATE NOT NULL,
    blocked_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability(unavailable_date);

-- 4. Booking Status Audit History Table
CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'admin',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_status_history_booking_id ON public.booking_status_history(booking_id);

-- 5. Media Gallery Table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    title TEXT,
    caption TEXT,
    category TEXT,
    poster_path TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_media_published ON public.media(is_published);

-- 6. Business Settings Table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    salon_name TEXT NOT NULL DEFAULT 'Braids by Helen',
    tagline TEXT NOT NULL DEFAULT 'Your Hair, Our Art.',
    contact_phone TEXT NOT NULL DEFAULT '09010189746',
    whatsapp_number TEXT NOT NULL DEFAULT '2349010189746',
    whatsapp_display TEXT NOT NULL DEFAULT '0901 018 9746',
    address TEXT NOT NULL DEFAULT 'Ibadan, Oyo State (Studio & Home Service)',
    hours TEXT NOT NULL DEFAULT 'Monday - Saturday: 8:00 AM - 7:00 PM | Sunday: 1:00 PM - 6:00 PM',
    currency_symbol TEXT NOT NULL DEFAULT '₦',
    pricing_note TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Policy B Conflict Prevention RPC Function
-- Atomically confirms an appointment while ensuring no existing confirmed booking shares the same date and slot.
CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_conflict_count INTEGER;
BEGIN
    -- 1. Fetch target booking
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found with ID %', p_booking_id;
    END IF;

    -- 2. Check for conflicting confirmed bookings on the same date and slot
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE booking_date = v_booking.booking_date
      AND time_slot = v_booking.time_slot
      AND status = 'CONFIRMED'
      AND id <> p_booking_id;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Double booking conflict: Date % and time slot % is already confirmed for another client.',
            v_booking.booking_date, v_booking.time_slot;
    END IF;

    -- 3. Update status to CONFIRMED
    UPDATE public.bookings
    SET status = 'CONFIRMED',
        confirmed_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- 4. Record status change history
    INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by, notes)
    VALUES (p_booking_id, v_booking.status, 'CONFIRMED', 'admin', 'Confirmed by Helen with atomic overlap check');

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'status', 'CONFIRMED',
        'booking_reference', v_booking.booking_reference
    );
END;
$$;
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
-- Braids by Helen Availability & Schedule Conflict Prevention Schema
-- Migration: 003_availability_schedule.sql

-- 1. Upgrade availability table schema
ALTER TABLE public.availability 
ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.availability 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- Add unique constraint on unavailable_date if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_availability_unavailable_date'
    ) THEN
        ALTER TABLE public.availability 
        ADD CONSTRAINT uq_availability_unavailable_date UNIQUE (unavailable_date);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_availability_date_all_day 
ON public.availability(unavailable_date, is_all_day);

-- 2. Procedure: get_public_schedule
-- Safely aggregates all day closures, blocked time chips, and confirmed booking slots
-- Exposes zero client phone numbers, names, or notes to public anonymous visitors.
CREATE OR REPLACE FUNCTION public.get_public_schedule(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS sched_date
    ),
    confirmed_slots AS (
        SELECT 
            b.booking_date,
            jsonb_agg(b.time_slot) AS booked_slots
        FROM public.bookings b
        WHERE b.status = 'CONFIRMED'
          AND b.booking_date >= p_start_date
          AND b.booking_date <= p_end_date
        GROUP BY b.booking_date
    ),
    merged_schedule AS (
        SELECT 
            d.sched_date,
            COALESCE(a.is_all_day, false) AS is_all_day,
            COALESCE(a.reason, '') AS reason,
            (
                SELECT jsonb_agg(DISTINCT slot_val)
                FROM (
                    SELECT jsonb_array_elements_text(COALESCE(a.blocked_slots, '[]'::jsonb)) AS slot_val
                    UNION
                    SELECT jsonb_array_elements_text(COALESCE(c.booked_slots, '[]'::jsonb)) AS slot_val
                ) s
                WHERE slot_val IS NOT NULL
            ) AS combined_blocked_slots
        FROM date_series d
        LEFT JOIN public.availability a ON a.unavailable_date = d.sched_date
        LEFT JOIN confirmed_slots c ON c.booking_date = d.sched_date
        WHERE a.unavailable_date IS NOT NULL OR c.booking_date IS NOT NULL
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'date', sched_date,
                'is_all_day', is_all_day,
                'reason', reason,
                'blocked_slots', COALESCE(combined_blocked_slots, '[]'::jsonb)
            )
        ),
        '[]'::jsonb
    ) INTO v_result
    FROM merged_schedule;

    RETURN v_result;
END;
$$;

-- Grant execution to public anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_schedule(DATE, DATE) TO anon, authenticated;

-- 3. Procedure: confirm_booking (Upgraded with availability verification)
-- Atomically ensures that:
-- A) Target date is not marked all day closed in availability
-- B) Target time slot is not in blocked_slots in availability
-- C) No conflicting confirmed booking exists on the same date and slot
CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_date_blocked BOOLEAN := false;
    v_slot_blocked BOOLEAN := false;
    v_conflict_count INTEGER := 0;
    v_reason TEXT := '';
BEGIN
    -- 1. Lock and fetch target booking
    SELECT * INTO v_booking 
    FROM public.bookings 
    WHERE id = p_booking_id 
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found with ID %', p_booking_id;
    END IF;

    -- 2. Check availability table for whole day closure
    SELECT 
        COALESCE(is_all_day, false),
        COALESCE(reason, '')
    INTO v_date_blocked, v_reason
    FROM public.availability
    WHERE unavailable_date = v_booking.booking_date;

    IF v_date_blocked THEN
        RAISE EXCEPTION 'Date conflict: Date % is closed for salon schedule (%).', 
            v_booking.booking_date, 
            CASE WHEN v_reason <> '' THEN v_reason ELSE 'Salon closed' END;
    END IF;

    -- 3. Check availability table for slot specific block
    SELECT (blocked_slots ? v_booking.time_slot)
    INTO v_slot_blocked
    FROM public.availability
    WHERE unavailable_date = v_booking.booking_date;

    IF v_slot_blocked THEN
        RAISE EXCEPTION 'Time slot conflict: Date % at % is blocked in salon availability.', 
            v_booking.booking_date, v_booking.time_slot;
    END IF;

    -- 4. Check for conflicting confirmed bookings on the same date and slot
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE booking_date = v_booking.booking_date
      AND time_slot = v_booking.time_slot
      AND status = 'CONFIRMED'
      AND id <> p_booking_id;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Double booking conflict: Date % and time slot % is already confirmed for another client.',
            v_booking.booking_date, v_booking.time_slot;
    END IF;

    -- 5. Atomically update status to CONFIRMED
    UPDATE public.bookings
    SET status = 'CONFIRMED',
        confirmed_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- 6. Insert audit history record
    INSERT INTO public.booking_status_history (
        booking_id, 
        previous_status, 
        new_status, 
        changed_by, 
        notes
    )
    VALUES (
        p_booking_id, 
        v_booking.status, 
        'CONFIRMED', 
        'admin', 
        'Confirmed by Helen with atomic availability and overlap verification'
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'status', 'CONFIRMED',
        'booking_reference', v_booking.booking_reference
    );
END;
$$;

-- Grant execution to authenticated admin
GRANT EXECUTE ON FUNCTION public.confirm_booking(UUID) TO authenticated;

-- 4. RLS policies on availability table
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'availability' AND policyname = 'Public read availability'
    ) THEN
        CREATE POLICY "Public read availability" 
        ON public.availability FOR SELECT 
        TO anon, authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'availability' AND policyname = 'Admin full control availability'
    ) THEN
        CREATE POLICY "Admin full control availability" 
        ON public.availability FOR ALL 
        TO authenticated 
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;
-- Braids by Helen Services & Portfolio Media Schema Extension
-- Migration: 004_services_media_schema.sql

-- 1. Extend Media Table with Foreign Key to Services and Style Tag
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS style_tag TEXT;

-- 2. Indexes for fast service-filtered media queries
CREATE INDEX IF NOT EXISTS idx_media_service_id ON public.media(service_id);
CREATE INDEX IF NOT EXISTS idx_media_published_order ON public.media(is_published, display_order);

-- 3. Storage Bucket Configuration for salon-media
-- Create public bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'salon-media',
    'salon-media',
    true,
    52428800, -- 50MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- 4. Storage Row Level Security Policies for salon-media
-- Public read access to all files in salon-media bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public clients can read salon-media'
    ) THEN
        CREATE POLICY "Public clients can read salon-media"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (bucket_id = 'salon-media');
    END IF;
END $$;

-- Authenticated admins can upload files to salon-media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload to salon-media'
    ) THEN
        CREATE POLICY "Admins can upload to salon-media"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'salon-media');
    END IF;
END $$;

-- Authenticated admins can update files in salon-media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update salon-media'
    ) THEN
        CREATE POLICY "Admins can update salon-media"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'salon-media')
        WITH CHECK (bucket_id = 'salon-media');
    END IF;
END $$;

-- Authenticated admins can delete files from salon-media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete from salon-media'
    ) THEN
        CREATE POLICY "Admins can delete from salon-media"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'salon-media');
    END IF;
END $$;
-- Migration 005: Web Push Subscriptions and Notification Logs
-- Enables Helen to receive background mobile Web Push alerts for new salon bookings

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_name text default 'Helen Mobile Device',
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_notified_at timestamptz
);

create index if not exists idx_push_subscriptions_active on public.push_subscriptions(is_active);
create index if not exists idx_push_subscriptions_endpoint on public.push_subscriptions(endpoint);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.push_subscriptions(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  event_type text not null,
  title text not null,
  body text not null,
  status text not null default 'sent',
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_logs_booking on public.notification_logs(booking_id);
create index if not exists idx_notification_logs_created on public.notification_logs(created_at desc);

-- Enable Row Level Security
alter table public.push_subscriptions enable row level security;
alter table public.notification_logs enable row level security;

-- Policies for push_subscriptions
drop policy if exists "Allow public anonymous subscription registration" on public.push_subscriptions;
create policy "Allow public anonymous subscription registration"
  on public.push_subscriptions for insert
  with check (true);

drop policy if exists "Allow read of push subscriptions" on public.push_subscriptions;
create policy "Allow read of push subscriptions"
  on public.push_subscriptions for select
  using (true);

drop policy if exists "Allow update of push subscriptions" on public.push_subscriptions;
create policy "Allow update of push subscriptions"
  on public.push_subscriptions for update
  using (true)
  with check (true);

-- Policies for notification_logs
drop policy if exists "Allow insert of notification logs" on public.notification_logs;
create policy "Allow insert of notification logs"
  on public.notification_logs for insert
  with check (true);

drop policy if exists "Allow read of notification logs" on public.notification_logs;
create policy "Allow read of notification logs"
  on public.notification_logs for select
  using (true);
-- Braids by Helen Initial Seed Data
-- Seed file: supabase/seed.sql

-- 1. Business Settings Seed
INSERT INTO public.business_settings (
    id,
    salon_name,
    tagline,
    contact_phone,
    whatsapp_number,
    whatsapp_display,
    address,
    hours,
    currency_symbol,
    pricing_note
) VALUES (
    'default',
    'Braids by Helen',
    'Your Hair, Our Art.',
    '09010189746',
    '2349010189746',
    '0901 018 9746',
    'Ibadan, Oyo State (Studio & Home Service)',
    'Monday - Saturday: 8:00 AM - 7:00 PM | Sunday: 1:00 PM - 6:00 PM',
    '₦',
    'Starting estimates shown for illustration. Braids by Helen confirms final pricing based on hair length, density, and extensions provided.'
)
ON CONFLICT (id) DO UPDATE SET
    salon_name = EXCLUDED.salon_name,
    tagline = EXCLUDED.tagline,
    contact_phone = EXCLUDED.contact_phone,
    whatsapp_number = EXCLUDED.whatsapp_number,
    whatsapp_display = EXCLUDED.whatsapp_display,
    address = EXCLUDED.address,
    hours = EXCLUDED.hours,
    currency_symbol = EXCLUDED.currency_symbol,
    pricing_note = EXCLUDED.pricing_note,
    updated_at = timezone('utc'::text, now());

-- 2. Services Seed (Helen's 6 Official Services)
DELETE FROM public.services;

INSERT INTO public.services (
    id,
    slug,
    category,
    name,
    subtitle,
    description,
    starting_price,
    duration_estimate,
    styles,
    image_url,
    tag,
    is_popular,
    is_active,
    display_order
) VALUES
(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'short-knotless-twists',
    'braids',
    'Short Knotless Braids / Twists',
    'Neck to shoulder length lightweight protective styling',
    'Clean parting with natural root start to protect edges and eliminate scalp tension. Tailored to neck or shoulder length.',
    5000,
    '2.5 to 3.5 hrs',
    '["Short Knotless Braids", "Short Passion Twists", "Bob Length Knotless", "Short Senegalese Twists"]'::jsonb,
    '/images/knotless-braids.png',
    'Popular',
    true,
    true,
    1
),
(
    '00000000-0000-0000-0000-000000000002'::uuid,
    'long-knotless-twists',
    'braids',
    'Long Knotless Braids / Twists',
    'Mid back to waist length full glam finish',
    'Sleek, flowy knotless braids or twists extending to mid back or waist length. Lightweight feel with flawless weight distribution.',
    7000,
    '3.5 to 5 hrs',
    '["Mid back Knotless", "Waist Length Knotless", "Long Passion Twists", "Long French Curl Knotless"]'::jsonb,
    '/images/box-braids.png',
    'Signature',
    true,
    true,
    2
),
(
    '00000000-0000-0000-0000-000000000003'::uuid,
    'all-back',
    'weaving',
    'All-back Cornrows',
    'Neat straight back cornrow precision',
    'Classic, crisp feed in cornrows directed straight back. Beautiful as a standalone look or protective base for wigs.',
    1500,
    '1 to 2 hrs',
    '["Classic All-back (4 to 6 lines)", "Neat Micro All-back", "Stitch All-back", "Cornrows for Wig Base"]'::jsonb,
    '/images/ghana-weaving-allback.png',
    'Quick Style',
    false,
    true,
    3
),
(
    '00000000-0000-0000-0000-000000000004'::uuid,
    'retouching',
    'care',
    'Retouching',
    'Perimeter refresh and edge maintenance',
    'Revitalize your hairstyle by taking down and redoing the front perimeter and crown lines for a fresh, just styled look.',
    2000,
    '1 to 1.5 hrs',
    '["Front Perimeter Retouch", "Crown and Edges Refresh", "Braid Take down and Redo", "Parting Reneatening"]'::jsonb,
    '/images/hair-retouching.jpg',
    'Maintenance',
    false,
    true,
    4
),
(
    '00000000-0000-0000-0000-000000000005'::uuid,
    'hair-washing',
    'care',
    'Hair Washing',
    'Deep clarifying wash, scalp scrub and conditioning',
    'Invigorating salon shampoo, thorough scalp cleanse, deep conditioning moisture massage, and gentle blow dry preparation.',
    2000,
    '45 mins to 1 hr',
    '["Clarifying Wash and Conditioning", "Scalp Scrub and Massage", "Steam Moisture Treatment", "Wash and Blow dry Prep"]'::jsonb,
    '/images/hair-washing.jpg',
    'Essential',
    false,
    true,
    5
),
(
    '00000000-0000-0000-0000-000000000006'::uuid,
    'children-hairstyles',
    'children',
    'Children''s Hairstyles',
    'Gentle, pain free, and neat styling for kids',
    'Extra gentle styling crafted specially for sensitive young scalps, adorned with colorful beads and hair accessories.',
    3000,
    '1.5 to 2.5 hrs',
    '["Beaded Natural Cornrows", "Kids All-back with Beads", "Puff Balls and Twists", "Gentle Natural Braids"]'::jsonb,
    '/images/children-hair.png',
    'Kids Favorite',
    true,
    true,
    6
)
ON CONFLICT (slug) DO UPDATE SET
    category = EXCLUDED.category,
    name = EXCLUDED.name,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    starting_price = EXCLUDED.starting_price,
    duration_estimate = EXCLUDED.duration_estimate,
    styles = EXCLUDED.styles,
    image_url = EXCLUDED.image_url,
    tag = EXCLUDED.tag,
    is_popular = EXCLUDED.is_popular,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = timezone('utc'::text, now());

-- 3. Helen Admin User Provisioning Guide
-- In your Supabase cloud project dashboard:
-- Go to Authentication -> Users -> Add User -> Create user
-- Email: admin@braidsbyhelen.com (or Helen's personal email)
-- Password: [Set a secure password for Helen]
-- Auto-confirm user: Yes
--
-- Or run this SQL snippet in Supabase SQL Editor if service role access is available:
-- INSERT INTO auth.users (
--     instance_id,
--     id,
--     aud,
--     role,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     recovery_sent_at,
--     last_sign_in_at,
--     raw_app_meta_data,
--     raw_user_meta_data,
--     created_at,
--     updated_at,
--     confirmation_token,
--     email_change,
--     email_change_token_new,
--     recovery_token
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     gen_random_uuid(),
--     'authenticated',
--     'authenticated',
--     'helen@braidsbyhelen.com',
--     crypt('ReplaceWithSecureAdminPassword123!', gen_salt('bf')),
--     now(),
--     now(),
--     now(),
--     '{"provider":"email","providers":["email"]}',
--     '{"full_name":"Helen Admin","role":"admin"}',
--     now(),
--     now(),
--     '',
--     '',
--     '',
--     ''
-- );

-- 11. PostgreSQL Table Grants & Permissions (Fixes "permission denied for table bookings")
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.booking_status_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.availability TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.media TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.business_settings TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

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

DROP POLICY IF EXISTS "Admins have full access to status history" ON public.booking_status_history;
DROP POLICY IF EXISTS "Public and admin status history policy" ON public.booking_status_history;

CREATE POLICY "Public and admin status history policy"
ON public.booking_status_history
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

