-- Real Mulchachos catalog. Run once in the Supabase SQL editor.
-- Replaces the six placeholder materials from schema.sql.
--
-- EVERY PRICE BELOW IS ALL-IN: material, delivery, and spreading.
-- That is why the script also zeroes labor_per_yard and delivery_fee.
-- Do not re-add them or every quote doubles up.
--
-- MULCH: sold by the 2 cu ft bag. 13.5 bags to a cubic yard, so
--   hardwood  $7.50/bag  ->  $101.25/yd
--   cedar     $8.50/bag  ->  $114.75/yd
-- Bag price stays in the blurb so customers see both.

-- Rates already include delivery and spreading.
update pricing_settings
   set labor_per_yard = 0,
       delivery_fee = 0,
       updated_at = now()
 where id = 1;

delete from materials;

insert into materials
  (slug, name, blurb, category, swatch, image_url,
   cost_per_yard, instant_bookable, active, sort_order)
values
  -- ---------------------------------------------------------------- mulch
  ('hardwood-mulch', 'Hardwood mulch',
   'Dark and fine textured. Breaks down into the bed and feeds it. Also sold by the bag at $7.50 for 2 cu ft.',
   'mulch', '#584C39', '/materials/hardwood-mulch.jpg',
   101.25, true, true, 10),

  ('cedar-mulch', 'Cedar mulch',
   'Warm red tone that holds colour, and it keeps insects out of the beds. Also sold by the bag at $8.50 for 2 cu ft.',
   'mulch', '#855E47', '/materials/cedar-mulch.jpg',
   114.75, true, true, 20),

  -- --------------------------------------------------- everyday aggregate
  ('utility-limestone', 'Utility limestone',
   'Pale grey base rock for driveways, pads, and drainage. The workhorse.',
   'rock', '#848075', '/materials/utility-limestone.jpg',
   340, true, true, 30),

  ('gold-decomposed-granite', 'Gold decomposed granite',
   'Compacts to a firm walking surface. Paths, seating areas, dry beds.',
   'rock', '#A47D56', '/materials/gold-decomposed-granite.jpg',
   375, true, true, 40),

  ('pea-gravel', 'Pea gravel',
   'Small rounded tan stone. Easy underfoot, good for paths and play areas.',
   'rock', '#A49078', '/materials/pea-gravel.jpg',
   400, true, true, 50),

  ('granite-chips', 'Granite chips',
   'Angular pink and grey granite, 1 inch minus. Holds its place on a slope.',
   'rock', '#959191', '/materials/granite-chips.jpg',
   450, true, true, 60),

  ('black-star-gravel', 'Black star gravel',
   'Crushed dark grey basalt. Available in 3/8 inch, 5/8 inch, and 1.5 to 4 inch.',
   'rock', '#797368', '/materials/black-star-gravel.jpg',
   600, true, true, 70),

  ('salt-and-pepper-river-rock', 'Salt and pepper river rock',
   'Rounded speckled granite. Available in 1 inch or less, 1 to 2 inch, and 2 to 4 inch.',
   'rock', '#8F8F8A', '/materials/salt-and-pepper-river-rock.jpg',
   600, true, true, 80),

  ('arizona-cobble', 'Arizona cobble',
   'Warm mixed browns and greys. Available in 1 inch or less, 1 to 2 inch, and 2 to 4 inch.',
   'rock', '#766C63', '/materials/arizona-cobble.jpg',
   650, true, true, 90),

  -- ------------------------------------------------------------- decorative
  ('white-marble-chips', 'White marble chips',
   'Bright white angular marble, 1/2 to 1.5 inch. High contrast against green.',
   'rock', '#C2C2C2', '/materials/white-marble-chips.jpg',
   750, true, true, 100),

  ('mountain-berry-pebbles', 'Mountain berry pebbles',
   'Soft pinks, mauves, and cream. Available in 7/8 inch and 2 to 4 inch.',
   'rock', '#80736F', '/materials/mountain-berry-pebbles.jpg',
   1500, false, true, 110),

  ('black-mexican-beach-pebbles', 'Black Mexican beach pebbles',
   'Smooth charcoal stone that turns near black when wet. Available in 1 inch or less, 1 to 2 inch, and 2 to 4 inch.',
   'rock', '#636771', '/materials/black-mexican-beach-pebbles.jpg',
   1500, false, true, 120),

  ('santorini-river-rock', 'Santorini river rock',
   'Bright white rounded stone. Available in 7/8 inch, 1.5 inch, 2 to 3 inch, and 3 to 5 inch.',
   'rock', '#9A9EA3', '/materials/santorini-river-rock.jpg',
   1950, false, true, 130);
