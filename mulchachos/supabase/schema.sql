-- Run this once in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Who is allowed to write. Add yourself, then anyone else who needs access.
-- ---------------------------------------------------------------------------
create table if not exists admins (
  email text primary key,
  created_at timestamptz not null default now()
);

-- insert into admins (email) values ('you@prestonhollowmulchachos.com');

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = auth.jwt() ->> 'email');
$$;

-- ---------------------------------------------------------------------------
-- Materials
-- ---------------------------------------------------------------------------
create table if not exists materials (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  blurb            text not null default '',
  category         text not null default 'mulch' check (category in ('mulch','rock','other')),
  swatch           text not null default '#4A3728',   -- fallback chip color
  image_url        text,                              -- photo of real yard stock
  cost_per_yard    numeric(10,2) not null default 0,
  instant_bookable boolean not null default true,
  active           boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists materials_active_sort on materials (active, sort_order);

-- ---------------------------------------------------------------------------
-- Pricing settings. Exactly one row, id = 1.
-- ---------------------------------------------------------------------------
create table if not exists pricing_settings (
  id                       int primary key default 1 check (id = 1),
  labor_per_yard           numeric(10,2) not null default 45,
  delivery_fee             numeric(10,2) not null default 75,
  yards_per_trip           numeric(10,2) not null default 6,
  minimum_job              numeric(10,2) not null default 275,
  limited_access_surcharge numeric(10,2) not null default 18,
  edging_per_foot          numeric(10,2) not null default 2.25,
  instant_book_yard_cap    numeric(10,2) not null default 12,
  deposit_rate             numeric(4,3)  not null default 0.5,
  service_zips             text[]        not null default array[
    '75225','75229','75230','75209','75220','75205','75219','75231','75240'
  ],
  updated_at               timestamptz not null default now()
);

insert into pricing_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row level security. Public reads active materials. Only admins write.
-- ---------------------------------------------------------------------------
alter table materials        enable row level security;
alter table pricing_settings enable row level security;
alter table admins           enable row level security;

drop policy if exists materials_public_read on materials;
create policy materials_public_read on materials
  for select using (active = true or is_admin());

drop policy if exists materials_admin_write on materials;
create policy materials_admin_write on materials
  for all using (is_admin()) with check (is_admin());

drop policy if exists pricing_public_read on pricing_settings;
create policy pricing_public_read on pricing_settings for select using (true);

drop policy if exists pricing_admin_write on pricing_settings;
create policy pricing_admin_write on pricing_settings
  for update using (is_admin()) with check (is_admin());

drop policy if exists admins_self_read on admins;
create policy admins_self_read on admins for select using (is_admin());

-- ---------------------------------------------------------------------------
-- Image storage. Public read so the marketing pages can render photos.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('material-photos', 'material-photos', true)
on conflict (id) do nothing;

drop policy if exists photos_public_read on storage.objects;
create policy photos_public_read on storage.objects
  for select using (bucket_id = 'material-photos');

drop policy if exists photos_admin_write on storage.objects;
create policy photos_admin_write on storage.objects
  for insert with check (bucket_id = 'material-photos' and is_admin());

drop policy if exists photos_admin_delete on storage.objects;
create policy photos_admin_delete on storage.objects
  for delete using (bucket_id = 'material-photos' and is_admin());

-- ---------------------------------------------------------------------------
-- Seed from the hardcoded catalog so nothing breaks on first deploy.
-- ---------------------------------------------------------------------------
insert into materials (slug, name, blurb, category, swatch, cost_per_yard, instant_bookable, sort_order) values
  ('black-hardwood',     'Black hardwood',     'Highest contrast against green. The Preston Hollow default.', 'mulch', '#1C1917', 38, true,  1),
  ('native-hardwood',    'Native hardwood',    'Undyed, breaks down into the bed. Best value per yard.',      'mulch', '#4A3728', 30, true,  2),
  ('brown-dyed',         'Brown dyed',         'Holds color about a season longer than native.',              'mulch', '#6B4A2F', 36, true,  3),
  ('cedar',              'Cedar',              'Lighter tone, and it keeps insects out of the beds.',          'mulch', '#A87F52', 46, true,  4),
  ('decomposed-granite', 'Decomposed granite', 'Paths and dry beds. Compacts to a firm walking surface.',     'rock',  '#C4A57B', 62, false, 5),
  ('river-rock',         'River rock',         'Drainage and borders. Priced by size and haul distance.',     'rock',  '#8C8A82', 95, false, 6)
on conflict (slug) do nothing;
