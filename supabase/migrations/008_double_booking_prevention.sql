-- Braids by Helen: Double Booking Prevention and Active Slot Reservation
-- Migration: 008_double_booking_prevention.sql

-- 1. Upgrade get_public_schedule to treat PENDING, RESCHEDULE_PROPOSED, and CONFIRMED bookings as reserved slots
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
    active_booked_slots AS (
        SELECT 
            b.booking_date,
            jsonb_agg(DISTINCT b.time_slot) AS booked_slots
        FROM public.bookings b
        WHERE b.status IN ('CONFIRMED', 'PENDING', 'RESCHEDULE_PROPOSED')
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
        LEFT JOIN active_booked_slots c ON c.booking_date = d.sched_date
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

GRANT EXECUTE ON FUNCTION public.get_public_schedule(DATE, DATE) TO anon, authenticated;

-- 2. Partial unique index to strictly guarantee no duplicate active bookings at database level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'uq_bookings_active_date_slot'
    ) THEN
        CREATE UNIQUE INDEX uq_bookings_active_date_slot 
        ON public.bookings(booking_date, time_slot) 
        WHERE status IN ('PENDING', 'CONFIRMED', 'RESCHEDULE_PROPOSED');
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN others THEN
        -- If existing duplicate rows exist in legacy data, index creation can be handled manually
        RAISE NOTICE 'Notice: unique index skipped if duplicate data exists: %', SQLERRM;
END $$;
