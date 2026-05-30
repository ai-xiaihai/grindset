-- Explicit Data API grants. Required for new Supabase projects from 2026-05-30
-- and for all projects from 2026-10-30. Without these, supabase-js / PostgREST
-- returns 42501 when hitting tables in `public`.
-- https://github.com/orgs/supabase/discussions/45329

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select, insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;

grant select, insert on public.night_out_locations to authenticated;
grant all on public.night_out_locations to service_role;

grant execute on function public.search_users_by_email(text) to authenticated;
grant execute on function public.get_follow_counts(uuid) to authenticated;
