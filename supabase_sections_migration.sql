-- ========================================================
-- SCHEMA MIGRATION: SEZIONI E PAGINE DINAMICHE PORTFOLIO
-- Esegui questo script nell'editor SQL di Supabase
-- ========================================================

-- 1. Tabella delle Sezioni Principali
CREATE TABLE IF NOT EXISTS public.portfolio_sections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    label text NOT NULL,
    position integer DEFAULT 0,
    is_dropdown boolean DEFAULT false,
    target text NOT NULL, -- es. "#overview", "#portraits-beauty", "#body-form", "#archive", "#contact"
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabella delle Pagine Interne
CREATE TABLE IF NOT EXISTS public.portfolio_pages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id uuid REFERENCES public.portfolio_sections(id) ON DELETE CASCADE,
    slug text NOT NULL UNIQUE, -- corrisponde al category di portfolio_items
    label text NOT NULL,
    position integer DEFAULT 0,
    target_type text DEFAULT 'tab', -- 'tab' o 'section'
    target_value text NOT NULL, -- es. 'pb-portraits', '#editorials'
    target_section text, -- es. '#portraits-beauty' se target_type è 'tab'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Abilitazione RLS
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_pages ENABLE ROW LEVEL SECURITY;

-- 4. Politiche RLS di Lettura Pubblica
CREATE POLICY "Consenti lettura pubblica portfolio_sections" 
ON public.portfolio_sections FOR SELECT USING (true);

CREATE POLICY "Consenti lettura pubblica portfolio_pages" 
ON public.portfolio_pages FOR SELECT USING (true);

-- 5. Politiche RLS di Scrittura per gli Admin
CREATE POLICY "Consenti agli admin la gestione di portfolio_sections" 
ON public.portfolio_sections FOR all 
using (
    (select is_admin from public.profiles where id = auth.uid()) = true
) with check (
    (select is_admin from public.profiles where id = auth.uid()) = true
);

CREATE POLICY "Consenti agli admin la gestione di portfolio_pages" 
ON public.portfolio_pages FOR all 
using (
    (select is_admin from public.profiles where id = auth.uid()) = true
) with check (
    (select is_admin from public.profiles where id = auth.uid()) = true
);

-- 6. Popolamento Dati Iniziali (FASE 1: Allineamento con menu home.html attuale)
-- Sezione 1: Overview
INSERT INTO public.portfolio_sections (slug, label, position, is_dropdown, target)
VALUES ('overview', 'Overview', 0, false, '#overview')
ON CONFLICT (slug) DO NOTHING;

-- Sezione 2: Portraits
INSERT INTO public.portfolio_sections (slug, label, position, is_dropdown, target)
VALUES ('portraits', 'Portraits', 1, true, '#portraits-beauty')
ON CONFLICT (slug) DO NOTHING;

-- Sezione 3: BODY
INSERT INTO public.portfolio_sections (slug, label, position, is_dropdown, target)
VALUES ('body', 'BODY', 2, true, '#body-form')
ON CONFLICT (slug) DO NOTHING;

-- Sezione 4: Archive
INSERT INTO public.portfolio_sections (slug, label, position, is_dropdown, target)
VALUES ('archive', 'Archive', 3, true, '#archive')
ON CONFLICT (slug) DO NOTHING;

-- Sezione 5: INFO
INSERT INTO public.portfolio_sections (slug, label, position, is_dropdown, target)
VALUES ('info', 'INFO', 4, false, '#contact')
ON CONFLICT (slug) DO NOTHING;

-- Associa le pagine interne alle relative macro-sezioni
DO $$
DECLARE
    sect_portraits_id uuid;
    sect_body_id uuid;
    sect_archive_id uuid;
BEGIN
    -- Recupera ID delle sezioni
    SELECT id INTO sect_portraits_id FROM public.portfolio_sections WHERE slug = 'portraits';
    SELECT id INTO sect_body_id FROM public.portfolio_sections WHERE slug = 'body';
    SELECT id INTO sect_archive_id FROM public.portfolio_sections WHERE slug = 'archive';

    -- Pagine per Portraits
    INSERT INTO public.portfolio_pages (section_id, slug, label, position, target_type, target_value, target_section)
    VALUES 
    (sect_portraits_id, 'portraits-portraits', 'Portraits', 0, 'tab', 'pb-portraits', '#portraits-beauty'),
    (sect_portraits_id, 'portraits-pets', 'Pets & Portraits', 1, 'tab', 'pb-pets', '#portraits-beauty')
    ON CONFLICT (slug) DO NOTHING;

    -- Pagine per BODY
    INSERT INTO public.portfolio_pages (section_id, slug, label, position, target_type, target_value, target_section)
    VALUES 
    (sect_body_id, 'body-organic', 'Organic Sculptures', 0, 'tab', 'body-organic', '#body-form'),
    (sect_body_id, 'body-shadows', 'Shadows & Graphic Intimacy', 1, 'tab', 'body-shadows', '#body-form')
    ON CONFLICT (slug) DO NOTHING;

    -- Pagine per Archive
    INSERT INTO public.portfolio_pages (section_id, slug, label, position, target_type, target_value, target_section)
    VALUES 
    (sect_archive_id, 'portraits-beauty', 'Beauty', 0, 'tab', 'pb-beauty', '#portraits-beauty'),
    (sect_archive_id, 'editorial-project', 'Editorials', 1, 'section', '#editorials', NULL),
    (sect_archive_id, 'campaigns-fashion', 'Fashion', 2, 'section', '#campaigns-fashion', NULL),
    (sect_archive_id, 'campaigns-lingerie', 'Lingerie', 3, 'section', '#campaigns-lingerie', NULL),
    (sect_archive_id, 'campaigns-swimwear', 'Swimwear', 4, 'section', '#campaigns-swimwear', NULL),
    (sect_archive_id, 'editorial-unpublished', 'Unpublished Research', 5, 'section', '#unpublished-research', NULL)
    ON CONFLICT (slug) DO NOTHING;
END $$;
