Bro, this is the right time to give the coding agent a proper project brief instead of asking it to make random changes to the demo. We want the agent to audit what already exists, preserve working functionality, and evolve the demo into a usable booking and business-management platform for Braids by Helen.

For the design reference, yes, both websites you mentioned are useful:

[Jinverse Digital by Nick Tai | Web Design for Local Service Businesses](https://images.openai.com/static-rsc-4/2-METTVOQZGnKJCo0MXAkSVVzt6NAOPkxHtGTaXoElTBW0SOPFxw04Fz5MV1uwIlpAgaTIDi6kMiFAF_zDjpa-cacrTNo372K00YMzBlxYzjJTGxioEVme6A8dwQMyuQdxNEm0Z9RP3aFJC-TQUhlA8i1_go4W2So_tdzFXrUW4?purpose=inline)

Dribbble

Best for polished landing pages, booking interfaces, typography, layouts and individual UI details.

[Browse salon website designs](https://dribbble.com/search/hair-salon-website)

[FloJos African Hair Braiding · Honolulu, HI](https://images.openai.com/static-rsc-4/k26DfoVz9yWnrT-klO0XDQoUWyd0dkwjjzHZ0yJyQOexA23gng3sFYWhVk1fE-AjR1LwqvsW09OGUhGDGEJlsXyq2vIzt_O9dqMpPtH5FYXIXIIh68rKM5WzdCkZGlWzUIkmV94xAB4CGMnEdNW38zAaOzk4ONATU7pZ0ltCPgY?purpose=inline)

Pinterest

Best for exploring overall brand direction, colour palettes, African braid photography and complete visual concepts.

[Browse hair salon website inspiration](https://www.pinterest.com/search/pins/?q=hair%20braiding%20salon%20website%20design)

My recommendation is to use Dribbble for the interface and Pinterest for the broader mood. Find two or three references that you like, but don't make the agent copy an entire website. We want a conversion-focused design that fits Helen's real work, customers and budget.

Below is the master brief you can send to your coding agent. It covers the architecture, design system, booking rules, push notifications, admin authentication, media management, customer experience, security and implementation process.

# BRAIDS BY HELEN

## Master Product, Architecture & Implementation Brief — V1

**Project type:** Client website + booking platform + installable Progressive Web App (PWA)\
**Business:** Braids by Helen\
**Location:** Ibadan, Oyo State, Nigeria\
**Primary objective:** Build a professional, mobile-first website that attracts customers, converts visitors into booking requests, and gives Helen a simple way to manage her services, availability, appointments and portfolio.

**Development approach:** Audit the existing demo, retain working features, and implement improvements incrementally. Do not rebuild the project from scratch without a clear technical reason.

---

# 1. YOUR ROLE AND FIRST TASK

You are taking over an existing demo that you previously built. Your first responsibility is to understand the current codebase before changing it.

The product owner will provide:

- The existing project repository/codebase.
- Two customer-provided image assets.
- Two customer-provided video assets.
- The generated Braids by Helen primary logo.
- The generated Braids by Helen app icon.
- Additional visual references if available.

Locate the supplied assets in the repository, project workspace or attached files. Do not invent file paths or assume assets are present until you have verified them.

## Mandatory initial audit

Before implementation, inspect and document:

1. Current frontend framework, language, routing and build setup.
2. Current backend, database, hosting and authentication provider, if any.
3. Existing database schema, migrations, relationships and access policies.
4. Existing booking flow, form validation and success states.
5. Existing availability management and its current meaning.
6. Existing administrator dashboard and authentication.
7. Existing image/video handling and upload functionality.
8. Existing integrations, environment variables and deployment configuration.
9. Current mobile responsiveness and accessibility.
10. Any existing PWA manifest, service worker, push-notification code or background jobs.
11. Known bugs, incomplete features, security issues and technical debt.

Create a short audit report with these headings:

- Working features to preserve.
- Incomplete features to finish.
- Bugs and risks.
- Current architecture and dependencies.
- Proposed changes.
- Required environment variables and external services.
- Estimated implementation stages.

**Do not assume the project uses Supabase, Firebase, Next.js or any particular framework until the codebase confirms it.** Prefer the current stack if it can support the requirements safely and reliably.

Do not replace working booking or availability logic merely because you prefer a different implementation.

# 2. PRODUCT VISION

Braids by Helen should feel like a real beauty business with a professional online presence, not a generic template.

The website must help customers:

- Discover Helen's hairstyles and services.
- View real photos and videos of her work.
- Understand starting prices.
- Submit a booking request from a phone or computer.
- Receive clear feedback after submitting a request.
- Contact Helen through WhatsApp or a phone call when needed.
- Return to the website easily on future visits.

Helen must be able to:

- Sign in securely to her admin dashboard.
- Review incoming bookings.
- Confirm, reschedule or reject booking requests.
- Contact customers by WhatsApp or telephone.
- Manage appointment availability.
- Add, edit, hide and remove services.
- Update starting prices and descriptions.
- Upload and manage hairstyle photos and videos.
- Review booking statuses and notification health.
- Receive push notifications about new bookings and important pending actions.

## Product principles

1. Mobile-first, because many customers will visit using smartphones.
2. Real work over stock imagery.
3. Simple booking with minimal friction.
4. Clear communication about whether an appointment is confirmed.
5. No paid integrations without approval.
6. No WhatsApp Business API or Meta developer setup.
7. No unnecessary customer accounts.
8. No automated payments or deposits in V1.
9. Strong security around admin access and customer information.
10. Graceful handling of poor connectivity and notification failures.

# 3. BRAND IDENTITY AND DESIGN TOKENS

Use the supplied generated primary logo and app icon as the starting brand assets.

Do not recreate, distort, recolour or replace them without approval. If the supplied logo needs technical cleanup, preserve its original design and produce optimised variants where necessary.

## Brand personality

- Elegant.
- Professional.
- Warm.
- Feminine without feeling childish.
- Premium but approachable.
- Confident and creative.
- Rooted in the beauty of braiding and hairstyling.

## Core colour tokens

Use these as the initial design system. Keep them centralised in CSS variables, theme configuration or the existing design-token system.

| Token            | Value     | Intended use                                 |
| ---------------- | --------- | -------------------------------------------- |
| Primary Burgundy | `#70263D` | Primary buttons, headings, brand elements    |
| Warm Ivory       | `#FFF9F2` | Main page background                         |
| Soft Gold        | `#C5A46D` | Small highlights, dividers, selected accents |
| Espresso Brown   | `#302522` | Body text and dark surfaces                  |
| Dusty Rose       | `#D9A6A6` | Secondary accents and subtle highlights      |
| Pure White       | `#FFFFFF` | Cards, forms and contrasting surfaces        |

Suggested CSS variables:

- `--color-primary: #70263D`
- `--color-background: #FFF9F2`
- `--color-accent: #C5A46D`
- `--color-text: #302522`
- `--color-secondary: #D9A6A6`
- `--color-surface: #FFFFFF`

Add semantic tokens for success, warning, error, disabled and focus states. Maintain sufficient contrast and never communicate booking status by colour alone.

## Typography

Use an elegant serif for major headings and a highly legible sans-serif for body text.

Suggested pairings:

- Headings: Cormorant Garamond or Playfair Display.
- Body and interface: DM Sans or Inter.

Verify font loading and performance. If a preferred font is unavailable, choose a suitable fallback rather than allowing broken typography.

## Layout and component direction

- Generous spacing.
- Large, high-quality hairstyle imagery.
- Clean content hierarchy.
- Refined borders and restrained shadows.
- Rounded corners used consistently, not excessively.
- Clear primary actions.
- Easy-to-tap controls on mobile.
- Minimal unnecessary animations.
- Accessible focus indicators.
- Responsive layouts across phones, tablets and desktop screens.

Avoid a generic dashboard full of unnecessary cards and charts. The admin interface should prioritise actions Helen actually needs.

## Logo and icon usage

Use the supplied primary logo for appropriate website branding, such as the header and footer.

Use the supplied app icon for:

- Browser favicon.
- PWA manifest icons, after generating appropriate technical sizes.
- Home Screen installation.
- Notification branding where supported.
- Other appropriate small brand placements.

Create a simplified small-size icon variant if the full icon's text becomes illegible at 32×32 or 48×48 pixels. Do not use a tiny version of a detailed logo where it cannot be read.

Keep source assets and generated optimised versions separate.

# 4. WEBSITE INFORMATION ARCHITECTURE

## Public website

Recommended navigation:

- Home.
- Services.
- Gallery.
- About.
- Contact.
- Book Now.

The navigation must remain compact and easy to use on mobile.

### Home page

The homepage should communicate three things immediately:

1. What Helen does.
2. Why a visitor should trust her work.
3. How the visitor can book.

Suggested hero content:

**Headline:** Your Hair, Our Art.

**Supporting copy:** Beautiful braids and hairstyles crafted with care. Explore our work, find your style and request your appointment with Braids by Helen.

**Primary CTA:** Book an Appointment.

**Secondary CTA:** Explore Our Styles.

Use actual customer-provided work prominently. Do not use generated or stock hairstyle images as if they were Helen's work.

Recommended sections:

1. Hero with strong hairstyle imagery.
2. Featured services and starting prices.
3. Selected hairstyle gallery.
4. Why choose Braids by Helen.
5. Simple booking explanation.
6. Customer testimonials, only if genuine testimonials are supplied.
7. Service-area information for Ibadan.
8. Final booking CTA.
9. Footer with verified contact and social links.

Do not invent testimonials, awards, years of experience, customer counts or business claims.

### Services page or section

Display services as clean cards or a compact responsive list.

Starting prices supplied by Helen:

| Service                      | Starting price |
| ---------------------------- | -------------- |
| Short Knotless Braids/Twists | ₦5,000         |
| Long Knotless Braids/Twists  | ₦7,000         |
| All-back                     | ₦1,500         |
| Retouching                   | ₦2,000         |
| Hair Washing                 | ₦2,000         |
| Children's Hairstyles        | ₦3,000         |

Prices depend on hair length, size and style. Clearly display “From” before the price and explain that the final price may vary.

These prices are initial content, not hard-coded values in the interface. Helen must be able to update them through the dashboard.

Do not add unconfirmed services or invent exact prices for other hairstyles.

### Gallery

The gallery must support both photos and videos.

The initial demo should use the supplied two images and two videos if they are available and usable.

Requirements:

- Use real customer-provided media.
- Preserve the original files.
- Optimise copies for web delivery.
- Use thumbnails or video poster images.
- Lazy-load media below the fold.
- Do not autoplay videos with sound.
- Provide accessible playback controls.
- Allow users to browse the gallery comfortably on mobile.
- Provide useful alt text for photos.
- Use sensible video titles or captions where supplied.
- Avoid loading every full-resolution video immediately.
- Support future gallery categories if useful, without overcomplicating V1.

Helen must be able to add more media without editing source code.

If a supplied video format is unsupported, handle it gracefully and document the conversion needed. Do not silently replace it with a different video.

### About and contact

Include a concise business introduction and verified contact information.

Business location/service area: Ibadan, Oyo State, Nigeria.

Social accounts provided:

- TikTok: `@hair_by_helen01`
- Facebook: `Lyna Hair Touch`

The supplied flyer shows the telephone/WhatsApp number `09010189746`. Verify with Helen that this is the number she wants published before launching.

Do not invent a street address or precise salon location.

# 5. BOOKING SYSTEM

This is a central product feature and must be implemented carefully.

## Customer booking flow

1. Customer visits the website.
2. Customer selects a service.
3. Customer selects an available date.
4. Customer selects an available time slot, if the current booking model supports time slots.
5. Customer enters their name and phone number.
6. Customer can add an optional note.
7. Customer reviews the booking details.
8. Customer submits the request.
9. Backend validates the request and current availability.
10. Booking is saved with status `PENDING`.
11. A notification job is recorded for Helen.
12. Customer sees a clear success page or success state with a booking reference.

The exact steps should preserve the existing demo's useful behaviour, but the final flow must not claim a booking is confirmed when it is only pending.

## Customer success state

Suggested message:

“Your booking request has been received! Your appointment is not confirmed yet. Helen will review your request and contact you to confirm the details.”

Display:

- Booking reference.
- Selected service.
- Requested date and time.
- Current status.
- A WhatsApp contact option if Helen's verified number is configured.

Only display success after the backend has successfully persisted the booking.

If submission fails, preserve the customer's entered details where safe, show a clear error and allow them to retry.

Prevent accidental duplicate submissions using an idempotency strategy or another appropriate mechanism.

## Booking statuses

Use explicit, validated status values:

- `PENDING`: Awaiting Helen's decision.
- `CONFIRMED`: Appointment accepted.
- `RESCHEDULE_PROPOSED`: An alternative date/time has been proposed and is awaiting customer agreement.
- `REJECTED`: Helen cannot accept the booking.
- `CANCELLED`: Booking cancelled, if cancellation is included in V1.
- `COMPLETED`: Appointment completed.

Use consistent status names in the database, backend and interface.

Record status changes and timestamps.

## Double-booking prevention

This must be designed around the actual business rules.

**Do not automatically reject every second booking just because the first booking is pending.** A pending request is not necessarily an accepted appointment, and automatically rejecting later customers can lose legitimate business if the first customer never responds.

First determine whether Helen:

- Can serve only one customer at a time.
- Can perform multiple appointments concurrently.
- Needs fixed appointment slots or flexible durations.
- Wants a request-based booking model or first-come-first-served slot reservations.

For V1, prefer a simple request-based model with explicit availability and server-side conflict prevention.

### Recommended behaviour

When a customer requests a slot, the backend must check current availability. The browser's list of available dates is not sufficient validation.

If the system allows only one appointment per slot:

1. A customer submits a booking request.
2. The backend checks the slot inside a transaction or equivalent concurrency-safe operation.
3. The system creates the pending booking according to the chosen reservation policy.
4. Other customers must not be told the slot is confirmed or reserved unless the relevant rule permits that claim.
5. If the slot is no longer available under the policy, return a clear response and offer other available times.

We must choose explicitly between these policies:

**Policy A — Temporary hold:** A pending request temporarily holds the slot for a defined period. If the customer does not confirm or respond within that period, the hold expires and the slot becomes available again. This needs an expiry rule and a way to notify the customer.

**Policy B — Requests without a hold:** Pending requests do not reserve the slot. Helen reviews competing requests and accepts one. The backend must prevent her from confirming conflicting appointments, and customers must be told that their requested time is not guaranteed.

Do not implement both policies accidentally or mix their meanings.

**Initial recommendation:** For a small salon, use Policy B unless Helen confirms she wants temporary holds. It avoids silently blocking her calendar for customers who never respond. Make sure that the dashboard warns Helen when multiple pending requests conflict, and allow her to contact customers or propose alternatives.

Once Helen confirms a slot, the system must prevent another conflicting confirmation.

If appointment durations differ, conflict checks must use appointment start and end times, not merely matching date strings.

## Admin availability management

Helen must be able to:

- Open and close dates.
- Set available appointment times.
- Mark dates or times unavailable.
- Update availability when her schedule changes.
- View conflicting pending requests.
- Avoid confirming appointments that conflict with already-confirmed bookings.

The backend must enforce the availability rules. Do not rely on the frontend alone.

# 6. ADMIN DASHBOARD AND AUTHENTICATION

The admin dashboard is for Helen. Customer booking must not require a customer account.

## Admin authentication

Use the project's existing authentication provider if suitable.

Requirements:

- Secure sign-in.
- Secure sign-out.
- Session persistence appropriate to the provider.
- Protected admin routes.
- Server-side authentication and authorisation checks.
- Password reset or recovery where supported.
- No hard-coded passwords.
- No public admin registration.
- No administrator secrets embedded in frontend code.
- Rate limiting or abuse protection where appropriate.

Provision Helen's administrator account through a secure administrative process. Do not create a public signup route that lets anyone become an admin.

If the current authentication system is incomplete, document the gap and propose the smallest secure implementation.

## Dashboard navigation

Recommended sections:

1. Overview.
2. Bookings.
3. Availability.
4. Services and prices.
5. Gallery/media.
6. Notification settings.
7. Business profile/settings.

### Overview

Show only actionable information:

- New pending bookings.
- Confirmed upcoming appointments.
- Rescheduling proposals awaiting resolution.
- Recent booking activity.
- Notification subscription status.
- Important notification processing failures, if any.

Use a clear pending-booking count.

### Booking list

Support:

- Filter by status.
- View booking details.
- View original and proposed appointment times.
- Confirm a request.
- Propose an alternative time.
- Reject with a reason.
- Call customer.
- Open a prefilled WhatsApp message.
- Record customer contact and response where appropriate.

Use clear confirmation dialogs for important actions.

### Booking history

Record important transitions with timestamps and, where relevant, the administrator responsible.

Avoid storing unnecessary sensitive information in logs.

# 7. RESCHEDULING AND REJECTION WORKFLOWS

## Confirming a booking

When Helen confirms a pending booking:

1. Validate the booking's current state.
2. Check the requested slot is still available.
3. Apply the confirmation atomically.
4. Record the confirmation timestamp.
5. Update the dashboard.
6. Display customer contact actions.

If another booking has already taken the slot, return a clear conflict error and offer the rescheduling workflow.

## Rescheduling a booking

Helen clicks Reschedule.

Display:

- Original date and time.
- New available date.
- New available time.
- Optional message to the customer.
- Save proposal action.

When submitted:

1. Validate the proposed time.
2. Ensure the proposal does not conflict with confirmed appointments.
3. Record the proposed time separately from the original time.
4. Set status to `RESCHEDULE_PROPOSED`.
5. Preserve the original request and audit history.
6. Display Call Customer and Message on WhatsApp actions.

A proposal is not a confirmed appointment.

Because V1 has no automated WhatsApp integration or customer account, Helen must record the customer's response in the dashboard.

Only after customer agreement should the system finalise the new appointment time and set status to `CONFIRMED`.

If the customer declines, Helen can offer another slot or reject the request.

Do not overwrite the original time without preserving the history.

## Rejecting a booking

When Helen clicks Reject:

1. Open a form with a required reason.
2. Allow an optional additional message.
3. Ask for confirmation before applying the rejection.
4. Set status to `REJECTED`.
5. Record the reason and timestamp.
6. Display Call Customer and Message on WhatsApp actions.

The reason must be included safely in the generated message.

The rejection action must not send a WhatsApp message automatically.

## Customer contact actions

**Call Customer:** Open the phone dialler using a properly formatted telephone number.

**Message on WhatsApp:** Open WhatsApp click-to-chat using Helen's verified business number, the customer's phone number where appropriate, and a URL-encoded prefilled message.

Messages should be generated from the actual booking record and current status.

Examples:

Confirmation:\
“Hello [Customer Name], your booking with Braids by Helen for [Service] on [Date] at [Time] has been confirmed. We look forward to seeing you!”

Rescheduling:\
“Hello [Customer Name], thank you for booking with Braids by Helen. I am unavailable at your requested time of [Original Date and Time]. I can offer [Proposed Date and Time] instead. Please let me know if this works for you.”

Rejection:\
“Hello [Customer Name], thank you for choosing Braids by Helen. Unfortunately, I cannot accommodate your booking for [Date and Time]. Reason: [Reason]. I apologise for the inconvenience and appreciate your understanding.”

These are editable templates, not automatic outbound messages.

Do not claim that opening WhatsApp means a message was sent or read.

Do not implement WhatsApp number verification in V1. Provide both call and WhatsApp buttons so Helen can use whichever works.

# 8. PUSH NOTIFICATIONS — CROSS-PLATFORM PWA

Push notifications are a priority, especially for Helen's administrator experience.

## Platform requirements

Use standards-based Web Push with VAPID where appropriate.

Android:

- HTTPS.
- Supported browser.
- Registered service worker.
- Notification permission.
- Valid push subscription.

iPhone:

- Supported iOS version.
- Website added to the Home Screen.
- Web app launched from its Home Screen icon.
- Notification permission granted through the installed web app.
- Valid push subscription.

Do not assume that simply opening Safari on an iPhone is sufficient. Provide clear Home Screen installation and notification-enablement instructions.

Feature-detect capabilities. Do not show an enable-notifications button that cannot work on the current device.

Test on real Android and iPhone devices.

## Subscription management

Store each push subscription securely against Helen's authenticated administrator account.

Allow multiple devices for the same administrator.

Requirements:

- Register a device when permission is granted and subscription creation succeeds.
- Update subscriptions when appropriate.
- Disable invalid or expired subscriptions.
- Support notification permission being denied.
- Handle permission changes gracefully.
- Provide a way to test notifications.
- Provide clear notification status in the dashboard.
- Never expose private subscription data publicly.

Do not store sensitive administrator credentials or private server keys in browser storage.

## Notification events

Priority events:

1. New booking request.
2. Booking requiring attention after remaining pending.
3. New rescheduling proposal or other important booking event, where relevant.
4. Optional future reminders for upcoming appointments.

Do not notify Helen unnecessarily for every minor edit.

## Notification payload

Keep the payload minimal. For example:

Title: `New Booking Request`

Body: `A customer has requested an appointment. Tap to review.`

Include a safe booking identifier so the PWA can open the relevant authenticated booking page.

Avoid placing unnecessary customer phone numbers or other sensitive information in the push payload.

When Helen taps the notification:

1. Open the PWA.
2. Navigate to the appropriate booking.
3. Authenticate if necessary.
4. Show the booking details only after access is authorised.

## Reliable delivery architecture

Separate booking persistence from notification delivery.

Recommended logical flow:

1. Validate booking request.
2. Save the booking.
3. Create a durable notification event/job.
4. Process the job asynchronously.
5. Send a Web Push request.
6. Record the outcome.
7. Retry eligible failures with bounded exponential backoff.
8. Mark invalid subscriptions appropriately.
9. Preserve the booking regardless of notification delivery outcome.

Where supported by the current stack, save the booking and notification event atomically or use an equivalent transactional outbox pattern.

Do not make the booking transaction depend on an external push provider being available.

If the current backend supports durable queues, use them. If it does not, evaluate the smallest reliable queue/worker solution before introducing a new paid service.

Do not assume that merely creating a queue or database trigger automatically processes jobs. Implement and verify the worker invocation or schedule.

## Retry and offline behaviour

Distinguish between:

- A push request that failed before being accepted.
- A request accepted by the push service.
- Actual display on Helen's device, which the server may not be able to verify.

Retry transient submission failures using backoff and a bounded retry policy.

Set an appropriate Web Push TTL so a push service can attempt delivery while the message remains eligible.

Do not repeatedly send duplicates simply because we cannot confirm that an accepted notification was displayed.

If a subscription is invalid, disable it and prompt Helen to re-enable notifications from the dashboard when needed.

A device that is offline may receive an eligible queued push when it reconnects, but delivery is not guaranteed. Browser, operating-system, permission, subscription and push-service policies all affect delivery.

## Pending-booking reminders

Implement reminders as new notifications for unresolved bookings, not blind retries of previously accepted notifications.

Initial behaviour:

- Immediate notification for a new booking.
- Persistent pending status in the dashboard.
- A configurable reminder after a defined interval.
- Rate limiting to avoid overwhelming Helen.
- Stop pending reminders once the booking is resolved.

Choose sensible defaults, document them and avoid duplicate reminder jobs.

## Fallbacks

Push notifications are alerts, not the booking database.

If push fails:

- Keep the booking visible in the dashboard.
- Keep the notification failure visible to administrators.
- Allow Helen to use the dashboard when she next opens the app.
- Provide a notification test and diagnostic view.

Do not claim guaranteed delivery.

## Browser badge

Where supported, use the PWA app badge to show the count of unresolved bookings.

Treat this as an enhancement, not the only way to display pending work.

# 9. PROGRESSIVE WEB APP

Build the PWA foundations into V1.

Required:

- Web app manifest.
- Appropriate application name and short name.
- Supplied app icon and correctly sized variants.
- HTTPS deployment.
- Service worker.
- Installability checks.
- Appropriate theme and background colours.
- Safe caching strategy.
- Push-notification integration.
- Notification click handling.
- Responsive app-like dashboard.

Suggested application name: `Braids by Helen`.

Suggested short name: `Braids Helen`.

Suggested theme colour: `#70263D`.

Suggested background colour: `#FFF9F2`.

## Customer installation

Customers can install the PWA if they wish, but installation must not be required to browse services or submit bookings.

## Administrator installation

Prioritise Helen's PWA experience.

Provide concise installation guidance for:

- Android Chrome.
- iPhone Safari and Home Screen installation.

Explain how to enable notifications after installation.

Do not assume all devices expose the same installation controls.

## Offline support

Cache appropriate static assets and the app shell where practical.

Do not claim that an offline booking has been submitted. Booking submission requires server confirmation.

Do not cache sensitive admin pages or customer booking data indiscriminately.

Use a deliberate service-worker update strategy so users receive important fixes without stale booking logic.

# 10. CUSTOMER DETAILS AND PRIVACY

For V1, customers do not need accounts.

Offer optional local-device autofill for:

- Customer name.
- Customer phone number.

Only save these details locally after an appropriate user action, such as successful booking or explicit consent to remember them.

Provide a clear way to edit or clear saved details.

Explain that locally saved information belongs to the current browser and device. It will not automatically synchronise between Chrome, Safari or different phones.

Do not store unnecessary information. Avoid saving sensitive data in local storage.

Always validate submitted details on the server.

If the customer clears browser data, the saved details may disappear. This must not affect existing bookings in the database.

# 11. MEDIA MANAGEMENT

Helen must be able to update her portfolio without developer involvement.

## Admin gallery workflow

1. Helen signs in.
2. Opens Gallery/Media.
3. Uploads a photo or video.
4. Adds a title or optional caption.
5. Chooses a category if supported.
6. Sets visibility.
7. Saves.
8. The public gallery displays the new media.

Support:

- Image uploads.
- Video uploads.
- Preview before publishing.
- Edit captions.
- Reorder media.
- Hide or unpublish media.
- Delete media with confirmation.
- Loading, error and retry states.

Use the existing storage provider if suitable.

If a new storage provider is required, document its costs, limits and configuration before implementation.

Optimise uploaded media where practical:

- Generate responsive image variants.
- Prefer modern image formats when supported.
- Use video posters.
- Avoid unnecessarily large downloads.
- Lazy-load below-the-fold media.
- Consider upload size limits and mobile network constraints.

Do not make all videos download automatically when the homepage opens.

Do not expose storage credentials or unrestricted upload endpoints.

## Initial content

Use the supplied two images and two videos as the initial gallery content, after checking their quality, format and suitability.

Do not invent more portfolio entries.

Ensure Helen can replace, remove or add to this initial content through the admin dashboard.

# 12. PROPOSED DATA MODEL

Adapt these entities to the actual project and existing database. They are logical requirements, not a mandate to create duplicate tables.

## Services

Suggested fields:

- `id`
- `name`
- `slug`
- `description`
- `starting_price`
- `is_active`
- `display_order`
- `created_at`
- `updated_at`

Prices must be numeric and validated. Display them using the Nigerian naira symbol.

## Bookings

Suggested fields:

- `id`
- `booking_reference`
- `customer_name`
- `customer_phone`
- `service_id`
- `requested_start_at`
- `requested_end_at`, if durations are supported
- `proposed_start_at`, when rescheduling
- `proposed_end_at`, when rescheduling
- `customer_note`
- `status`
- `rejection_reason`, when applicable
- `created_at`
- `updated_at`
- `confirmed_at`, when applicable
- `resolved_at`, when applicable

Use a consistent timezone strategy. Store timestamps in UTC where appropriate and display appointments in the business's local timezone, `Africa/Lagos`.

Do not rely on the customer's device timezone to determine salon availability.

## Availability

Represent the business's actual availability rules clearly.

Depending on the existing implementation, this may involve:

- Available dates.
- Available time slots.
- Working hours.
- Unavailable dates.
- Appointment durations.
- Confirmed appointment conflicts.

Do not create redundant availability systems.

## Booking status history

Where practical, keep a history of important transitions:

- Booking ID.
- Previous status.
- New status.
- Timestamp.
- Actor, where relevant.
- Reason or action metadata.

Preserve the original booking request when rescheduling.

## Media

Suggested fields:

- `id`
- `media_type`
- `storage_path` or provider identifier
- `title`
- `caption`
- `category`
- `poster_path`, for videos if applicable
- `is_published`
- `display_order`
- `created_at`
- `updated_at`

## Push subscriptions

Suggested fields:

- `id`
- `admin_user_id`
- `endpoint`
- Required Web Push encryption key material.
- `is_active`
- `created_at`
- `last_successful_submission_at`, where meaningful
- `last_error_at`, where meaningful

Treat subscription endpoints and key material as sensitive. Apply appropriate database access policies and never expose them to public clients.

## Notification jobs/events

Suggested fields:

- `id`
- `event_id` or idempotency key
- `event_type`
- `booking_id`
- `status`
- `attempt_count`
- `next_attempt_at`
- `expires_at`
- `last_error_code`
- `created_at`
- `processed_at`

Adapt this to the selected queue technology. Avoid duplicating the queue provider's internal message data unnecessarily.

## Business settings

Where appropriate, keep configurable information in one place:

- Business name.
- Verified contact number.
- Social profile links.
- Service area.
- Business timezone.
- Booking policy.
- Reminder settings.

Do not make business information difficult to update by hard-coding it in multiple frontend components.

# 13. SECURITY AND VALIDATION

Security is part of the implementation, not a later enhancement.

Requirements:

- Protect every admin route.
- Authorise every admin mutation on the server.
- Prevent unauthorised access to customer bookings.
- Validate customer input on the server.
- Rate-limit public booking submissions where appropriate.
- Prevent duplicate requests and invalid status transitions.
- Check availability during the actual write operation.
- Protect against SQL injection, XSS and unsafe URL handling.
- Validate media types and upload limits.
- Use private credentials only in server-side configuration.
- Keep administrator credentials and VAPID private keys out of client bundles.
- Use secure session handling appropriate to the existing provider.
- Do not expose private booking information in public URLs.
- Restrict database access using the project's appropriate authorisation policies.
- Avoid logging full phone numbers or unnecessary personal data.
- Handle malformed WhatsApp URLs and telephone numbers safely.
- Use confirmation steps for destructive admin actions.

If the project uses Supabase, inspect Row Level Security policies and verify that public users cannot read all bookings or modify services, availability, subscriptions or administrator settings.

Never disable security policies simply to make the frontend work.

# 14. ERROR HANDLING AND OBSERVABILITY

Build understandable states for:

- Booking submission failure.
- Slot no longer available.
- Network interruption.
- Invalid form input.
- Upload failure.
- Push permission denied.
- Push subscription failure.
- Expired push subscription.
- Admin session expired.
- Unauthorized action.
- Failed notification job.
- Concurrent booking conflict.

Give users a useful next action rather than exposing technical stack traces.

For administrators, provide enough diagnostics to identify problems without revealing secrets.

Use structured server-side logs and, where practical, error monitoring that fits the existing stack and budget.

Do not introduce a paid monitoring service without approval.

# 15. PERFORMANCE AND ACCESSIBILITY

The site should work well for customers using ordinary mobile devices and potentially unreliable mobile networks in Nigeria.

Priorities:

- Fast initial page load.
- Compressed images.
- Lazy-loaded gallery media.
- Minimal unnecessary JavaScript.
- Efficient font loading.
- Responsive layouts.
- Clear form labels.
- Keyboard accessibility.
- Screen-reader-friendly status messages.
- Visible focus states.
- Adequate text contrast.
- Large touch targets.
- Reduced-motion support.
- No essential action available only on hover.

Use real portfolio media carefully so it improves conversion without making the website slow.

# 16. VISUAL DESIGN RESEARCH

Before finalising the visual direction, review a small number of reference websites.

Suggested sources:

- Dribbble: `https://dribbble.com/search/hair-salon-website`
- Pinterest: `https://www.pinterest.com/search/pins/?q=hair%20braiding%20salon%20website%20design`

The product owner may supply selected screenshots or links.

Use references for:

- Hero composition.
- Gallery layouts.
- Booking form clarity.
- Mobile navigation.
- Service cards.
- Typography.
- Spacing and visual hierarchy.

Do not reproduce another business's branding, copy, images or distinctive design wholesale.

Prioritise a design that fits the supplied logo, the brand tokens and Helen's real hairstyle portfolio.

# 17. IMPLEMENTATION PHASES

Do not attempt to change everything at once. Work in reviewable phases.

## Phase 0 — Audit and plan

- Inspect the codebase.
- Identify the actual stack and backend.
- Document working features and gaps.
- Locate the supplied assets.
- Map the existing booking flow and availability rules.
- Identify security risks.
- Propose the smallest safe implementation plan.

**Deliverable:** Audit report and implementation plan.

## Phase 1 — Brand and public website

- Integrate the supplied primary logo.
- Integrate the app icon where appropriate.
- Apply the centralised design tokens.
- Improve the homepage and responsive navigation.
- Implement services using database-driven content where appropriate.
- Populate the gallery with the supplied two photos and two videos.
- Add verified contact and social links.
- Improve accessibility and loading performance.

**Deliverable:** Branded public website with real initial content.

## Phase 2 — Booking and availability

- Audit and improve the existing booking form.
- Validate all booking data on the server.
- Implement durable booking persistence.
- Generate unique booking references.
- Implement clear pending and success states.
- Preserve the existing availability-management workflow where sound.
- Implement concurrency-safe conflict prevention.
- Implement confirmation, rescheduling and rejection.
- Add customer contact actions and prefilled message templates.

**Deliverable:** Functional end-to-end booking workflow.

## Phase 3 — Admin authentication and management

- Secure admin authentication.
- Protect dashboard routes and mutations.
- Implement booking management.
- Implement availability management.
- Implement service and price editing.
- Implement media uploads and gallery management.
- Add booking history and meaningful status indicators.

**Deliverable:** Helen can manage the business without editing code.

## Phase 4 — PWA and push notifications

- Implement manifest and service worker.
- Configure app icons and installation behaviour.
- Implement Web Push subscription management.
- Register Helen's supported devices.
- Create durable notification events/jobs.
- Implement the notification worker.
- Implement retries and expired-subscription handling.
- Add notification click navigation.
- Add pending-booking reminders and rate limits.
- Add notification settings and test functionality.
- Add app badge support where available.

**Deliverable:** Installable PWA with tested push-notification workflows.

## Phase 5 — Testing and launch preparation

- Test the full customer booking journey.
- Test the admin dashboard.
- Test concurrency and booking conflicts.
- Test confirmation, rescheduling and rejection.
- Test WhatsApp click-to-chat and calling.
- Test image/video uploads.
- Test push permission and subscription handling.
- Test on real Android Chrome.
- Test on a supported iPhone Home Screen PWA.
- Test offline and reconnect behaviour.
- Check accessibility, responsiveness and performance.
- Check production security policies.
- Verify all public business details with Helen.
- Document deployment and any recurring costs.

**Deliverable:** Launch candidate with a clear test report.

# 18. ACCEPTANCE TESTS

Do not declare the project complete simply because it compiles.

The following tests must pass.

### Customer booking

- A customer can submit a valid request.
- The booking is saved before success is shown.
- The customer sees a booking reference and pending status.
- Invalid input produces a clear error.
- A duplicate submission does not create duplicate bookings.
- A conflicting request is handled according to the approved booking policy.

### Admin booking management

- Helen can sign in securely.
- An unauthorised visitor cannot access private bookings.
- Helen can confirm an available appointment.
- Helen cannot confirm an appointment that conflicts with another confirmed appointment.
- Helen can propose a different date/time.
- The original requested time remains recorded.
- A proposed time is not silently treated as confirmed.
- Helen can reject with a reason.
- Contact actions use the correct customer number and message content.

### Notifications

- A new booking creates a notification event.
- A recoverable push submission failure is retried.
- A permanently invalid subscription is handled appropriately.
- Notification failures do not erase bookings.
- Duplicate jobs are controlled.
- A push click opens the appropriate booking after authentication.
- Pending reminders stop when a booking is resolved.
- Offline delivery limitations are documented.
- The dashboard still displays bookings when push delivery fails.

### PWA

- The manifest is valid.
- The app is installable on supported platforms.
- Icons display correctly at appropriate sizes.
- The service worker behaves correctly during updates.
- Customers are not falsely told that an offline booking succeeded.
- iPhone Home Screen push setup instructions are clear.

### Media and content

- The supplied two images and two videos display correctly.
- Media uploads work for Helen.
- Helen can edit and hide gallery entries.
- Large media does not unnecessarily slow the initial page load.
- The site does not publish an unverified phone number.

### Responsive and accessibility

- Main workflows work on mobile and desktop.
- Forms have accessible labels.
- Focus indicators are visible.
- Booking statuses are understandable without colour alone.
- Gallery controls are usable by keyboard and touch.

# 19. DELIVERY RULES FOR THE CODING AGENT

1. Audit before editing.
2. Preserve working features.
3. Do not silently change the business rules.
4. Do not hard-code prices, availability, contact details or service lists in multiple places.
5. Do not claim that push notifications are guaranteed.
6. Do not implement the WhatsApp Business API.
7. Do not introduce paid services without approval.
8. Do not expose secrets in client code.
9. Do not remove existing database records or migrations without a safe migration plan.
10. Do not replace the entire codebase unless the audit demonstrates that it is necessary.
11. Keep changes incremental and reviewable.
12. Run the relevant tests and build checks after each phase.
13. Report any requirement that conflicts with the existing architecture before making a destructive change.
14. Document environment variables without including their secret values.
15. Keep a list of completed, pending and blocked requirements.
16. Ask the product owner to resolve genuine business-rule ambiguities rather than inventing decisions.

## Required report after the initial audit

Return:

- Existing stack and deployment setup.
- Current database schema and relevant access policies.
- Existing booking and availability behaviour.
- Features that already work.
- Features that are incomplete or broken.
- Required schema changes.
- Proposed push queue and worker implementation.
- Expected external services and costs.
- Risks and open questions.
- Recommended implementation order.

Do not begin a large rewrite before presenting this report.

# 20. DEFINITION OF SUCCESS

The project is successful when:

- A customer can discover Helen's real work and submit a booking request easily.
- The customer always understands whether the appointment is pending, proposed, confirmed or rejected.
- Double-booking conflicts are prevented according to the approved scheduling policy.
- Helen can manage her schedule, services, prices and gallery herself.
- Helen can communicate with customers through direct calls and prefilled WhatsApp messages.
- The PWA works appropriately on supported Android and iPhone devices.
- Notification jobs are durable and recoverable.
- Important bookings remain accessible even when push notifications fail.
- The site is secure, responsive and reasonably fast.
- The business can launch without requiring a paid service that Helen has not approved.

**Final instruction:** Start with Phase 0. Inspect the existing demo, report what is already working and what needs to change, and wait for approval of the proposed implementation plan before making major architectural changes. Build Braids by Helen as a practical, maintainable business tool—not merely a visually attractive demo.

## A few decisions I want you to make before sending it

The brief is ready to give your agent, but there are three things worth keeping in mind.

1\. Don't let the agent build the entire platform in one pass. Get its audit first. That will tell us whether the current demo already has a working database, booking form, admin dashboard or availability controls. We should reuse them wherever possible.

2\. Confirm the double-booking policy with Helen. My initial recommendation is to let requests remain pending without automatically rejecting competing customers, while preventing Helen from confirming overlapping appointments. If she wants pending requests to temporarily reserve slots, we can add a clear expiry rule. The choice affects the database and booking workflow.

3\. Confirm the contact number before launch. The flyer shows `09010189746`, but we should verify that Helen wants that number published and used for customer contact.

One more practical point: the logo and app icon is on New Assest folder. The agent should use the primary logo in the website branding and the app icon for the favicon and PWA assets, rather than treating the two as interchangeable.
