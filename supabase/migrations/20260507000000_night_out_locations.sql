create table night_out_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  session_id uuid not null,
  latitude double precision not null,
  longitude double precision not null,
  recorded_at timestamptz default now()
);

alter table night_out_locations enable row level security;

create policy "users can insert own locations"
  on night_out_locations for insert
  with check (auth.uid() = user_id);

create policy "users can read own locations"
  on night_out_locations for select
  using (auth.uid() = user_id);

create index on night_out_locations (user_id, session_id);
