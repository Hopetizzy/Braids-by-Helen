# Rationale: 0005. Services & portfolio media management

## Context

Braids by Helen relies on visual presentation and transparent pricing to convert visitors into booked appointments. In the initial prototype, salon services, Naira prices, and gallery media were hardcoded in static JavaScript files. When Helen wanted to adjust a starting price, introduce a new braid style, or showcase her latest customer transformations, she had to request a code change.

In addition, modern salon clients make booking decisions based on genuine before and after results, particularly short styling videos showing braid neatness and scalp care. The application had several photoshoot images and styling videos provided in local assets, but the gallery had no mechanism to stream real video clips or connect a specific photo to its corresponding booking service.

To solve this, we need a complete administrative catalog manager for Helen and a dynamic media showcase that connects client inspiration directly to appointment reservations.

## Options considered

### Option 1: Direct Supabase storage and relational catalog management with native HTML5 video previews, service tagged portfolio cards, and offline demo fallback

This option uses Supabase Storage bucket `salon-media` for uploaded photos and videos, linking each media asset to a service record in PostgreSQL. The public gallery displays video cards with muted HTML5 inline playback and a Book This Style button that preselects the hairstyle in the booking modal. When running without an active internet connection, the system seamlessly displays bundled seed assets.

**Pros**:
- Keeps all media and catalog data within Helen's existing Supabase backend without adding external subscription services.
- Native HTML5 video requires zero third party player libraries, keeping bundle size small and load times fast.
- Direct service tagging removes friction from customer booking, guiding clients from visual inspiration straight to reservation.
- Bundled seed assets provide a rich offline demonstration experience.

**Cons**:
- Video storage and delivery rely on Supabase Storage bandwidth limits rather than a dedicated video streaming network.

### Option 2: External third party video hosting and headless CMS

This option stores service catalogs in a dedicated headless content management system (such as Sanity or Strapi) and hosts videos on a third party platform (such as Cloudinary or Vimeo).

**Pros**:
- Provides automated video transcoding, adaptive bitrate streaming, and responsive image transformations.

**Cons**:
- Introduces multiple third party accounts, extra recurring costs, and complex external API dependencies.
- Splits salon data across multiple services instead of keeping it unified in Supabase.
- Increases maintenance overhead for a single salon owner.

### Option 3: Static repository file storage with Git committed media

This option commits new image and video files directly into the repository and updates JSON configuration files via pull requests or web forms.

**Pros**:
- Requires no cloud storage bucket setup or database migrations.

**Cons**:
- Bloats git repository size rapidly with large video files.
- Prevents Helen from uploading new media directly from her mobile phone while working in her studio.
- Creates slow build and deployment pipelines as media files accumulate.

## Rationale

We selected Option 1 because it delivers an integrated solution within Helen's existing infrastructure. Braids by Helen already uses Supabase for database persistence, row level security, and authentication. Adding a storage bucket keeps authentication, access control, and data models unified under one provider.

Using native HTML5 video player attributes (`playsinline`, `muted`, `loop`, and `preload="metadata"`) provides smooth mobile previews without loading heavy third party video libraries. Furthermore, connecting each media item directly to a service with a one tap booking action creates a delightful customer experience that turns visual admiration into immediate bookings.
