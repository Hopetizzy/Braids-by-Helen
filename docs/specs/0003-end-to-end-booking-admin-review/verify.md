# Verify: End to end booking and admin review, spec 0003, updated 2026-10-12
_Steps derived from spec 0003 acceptance criteria. /check verify runs these, /test locks the durable ones._

## UI / manual
- [x] Open booking modal -> select Knotless Braids -> pick date and time slot -> enter name, phone, notes -> submit -> expect booking saved with reference code BBH-XXXX, status PENDING, phone sanitized to international Nigerian format, and confirmation ticket displayed with WhatsApp message link -> AC-1
- [x] Log in as admin and switch to Studio Dashboard -> expect appointment list loaded from database, counters displayed for Pending Review, Confirmed, Rescheduled, Declined, and Completed -> AC-2
- [x] In Studio Dashboard -> click Refresh Schedule button -> expect refresh spinner and updated appointment records -> AC-2
- [x] Review pending booking card -> expect four review buttons: Confirm, Reschedule, Decline, WhatsApp Client -> AC-3
- [x] Click Confirm on pending booking card -> expect conflict prevention check, status updated to CONFIRMED, confirmed timestamp recorded, and preformatted WhatsApp confirmation message launched -> AC-4
- [x] Attempt to confirm another appointment with identical date and time slot -> expect double booking prevention error message and second slot not confirmed -> AC-4
- [x] Click Reschedule on pending booking card -> select alternative date and time slot, enter optional note -> submit -> expect status updated to RESCHEDULE_PROPOSED, proposed slot recorded, and preformatted WhatsApp reschedule proposal launched -> AC-5
- [x] Click Decline on pending booking card -> select reason preset, enter optional note -> submit -> expect status updated to REJECTED, rejection reason recorded, and polite WhatsApp notification launched -> AC-6
- [x] View landing page and booking modal as public visitor -> expect client phone numbers and notes hidden from public view -> AC-7

## Commands
- [x] `npm run build` -> production build succeeds with clean JavaScript bundle and CSS styles -> AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7

## Acceptance criteria coverage
- AC-1 covered by booking submission step and confirmation ticket step
- AC-2 covered by studio schedule dashboard load and refresh schedule button steps
- AC-3 covered by 4 review buttons display step
- AC-4 covered by confirm action step and double booking prevention conflict step
- AC-5 covered by propose reschedule modal and WhatsApp link step
- AC-6 covered by decline modal with reason selection step
- AC-7 covered by client contact privacy check step
