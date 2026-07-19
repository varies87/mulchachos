# Mulchachos — home, estimator, admin

Next.js App Router + Tailwind + Supabase. Materials and pricing live in the
database, not in code. Nothing on this site requires a deploy to change a price.

## Setup

1. `npm i @supabase/ssr @supabase/supabase-js`
2. Run `supabase/schema.sql` in the Supabase SQL editor. It creates the tables,
   the storage bucket, the RLS policies, and seeds the six starting materials.
3. Add yourself to the allowlist:
   `insert into admins (email) values ('you@prestonhollowmulchachos.com');`
4. Environment variables, in `.env.local` and in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
5. In Supabase Auth settings, add your production URL and
   `https://prestonhollowmulchachos.com/admin` as redirect URLs.

## Using the admin panel

`/admin` — sign in with a magic link to the email on the allowlist.

**Pricing** covers labor per yard, delivery, job minimum, access surcharge,
edging, the instant-book yard cap, deposit rate, and the service ZIP list.
Saving pushes it live immediately.

**Materials** lists everything, live and hidden. Each card edits name, price per
cubic yard, description, category, display order, and a photo. Two checkboxes
carry real weight:

- *Show on the site* — hides a material without deleting it. Use this for
  seasonal stock rather than deleting, so old quotes still resolve.
- *Can be booked without a site visit* — unchecked sends every quote using that
  material to a written estimate instead of a book button. This is the money
  switch. Leave it off for anything priced by load or haul distance.

Photos upload to the `material-photos` bucket. If a material has no photo, the
swatch falls back to the flat color you pick, so a newly added material still
looks right before you photograph the pile.

## Security

Three layers, and the middle one is the one that matters:

1. `middleware.ts` refreshes the session on `/admin/*`.
2. `app/admin/layout.tsx` redirects anyone not signed in, and shows a dead end to
   anyone signed in but not in the `admins` table.
3. Row level security enforces the same allowlist at the database, so a leaked
   anon key still cannot write. The anon key is public by design — RLS is what
   protects you, which is why the policies are not optional.

## Caching

Public pages use `revalidate = 3600`, and every admin write calls
`revalidatePath` on `/` and `/estimate`. Edits appear right away; the hourly
window is only a backstop.

## Still to do

1. Real job photos in the `RECENT` block on the home page. That section will
   convert harder than any copy on the site.
2. `/request-estimate` — form with photo upload, then reuse the Harry's List PDF
   quote builder to return an itemized quote.
3. `/book` — Stripe deposit at the rate set in the admin panel, balance on
   completion. Separate Stripe account under the Mulchachos EIN.
4. Per-material and per-ZIP landing pages for search and for the Meta ads.
5. 301 redirects in `next.config.js` for every URL SiteGround currently serves.
   Crawl and save that list before cancelling the host.

## One warning

The seeded prices are the placeholders from the first pass, and they are not
your real numbers. Now that they are editable in the panel, the first thing to
do after deploying is open `/admin` and correct every one of them against your
actual invoices.
