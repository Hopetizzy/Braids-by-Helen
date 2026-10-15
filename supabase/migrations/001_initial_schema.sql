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
