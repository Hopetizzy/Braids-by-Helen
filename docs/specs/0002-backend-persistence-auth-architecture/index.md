# 0002. Backend persistence & auth architecture

**Date**: 2026-10-12
**Status**: In Progress

## Summary

This decision establishes Supabase as the backend platform for Braids by Helen. We configure managed PostgreSQL for relational appointment and service storage, Supabase Auth for Helen's private administrator access, Row Level Security to protect client bookings from public exposure, and Supabase Storage for hairstyle media. This replaces in memory prototype state with durable, secure data persistence while keeping the salon operating on a generous free tier without server maintenance.

## Requirements

**User stories**:
- As a salon client, I want to submit appointment requests and view active hairstyles without creating an account so that booking remains fast and frictionless.
- As the salon owner Helen, I want to log in securely with my email and password so that only I can view client contact numbers, manage bookings, and update salon services.
- As the salon owner Helen, I want the system to prevent overlapping confirmed appointments so that I am never double booked.

**Acceptance criteria**:
- **AC-1**: PostgreSQL database schema is provisioned with tables for `services`, `bookings`, `availability`, `booking_status_history`, `media`, and `business_settings`.
- **AC-2**: Row Level Security (RLS) policies are active on all tables: public clients can insert pending bookings and read active services, published gallery media, and business hours; only authenticated admin users can read all bookings, update booking statuses, edit services, manage availability, and access administrative settings.
- **AC-3**: Public user registration is disabled in Supabase Auth settings; Helen's admin account is provisioned directly with secure email and password via SQL seed helper and Supabase dashboard invite; admin session persists across browser restarts in browser local storage.
- **AC-4**: Booking request submission creates records with initial status `PENDING`, assigns a unique reference code (`BBH-XXXX`), and records timestamp in UTC with display time formatted in West Africa Time (`Africa/Lagos`).
- **AC-5**: Database constraints and validation functions enforce Policy B: multiple pending requests can coexist, but confirming an appointment atomically checks for existing confirmed overlaps and rejects conflicting confirmations.
- **AC-6**: Supabase Storage bucket `salon-media` is configured with public read access for published photos and videos, and upload/delete permissions restricted to authenticated admin users.
- **AC-7**: Client application connects to Supabase via `@supabase/supabase-js` using environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, with zero service role keys exposed in client bundles; when environment variables are omitted, client falls back gracefully to offline demo mock storage with a console notification.

## Decision

**Chosen option**: Option 1: Supabase (PostgreSQL, Supabase Auth, Row Level Security, and Supabase Storage)

We adopt Supabase as the unified backend provider for database persistence, admin authentication, media storage, and security enforcement, replacing in memory prototype state.

## Rationale

Reasoning and options: see [rationale.md](./rationale.md).

## Feature design

**Data model sketch**:
- `services`: `id` (uuid pk), `name` (text), `slug` (text unique), `category` (text), `subtitle` (text), `description` (text), `starting_price` (integer in Naira), `duration_estimate` (text), `styles` (jsonb), `image_url` (text), `is_active` (boolean), `display_order` (integer), `created_at` (timestamptz), `updated_at` (timestamptz)
- `bookings`: `id` (uuid pk), `booking_reference` (text unique), `customer_name` (text), `customer_phone` (text), `customer_phone_clean` (text), `service_id` (uuid fk), `service_name` (text), `style_choice` (text), `booking_date` (date), `time_slot` (text), `time_period` (text), `customer_note` (text), `status` (text check in PENDING, CONFIRMED, RESCHEDULE_PROPOSED, REJECTED, CANCELLED, COMPLETED), `proposed_date` (date), `proposed_time_slot` (text), `rejection_reason` (text), `created_at` (timestamptz), `confirmed_at` (timestamptz), `resolved_at` (timestamptz)
- `availability`: `id` (uuid pk), `unavailable_date` (date), `blocked_slots` (jsonb), `reason` (text), `created_at` (timestamptz)
- `booking_status_history`: `id` (uuid pk), `booking_id` (uuid fk), `previous_status` (text), `new_status` (text), `changed_by` (text), `notes` (text), `created_at` (timestamptz)
- `media`: `id` (uuid pk), `media_type` (text check in image, video), `storage_path` (text), `public_url` (text), `title` (text), `caption` (text), `category` (text), `poster_path` (text), `is_published` (boolean), `display_order` (integer), `created_at` (timestamptz)
- `business_settings`: `id` (text pk default 'default'), `salon_name` (text), `tagline` (text), `contact_phone` (text), `whatsapp_number` (text), `address` (text), `hours` (text), `currency_symbol` (text), `updated_at` (timestamptz)

**State transitions**:
`bookings.status`:
- `PENDING` → `CONFIRMED` (Helen confirms slot; atomic conflict check ensures slot is unreserved)
- `PENDING` → `RESCHEDULE_PROPOSED` (Helen proposes alternative date/time)
- `PENDING` → `REJECTED` (Helen declines with required reason)
- `RESCHEDULE_PROPOSED` → `CONFIRMED` (Customer agrees to new proposal; Helen confirms)
- `RESCHEDULE_PROPOSED` → `REJECTED` (Customer declines alternative)
- `CONFIRMED` → `COMPLETED` (Hair styling session finished)
- `CONFIRMED` → `CANCELLED` (Customer or salon cancels)

**API surface & Client Actions**:
| Action | Method / Operation | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| Fetch active services | Supabase select | None | Array of active services | Public anon | 500 network error |
| Submit booking request | Supabase insert / RPC | `customer_name`, `customer_phone`, `service_id`, `booking_date`, `time_slot`, `customer_note` | Created booking record with reference and PENDING status | Public anon | 400 validation error, 429 rate limit |
| Fetch appointments | Supabase select | Filter status, date range | Array of booking records | Authenticated admin | 401 unauthorized |
| Confirm appointment | Supabase RPC `confirm_booking` | `booking_id` | Updated booking status CONFIRMED | Authenticated admin | 401 unauthorized, 409 conflict slot already taken |
| Propose reschedule | Supabase update | `booking_id`, `proposed_date`, `proposed_time_slot`, `note` | Updated booking status RESCHEDULE_PROPOSED | Authenticated admin | 401 unauthorized |
| Reject appointment | Supabase update | `booking_id`, `rejection_reason` | Updated booking status REJECTED | Authenticated admin | 401 unauthorized, 400 missing reason |
| Admin sign in | Supabase Auth `signInWithPassword` | `email`, `password` | Session token, user object | Public | 400 invalid credentials |
| Admin sign out | Supabase Auth `signOut` | None | None | Authenticated admin | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Submit booking | `booking_reference` (`BBH-XXXX`) | Generated via database default function or client prefix generator |
| Submit booking | `customer_phone_clean` | Derived by sanitizing local digits into international Nigerian format (`234...`) |
| Submit booking | Initial status | Fixed literal `'PENDING'` |
| View bookings | Customer contact details | Columns `customer_name`, `customer_phone` from `bookings` table |
| View schedule | Salon opening days | Filtered rows from `availability` table joined with working hours |
| Client timezone display | Appointment date and time | Stored UTC timestamp formatted using `Africa/Lagos` locale |
| Admin authentication | Admin session token | Supabase Auth stored in browser `localStorage` |

**Key invariants**:
- Public anonymous users can never select or query the full `bookings` table. Client phone numbers and notes are private to Helen.
- A confirmed booking can never overlap with another confirmed booking on the same date and time slot.
- Deleting or updating services, availability, and business settings requires an authenticated admin session with Helen's user ID.
- No public user registration is permitted; Supabase Auth signup API is disabled.
- When Supabase credentials are not configured, client operates in offline demo mode using local mock storage rather than failing to mount.

**Security model**:
- Row Level Security (RLS) is enabled on all tables without exception.
- Public anonymous policy: `SELECT` on `services` where `is_active = true`; `INSERT` on `bookings` with status `'PENDING'`; `SELECT` on `media` where `is_published = true`; `SELECT` on `availability`; `SELECT` on `business_settings`.
- Authenticated admin policy: `ALL` (select, insert, update, delete) on all tables where `auth.role() = 'authenticated'`.
- Passwords are never stored in plaintext (handled by Supabase Auth with bcrypt).
- Client bundle contains only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Service role keys are never stored in frontend code.

**Configuration required**:
- `VITE_SUPABASE_URL`: Supabase project API URL
- `VITE_SUPABASE_ANON_KEY`: Supabase project public anonymous client key

**Critical test scenarios**:
- Happy path booking: Client submits valid booking request → record inserted with status PENDING and unique reference → customer sees pending confirmation screen, verifies **AC-4**, **AC-7**
- Public data privacy: Anonymous HTTP client attempts `SELECT * FROM bookings` → Supabase returns empty set or permission denied error, verifies **AC-2**
- Admin authentication: Unauthenticated user navigating to dashboard is redirected to login → valid email/password login loads bookings list → logout clears session, verifies **AC-2**, **AC-3**
- Conflict prevention: Helen attempts to confirm appointment slot A when slot A is already confirmed for another customer → database RPC rejects confirmation with 409 conflict error, verifies **AC-5**
- Unauthorized signup attempt: Public user calls `signUp` API → Supabase rejects with signup disabled error, verifies **AC-3**

## Build plan

- [x] 1. Create Supabase client helper module in `src/lib/supabase.js` and setup environment variables template in `.env.example`, satisfies **AC-7**
- [x] 2. Write SQL schema migration file `supabase/migrations/001_initial_schema.sql` defining tables, indexes, and constraints for services, bookings, availability, status history, media, and settings, satisfies **AC-1**, **AC-4**, **AC-5**
- [x] 3. Write Row Level Security policies and functions in `supabase/migrations/002_rls_policies.sql`, satisfies **AC-2**, **AC-3**, **AC-6**
- [x] 4. Write SQL seed data file `supabase/seed.sql` populating initial Braids by Helen services, categories, and business settings from `servicesData.js`, satisfies **AC-1**
- [x] 5. Create React authentication context and protected route wrapper in `src/context/AuthContext.jsx` for Helen's admin session, satisfies **AC-2**, **AC-3**
- [x] 6. Connect `BookingContext.jsx` to fetch active services dynamically from Supabase with fallback to local seed data during offline or local development, satisfies **AC-1**, **AC-7**

## Consequences

**Positive**:
- Replaces ephemeral in memory state with durable relational database storage.
- Closes the major security hole by protecting customer phone numbers behind Row Level Security and admin authentication.
- Zero infrastructure maintenance and zero monthly cost within Supabase free tier limits.
- Supports atomic double booking conflict checks in PostgreSQL.

**Negative / tradeoffs**:
- Requires creating a Supabase project and setting environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Offline bookings cannot be confirmed without network connectivity to Supabase.

**Neutral**:
- Local development without Supabase credentials can gracefully fall back to local seed data in demo mode.

## Follow-up

- [x] Provide simple setup documentation in `docs/SUPABASE_SETUP.md` for Helen or developer to create the free Supabase project, execute the SQL migration, and create Helen's admin user
