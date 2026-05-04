-- Import tracking tables
-- Run this in your Supabase SQL editor to enable /admin/imports

create table if not exists public.import_runs (
  id              uuid        primary key default gen_random_uuid(),
  filename        text        not null,
  total_rows      integer     not null default 0,
  inserted_count  integer     not null default 0,
  updated_count   integer     not null default 0,
  skipped_count   integer     not null default 0,
  error_count     integer     not null default 0,
  notes           text,
  created_at      timestamptz not null default now()
);

create table if not exists public.import_run_errors (
  id              uuid        primary key default gen_random_uuid(),
  import_run_id   uuid        not null references public.import_runs(id) on delete cascade,
  row_number      integer,
  spa_name        text,
  error_message   text,
  raw_data        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists import_runs_created_at_idx
  on public.import_runs (created_at desc);

create index if not exists import_run_errors_run_id_idx
  on public.import_run_errors (import_run_id);

-- Enable RLS (admin client uses service role and bypasses these automatically)
alter table public.import_runs        enable row level security;
alter table public.import_run_errors  enable row level security;

-- No public access — admin client (service role) bypasses RLS entirely.
-- Add explicit policies here if you ever query these tables from a regular
-- authenticated client in the future.
