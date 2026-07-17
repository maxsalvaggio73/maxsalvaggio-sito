-- ========================================================
-- SETUP DATABASE SUPABASE PER PORTFOLIO DINAMICO E DRAG-AND-DROP
-- Esegui questo script nell'editor SQL di Supabase (SQL Editor)
-- ========================================================

-- 1. Creazione della tabella per gli elementi del portfolio pubblico
create table if not exists public.portfolio_items (
    id uuid default gen_random_uuid() primary key,
    url text not null,                      -- URL pubblico dell'immagine in Supabase Storage
    storage_path text not null,             -- Path univoco del file nel Bucket (es. "overview/foto.jpg")
    title text not null,                    -- Titolo pulito per Alt Text e SEO
    category text not null,                 -- Categoria (es. "overview", "campaigns-fashion", etc.)
    project_id text,                        -- ID progetto editoriale (es. "covers", "viaggio-oriente")
    project_title text,                     -- Titolo visibile del progetto editoriale
    project_place text,                     -- Luogo dello scatto
    project_magazine text,                  -- Rivista
    width integer,                          -- Dimensioni
    height integer,
    is_horizontal boolean,
    position integer default 0,             -- Ordinamento personalizzato drag-and-drop
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Creazione dell'indice per caricamenti ordinati super veloci
create index if not exists idx_portfolio_items_category_position 
on public.portfolio_items(category, position);

-- 2. Abilitazione della sicurezza a livello di riga (Row Level Security - RLS)
alter table public.portfolio_items enable row level security;

-- 3. Politica per l'accesso pubblico in sola lettura ai dati del portfolio
create policy "Consenti lettura pubblica portfolio_items" 
on public.portfolio_items for select 
using (true);

-- 4. Politica per consentire solo agli amministratori di modificare i dati
create policy "Consenti agli admin la gestione di portfolio_items" 
on public.portfolio_items for all 
using (
    (select is_admin from public.profiles where id = auth.uid()) = true
) with check (
    (select is_admin from public.profiles where id = auth.uid()) = true
);

-- ========================================================
-- NOTA SULLO STORAGE:
-- Prima di eseguire le politiche sotto, crea un bucket chiamato
-- "public-portfolio" nello Storage di Supabase e impostalo come PUBLIC!
-- ========================================================

-- 5. Politiche di sicurezza per lo Storage del Portfolio ("public-portfolio")

create policy "Consenti lettura pubblica oggetti public-portfolio" 
on storage.objects for select 
using (bucket_id = 'public-portfolio');

create policy "Consenti agli admin la gestione degli oggetti public-portfolio" 
on storage.objects for all 
using (
    bucket_id = 'public-portfolio' and (select is_admin from public.profiles where id = auth.uid()) = true
) with check (
    bucket_id = 'public-portfolio' and (select is_admin from public.profiles where id = auth.uid()) = true
);

-- ========================================================
-- GUEST USERS MIGRATION
-- Esegui questo blocco nell'editor SQL di Supabase per abilitare
-- la gestione degli utenti Guest dall'Admin Panel.
-- ========================================================

-- 6. Aggiunta colonne per utenti Guest nella tabella profiles
alter table public.profiles
  add column if not exists is_guest boolean default false,
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Indice per query rapide sulla lista Guest (ordinamento alfabetico)
create index if not exists idx_profiles_guest_name
on public.profiles(last_name, first_name) where is_guest = true;

