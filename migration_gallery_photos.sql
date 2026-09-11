-- ========================================================
-- MIGRATION: LEGACY portfolio_items -> gallery_photos
-- ========================================================

-- 1. Create the new table if it does not exist (structure mirrors the old one)
CREATE TABLE IF NOT EXISTS public.gallery_photos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    url text NOT NULL,                      -- Public image URL in Supabase Storage
    storage_path text NOT NULL,             -- Path inside the bucket (e.g., "overview/foto.jpg")
    title text NOT NULL,                    -- Alt text / SEO title
    category text NOT NULL,                 -- Category / tag (e.g., "overview", "pb-beauty", ...)
    project_id text,                        -- Optional editorial project identifier
    project_title text,                     -- Optional project title
    project_place text,                     -- Optional location of the shoot
    project_magazine text,                  -- Optional magazine name
    width integer,                          -- Image dimensions
    height integer,
    is_horizontal boolean,
    position integer DEFAULT 0,             -- Ordering for drag‑and‑drop
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Copy existing data from the legacy table
INSERT INTO public.gallery_photos (
    id, url, storage_path, title, category,
    project_id, project_title, project_place, project_magazine,
    width, height, is_horizontal, position, created_at
)
SELECT
    id, url, storage_path, title, category,
    project_id, project_title, project_place, project_magazine,
    width, height, is_horizontal, position, created_at
FROM public.portfolio_items;

-- 3. (Optional) Drop the old table if you no longer need it
-- DROP TABLE IF EXISTS public.portfolio_items;
