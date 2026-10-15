# Booking Engine

## Overview

This area manages the interactive appointment scheduling modal for Lyna Hair Touch. It guides clients through service choice, date picking, time selection, client details, and reservation confirmation.

## Key files

| File | Owns |
|---|---|
| `BookingModal.jsx` | Modal dialog wrapper, step progress indicator, and step routing |
| `StepService.jsx` | Service category filter and hairstyle variation picker |
| `StepDate.jsx` | Calendar date picker with intelligent availability indicator |
| `StepTime.jsx` | Morning, afternoon, and evening time slot selection |
| `StepDetails.jsx` | Client contact inputs and special hair styling notes |
| `StepSuccess.jsx` | Digital appointment ticket, WhatsApp dispatch URL, and calendar actions |

## Conventions

- Every step component reads and writes data through the shared `useBooking` context hook.
- Advance the step index using `bookingStep` (step 1 through step 5) without maintaining separate local step counters.
- Format phone numbers into international Nigerian format without leading zeros for direct WhatsApp messaging.
- Trigger celebration confetti animations solely upon reaching step 5 reservation confirmation.
- Use the shared modal backdrop with blur effects to keep user attention focused on the scheduling journey.

## Gotchas

- Phone input accepts local formats like `0901...` but WhatsApp link generation requires `234...` country code prefix.
- The date selector calculates defaults relative to tomorrow to prevent same day booking conflicts without salon approval.
- Closing the modal retains form draft data in context unless explicitly reset.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
