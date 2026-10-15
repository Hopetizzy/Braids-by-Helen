# 0006. Rationale: PWA & push notifications

## Context

Braids by Helen operates as an appointment based braiding salon in Ibadan, Nigeria. Helen spends long hours on her feet styling hair and cannot sit in front of a laptop all day to watch for new reservations. When clients submit appointment requests, Helen needs immediate awareness on her mobile phone so that she can confirm the slot or contact the customer before another client requests the same hours.

Traditional mobile app store distribution requires paying annual developer account fees to Apple and Google, building separate native iOS and Android binaries, and waiting through app store review cycles. In addition, SMS alert gateways in Nigeria incur recurring per message costs that add up quickly.

Modern web browsers support Progressive Web App installation and the W3C Push API. This allows Helen to install the salon system directly to her phone home screen and receive real time alerts at zero per notification delivery cost.

## Options considered

### Option 1: Native Progressive Web App with Web Push API via VAPID and Supabase

Deploy a standards compliant service worker and web app manifest. Helen adds the salon app to her mobile home screen and enables notifications in her dashboard. When a reservation arrives, a Supabase Edge Function signs a Web Push payload with VAPID keys and dispatches it to Helen's registered devices.

**Pros**:
- Zero recurring SMS delivery costs or third party notification subscription tiers.
- No app store fees or review delays.
- Immediate deep linking directly into Helen studio dashboard with full appointment details.
- Works across Android Chrome, desktop browsers, and modern iOS Safari.

**Cons**:
- iOS Safari requires version 16.4 or later and requires home screen installation before push permission can be prompted.
- Requires managing VAPID public and private cryptographic keys.

### Option 2: Third party notification platform such as OneSignal or Pusher Beams

Integrate a hosted push notification software development kit into the frontend and forward new booking webhooks to the hosted service.

**Pros**:
- Hosted dashboard provides visual push campaign analytics and device lists.
- Simplifies device token management.

**Cons**:
- Introduces external vendor dependency and third party tracking scripts.
- Free tiers have subscriber caps that require paid monthly upgrades as usage grows.
- Adds extra build weight and external SDK baggage to the client application.

### Option 3: SMS and WhatsApp merchant alerts only

Send an automated SMS or WhatsApp Business template message to Helen's phone number whenever a new booking record is created.

**Pros**:
- Works on any phone regardless of browser version or installation status.
- Does not require service worker setup.

**Cons**:
- Telecommunications providers charge per message fees for every notification sent.
- WhatsApp Business Cloud API requires meta business verification and template approval.
- Does not enable home screen app installation or offline caching for clients.

## Rationale

Option 1 provides the highest reliability, lowest operational friction, and cleanest long term cost profile. By combining standard Web App Manifest features with the W3C Push API, Helen gains a real mobile app presence on her device home screen. Supabase Edge Functions sign push notifications with VAPID keys directly within the project backend infrastructure, keeping all customer data private and avoiding external vendor fees.
