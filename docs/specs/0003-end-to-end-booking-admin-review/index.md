# 0003. End to end booking & admin review

**Date**: 2026-10-12
**Status**: In Progress

## Summary

This decision establishes the complete customer reservation and salon management review workflow for Braids by Helen. Customers submit appointment requests through the five step booking modal, creating persistent records in Supabase with pending status and unique reference codes. Helen reviews incoming requests in her private studio dashboard, where she can confirm slots, propose reschedules with alternative times, decline with explanatory notes, or trigger instant WhatsApp conversations using preformatted message templates.

## Requirements

**User stories**:
- As a salon client, I want to submit an appointment request and receive an immediate reference code with an option to message Helen directly on WhatsApp so that my request is acknowledged without friction.
- As the salon owner Helen, I want to view all incoming client requests in my private dashboard with full customer names, telephone numbers, and hairstyle choices so that I can review and act on each request promptly.
- As the salon owner Helen, I want one touch buttons to confirm appointments, propose alternative dates, or decline requests while launching preformatted WhatsApp messages so that client communication is effortless.

**Acceptance criteria**:
- **AC-1**: Customer booking submission writes a persistent record to the database with status `PENDING`, assigns a unique reference code `BBH-XXXX`, sanitizes telephone digits into international Nigerian format (`234...`), and displays an immediate pending confirmation card with direct WhatsApp chat trigger.
- **AC-2**: Authenticated administrator dashboard fetches live booking records from Supabase, displays status counters (Pending, Confirmed, Completed, Cancelled, Rejected), and provides manual refresh capability with loading indicators.
- **AC-3**: Each pending booking card provides four explicit review actions: Confirm, Propose Reschedule, Decline, and WhatsApp Contact.
- **AC-4**: Confirming an appointment invokes atomic double booking prevention, sets status to `CONFIRMED`, records confirmed timestamp, and launches preformatted WhatsApp confirmation message (`Hello [Client], your Braids by Helen appointment for [Service] on [Date] at [Time] is confirmed!`).
- **AC-5**: Proposing a reschedule opens an interactive modal allowing Helen to select an alternative date and time slot, updates status to `RESCHEDULE_PROPOSED` with stored proposed slot values, and launches a preformatted WhatsApp reschedule proposal.
- **AC-6**: Declining an appointment opens a decline modal requiring a reason selection (such as Fully Booked, Outside Working Hours, or Emergency Closure) with optional custom note, updates status to `REJECTED`, and generates a polite WhatsApp notification.
- **AC-7**: Customer contact numbers and styling notes remain strictly protected behind administrator authentication and Row Level Security, hidden from public or unauthenticated visitors.

## Decision

**Chosen option**: Option 1: Direct Supabase persistence with prefilled `wa.me` WhatsApp action templates and structured review state modals.

We adopt direct Supabase queries with Row Level Security, paired with prefilled `wa.me` WhatsApp deep links and interactive admin modals for appointment confirmations, reschedule proposals, and decline reasons.

## Rationale

Reasoning and options: see [rationale.md](./rationale.md).

## Feature design

**Data model sketch**:
- `bookings`:
  - `id` (uuid primary key)
  - `booking_reference` (text unique, format `BBH-XXXX`)
  - `customer_name` (text required)
  - `customer_phone` (text required)
  - `customer_phone_clean` (text required, international digits e.g. `2349010189746`)
  - `service_id` (uuid foreign key references services)
  - `service_name` (text required)
  - `style_choice` (text optional)
  - `booking_date` (date required)
  - `time_slot` (text required)
  - `time_period` (text optional)
  - `customer_note` (text optional)
  - `status` (text check in PENDING, CONFIRMED, RESCHEDULE_PROPOSED, REJECTED, CANCELLED, COMPLETED)
  - `proposed_date` (date optional)
  - `proposed_time_slot` (text optional)
  - `rejection_reason` (text optional)
  - `created_at` (timestamptz default now)
  - `confirmed_at` (timestamptz optional)
  - `resolved_at` (timestamptz optional)
  - `updated_at` (timestamptz default now)
- `booking_status_history`:
  - `id` (uuid primary key)
  - `booking_id` (uuid foreign key references bookings)
  - `previous_status` (text)
  - `new_status` (text)
  - `changed_by` (text default 'admin')
  - `notes` (text)
  - `created_at` (timestamptz default now)

**State transitions**:
`bookings.status`:
- `PENDING` → `CONFIRMED` (Triggered by Helen confirming slot; calls atomic overlap check; sends WhatsApp confirmation)
- `PENDING` → `RESCHEDULE_PROPOSED` (Triggered by Helen selecting alternative slot; stores proposal; sends WhatsApp reschedule proposal)
- `PENDING` → `REJECTED` (Triggered by Helen declining with reason; stores reason; sends WhatsApp decline notice)
- `RESCHEDULE_PROPOSED` → `CONFIRMED` (Triggered by Helen once client agrees to proposed slot)
- `RESCHEDULE_PROPOSED` → `REJECTED` (Triggered if client rejects alternative or slot expires)
- `CONFIRMED` → `COMPLETED` (Triggered by Helen after hair session finishes)
- `CONFIRMED` → `CANCELLED` (Triggered if client cancels before appointment)

**API surface & Client Actions**:
| Action | Method / Operation | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| Submit booking | Supabase insert `bookings` | `customer_name`, `customer_phone`, `service_id`, `booking_date`, `time_slot`, `customer_note` | Created booking record with `BBH-XXXX` reference | Public anon | 400 invalid inputs, 429 rate limit |
| Fetch dashboard bookings | Supabase select `bookings` | `filter_status`, date ordering | Array of booking records | Authenticated admin | 401 unauthorized |
| Confirm booking | Supabase RPC `confirm_booking` | `booking_id` | Updated booking status `CONFIRMED` | Authenticated admin | 401 unauthorized, 409 slot overlap |
| Propose reschedule | Supabase update `bookings` | `booking_id`, `proposed_date`, `proposed_time_slot`, `note` | Updated booking status `RESCHEDULE_PROPOSED` | Authenticated admin | 401 unauthorized, 400 missing date |
| Decline booking | Supabase update `bookings` | `booking_id`, `rejection_reason`, `notes` | Updated booking status `REJECTED` | Authenticated admin | 401 unauthorized, 400 missing reason |
| Mark completed | Supabase update `bookings` | `booking_id` | Updated booking status `COMPLETED` | Authenticated admin | 401 unauthorized |
| Dispatch WhatsApp | URL open `wa.me/{clean_phone}` | `clean_phone`, `encoded_text` | Launches WhatsApp app or web | Client action | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Submit booking | `booking_reference` (`BBH-XXXX`) | Client generator using random four digits or database sequence |
| Submit booking | `customer_phone_clean` | Derived by stripping symbols and formatting into international Nigerian standard (`234...`) |
| Submit booking | Initial status | Fixed literal `'PENDING'` |
| Confirmation view | Reference code & summary | Returned record from booking submission |
| Confirmation view | WhatsApp deep link | Derived from Helen salon telephone number, client reference, and service name |
| Dashboard review | Client telephone numbers | Protected columns `customer_phone` and `customer_phone_clean` from `bookings` table |
| Reschedule proposal | `proposed_date`, `proposed_time_slot` | Inputs selected by Helen in reschedule modal |
| Decline action | `rejection_reason` | Selected preset reason from decline modal |
| WhatsApp templates | Prefilled message text | Template string interpolating client name, reference, date, and salon name |

**Key invariants**:
- Unauthenticated visitors cannot view or query client telephone numbers or customer notes.
- Customer booking submissions default to `PENDING` without reserving or locking calendar slots.
- Confirming an appointment verifies no other confirmed booking occupies the identical date and time slot.
- Declining a booking requires selecting an explanatory reason before updating status.
- Rescheduling requires providing a concrete alternative date and time slot.

**Security model**:
- Row Level Security enforces that public users can only insert pending bookings and cannot read existing records.
- Authenticated admin session is required to fetch bookings, read client phone numbers, and execute status modifications.
- WhatsApp deep links are generated directly on the client side using standard HTTPS `wa.me` format without transmitting customer contact data to third party APIs.

**Configuration required**:
- `VITE_SUPABASE_URL`: Supabase project URL (optional for offline demo mode)
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public API key (optional for offline demo mode)

**Critical test scenarios**:
- Happy path booking: Client selects Knotless Braids, fills contact form, submits request → record created with status PENDING and reference BBH-XXXX → confirmation screen presents direct WhatsApp chat link, verifies **AC-1**, **AC-7**
- Admin review dashboard: Helen signs in, views pending booking with client phone number, clicks Refresh → appointment list refreshes with status counts, verifies **AC-2**, **AC-3**
- Appointment confirmation: Helen clicks Confirm on pending booking → atomic conflict check passes → status changes to CONFIRMED → WhatsApp confirmation link opens with tailored message, verifies **AC-3**, **AC-4**
- Reschedule proposal: Helen opens reschedule modal, selects Friday 2:00 PM, submits → status updates to RESCHEDULE_PROPOSED → WhatsApp template opens proposing Friday 2:00 PM to client, verifies **AC-3**, **AC-5**
- Decline appointment: Helen clicks Decline, selects "Date Fully Booked", submits → status updates to REJECTED with recorded reason → polite WhatsApp notification opens, verifies **AC-3**, **AC-6**

## Build plan

1. [x] Create WhatsApp message template generator utility in `src/utils/whatsappTemplates.js` with functions for booking receipts, confirmations, reschedule proposals, and polite declines, satisfies **AC-1**, **AC-4**, **AC-5**, **AC-6**
2. [x] Update booking completion modal step in `src/components/booking/StepSuccess.jsx` to display the new Braids by Helen confirmation card with direct WhatsApp chat action, satisfies **AC-1**
3. [x] Create appointment review action modals in `src/components/business/RescheduleModal.jsx` and `src/components/business/DeclineModal.jsx`, satisfies **AC-5**, **AC-6**
4. [x] Update `AppointmentCard.jsx` with full 4 action review suite: Confirm button with atomic check, Reschedule button opening modal, Decline button opening modal, and direct WhatsApp contact trigger, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**
5. [x] Connect `LynaDashboard.jsx` to fetch live booking records from Supabase, display status counters, and provide manual Refresh Schedule button with loading states, satisfies **AC-2**, **AC-7**

## Consequences

**Positive**:
- Provides a seamless end to end loop from customer booking request to salon owner review and customer communication.
- Uses standard WhatsApp `wa.me` links with zero monthly fees and zero complex third party API verification.
- Enforces clear status transitions with audit reasons and prevents accidental double bookings.
- Protects client privacy by restricting telephone number access to authenticated admin users.

**Negative / tradeoffs**:
- Dispatching WhatsApp messages relies on Helen clicking the generated link rather than automated background SMS.
- Reschedule proposals require Helen and the customer to finalize agreement through WhatsApp chat.

**Neutral**:
- Offline demo mode continues to work smoothly using local mock appointments when Supabase credentials are not supplied.

## Follow-up

- [ ] Connect Supabase Realtime channel in a future enhancement if Helen requests automatic live push updates on desktop without manual refresh
