-- Run once in the Supabase SQL editor, after seed-materials.sql.

-- ---------------------------------------------------------------------------
-- 1. Mulch goes to a flat $120/yd, all in.
-- ---------------------------------------------------------------------------
update materials set cost_per_yard = 120 where category = 'mulch';

-- ---------------------------------------------------------------------------
-- 2. Minimum job size, in yards, per category.
-- ---------------------------------------------------------------------------
alter table pricing_settings
  add column if not exists mulch_min_yards numeric(10,2) not null default 4,
  add column if not exists rock_min_yards  numeric(10,2) not null default 0;

-- ---------------------------------------------------------------------------
-- 3. Volume tiers. Discount is a flat dollar amount off the per-yard rate,
--    NOT a percentage. A percentage would cost far more margin on premium
--    stone, which already runs at a thinner margin than commodity rock.
-- ---------------------------------------------------------------------------
create table if not exists discount_tiers (
  id                serial primary key,
  category          text not null check (category in ('mulch','rock')),
  min_yards         numeric(10,2) not null,
  discount_per_yard numeric(10,2) not null,
  unique (category, min_yards)
);

delete from discount_tiers;

-- Rock only. Mulch stays flat: a Lowe's drop costs $80 at any size, so
-- bigger mulch jobs are not meaningfully cheaper to run.
insert into discount_tiers (category, min_yards, discount_per_yard) values
  ('rock',  5, 20),
  ('rock', 10, 35),
  ('rock', 20, 50);

alter table discount_tiers enable row level security;

drop policy if exists tiers_public_read on discount_tiers;
create policy tiers_public_read on discount_tiers for select using (true);

drop policy if exists tiers_admin_write on discount_tiers;
create policy tiers_admin_write on discount_tiers
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- 4. Inquiries from the estimator.
-- ---------------------------------------------------------------------------
create table if not exists inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  contact     text not null,
  message     text not null,
  quote_note  text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists inquiries_recent on inquiries (handled, created_at desc);

alter table inquiries enable row level security;

-- Anyone may send one. Only admins may read or update them.
drop policy if exists inquiries_public_insert on inquiries;
create policy inquiries_public_insert on inquiries
  for insert with check (true);

drop policy if exists inquiries_admin_read on inquiries;
create policy inquiries_admin_read on inquiries
  for select using (is_admin());

drop policy if exists inquiries_admin_update on inquiries;
create policy inquiries_admin_update on inquiries
  for update using (is_admin()) with check (is_admin());
