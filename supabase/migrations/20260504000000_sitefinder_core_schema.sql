-- SiteFinder.Camp core schema
-- Built around the RV campground CSV format in the parent project folder.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user'
    check (role in ('admin', 'owner', 'user', 'advertiser')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
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

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table if not exists public.campgrounds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived', 'pending')),

  name text not null,
  address text,
  city text not null,
  state text not null,
  zip text,
  phone text,
  email text,
  website text,
  price_range text,
  campground_type text,

  full_hookups boolean,
  amp_30 boolean,
  amp_50 boolean,
  pull_through boolean,
  big_rig_friendly boolean,
  wifi boolean,
  laundry boolean,
  showers boolean,
  pool boolean,
  pet_friendly boolean,
  monthly_stays boolean,
  dump_station boolean,

  description text,
  source_filename text,
  source_row_number integer,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campgrounds_status_idx on public.campgrounds(status);
create index if not exists campgrounds_state_city_idx on public.campgrounds(state, city);
create index if not exists campgrounds_type_idx on public.campgrounds(campground_type);
create index if not exists campgrounds_featured_idx on public.campgrounds(is_featured)
  where is_featured = true;
create index if not exists campgrounds_name_trgm_idx on public.campgrounds
  using gin (name gin_trgm_ops);

alter table public.campgrounds enable row level security;

drop policy if exists "Published campgrounds are public" on public.campgrounds;
create policy "Published campgrounds are public"
  on public.campgrounds for select
  using (status = 'published');

drop policy if exists "Admins can read all campgrounds" on public.campgrounds;
create policy "Admins can read all campgrounds"
  on public.campgrounds for select
  using (public.is_admin());

drop policy if exists "Admins can insert campgrounds" on public.campgrounds;
create policy "Admins can insert campgrounds"
  on public.campgrounds for insert
  with check (public.is_admin());

drop policy if exists "Admins can update campgrounds" on public.campgrounds;
create policy "Admins can update campgrounds"
  on public.campgrounds for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete campgrounds" on public.campgrounds;
create policy "Admins can delete campgrounds"
  on public.campgrounds for delete
  using (public.is_admin());

drop trigger if exists campgrounds_set_updated_at on public.campgrounds;
create trigger campgrounds_set_updated_at
  before update on public.campgrounds
  for each row execute function public.set_updated_at();

create table if not exists public.campground_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campground_id uuid not null references public.campgrounds(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, campground_id)
);

create index if not exists campground_favorites_user_idx
  on public.campground_favorites(user_id, created_at desc);

alter table public.campground_favorites enable row level security;

drop policy if exists "Users can view their campground favorites" on public.campground_favorites;
create policy "Users can view their campground favorites"
  on public.campground_favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can save campground favorites" on public.campground_favorites;
create policy "Users can save campground favorites"
  on public.campground_favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove campground favorites" on public.campground_favorites;
create policy "Users can remove campground favorites"
  on public.campground_favorites for delete
  using (auth.uid() = user_id);

create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  status text not null default 'completed'
    check (status in ('running', 'completed', 'failed')),
  total_rows integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  error_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.import_runs enable row level security;

drop policy if exists "Admins can manage import runs" on public.import_runs;
create policy "Admins can manage import runs"
  on public.import_runs for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists import_runs_set_updated_at on public.import_runs;
create trigger import_runs_set_updated_at
  before update on public.import_runs
  for each row execute function public.set_updated_at();

create table if not exists public.import_run_errors (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.import_runs(id) on delete cascade,
  row_number integer,
  campground_name text,
  error_message text not null,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists import_run_errors_run_idx
  on public.import_run_errors(import_run_id, row_number);

alter table public.import_run_errors enable row level security;

drop policy if exists "Admins can manage import errors" on public.import_run_errors;
create policy "Admins can manage import errors"
  on public.import_run_errors for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do nothing;
