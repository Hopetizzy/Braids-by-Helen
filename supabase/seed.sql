-- Braids by Helen Initial Seed Data
-- Seed file: supabase/seed.sql

-- 1. Business Settings Seed
INSERT INTO public.business_settings (
    id,
    salon_name,
    tagline,
    contact_phone,
    whatsapp_number,
    whatsapp_display,
    address,
    hours,
    currency_symbol,
    pricing_note
) VALUES (
    'default',
    'Braids by Helen',
    'Your Hair, Our Art.',
    '09010189746',
    '2349010189746',
    '0901 018 9746',
    'Ibadan, Oyo State (Studio & Home Service)',
    'Monday to Saturday: 8:00 AM to 7:00 PM | Sunday: 1:00 PM to 6:00 PM',
    '₦',
    'Starting rates shown. Braids by Helen confirms final pricing based on hair length, density, and extensions provided.'
)
ON CONFLICT (id) DO UPDATE SET
    salon_name = EXCLUDED.salon_name,
    tagline = EXCLUDED.tagline,
    contact_phone = EXCLUDED.contact_phone,
    whatsapp_number = EXCLUDED.whatsapp_number,
    whatsapp_display = EXCLUDED.whatsapp_display,
    address = EXCLUDED.address,
    hours = EXCLUDED.hours,
    currency_symbol = EXCLUDED.currency_symbol,
    pricing_note = EXCLUDED.pricing_note,
    updated_at = timezone('utc'::text, now());

-- Clear legacy services
DELETE FROM public.services;

-- 2. Helen's 6 Exact Services Seed
INSERT INTO public.services (
    id,
    slug,
    category,
    name,
    subtitle,
    description,
    starting_price,
    duration_estimate,
    styles,
    image_url,
    tag,
    is_popular,
    is_active,
    display_order
) VALUES
(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'short-knotless-twists',
    'braids',
    'Short Knotless Braids / Twists',
    'Neck to shoulder length lightweight protective styling',
    'Clean parting with natural root start to protect edges and eliminate scalp tension. Tailored to neck or shoulder length.',
    5000,
    '2.5 to 3.5 hrs',
    '["Short Knotless Braids", "Short Passion Twists", "Bob Length Knotless", "Short Senegalese Twists"]'::jsonb,
    '/images/knotless-braids.png',
    'Popular',
    true,
    true,
    1
),
(
    '00000000-0000-0000-0000-000000000002'::uuid,
    'long-knotless-twists',
    'braids',
    'Long Knotless Braids / Twists',
    'Mid back to waist length full glam finish',
    'Sleek, flowy knotless braids or twists extending to mid back or waist length. Lightweight feel with flawless weight distribution.',
    7000,
    '3.5 to 5 hrs',
    '["Mid back Knotless", "Waist Length Knotless", "Long Passion Twists", "Long French Curl Knotless"]'::jsonb,
    '/images/box-braids.png',
    'Signature',
    true,
    true,
    2
),
(
    '00000000-0000-0000-0000-000000000003'::uuid,
    'all-back',
    'weaving',
    'All-back Cornrows',
    'Neat straight back cornrow precision',
    'Classic, crisp feed in cornrows directed straight back. Beautiful as a standalone look or protective base for wigs.',
    1500,
    '1 to 2 hrs',
    '["Classic All-back (4 to 6 lines)", "Neat Micro All-back", "Stitch All-back", "Cornrows for Wig Base"]'::jsonb,
    '/images/ghana-weaving-allback.png',
    'Quick Style',
    false,
    true,
    3
),
(
    '00000000-0000-0000-0000-000000000004'::uuid,
    'retouching',
    'care',
    'Retouching',
    'Perimeter refresh and edge maintenance',
    'Revitalize your hairstyle by taking down and redoing the front perimeter and crown lines for a fresh, just styled look.',
    2000,
    '1 to 1.5 hrs',
    '["Front Perimeter Retouch", "Crown and Edges Refresh", "Braid Take down and Redo", "Parting Reneatening"]'::jsonb,
    '/images/hair-retouching.jpg',
    'Maintenance',
    false,
    true,
    4
),
(
    '00000000-0000-0000-0000-000000000005'::uuid,
    'hair-washing',
    'care',
    'Hair Washing',
    'Deep clarifying wash, scalp scrub and conditioning',
    'Invigorating salon shampoo, thorough scalp cleanse, deep conditioning moisture massage, and gentle blow dry preparation.',
    2000,
    '45 mins to 1 hr',
    '["Clarifying Wash and Conditioning", "Scalp Scrub and Massage", "Steam Moisture Treatment", "Wash and Blow dry Prep"]'::jsonb,
    '/images/hair-washing.jpg',
    'Essential',
    false,
    true,
    5
),
(
    '00000000-0000-0000-0000-000000000006'::uuid,
    'children-hairstyles',
    'children',
    'Children''s Hairstyles',
    'Gentle, pain free, and neat styling for kids',
    'Extra gentle styling crafted specially for sensitive young scalps, adorned with colorful beads and hair accessories.',
    3000,
    '1.5 to 2.5 hrs',
    '["Beaded Natural Cornrows", "Kids All-back with Beads", "Puff Balls and Twists", "Gentle Natural Braids"]'::jsonb,
    '/images/children-hair.png',
    'Kids Favorite',
    true,
    true,
    6
)
ON CONFLICT (slug) DO UPDATE SET
    category = EXCLUDED.category,
    name = EXCLUDED.name,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    starting_price = EXCLUDED.starting_price,
    duration_estimate = EXCLUDED.duration_estimate,
    styles = EXCLUDED.styles,
    image_url = EXCLUDED.image_url,
    tag = EXCLUDED.tag,
    is_popular = EXCLUDED.is_popular,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = timezone('utc'::text, now());
