# 0006. PWA & push notifications

**Date**: 2026-10-13
**Status**: Accepted

## Summary

This decision turns the Braids by Helen web application into an installable Progressive Web App with real time Web Push notifications. Helen can install the salon app directly to her mobile home screen without an app store download. When a customer submits an appointment reservation, Helen receives an immediate background push alert on her phone that opens directly to the booking review screen.

## Requirements

**User stories**:
- As Helen the salon owner, I want to install the salon booking system directly on my iPhone or Android home screen so that I can open my schedule with one tap just like a native mobile app.
- As Helen the salon owner, I want to receive immediate background push notifications on my phone whenever a client books an appointment, even when my mobile browser is closed.
- As Helen the salon owner, I want tapping a booking notification to take me straight to the pending reservation in my studio dashboard so that I can review and confirm the appointment quickly.
- As a visiting client, I want the web app to load instantly even on slow Nigerian mobile networks through local caching.

**Acceptance criteria**:
- **AC-1**: Web App Manifest (`manifest.json`) defines salon metadata, standalone display mode, brand theme colors (`#6B2D42`), and high resolution icons (`192x192` and `512x512` maskable) linked from `index.html`.
- **AC-2**: Service worker (`sw.js`) registers on application load, implementing stale while revalidate caching for static assets, fonts, and gallery media to deliver instant offline app shell rendering.
- **AC-3**: Mobile install guidance modal detects standalone launch status and device platform, presenting a native install trigger on Chromium browsers and an illustrated step by step Add to Home Screen walkthrough for iOS Safari.
- **AC-4**: Database schema migration adds `push_subscriptions` and `notification_logs` tables with unique endpoints, VAPID client key storage, device labels, and active flags.
- **AC-5**: Studio push subscription toggle in Helen's management dashboard requests browser notification permission, generates a Web Push subscription via public VAPID key, and persists the registration to Supabase with device metadata.
- **AC-6**: Secure push notification dispatcher delivers encrypted Web Push payloads containing salon booking details when new appointments are submitted.
- **AC-7**: Background service worker receives push events, wakes up, and displays system notifications with the salon brand icon and appointment summary even when the browser tab is closed.
- **AC-8**: Notification interaction handler focuses an existing salon studio window or opens a new window, deep linking directly to Helen's studio dashboard with the incoming appointment selected for immediate confirmation.

## Decision

**Chosen option**: Option 1: Native Progressive Web App service worker with standards based Web Push via VAPID keys, Supabase persistence, and iOS standalone installation guidance.

Helen gets an app store quality mobile experience with zero developer account fees or store approval delays. Client reservations trigger instant background push notifications directly to her mobile device.

## Feature design

**Data model sketch**:

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_name text default 'Helen Mobile Device',
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_notified_at timestamptz
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.push_subscriptions(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  event_type text not null,
  title text not null,
  body text not null,
  status text not null default 'sent',
  error_message text,
  created_at timestamptz not null default now()
);
```

**State transitions**:
Push subscription lifecycle:
`unsubscribed` -> `permission_prompt` -> `registered_active` -> `notification_received` -> `expired_or_revoked` (`is_active = false`)

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /functions/v1/send-push-notification | POST | booking_id:uuid, event_type:text | delivered:integer, failed:integer | Bearer service role or session | 400 bad request, 404 booking not found, 500 push dispatch error |
| /rest/v1/push_subscriptions | POST | endpoint:text, p256dh:text, auth:text, device_name:text | subscription record | Bearer anon with owner key or session | 409 unique endpoint conflict |
| /rest/v1/push_subscriptions | PATCH | is_active:boolean | updated record | Bearer session | 404 not found |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Register push subscription | VAPID public key | `VITE_VAPID_PUBLIC_KEY` environment variable |
| Create device subscription | endpoint, p256dh, auth | Browser `PushSubscription` object from `pushManager.subscribe()` |
| Label device | device name | Client user agent parsing or Helen manual device nickname |
| Format push notification | title, body, icon | Derived from customer name, service name, and booking date in `bookings` record |
| Open notification | target URL with deep link | Derived as `/?view=admin&bookingId=<id>` in push payload |

**Key invariants**:
- Push subscription endpoints are globally unique across all devices.
- Inactive or expired subscriptions returning 410 Gone from push services must immediately have `is_active` set to false.
- Background push alerts must function without requiring Helen to keep the browser active or foregrounded.
- The web app manifest and icons must be served over HTTPS or localhost to satisfy browser PWA installation requirements.

**Security model**:
- VAPID private signing key is stored exclusively in Supabase server environment variables, never bundled into client javascript code.
- Public VAPID key is safely shared with client browsers to create subscription tokens.
- Row level security allows authenticated Helen to view, insert, and deactivate her registered device push subscriptions.

**Configuration required**:
- `VITE_VAPID_PUBLIC_KEY`: Public application server key for browser push subscription negotiation.
- `VAPID_PRIVATE_KEY`: Private application server signing key stored in Supabase secrets for push delivery.
- `VAPID_SUBJECT`: Contact email or URL required by web push standards (`mailto:helen@braidsbyhelen.ng`).

**Critical test scenarios**:
- Happy path: Helen turns on push notifications in dashboard, registers her mobile device, a customer books a styling session, and Helen receives a background push alert with deep link navigation, verifies **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**.
- Offline app shell: User visits the salon app with network disconnected, and service worker serves cached shell, typography, and assets cleanly, verifies **AC-1**, **AC-2**.
- iOS Add to Home Screen: iPhone visitor accesses the app, receives clear visual guide to tap the Safari share icon and select Add to Home Screen, verifies **AC-3**.
- Expired subscription recovery: Push service returns 410 Gone for an expired device token, edge function deactivates the record without blocking booking creation, verifies **AC-4**, **AC-6**.

## Build plan

1. Configure Web App Manifest and icon assets: create `public/manifest.json` with brand theme colors, icons, and standalone configuration, linked from `index.html`, satisfies **AC-1**.
2. Implement service worker caching engine: create `public/sw.js` with stale while revalidate caching for application code, fonts, and assets, registered via client bootstrap, satisfies **AC-2**.
3. Build Add to Home Screen installation guide: create `src/components/pwa/InstallPromptModal.jsx` with native Chromium install prompt handling and iOS Safari visual instructions, satisfies **AC-3**.
4. Create push subscriptions database migration: write `supabase/migrations/005_push_notifications_schema.sql` declaring `push_subscriptions` and `notification_logs` tables with row level security, satisfies **AC-4**.
5. Build client push notification service: create `src/services/pushNotificationService.js` handling VAPID key conversion, browser permission requests, and Supabase synchronization, satisfies **AC-5**.
6. Integrate studio notification controls: add push subscription toggle, status badge, and test notification trigger inside Helen's studio dashboard in `LynaDashboard.jsx`, satisfies **AC-5**.
7. Implement Web Push dispatch function: create Supabase Edge Function `send-push-notification` with web push signing to broadcast booking alerts to active devices, satisfies **AC-6**.
8. Implement background push reception and deep linking: add `push` and `notificationclick` listeners in `public/sw.js` to show rich alerts and focus Helen's studio appointment review view, satisfies **AC-7**, **AC-8**.

## Consequences

**Positive**:
- Helen receives instant booking alerts on her mobile phone without paying monthly SMS gateway fees.
- Visiting clients enjoy fast loading times on cellular connections thanks to service worker caching.
- Zero app store friction or app review wait times.

**Negative / tradeoffs**:
- Web Push on iPhones requires iOS 16.4 or later and requires Helen to add the website to her Home Screen first before granting notification permission.
- Push subscriptions require VAPID key pair maintenance.

**Neutral**:
- Service worker registration requires cache version bumping during major static asset overhauls.

## Follow-up

- [ ] Generate production VAPID key pair using `web-push generate-vapid-keys` and add to project environment variables.
- [ ] Connect Supabase database webhook to invoke `send-push-notification` automatically when a new row is inserted into `bookings`.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
