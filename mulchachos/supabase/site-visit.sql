-- Customer asked for a free on-site estimate instead of (or as well as)
-- using their own measurements. Applied to production on 2026-11-23.
alter table estimate_requests add column if not exists site_visit boolean not null default false;
