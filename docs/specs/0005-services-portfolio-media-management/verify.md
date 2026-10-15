# Verify: Services & portfolio media management · spec 0005 · updated 2026-10-13

_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Helen navigates to Studio Dashboard and clicks Services button → Services management modal opens with all services, categories, and prices → AC-3
- [x] Helen uses quick adjuster (+1k or -1k) on Knotless Braids price → price estimate updates immediately in Naira and persists to local storage or Supabase → AC-3
- [x] Helen clicks Add Service, enters name, category, Naira price, and two style variations → new service appears in active list with auto derived slug → AC-3
- [x] Helen clicks active toggle on any service → service switches between Active and Hidden, updating client booking visibility accordingly → AC-3
- [x] Helen clicks Portfolio button in Studio Dashboard → Portfolio upload manager opens with file selector, category dropdown, and service tagger → AC-4
- [x] Helen selects an image or video file under size limit, tags Knotless Braids with Boho Goddess Curls, and clicks Publish → item saves with preview badge → AC-4
- [x] Helen selects a file exceeding size limits (photo over 10MB or video over 50MB) → interface catches error before upload with friendly limit warning → AC-4
- [x] Customer visits home gallery section and clicks Video Reels filter pill → gallery filters to video items with duration indicator pills → AC-5, AC-6
- [x] Customer hovers or views video card → native HTML5 video plays inline preview muted without audio distortion → AC-6
- [x] Customer clicks video card → high resolution video modal opens with playback controls and unmute toggle → AC-6
- [x] Customer clicks Book This Style button on media card tagged with a style → reservation modal opens with tagged service and style preselected in Step 1 → AC-7
- [x] App running offline in demo mode → bundled photoshoot images and styling videos display smoothly from local seed storage → AC-8

## Commands

- [x] `npm run build` → exits with code 0 with zero syntax or bundling errors → AC-1, AC-2

## Acceptance criteria coverage

- AC-1 schema migration and indexes covered by command step 1 and UI step 3
- AC-2 storage bucket and offline fallback covered by UI steps 6, 7, 12
- AC-3 services management interface covered by UI steps 1, 2, 3, 4
- AC-4 portfolio upload manager covered by UI steps 5, 6, 7
- AC-5 dynamic customer gallery covered by UI step 8
- AC-6 native HTML5 video previews covered by UI steps 9, 10
- AC-7 Book This Style interactive triggers covered by UI step 11
- AC-8 seed assets integration covered by UI step 12
