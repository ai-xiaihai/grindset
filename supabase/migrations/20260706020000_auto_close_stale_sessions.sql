select cron.schedule(
  'close-stale-night-out-sessions',
  '*/15 * * * *',
  $$
  update night_out_locations
  set ended_at = stale.last_recorded_at
  from (
    select session_id, max(recorded_at) as last_recorded_at
    from night_out_locations
    where ended_at is null
    group by session_id
    having max(recorded_at) < now() - interval '1 hour'
  ) as stale
  where night_out_locations.session_id = stale.session_id
    and night_out_locations.ended_at is null;
  $$
);
