# Verify: PWA & push notifications · spec 0006 · updated 2026-10-13

_Steps derived from spec 0006 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [x] Inspect `manifest.json` in browser devtools Application tab → displays brand colors, standalone display mode, and maskable icons → AC-1
- [x] Inspect Service Worker in devtools Application tab → `sw.js` registered and active, serving cached assets offline → AC-2
- [x] Simulate mobile viewport and open salon landing page → Install Prompt Modal presents clear install trigger on Chromium or 3-step guide on iOS Safari → AC-3
- [x] Open Helen studio dashboard and click "Push Alerts" → Push Notification Settings Modal opens displaying connection status and device label → AC-5
- [x] Toggle "Enable Push Notifications" in dashboard → browser prompts for notification permission, generates Web Push subscription, and stores record in `push_subscriptions` → AC-4, AC-5
- [x] Click "Send Test Alert" in Push Notification Settings Modal → device displays test notification with salon icon and sound → AC-5, AC-7
- [x] Submit a new client booking via the 5-step reservation modal → background push notification alert is dispatched with client name and appointment time → AC-6, AC-7
- [x] Tap the booking push notification banner on device → focuses or opens browser window and navigates to studio dashboard with booking review view active → AC-8

## Commands
- [x] `npm run build` → exits with code 0 and bundles application assets cleanly → AC-1, AC-2

## Acceptance-criteria coverage
- AC-1: Web App Manifest configuration · covered by devtools manifest check and production build
- AC-2: Service worker caching · covered by devtools service worker check and offline test
- AC-3: Mobile install guidance modal · covered by Chromium and iOS install guide UI check
- AC-4: Push subscriptions schema · covered by migration 005 and subscription persistence check
- AC-5: Studio push toggle and device registration · covered by Push Notification Settings Modal test
- AC-6: Secure push dispatcher · covered by edge function and booking submission push dispatch
- AC-7: Background push alert display · covered by notification rendering test
- AC-8: Notification click deep linking · covered by notification click navigation check
