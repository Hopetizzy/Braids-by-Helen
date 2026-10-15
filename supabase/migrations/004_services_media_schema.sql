-- Braids by Helen Services & Portfolio Media Schema Extension
-- Migration: 004_services_media_schema.sql

-- 1. Extend Media Table with Foreign Key to Services and Style Tag
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS style_tag TEXT;

-- 2. Indexes for fast service-filtered media queries
CREATE INDEX IF NOT EXISTS idx_media_service_id ON public.media(service_id);
CREATE INDEX IF NOT EXISTS idx_media_published_order ON public.media(is_published, display_order);

-- 3. Storage Bucket Configuration for salon-media
-- Create public bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'salon-media',
    'salon-media',
    true,
    52428800, -- 50MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- 4. Storage Row Level Security Policies for salon-media
-- Public read access to all files in salon-media bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public clients can read salon-media'
    ) THEN
        CREATE POLICY "Public clients can read salon-media"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (bucket_id = 'salon-media');
    END IF;
END $$;

-- Authenticated admins can upload files to salon-media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload to salon-media'
    ) THEN
        CREATE POLICY "Admins can upload to salon-media"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'salon-media');
    END IF;
END $$;

-- Authenticated admins can update files in salon-media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update salon-media'
    ) THEN
        CREATE POLICY "Admins can update salon-media"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'salon-media')
        WITH CHECK (bucket_id = 'salon-media');
    END IF;
END $$;

-- Authenticated admins can delete files from salon-media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete from salon-media'
    ) THEN
        CREATE POLICY "Admins can delete from salon-media"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'salon-media');
    END IF;
END $$;
