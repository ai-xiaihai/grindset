drop policy "users can insert own locations" on night_out_locations;

create policy "users can insert own locations"
  on night_out_locations for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1
      from night_out_locations as existing
      where existing.session_id = night_out_locations.session_id
        and existing.ended_at is not null
    )
  );
