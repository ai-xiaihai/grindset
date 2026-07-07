-- The client now reconciles a dangling session on next app launch, using the
-- last known point's timestamp as the close time. This job is now just a
-- backstop for sessions where the app is never reopened again (uninstalled,
-- abandoned), so it can run less often and with a much longer window.
select cron.schedule(
  'close-stale-night-out-sessions',
  '0 * * * *',
  $$
  update night_out_locations
  set ended_at = stale.last_recorded_at
  from (
    select session_id, max(recorded_at) as last_recorded_at
    from night_out_locations
    where ended_at is null
    group by session_id
    having max(recorded_at) < now() - interval '24 hours'
  ) as stale
  where night_out_locations.session_id = stale.session_id
    and night_out_locations.ended_at is null;
  $$
);
