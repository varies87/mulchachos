-- Customer-facing improvements. Run once in the Supabase SQL editor,
-- after weed-fabric.sql. Adds three things:
--
--   1. estimate_requests  — the /request-estimate submissions, with photos
--   2. testimonials       — real customer quotes, managed in the admin panel
--   3. job_photos         — real delivery photos for the home page gallery
--
-- Testimonials and job_photos ship EMPTY on purpose. They are social proof,
-- and social proof only works if it is true. Add real ones in the admin panel.
-- Both sections stay hidden on the site until there is something real to show.

-- ---------------------------------------------------------------------------
-- 1. Estimate requests. The scheduling funnel the estimator CTAs point to.
--    Anyone may send one. Only admins may read or update.
-- ---------------------------------------------------------------------------
create table if not exists estimate_requests (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  contact         text not null,
  address         text,
  zip             text,
  material_slug   text,
  material_name   text,
  square_feet     numeric(10,2),
  depth_inches    numeric(10,2),
  weed_fabric     boolean not null default false,
  limited_access  boolean not null default false,
  edging          boolean not null default false,
  estimated_total numeric(10,2),
  quote_note      text,
  preferred_time  text,
  notes           text,
  photo_paths     text[] not null default '{}',
  status          text not null default 'new'
                    check (status in ('new','scheduled','quoted','closed')),
  created_at      timestamptz not null default now()
);

create index if not exists estimate_requests_recent
  on estimate_requests (status, created_at desc);

alter table estimate_requests enable row level security;

drop policy if exists estimate_requests_public_insert on estimate_requests;
create policy estimate_requests_public_insert on estimate_requests
  for insert with check (true);

drop policy if exists estimate_requests_admin_read on estimate_requests;
create policy estimate_requests_admin_read on estimate_requests
  for select using (is_admin());

drop policy if exists estimate_requests_admin_update on estimate_requests;
create policy estimate_requests_admin_update on estimate_requests
  for update using (is_admin()) with check (is_admin());

-- Photos a visitor uploads with a request. The bucket is PRIVATE: a visitor
-- can add a photo of their own yard, but nobody can browse the folder. The
-- admin panel reads them back through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('estimate-photos', 'estimate-photos', false)
on conflict (id) do nothing;

drop policy if exists estimate_photos_public_insert on storage.objects;
create policy estimate_photos_public_insert on storage.objects
  for insert with check (bucket_id = 'estimate-photos');

drop policy if exists estimate_photos_admin_read on storage.objects;
create policy estimate_photos_admin_read on storage.objects
  for select using (bucket_id = 'estimate-photos' and is_admin());

drop policy if exists estimate_photos_admin_delete on storage.objects;
create policy estimate_photos_admin_delete on storage.objects
  for delete using (bucket_id = 'estimate-photos' and is_admin());

-- ---------------------------------------------------------------------------
-- 2. Testimonials. Public reads the active ones, only admins write.
-- ---------------------------------------------------------------------------
create table if not exists testimonials (
  id           uuid primary key default gen_random_uuid(),
  author       text not null,
  neighborhood text,
  quote        text not null,
  rating       int not null default 5 check (rating between 1 and 5),
  sort_order   int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists testimonials_active_sort
  on testimonials (active, sort_order);

alter table testimonials enable row level security;

drop policy if exists testimonials_public_read on testimonials;
create policy testimonials_public_read on testimonials
  for select using (active = true or is_admin());

drop policy if exists testimonials_admin_write on testimonials;
create policy testimonials_admin_write on testimonials
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- 3. Job photos. Real deliveries for the home page gallery. The bucket is
--    public so the marketing pages render fast without signing every image,
--    the same way material-photos already works.
-- ---------------------------------------------------------------------------
create table if not exists job_photos (
  id            uuid primary key default gen_random_uuid(),
  image_url     text not null,
  caption       text,
  neighborhood  text,
  material_slug text,
  sort_order    int not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists job_photos_active_sort
  on job_photos (active, sort_order);

alter table job_photos enable row level security;

drop policy if exists job_photos_public_read on job_photos;
create policy job_photos_public_read on job_photos
  for select using (active = true or is_admin());

drop policy if exists job_photos_admin_write on job_photos;
create policy job_photos_admin_write on job_photos
  for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

drop policy if exists job_photos_bucket_read on storage.objects;
create policy job_photos_bucket_read on storage.objects
  for select using (bucket_id = 'job-photos');

drop policy if exists job_photos_bucket_write on storage.objects;
create policy job_photos_bucket_write on storage.objects
  for insert with check (bucket_id = 'job-photos' and is_admin());

drop policy if exists job_photos_bucket_delete on storage.objects;
create policy job_photos_bucket_delete on storage.objects
  for delete using (bucket_id = 'job-photos' and is_admin());
