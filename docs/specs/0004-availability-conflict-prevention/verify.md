# Verify: Availability & conflict prevention · spec 0004 · updated 2026-10-13

_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Open customer booking modal and inspect dates -> closed dates and dates with all slots occupied display Full badge and cannot be selected -> AC-4
- [ ] Select an open date and inspect time slots -> blocked slots and confirmed appointments display Full badge with crossed out styling, and passed slots for today show Past badge -> AC-4
- [ ] In Helen studio dashboard, click Unavailability button -> Schedule Availability modal opens with interactive date chips, status summary, and time chips -> AC-5
- [ ] Select a date in the availability modal and click Close Day with a reason -> date displays Closed badge -> customer date picker reflects that date as Full -> AC-1, AC-5
- [ ] Select an open date in the availability modal and click specific time slot chips -> slot toggles to Blocked -> customer time picker displays those slots as Full -> AC-1, AC-5
- [ ] In availability modal, attempt to close a date that already has a confirmed client -> deliberate confirmation warning appears detailing affected clients -> AC-5
- [ ] Review pending booking cards in studio dashboard -> requests falling on blocked dates or time slots display an amber Conflict badge with quick Reschedule and Decline actions -> AC-6
- [ ] Attempt to confirm a booking request that conflicts with a blocked slot or existing confirmed appointment -> atomic rejection triggers conflict alert dialog with one tap Propose Reschedule shortcut -> AC-2, AC-7

## Commands

- [ ] Inspect SQL migration `supabase/migrations/003_availability_schedule.sql` -> schema upgrades `availability` table and creates `get_public_schedule` and `confirm_booking` procedures -> AC-1, AC-2, AC-3
- [ ] Run `npm run build` -> production bundle compiles successfully with zero errors -> AC-4, AC-5

## Acceptance criteria coverage

- AC-1 covered by schema migration and BlockAvailabilityModal date controls
- AC-2 covered by atomic confirm_booking procedure and conflict error trapping
- AC-3 covered by get_public_schedule RPC isolating client personal details
- AC-4 covered by StepDate and StepTime dynamic disabled states and Full badges
- AC-5 covered by BlockAvailabilityModal whole day closures, slot blocks, and confirmation guard
- AC-6 covered by AppointmentCard conflict warning badge and inline banner
- AC-7 covered by collision alert modal with immediate reschedule proposal shortcut
