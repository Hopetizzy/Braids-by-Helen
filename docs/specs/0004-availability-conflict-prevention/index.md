# 0004. Availability & conflict prevention

**Date**: 2026-10-13
**Status**: Accepted

## Summary

This decision establishes salon availability controls and atomic double booking prevention for Braids by Helen. Helen can close entire calendar dates or block individual time slots directly from her studio dashboard, preventing clients from selecting unavailable hours. The customer booking modal dynamically disables occupied or blocked slots with a clear Full badge. Database stored procedures atomically prevent conflicting confirmations under Policy B, keeping Helen's schedule organized and dependable.

## Requirements

**User stories**:
- As a salon client, I want to see clearly which dates and time slots are already booked or closed so that I only request available appointments.
- As the salon owner Helen, I want to close entire dates for holidays or block specific hours for errands so that clients cannot book when I am unavailable.
- As the salon owner Helen, I want the system to alert me if pending requests clash with blocked slots and prevent me from ever confirming two bookings for the exact same time.

**Acceptance criteria**:
- **AC-1**: Database schema updates the `availability` table with an `is_all_day` boolean column, `blocked_slots` jsonb array, and `unavailable_date` unique constraint so each date holds a single clean schedule record.
- **AC-2**: PostgreSQL stored procedure `confirm_booking` atomically validates both existing confirmed bookings and the `availability` table, rejecting confirmation with an error if the slot is already taken or the date is closed.
- **AC-3**: PostgreSQL stored procedure `get_public_schedule` provides public visitors with unavailable date and time slot lists within an active date window without exposing customer names, phone numbers, or private notes.
- **AC-4**: Customer booking modal components `StepDate` and `StepTime` retrieve public schedule state, dynamically disabling closed dates and unavailable time slots with visible Full indicators.
- **AC-5**: Studio dashboard provides Helen with an interactive Schedule Availability modal to toggle whole day closures, select individual time slots to block or unblock, and attach optional reason notes.
- **AC-6**: Studio dashboard detects pending booking requests falling on blocked dates or slots, displaying an amber conflict warning badge with quick actions to propose a reschedule or decline.
- **AC-7**: Attempting to confirm a booking that collides with an existing confirmed slot or blocked schedule displays an explicit conflict alert dialog naming the conflict and offering an immediate reschedule proposal shortcut.

## Decision

**Chosen option**: Option 1: Two tier availability management with privacy safe public schedule procedure, interactive studio availability modal, and atomic database confirmation checks.

We adopt an atomic database verification procedure in Supabase PostgreSQL combined with privacy isolated public schedule queries and an interactive calendar modal for Helen to manage date and slot blocks.

**Implementation skills**: `tailwindcss-mcp-server` (recommended styling)

## Rationale

Reasoning and options: see [rationale.md](./rationale.md).

## Feature design

**Data model sketch**:
- `availability`:
  - `id` (uuid primary key default `uuid_generate_v4()`)
  - `unavailable_date` (date unique not null)
  - `is_all_day` (boolean not null default false)
  - `blocked_slots` (jsonb not null default `'[]'::jsonb`)
  - `reason` (text optional e.g. Salon holiday or Private event)
  - `created_at` (timestamptz not null default now)
  - `updated_at` (timestamptz not null default now)
- `bookings`:
  - `booking_date` (date not null)
  - `time_slot` (text not null)
  - `status` (text check in PENDING, CONFIRMED, RESCHEDULE_PROPOSED, REJECTED, CANCELLED, COMPLETED)
  - Indexes on `(booking_date, time_slot, status)` for rapid conflict lookups

**State transitions**:
`bookings.status` under Policy B:
- `PENDING` -> `CONFIRMED`: Helen confirms booking. Stored procedure `confirm_booking` checks for conflicting confirmed bookings and active availability blocks on that date and time slot. If clear, transitions to `CONFIRMED`. If conflict exists, transaction aborts and returns error.
- `PENDING` -> `RESCHEDULE_PROPOSED`: Helen proposes alternative slot when original requested slot is blocked or contested.
- `PENDING` -> `REJECTED`: Helen declines request when slot is unavailable and client cannot reschedule.
- `CONFIRMED` -> `CANCELLED`: Client or salon cancels confirmed appointment, freeing the slot for others.

**API surface**:
| Endpoint / Procedure | Method / Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `get_public_schedule` | Supabase RPC | `p_start_date: date`, `p_end_date: date` | Array of `{ date, is_all_day, blocked_slots }` | Public anon | 400 invalid date range |
| `confirm_booking` | Supabase RPC | `p_booking_id: uuid` | `{ success: true, booking_id, status }` | Authenticated admin | 401 unauthorized, 409 double booking conflict |
| `upsert_availability` | Supabase RPC / table upsert | `unavailable_date`, `is_all_day`, `blocked_slots`, `reason` | Updated availability row | Authenticated admin | 401 unauthorized, 400 validation error |
| `delete_availability` | Supabase delete | `unavailable_date: date` | Success boolean | Authenticated admin | 401 unauthorized |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Load customer date picker | Date availability status (open or full) | Output of `get_public_schedule` RPC joined with operating days |
| Load customer time picker | Time slot disabled state | Output of `get_public_schedule` matching slot against confirmed bookings or blocked slots |
| Open availability modal | Existing blocked dates and hours | Stored rows from `availability` table |
| Toggle date closure | `is_all_day` boolean | Checkbox input selected by Helen in modal |
| Block specific hour | `blocked_slots` array item | Time chip tapped by Helen in modal |
| Confirm booking | Conflict error message | Raised exception from PostgreSQL `confirm_booking` procedure |
| Display conflict badge | Colliding booking reference | Stored booking record matching date and time slot in context |

**Key invariants**:
- Anonymous public clients can never inspect customer names, phone numbers, or notes from the bookings table.
- A confirmed booking can never share the same date and time slot with another confirmed booking.
- A booking cannot be confirmed if the date is marked all day unavailable or the specific time slot is in `blocked_slots`.
- Multiple pending booking requests can coexist for the same date and time slot under Policy B until Helen confirms one.
- In offline demo mode when Supabase is not configured, local browser storage replicates these exact rules.

**Security model**:
- Row Level Security active on `availability` table:
  - Public anonymous users: `SELECT` permission only to read schedule limits.
  - Authenticated admin: Full `INSERT`, `UPDATE`, `DELETE` permissions where `auth.role() = 'authenticated'`.
- Function `get_public_schedule` runs as `SECURITY DEFINER` to safely aggregate booked and blocked slots without granting public table permissions over client contact records.
- Stored procedure `confirm_booking` runs as `SECURITY DEFINER` restricted to authenticated admin calls.

**Critical test scenarios**:
- Happy path public view: Customer opens reservation modal, dates with no openings show Full badge, and occupied time slots are unclickable, verifies **AC-3**, **AC-4**
- Helen blocks entire date: Helen opens Schedule Availability modal, selects a holiday date, marks it closed all day, and customer date picker immediately shows that date as Full, verifies **AC-1**, **AC-5**
- Helen blocks specific slot: Helen blocks 2:00 PM on Friday, and customer modal displays 2:00 PM crossed out with Full badge while other Friday slots remain open, verifies **AC-1**, **AC-4**, **AC-5**
- Conflict detection on pending request: Helen blocks a date that already has a pending client booking, and the dashboard displays an amber conflict badge prompting reschedule, verifies **AC-6**
- Double booking prevention: Helen attempts to confirm a second booking for an already confirmed slot, database aborts with double booking exception, and dashboard opens conflict resolution dialog, verifies **AC-2**, **AC-7**
- Deliberate confirmation on blocked date: Helen attempts to close a date with existing confirmed clients, system requires explicit confirmation before applying the block, verifies **AC-5**

## Build plan

- [x] 1. Database schema migration: add `is_all_day` column, unique constraint, `get_public_schedule` procedure, and updated `confirm_booking` atomic conflict procedure (`supabase/migrations/003_availability_schedule.sql`), satisfies **AC-1**, **AC-2**, **AC-3**
- [x] 2. Date utilities and public schedule sync: create `src/utils/dateUtils.js` helper and connect `BookingContext` public schedule state with local storage fallback, satisfies **AC-3**, **AC-4**
- [x] 3. Customer booking modal availability indicators: update `StepDate.jsx` and `StepTime.jsx` to dynamically mark closed dates and blocked or confirmed slots with disabled states and Full badges, satisfies **AC-4**
- [x] 4. Helen studio availability controls modal: build `src/components/business/BlockAvailabilityModal.jsx` with date toggle and slot block pickers, wiring persistence to Supabase and context state, satisfies **AC-5**
- [x] 5. Dashboard conflict warning tags and confirmation guard: update `AppointmentCard.jsx` and `LynaDashboard.jsx` to flag pending requests on blocked slots and show conflict resolution dialogs on atomic collision, satisfies **AC-6**, **AC-7**

## Consequences

**Positive**:
- Eliminates accidental double bookings through database level transaction locks.
- Protects client privacy by exposing only slot availability metadata rather than client identities.
- Gives Helen effortless control over salon holidays and partial day errands without editing code.
- Informs clients of unavailable times upfront, reducing rejected booking requests.

**Negative / tradeoffs**:
- Requires an additional RPC network call when customer opens the booking modal.
- If Helen closes a date with existing bookings, she must manually contact affected clients to reschedule.

**Neutral**:
- Offline demo mode maintains an equivalent mock availability store in browser local storage.

## Follow-up

- [ ] Add SMS or automated notification reminders when Helen reschedules a client from a blocked slot.
- [ ] Connect salon business hours from `business_settings` dynamically into client date generators.
