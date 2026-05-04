create extension if not exists pgcrypto;

create table if not exists public.spa_reviews (
  id uuid primary key default gen_random_uuid(),
  spa_id uuid not null references public.spas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spa_reviews_one_per_user_per_spa unique (spa_id, user_id)
);

create table if not exists public.spa_review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.spa_reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  spa_id uuid not null references public.spas(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists spa_reviews_spa_status_created_idx
  on public.spa_reviews (spa_id, status, created_at desc);

create index if not exists spa_reviews_user_spa_idx
  on public.spa_reviews (user_id, spa_id);

create index if not exists spa_review_photos_review_id_idx
  on public.spa_review_photos (review_id);

create index if not exists spa_review_photos_spa_id_idx
  on public.spa_review_photos (spa_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_spa_reviews_updated_at on public.spa_reviews;
create trigger set_spa_reviews_updated_at
before update on public.spa_reviews
for each row
execute function public.set_updated_at();

alter table public.spa_reviews enable row level security;
alter table public.spa_review_photos enable row level security;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "Public can read approved spa reviews" on public.spa_reviews;
create policy "Public can read approved spa reviews"
on public.spa_reviews
for select
using (status = 'approved');

drop policy if exists "Users can read own spa reviews" on public.spa_reviews;
create policy "Users can read own spa reviews"
on public.spa_reviews
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own spa reviews" on public.spa_reviews;
create policy "Users can insert own spa reviews"
on public.spa_reviews
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own spa reviews as pending" on public.spa_reviews;
create policy "Users can update own spa reviews as pending"
on public.spa_reviews
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "Admins can manage all spa reviews" on public.spa_reviews;
create policy "Admins can manage all spa reviews"
on public.spa_reviews
for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "Public can read approved review photos" on public.spa_review_photos;
create policy "Public can read approved review photos"
on public.spa_review_photos
for select
using (
  exists (
    select 1
    from public.spa_reviews
    where spa_reviews.id = spa_review_photos.review_id
      and spa_reviews.status = 'approved'
  )
);

drop policy if exists "Users can read own review photos" on public.spa_review_photos;
create policy "Users can read own review photos"
on public.spa_review_photos
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own review photos" on public.spa_review_photos;
create policy "Users can insert own review photos"
on public.spa_review_photos
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can delete own review photos" on public.spa_review_photos;
create policy "Users can delete own review photos"
on public.spa_review_photos
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can manage all review photos" on public.spa_review_photos;
create policy "Admins can manage all review photos"
on public.spa_review_photos
for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read review photo objects" on storage.objects;

drop policy if exists "Authenticated users can upload review photo objects" on storage.objects;
create policy "Authenticated users can upload review photo objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'review-photos'
  and (string_to_array(name, '/'))[3] like auth.uid()::text || '-%'
);

drop policy if exists "Users can delete own review photo objects" on storage.objects;
create policy "Users can delete own review photo objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'review-photos'
  and (string_to_array(name, '/'))[3] like auth.uid()::text || '-%'
);
