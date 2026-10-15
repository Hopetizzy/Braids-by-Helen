# 0005. Services & portfolio media management

**Date**: 2026-10-13
**Status**: Accepted

## Summary

This decision provides Helen with direct studio control over her salon service menu and media gallery. Helen can adjust Naira prices, duration estimates, style variations, and active offerings without editing code. She can also upload authentic client photos and videos directly to secure cloud storage. Every portfolio item connects to a specific service, allowing visiting clients to preview styles in high quality and book that exact look with one tap.

## Requirements

**User stories**:
- As a salon client, I want to explore Helen's service catalog with accurate Naira starting prices and style variations so that I know what to expect before booking.
- As a salon client, I want to watch real video clips and inspect photos of Helen's work, tapping a button on any style to start booking that exact hairstyle immediately.
- As Helen the salon owner, I want to edit prices, toggle service visibility, and add new hairstyles in my studio dashboard so that my offerings reflect current pricing and availability.
- As Helen the salon owner, I want to upload new photos and video clips from my phone, tag them with the matching service, and showcase my newest braiding transformations instantly.

**Acceptance criteria**:
- **AC-1**: Database schema updates the `media` table with a foreign key referencing `services(id)` on delete set null, an optional style tag, and indexes for fast service filtered media queries.
- **AC-2**: Supabase Storage setup specifies a public bucket named `salon-media` for images and videos, backed by authenticated owner write policies and an offline local storage fallback.
- **AC-3**: Service management interface in Helen's studio dashboard allows viewing, updating starting prices in Naira, updating duration estimates, editing style variations, toggling active status, and creating new services.
- **AC-4**: Portfolio media management interface in Helen's studio dashboard provides upload controls for photos (up to 10MB) and videos (up to 50MB), thumbnail previews, service tagging dropdowns, caption inputs, and delete actions.
- **AC-5**: Customer gallery section dynamically displays active portfolio items from the database, organizing items by category and media type with video duration indicators and smooth playback.
- **AC-6**: Native HTML5 video player provides inline, muted loop previews on gallery cards, opening an expanded player modal with full controls and sound when selected.
- **AC-7**: Every media card displays an interactive Book This Style action that launches the customer reservation modal with the tagged service and hairstyle preselected in step one.
- **AC-8**: Seed data integrates Helen's real photoshoot images and styling videos from local assets, ensuring the gallery and service list display rich content even in offline demo mode.

## Decision

**Chosen option**: Option 1: Direct Supabase storage and relational catalog management with native HTML5 video previews, service tagged portfolio cards, and offline demo fallback.

We establish direct catalog and media management inside Helen's studio dashboard, storing media files in Supabase Storage with relational metadata in PostgreSQL, while providing native video playback and one tap booking triggers for salon clients.

**Implementation skills**: `tailwindcss-mcp-server` (recommended styling)

## Rationale

Reasoning and options: see [rationale.md](./rationale.md).

## Feature design

**Data model sketch**:
- `services`:
  - `id` (uuid primary key default `uuid_generate_v4()`)
  - `slug` (text unique not null)
  - `category` (text not null)
  - `name` (text not null)
  - `subtitle` (text optional)
  - `description` (text optional)
  - `starting_price` (integer not null default 0, stored in Naira)
  - `duration_estimate` (text not null e.g. 3 to 4 hours)
  - `styles` (jsonb not null default `'[]'::jsonb`, array of style variation strings)
  - `image_url` (text optional)
  - `tag` (text optional e.g. Signature or Popular)
  - `is_popular` (boolean not null default false)
  - `is_active` (boolean not null default true)
  - `display_order` (integer not null default 0)
  - `created_at` (timestamptz not null default now)
  - `updated_at` (timestamptz not null default now)
- `media`:
  - `id` (uuid primary key default `uuid_generate_v4()`)
  - `service_id` (uuid optional references `services(id)` on delete set null)
  - `style_tag` (text optional, matching a style variation name)
  - `media_type` (text not null check in `'image'`, `'video'`)
  - `storage_path` (text not null)
  - `public_url` (text not null)
  - `title` (text optional)
  - `caption` (text optional)
  - `category` (text optional)
  - `poster_path` (text optional)
  - `is_published` (boolean not null default true)
  - `display_order` (integer not null default 0)
  - `created_at` (timestamptz not null default now)

**State transitions**:
- Service state:
  - Active: visible in public customer booking flow and gallery filters.
  - Inactive: hidden from client booking modal, preserved in Helen's studio dashboard for later reactivation.
- Media item state:
  - Published: visible on public gallery grid and home showcase.
  - Draft or Archived: hidden from public clients, retained in studio dashboard.
- Direct booking flow:
  - Client clicks Book This Style on a media card.
  - Gallery triggers `BookingContext.openBookingModal()` passing `{ serviceId, serviceName, styleChoice }`.
  - Modal opens directly at Step 1 with service and style choice already selected, allowing client to jump directly to Step 2 for scheduling.

**API surface**:
| Endpoint or Method | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `fetchServices()` | RPC / SELECT | `includeInactive: boolean` | `services: Service[]` | Public for active, authenticated for all | 500 connection error |
| `saveService(payload)` | UPSERT | `id (opt), name, category, starting_price, duration_estimate, styles, is_active` | `service: Service` | Authenticated Helen | 400 validation error, 403 unauthorized |
| `fetchMedia(filter)` | SELECT | `category (opt), serviceId (opt)` | `media: MediaItem[]` | Public for published, authenticated for all | 500 connection error |
| `uploadMediaFile(file)` | Storage POST | `file: File, folder: string` | `publicUrl: string, storagePath: string` | Authenticated Helen | 413 file too large, 415 invalid type |
| `saveMediaRecord(payload)` | INSERT / UPDATE | `media_type, public_url, storage_path, service_id, style_tag, caption` | `media: MediaItem` | Authenticated Helen | 400 invalid payload, 403 unauthorized |
| `deleteMedia(id, path)` | DELETE | `id: UUID, storagePath: string` | `success: boolean` | Authenticated Helen | 404 item not found, 403 unauthorized |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Client browses service menu | Price display with Naira symbol | DB column `services.starting_price` formatted with currency utility |
| Client views service variations | Style dropdown list | DB column `services.styles` parsed from JSONB array |
| Client clicks Book This Style | Preselected service and style in booking modal | Media item relation `media.service_id` and `media.style_tag` (defaults to first variation in `services.styles` if null) |
| Client watches gallery video | Video stream and duration | DB column `media.public_url` and HTML5 loadedmetadata duration |
| Helen creates new service | Generated URL slug | Auto derived from `name` (lowercase alphanumeric characters separated by hyphens) |
| Helen uploads photo or video | Stored asset public URL | Supabase Storage bucket `salon-media` public URL generation |
| Helen views media card in manager | Associated service name badge | DB join between `media.service_id` and `services.name` |
| Client previews video thumbnail | Card poster image | Browser native HTML5 video frame rendering (`preload="metadata"`) with optional `media.poster_path` |

**Key invariants**:
- Starting prices must always be non negative integers representing whole Naira amounts.
- Service slugs must be unique and auto derived from service names using lowercase alphanumeric characters.
- Every media item must specify a valid media type, either image or video.
- Media items referencing a deleted service must retain their public asset URL with `service_id` gracefully set to null.
- If a tagged media item has no explicit style tag, the booking trigger must safely fall back to the first available style variation.
- File uploads must not exceed 10 megabytes for photos or 50 megabytes for videos.
- Video playback must always start muted to respect browser autoplay policies and avoid unexpected loud audio.

**Security model**:
- Anonymous public visitors have read only access to services where `is_active` is true and media where `is_published` is true.
- Authenticated Helen has full read, create, update, and delete access across all services, media rows, and the `salon-media` storage bucket.
- Storage bucket policies restrict uploads and deletions to authenticated sessions only.

**Configuration required**:
- `VITE_SUPABASE_URL`: cloud project URL for database and storage access.
- `VITE_SUPABASE_ANON_KEY`: public client key for anonymous customer queries.

**Critical test scenarios**:
- Happy path: Helen uploads a braiding video, tags it with Knotless Braids and Medium Waist Length, and saves; a customer clicks Book This Style on the gallery card, opening the reservation modal with Knotless Braids preselected, verifies **AC-3**, **AC-4**, **AC-5**, **AC-7**.
- Failure case: An uploaded video file exceeds 50 megabytes or the network connection drops during upload; the UI catches the error before storage mutation, displaying a friendly file size limit warning, verifies **AC-4**.
- Auth and permission: An unauthenticated visitor attempts to call the service update or media deletion procedure directly; Supabase Row Level Security denies the mutation with an unauthorized status code, verifies **AC-1**, **AC-2**.

## Build plan

1. [x] Database migration and schema expansion: create migration `004_services_media_schema.sql` adding `service_id` foreign key, `style_tag` column, and service lookup index to `media` table, satisfies **AC-1**.
2. [x] Storage bucket configuration and offline media utilities: configure `salon-media` storage bucket policies and build storage helper with local seed asset fallback, satisfies **AC-2**, **AC-8**.
3. [x] Services management interface: create `ManageServicesModal` for Helen to edit Naira prices, durations, variations, and active toggles, satisfies **AC-3**.
4. [x] Portfolio media upload and tagging interface: create `ManagePortfolioModal` allowing Helen to upload media files, attach captions, and select associated services, satisfies **AC-4**.
5. [x] Live customer gallery with native video player: update `GallerySection` to render live media cards with category filtering, video duration badges, and expanded video modal, satisfies **AC-5**, **AC-6**.
6. [x] Interactive Book This Style trigger integration: connect gallery card buttons to `BookingContext`, opening the reservation modal with preselected service and variation data, satisfies **AC-7**.

## Consequences

**Positive**:
- Helen can modify prices, durations, and offerings whenever salon costs change without requiring developer intervention.
- Prospective clients can view real authentic video results of Helen's work and book that exact look in a single tap.
- Offline demo mode keeps the application completely functional with bundled assets when offline.

**Negative / tradeoffs**:
- Video assets require higher bandwidth than static photos, requiring efficient lazy loading and poster image previews.
- Hosting video files in cloud storage consumes more storage quota than simple image galleries.

**Neutral**:
- Deleting services sets media references to null rather than deleting photos, keeping Helen's portfolio intact while detaching deprecated offerings.

## Follow-up

- [ ] Add thumbnail generation or automatic poster capture for uploaded video files to further improve initial gallery load times.
