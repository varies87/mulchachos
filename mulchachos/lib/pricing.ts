import { DiscountTier, FabricTier, Material, PricingSettings } from "./materials";

// A cubic yard is 27 cubic feet. Spread D inches deep over A square feet:
//   yards = A * (D / 12) / 27  =  A * D / 324
export function yardsNeeded(squareFeet: number, depthInches: number): number {
  if (!squareFeet || !depthInches) return 0;
  return (squareFeet * depthInches) / 324;
}

// Round up to the quarter yard. You cannot buy a partial scoop.
export function billableYards(raw: number): number {
  return Math.ceil(raw * 4) / 4;
}

/** Best flat discount the yardage qualifies for, in dollars per yard. */
export function tierFor(
  tiers: DiscountTier[],
  category: string,
  yards: number
): DiscountTier | null {
  const eligible = tiers
    .filter((t) => t.category === category && yards >= t.min_yards)
    .sort((a, b) => b.min_yards - a.min_yards);
  return eligible[0] ?? null;
}

/** The next tier up, so the estimator can nudge toward it. */
export function nextTier(
  tiers: DiscountTier[],
  category: string,
  yards: number
): DiscountTier | null {
  const ahead = tiers
    .filter((t) => t.category === category && yards < t.min_yards)
    .sort((a, b) => a.min_yards - b.min_yards);
  return ahead[0] ?? null;
}

export function minYardsFor(s: PricingSettings, category: string): number {
  return category === "mulch" ? s.mulch_min_yards : s.rock_min_yards;
}

/**
 * Weed fabric price. Takes the cheapest total available at any tier, so the
 * bill never drops when the area grows — no cliff at 199 vs 200 sqft.
 */
export function fabricPrice(tiers: FabricTier[], squareFeet: number): number {
  if (squareFeet <= 0 || tiers.length === 0) return 0;
  return Math.min(
    ...tiers.map((t) => Math.max(squareFeet, t.min_sqft) * t.price_per_sqft)
  );
}

export interface QuoteInput {
  material: Material;
  settings: PricingSettings;
  tiers: DiscountTier[];
  fabricTiers: FabricTier[];
  weedFabric: boolean;
  squareFeet: number;
  depthInches: number;
  zip: string;
  limitedAccess: boolean;
  edgingFeet: number;
}

export interface LineItem {
  label: string;
  detail?: string;
  amount: number;
}

export interface Quote {
  rawYards: number;
  yards: number;
  billedYards: number;
  minimumYards: number;
  minimumYardsApplied: boolean;
  ratePerYard: number;
  discountPerYard: number;
  savings: number;
  tier: DiscountTier | null;
  upcoming: DiscountTier | null;
  trips: number;
  lineItems: LineItem[];
  subtotal: number;
  total: number;
  minimumApplied: boolean;
  deposit: number;
  instantBookable: boolean;
  reviewReasons: string[];
}

export function buildQuote(input: QuoteInput): Quote {
  const { material, settings, tiers, fabricTiers, weedFabric, squareFeet,
          depthInches, zip, limitedAccess, edgingFeet } = input;
  const s = settings;

  const rawYards = yardsNeeded(squareFeet, depthInches);
  const yards = billableYards(rawYards);

  // Small jobs are not worth a delivery, so a minimum applies.
  const minimumYards = minYardsFor(s, material.category);
  const minimumYardsApplied = yards > 0 && yards < minimumYards;
  const billedYards = minimumYardsApplied ? minimumYards : yards;

  // Flat dollars off the per-yard rate, never a percentage.
  const tier = tierFor(tiers, material.category, billedYards);
  const upcoming = nextTier(tiers, material.category, billedYards);
  const discountPerYard = tier ? tier.discount_per_yard : 0;
  const ratePerYard = Math.max(0, material.cost_per_yard - discountPerYard);
  const savings = discountPerYard * billedYards;
  const trips = Math.max(1, Math.ceil(billedYards / (s.yards_per_trip || 6)));

  const lineItems: LineItem[] = [];

  // Material rates are all-in: delivery and spreading are included. The
  // labour and delivery lines only appear if those settings are non-zero,
  // so nothing shows as a $0 line item.
  if (yards > 0) {
    lineItems.push({
      label: material.name,
      detail: `${billedYards.toFixed(2)} yd³ at $${ratePerYard}/yd³, delivered and spread`,
      amount: billedYards * ratePerYard,
    });

    if (weedFabric) {
      const fab = fabricPrice(fabricTiers, squareFeet);
      lineItems.push({
        label: "Heavy duty weed fabric",
        detail: `${squareFeet.toLocaleString()} sq ft at $${(fab / squareFeet).toFixed(2)}/sq ft`,
        amount: fab,
      });
    }

    if (s.labor_per_yard > 0) {
      lineItems.push({
        label: "Spreading",
        detail: `${yards.toFixed(2)} yd³ at $${s.labor_per_yard}/yd³`,
        amount: yards * s.labor_per_yard,
      });
    }

    if (s.delivery_fee > 0) {
      lineItems.push({
        label: "Delivery",
        detail: trips > 1 ? `${trips} trips` : "1 trip",
        amount: trips * s.delivery_fee,
      });
    }
  }

  if (limitedAccess && billedYards > 0) {
    lineItems.push({
      label: "Limited access",
      detail: "Wheelbarrow haul from the street",
      amount: billedYards * s.limited_access_surcharge,
    });
  }

  if (edgingFeet > 0) {
    lineItems.push({
      label: "Edging and weed pull",
      detail: `${edgingFeet} ft of bed edge`,
      amount: edgingFeet * s.edging_per_foot,
    });
  }

  const subtotal = lineItems.reduce((sum, l) => sum + l.amount, 0);
  const minimumApplied = subtotal > 0 && subtotal < s.minimum_job;
  const total = minimumApplied ? s.minimum_job : subtotal;

  // Cases where quoting sight-unseen would lose money or force a callback.
  const reviewReasons: string[] = [];
  if (!material.instant_bookable) {
    reviewReasons.push(`${material.name} is priced by load and haul distance`);
  }
  if (billedYards > s.instant_book_yard_cap) {
    reviewReasons.push(`Jobs over ${s.instant_book_yard_cap} yd³ get walked first`);
  }
  if (zip.length === 5 && !s.service_zips.includes(zip)) {
    reviewReasons.push("Outside the standard service area");
  }

  return {
    rawYards,
    yards,
    billedYards,
    minimumYards,
    minimumYardsApplied,
    ratePerYard,
    discountPerYard,
    savings,
    tier,
    upcoming,
    trips,
    lineItems,
    subtotal,
    total,
    minimumApplied,
    deposit: Math.round(total * s.deposit_rate),
    instantBookable: reviewReasons.length === 0 && billedYards > 0,
    reviewReasons,
  };
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
