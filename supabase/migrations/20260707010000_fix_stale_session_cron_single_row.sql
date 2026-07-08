-- ended_at should live on the last location row of a session only, not every
-- row. The previous version of this job stamped every row for a stale
-- session; re-register it to target just the one row with the max recorded_at.
select cron.schedule(
  'close-stale-night-out-sessions',
  '0 * * * *',
  $$
  update night_out_locations
  set ended_at = stale.last_recorded_at
  from (
    select distinct on (session_id) id, session_id, recorded_at as last_recorded_at
    from night_out_locations
    where ended_at is null
    order by session_id, recorded_at desc
  ) as stale
  where night_out_locations.id = stale.id
    and night_out_locations.ended_at is null
    and stale.last_recorded_at < now() - interval '24 hours';
  $$
);
