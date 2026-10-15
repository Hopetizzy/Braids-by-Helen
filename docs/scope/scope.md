# Scope: Braids by Helen

Transform the salon booking demo into a production booking and business management platform for Braids by Helen in Ibadan, Oyo State, Nigeria.

**Build approach:** Tracer Bullet (build each slice end to end across frontend, backend, and persistence so each piece works completely).
**Workflow:** Beta (after develop, check verify then test). The project default level of rigor. /architect is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (such as GA) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Customer landing presentation | Pre workflow | existing |
| B | Client reservation modal | Pre workflow | existing |
| C | In memory studio schedule | Pre workflow | existing |
| 1 | Brand identity & design tokens | Foundation | in-progress |
| 2 | Backend persistence & auth architecture | Foundation | in-progress |
| 3 | End to end booking & admin review | Slice 1 | in-progress |
| 4 | Availability & conflict prevention | Slice 2 | done |
| 5 | Services & portfolio media management | Slice 3 | done |
| 6 | PWA & push notifications | Slice 4 | done |

## Existing context

### A. Customer landing presentation · existing
Customer presentation showcasing hairstyle categories, hero section, and gallery placeholders. code in `src/components/customer/`

### B. Client reservation modal · existing
Five step interactive reservation modal with time slot pickers, Nigerian phone validation, and confetti completion. code in `src/components/booking/`

### C. In memory studio schedule · existing
Salon management view showing in memory appointment cards, status filters, and view toggling. code in `src/components/business/`

## Foundations

### 1. Brand identity & design tokens · in-progress
Migrate the visual design system from Lyna Hair Touch to Braids by Helen using the supplied logo, app icon, and luxury salon palette (burgundy, ivory, soft gold, espresso, dusty rose).
**Done when:** the application displays Braids by Helen branding with centralized color tokens, refined typography, and verified touch targets.
- [x] Design it (spec): [0001](../specs/0001-brand-identity-design-tokens/index.md)
- [x] Build it: /develop brand identity & design tokens
   - [x] Assets: copy and optimize logo, app icon, and favicon into public assets (AC-3)
   - [x] Typography: configure Cormorant Garamond and DM Sans fonts in index.html and Tailwind (AC-2)
   - [x] Design tokens: declare CSS variables in src/index.css and wire Tailwind palette extension (AC-1, AC-4, AC-5)
- [ ] Verify it: /check verify brand identity & design tokens
- [ ] Test it: /test brand identity & design tokens
Spec [0001](../specs/0001-brand-identity-design-tokens/index.md) · code in `src/index.css`, `tailwind.config.js`, `public/assets/`

### 2. Backend persistence & auth architecture · in-progress
Establish a persistent database, secure administrator authentication for Helen, and server validation to replace client only memory state.
**Done when:** database schema supports bookings, services, availability, and media with server enforced security policies.
- [x] Design it (spec): [0002](../specs/0002-backend-persistence-auth-architecture/index.md)
- [x] Build it: /develop backend persistence & auth architecture
   - [x] Supabase client & environment configuration: initialize client library with fallback to offline demo mock (AC-7)
   - [x] Relational schema & migration: create PostgreSQL tables, unique references, constraints, and seed data (AC-1, AC-4, AC-5)
   - [x] Row Level Security & media storage: apply security policies on all tables and create salon media bucket (AC-2, AC-6)
   - [x] Administrator authentication & state integration: wire AuthContext and connect BookingContext with local fallback (AC-2, AC-3, AC-7)
- [x] Verify it: /check verify backend persistence & auth architecture
- [ ] Test it: /test backend persistence & auth architecture
Spec [0002](../specs/0002-backend-persistence-auth-architecture/index.md) · code in `src/lib/supabase.js`, `supabase/migrations/`, `src/context/AuthContext.jsx`, `src/context/BookingContext.jsx`

## Slice 1: End to end booking & admin review

### 3. End to end booking & admin review · in-progress
Connect customer booking to database storage with pending status, unique reference generation, and an authenticated owner dashboard to review requests and dispatch WhatsApp or phone contact.
**Done when:** a customer can submit a booking request that saves with pending status and Helen can view and process the request in her authenticated dashboard.
- [x] Design it (spec): [0003](../specs/0003-end-to-end-booking-admin-review/index.md)
- [x] Build it: /develop end to end booking & admin review
   - [x] WhatsApp messaging utilities: build template generators for confirmations, reschedules, and declines (AC-1, AC-4, AC-5, AC-6)
   - [x] Customer confirmation view: update completion modal with reference card and WhatsApp chat button (AC-1)
   - [x] Admin review modals: build reschedule proposal modal and decline reason modal (AC-5, AC-6)
   - [x] Appointment card actions & live dashboard: add 4 action review suite and wire live Supabase polling (AC-2, AC-3, AC-4, AC-7)
- [x] Verify it: /check verify end to end booking & admin review
- [ ] Test it: /test end to end booking & admin review
Spec [0003](../specs/0003-end-to-end-booking-admin-review/index.md) · code in `src/utils/whatsappTemplates.js`, `src/components/booking/`, `src/components/business/`

## Slice 2: Availability & conflict prevention

### 4. Availability & conflict prevention · done
Implement salon schedule controls so Helen can open or close dates, block hours, and confirm appointments under Policy B without double booking.
**Done when:** Helen can mark dates and times unavailable and the backend prevents confirming overlapping appointments.
- [x] Design it (spec): [0004](../specs/0004-availability-conflict-prevention/index.md)
- [x] Build it: /develop availability & conflict prevention
   - [x] Schema migration & RPC procedures: add is_all_day column, unique constraint, and public/confirm procedures (AC-1, AC-2, AC-3)
   - [x] Public schedule & date utilities: build dateUtils and connect BookingContext live schedule state (AC-3, AC-4)
   - [x] Booking modal availability indicators: update StepDate and StepTime with live disabled states and Full badges (AC-4)
   - [x] Helen studio schedule controls: build BlockAvailabilityModal for full day and slot blocking (AC-5)
   - [x] Dashboard conflict detection & confirmation guard: flag colliding requests and prompt reschedule on conflict (AC-6, AC-7)
- [ ] Verify it: /check verify availability & conflict prevention
- [ ] Test it: /test availability & conflict prevention
Spec [0004](../specs/0004-availability-conflict-prevention/index.md) · code in `src/utils/dateUtils.js`, `src/components/booking/`, `src/components/business/`, `supabase/migrations/003_availability_schedule.sql`

## Slice 3: Services & portfolio media management

### 5. Services & portfolio media management · done
Enable Helen to manage starting prices, descriptions, and active service offerings, plus upload real photos and videos from the supplied assets.
**Done when:** Helen can update service details without editing code and the gallery displays optimized customer photos and videos with lazy loading.
- [x] Design it (spec): [0005](../specs/0005-services-portfolio-media-management/index.md)
- [x] Build it: /develop services & portfolio media management
   - [x] Schema migration & storage configuration: add foreign key, style tags, and storage bucket with seed fallback (AC-1, AC-2, AC-8)
   - [x] Studio services management modal: build price, duration, variations, and active toggle editor (AC-3)
   - [x] Studio portfolio upload manager: build media upload with size guards, captions, and service tagger (AC-4)
   - [x] Live customer gallery & HTML5 video player: update gallery grid with video indicators and expanded playback modal (AC-5, AC-6)
   - [x] Interactive Book This Style trigger: wire media cards to preselect tagged service and style in booking modal (AC-7)
- [x] Verify it: /check verify services & portfolio media management
- [x] Test it: /test services & portfolio media management
Spec [0005](../specs/0005-services-portfolio-media-management/index.md) · code in `src/components/customer/`, `src/components/business/`, `src/context/BookingContext.jsx`, `supabase/migrations/004_services_media_schema.sql`

## Slice 4: PWA & push notifications

### 6. PWA & push notifications · done
Configure an installable Progressive Web App with Web Push notifications so Helen receives instant background alerts on mobile devices when new bookings arrive.
**Done when:** the web app is installable on Android and iPhone Home Screen and Helen receives push notifications for new booking requests.
- [x] Design it (spec): [0006](../specs/0006-pwa-push-notifications/index.md)
- [x] Build it: /develop pwa & push notifications
   - [x] Web App Manifest & service worker offline caching: configure manifest.json and stale while revalidate sw.js (AC-1, AC-2)
   - [x] Install guidance & iOS prompt modal: build InstallPromptModal with iOS Safari share guide and Chromium prompt (AC-3)
   - [x] Push schema migration & client service: create push_subscriptions table and client push service (AC-4, AC-5)
   - [x] Helen studio notification toggle: add push subscription controls and test trigger in LynaDashboard (AC-5)
   - [x] Web Push dispatcher & background alert handler: deploy push sender and service worker push click handlers (AC-6, AC-7, AC-8)
- [x] Verify it: /check verify pwa & push notifications
- [x] Test it: /test pwa & push notifications
- [x] Review it (fresh model): /check review pwa & push notifications
- [x] Document it: /document pwa & push notifications
Spec [0006](../specs/0006-pwa-push-notifications/index.md) · code in `public/manifest.json`, `public/sw.js`, `src/components/pwa/`, `src/services/`, `supabase/migrations/`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Automated payment processing**: online card payments or advance deposits at booking time (salon collects payment directly in person)
- **Customer accounts**: login portals, password recovery, or profile management for salon clients
- **Meta WhatsApp Business API**: paid cloud message integration requiring Facebook business verification
- **Multi stylist staff scheduling**: employee shift assignments and separate stylist calendars

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Skills locate it by that `(spec)` suffix, never by an exact label.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` at spec capture | `Design it` ticked; spec linked; `Build it: /develop <feature>` with 2 to 5 milestones; the tier closing boxes |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` and milestones ticked; `Verify it` ticked |
| `done` | you, when you decide it is; `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; conventions captured |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`. The tag drops once the spec is captured.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Workflow tier tag** beside a heading (such as `· GA`) sets that one feature rigor above or below the project default; no tag inherits the default.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Beta** = `/check verify` then `/test`.
