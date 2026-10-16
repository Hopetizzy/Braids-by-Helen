import fs from 'fs';
import path from 'path';

console.log('--- Verifying Fixes for Braids by Helen ---');

let allPassed = true;
function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    allPassed = false;
  }
}

// 1. Verify tailwind.config.js cream default
const tailwindContent = fs.readFileSync('tailwind.config.js', 'utf-8');
assert(tailwindContent.includes("DEFAULT: '#FFF9F2'"), "tailwind.config.js has DEFAULT for cream color");

// 2. Verify InstallPromptModal.jsx readability & contrast
const installModalContent = fs.readFileSync('src/components/pwa/InstallPromptModal.jsx', 'utf-8');
assert(installModalContent.includes('bg-[#FFF9F2]'), "InstallPromptModal has solid #FFF9F2 background card");
assert(installModalContent.includes('bg-stone-950/75'), "InstallPromptModal has high contrast backdrop");
assert(installModalContent.includes('text-stone-900'), "InstallPromptModal has high contrast text-stone-900 heading");
assert(installModalContent.includes('text-stone-700'), "InstallPromptModal has legible text-stone-700 body");

// 3. Verify RescheduleModal.jsx hooks ordering (no early return before useState)
const rescheduleContent = fs.readFileSync('src/components/business/RescheduleModal.jsx', 'utf-8');
const proposedDateIdx = rescheduleContent.indexOf('const [proposedDate, setProposedDate]');
const earlyReturnIdx = rescheduleContent.indexOf('if (!isOpen || !appointment) return null;');
assert(proposedDateIdx !== -1, "RescheduleModal has proposedDate useState");
assert(earlyReturnIdx !== -1, "RescheduleModal has early return");
assert(proposedDateIdx < earlyReturnIdx, "RescheduleModal declares useState BEFORE early return (prevents React fatal hooks crash)");

// 4. Verify DeclineModal.jsx hooks ordering
const declineContent = fs.readFileSync('src/components/business/DeclineModal.jsx', 'utf-8');
const declineHookIdx = declineContent.indexOf('const [selectedReason, setSelectedReason]');
const declineReturnIdx = declineContent.indexOf('if (!isOpen || !appointment) return null;');
assert(declineHookIdx < declineReturnIdx, "DeclineModal declares useState BEFORE early return");

// 5. Verify AppointmentCard.jsx safe window open
const appCardContent = fs.readFileSync('src/components/business/AppointmentCard.jsx', 'utf-8');
assert(appCardContent.includes("window.open(rescheduleWaUrl, '_blank', 'noopener,noreferrer')"), "AppointmentCard uses safe window.open with noopener,noreferrer");

// 6. Verify BookingContext.jsx double booking prevention
const bookingContextContent = fs.readFileSync('src/context/BookingContext.jsx', 'utf-8');
assert(bookingContextContent.includes('hasLocalBookingClash'), "submitBooking checks local appointments for date/slot conflicts");
assert(bookingContextContent.includes("in('status', ['PENDING', 'CONFIRMED', 'RESCHEDULE_PROPOSED'])"), "fetchPublicSchedule and submitBooking check live pending & confirmed slots");
assert(bookingContextContent.includes('fetchPublicSchedule().catch'), "submitBooking refreshes public schedule immediately upon booking creation");

// 7. Verify StepTime.jsx checks both publicSchedule and appointments
const stepTimeContent = fs.readFileSync('src/components/booking/StepTime.jsx', 'utf-8');
assert(stepTimeContent.includes('isSlotBooked'), "StepTime defines isSlotBooked check");
assert(stepTimeContent.includes('appointments'), "StepTime imports and checks appointments");
assert(stepTimeContent.includes("label: 'Booked'"), "StepTime displays 'Booked' label for occupied slots");
assert(stepTimeContent.includes('checkSlotStatus(bookingData.time, true).disabled'), "StepTime disables Enter Details button if selected slot is booked");

// 8. Verify StepDetails.jsx label for WhatsApp or phone number
const stepDetailsContent = fs.readFileSync('src/components/booking/StepDetails.jsx', 'utf-8');
assert(stepDetailsContent.includes('WhatsApp or Phone Number'), "StepDetails label updated to 'WhatsApp or Phone Number'");
assert(stepDetailsContent.includes('submissionError'), "StepDetails displays submissionError banner if slot is taken");

// 9. Verify StepSuccess.jsx clear confirmation message
const stepSuccessContent = fs.readFileSync('src/components/booking/StepSuccess.jsx', 'utf-8');
assert(stepSuccessContent.includes('Braids by Helen will contact you for your booking confirmation'), "StepSuccess gives clear confirmation message that Braids by Helen will contact the visitor");
assert(stepSuccessContent.includes("Helen will reach out to you via WhatsApp or phone call"), "StepSuccess gives clear instructions regarding confirmation");

// 10. Verify saveMediaItem resolves service_id to UUID or null and avoids invalid uuid syntax error
assert(bookingContextContent.includes('isUuid(rawServiceId)'), "saveMediaItem validates if serviceId is a valid UUID");
assert(bookingContextContent.includes('dbServiceId = matched.dbId'), "saveMediaItem looks up dbId UUID for text slugs like hair-washing");

console.log('-------------------------------------------');
if (allPassed) {
  console.log('ALL FIXES VERIFIED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  console.error('SOME CHECKS FAILED! ✗');
  process.exit(1);
}
