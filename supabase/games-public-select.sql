-- Public read access for `games` (homepage uses the anon key on the server).
-- Run once in Supabase: Dashboard → SQL → New query → Run.
-- For code rows on game pages, also run `codes-public-select.sql`.
--
-- Requires row level security to already be enabled on `public.games` (Supabase default for new tables).
-- Do not run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` here unless you also add INSERT/UPDATE policies,
-- or existing admin writes can start failing.
--
-- If you already have a conflicting policy name, either skip this file or:
--   drop policy "Allow public select on games" on public.games;

create policy "Allow public select on games"
on public.games
for select
to anon, authenticated
using (true);

-- Writes from `/admin/add-game` still need their own INSERT policy, e.g.:
-- create policy "Authenticated insert games" on public.games
-- for insert to authenticated with (auth.uid() is not null);
