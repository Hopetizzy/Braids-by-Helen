-- Migration: 009_clean_portfolio_seed_media.sql
-- Description: Removes legacy seed or hardcoded media items from the database so that only admin-uploaded items exist

DELETE FROM public.media
WHERE id::text LIKE 'media-seed-%'
   OR storage_path LIKE 'seed/%'
   OR public_url LIKE '/media/portfolio-%'
   OR public_url LIKE '/images/passion-twists.png'
   OR public_url LIKE '/images/wig-install.png';
