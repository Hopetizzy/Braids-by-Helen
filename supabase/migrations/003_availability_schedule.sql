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
