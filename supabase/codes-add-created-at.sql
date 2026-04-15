-- Optional: true “newest first” ordering for homepage Latest Codes.
-- Run once in Supabase SQL if `public.codes` has no `created_at` column.

alter table public.codes
add column if not exists created_at timestamptz default now();

-- Backfill existing rows (one-time stamp; new rows get default now() on insert).
update public.codes
set created_at = coalesce(created_at, now())
where created_at is null;
