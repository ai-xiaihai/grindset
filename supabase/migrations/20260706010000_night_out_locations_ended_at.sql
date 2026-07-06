alter table night_out_locations add column ended_at timestamptz;

create policy "users can update own locations"
  on night_out_locations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant update on public.night_out_locations to authenticated;
