-- Allow any authenticated user to read profiles (needed for search results and follow lists)
drop policy "Users can read own profile" on profiles;

create policy "Authenticated users can read all profiles"
  on profiles for select
  using (auth.role() = 'authenticated');

-- Search users by email via auth.users (security definer to access auth schema)
create or replace function search_users_by_email(search_query text)
returns table (id uuid, name text, email text) as $$
  select p.id, p.name, au.email::text
  from auth.users au
  join profiles p on p.id = au.id
  where au.email ilike '%' || search_query || '%'
  limit 10;
$$ language sql stable security definer;

-- Follows table (asymmetric, Strava-style)
create table follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

alter table follows enable row level security;

create policy "Authenticated users can read follows"
  on follows for select
  using (auth.role() = 'authenticated');

create policy "Users can follow others"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete
  using (auth.uid() = follower_id);

-- Helper function for follow counts
create or replace function get_follow_counts(user_id uuid)
returns json as $$
  select json_build_object(
    'followers', (select count(*) from follows where following_id = user_id),
    'following', (select count(*) from follows where follower_id = user_id)
  );
$$ language sql stable security invoker;
