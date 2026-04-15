-- One-time cleanup: remove via.placeholder.com URLs from `games`.
-- Run in Supabase SQL editor after deploying app changes.

update public.games
set image = 'https://tr.rbxcdn.com/default-thumbnail.png'
where image ilike '%via.placeholder.com%';

-- Prefer the row's icon (`image`) when the wide banner was a placeholder.
update public.games
set banner_image = image
where banner_image ilike '%via.placeholder.com%';
