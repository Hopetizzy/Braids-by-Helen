# Verify: Backend persistence & auth architecture · spec 0002 · updated 2026-10-12
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [x] Client submits new booking request → system generates unique BBH reference and saves record with PENDING status → AC-4, AC-7
- [x] Client views hairstyle services → active services render dynamically from Supabase or fallback defaults → AC-1, AC-7
- [x] Visitor navigates to business dashboard while unauthenticated → system displays luxury admin login form rather than revealing client numbers → AC-2, AC-3
- [x] Helen enters administrator credentials in login form → authenticated session established and studio schedule displays → AC-2, AC-3
- [x] Helen clicks quick demo login in offline mode → mock admin session saved in browser local storage and dashboard unlocks → AC-3, AC-7
- [x] Helen clicks sign out in studio dashboard → admin session clears and view returns to login card → AC-3
- [x] Public user inspects browser local storage → anonymous visitors have no access token and cannot read full bookings table → AC-2

## Commands
- [x] `npm run build` → Vite production build finishes with zero errors → AC-7
- [x] Inspect `supabase/migrations/001_initial_schema.sql` → contains tables for services, bookings, availability, history, media, settings, and Policy B atomic check function → AC-1, AC-4, AC-5
- [x] Inspect `supabase/migrations/002_rls_policies.sql` → contains Row Level Security policies on all tables and salon media storage bucket → AC-2, AC-6
- [x] Inspect `supabase/seed.sql` → contains seed rows for Braids by Helen services, settings, and admin provisioning guide → AC-1, AC-3
- [x] Inspect `src/lib/supabase.js` → client uses environment variables with graceful fallback when omitted → AC-7

## Acceptance criteria coverage
- AC-1 (Database schema): covered by initial schema migration inspection and dynamic services loading
- AC-2 (Row Level Security): covered by RLS migration inspection and admin login boundary test
- AC-3 (Admin auth & signup disabled): covered by admin login, demo fallback, and sign out manual tests
- AC-4 (Pending status & BBH reference): covered by booking submission flow
- AC-5 (Policy B double booking prevention): covered by confirm_booking RPC in initial schema migration
- AC-6 (Salon media storage bucket): covered by storage policies in RLS migration
- AC-7 (Supabase client & demo fallback): covered by npm run build, client module inspection, and offline demo fallback
