-- Heavy duty weed fabric. Run after tiers-and-inquiries.sql.
--
-- Priced by square foot, on a sliding scale. The engine never charges more
-- than a larger job would cost, which removes the cliff at every threshold
-- and happens to match reality: rolls are bought whole, so a 900 sqft job
-- consumes the same roll as a 1000 sqft one.

create table if not exists fabric_tiers (
  id            serial primary key,
  min_sqft      integer not null unique,
  price_per_sqft numeric(10,4) not null
);

delete from fabric_tiers;

insert into fabric_tiers (min_sqft, price_per_sqft) values
  (0,    1.00),
  (200,  0.85),
  (500,  0.65),
  (1000, 0.50);

alter table fabric_tiers enable row level security;

drop policy if exists fabric_public_read on fabric_tiers;
create policy fabric_public_read on fabric_tiers for select using (true);

drop policy if exists fabric_admin_write on fabric_tiers;
create policy fabric_admin_write on fabric_tiers
  for all using (is_admin()) with check (is_admin());
