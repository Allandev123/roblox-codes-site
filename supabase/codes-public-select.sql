-- Public read on `codes` (game detail pages use the anon key on the server).
-- Run in Supabase: Dashboard → SQL → New query → Run.
--
-- Expected columns (app maps `reward`, or `description` if `reward` is null):
--   id, game_id → public.games.id, code, reward
--
-- If a policy with this name already exists:
--   drop policy "Allow public select on codes" on public.codes;

create policy "Allow public select on codes"
on public.codes
for select
to anon, authenticated
using (true);
