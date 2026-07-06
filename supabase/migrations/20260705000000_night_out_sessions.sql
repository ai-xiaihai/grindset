create table night_out_sessions (
  id uuid primary key,
  user_id uuid references profiles(id) on delete cascade,
  duration_seconds integer not null,
  cig_count integer not null default 0,
  max_bac double precision,
  created_at timestamptz default now()
);

alter table night_out_sessions enable row level security;

create policy "users can insert own night out sessions"
  on night_out_sessions for insert
  with check (auth.uid() = user_id);

create policy "users can read own night out sessions"
  on night_out_sessions for select
  using (auth.uid() = user_id);

create index on night_out_sessions (user_id);

grant select, insert on public.night_out_sessions to authenticated;
grant all on public.night_out_sessions to service_role;
