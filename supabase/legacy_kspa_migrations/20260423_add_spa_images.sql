create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spa-images',
  'spa-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.spa_images (
  id uuid primary key default gen_random_uuid(),
  spa_id uuid not null references public.spas(id) on delete cascade,
  kind text not null check (kind in ('logo', 'gallery')),
  storage_path text not null unique,
  file_name text not null,
  content_type text,
  size_bytes integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists spa_images_one_logo_per_spa_idx
  on public.spa_images (spa_id)
  where kind = 'logo';

create unique index if not exists spa_images_gallery_sort_order_idx
  on public.spa_images (spa_id, sort_order)
  where kind = 'gallery';

create index if not exists spa_images_spa_id_idx
  on public.spa_images (spa_id, kind, sort_order, created_at desc);
