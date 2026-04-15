-- Seed one row so the homepage / trending list can load from Supabase.
-- Run in Supabase: Dashboard → SQL → New query → Run.
--
-- Matches columns used by /admin/add-game. If `players` is integer, use 250000 (no quotes).
-- Optional: if you have `code_count`, append to the INSERT list:
--   , code_count
-- values (... , 3);

delete from public.games
where slug = 'pet-simulator-99';

insert into public.games (
  title,
  slug,
  image,
  players,
  place_id,
  description
)
values (
  'Pet Simulator 99',
  'pet-simulator-99',
  'https://tr.rbxcdn.com/180DAY-03854432095bc666d812e935e8aa758f/512/512/Image/Png/noFilter',
  '250000',
  8737899170,
  'Seed row for frontend verification (Pet Simulator 99).'
);

-- Verify, then refresh the site:
-- select title, slug, image, players, place_id from public.games where slug = 'pet-simulator-99';
