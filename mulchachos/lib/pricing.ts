import { Material, PricingSettings } from "./materials";

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

export interface QuoteInput {
  material: Material;
  settings: PricingSettings;
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
  const { material, settings, squareFeet, depthInches, zip, limitedAccess, edgingFeet } = input;
  const s = settings;

  const rawYards = yardsNeeded(squareFeet, depthInches);
  const yards = billableYards(rawYards);
  const trips = Math.max(1, Math.ceil(yards / (s.yards_per_trip || 6)));

  const lineItems: LineItem[] = [];

  // Material rates are all-in: delivery and spreading are included. The
  // labour and delivery lines only appear if those settings are non-zero,
  // so nothing shows as a $0 line item.
  if (yards > 0) {
    lineItems.push({
      label: material.name,
      detail: `${yards.toFixed(2)} yd³ at $${material.cost_per_yard}/yd³, delivered and spread`,
      amount: yards * material.cost_per_yard,
    });

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

  if (limitedAccess && yards > 0) {
    lineItems.push({
      label: "Limited access",
      detail: "Wheelbarrow haul from the street",
      amount: yards * s.limited_access_surcharge,
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
  if (yards > s.instant_book_yard_cap) {
    reviewReasons.push(`Jobs over ${s.instant_book_yard_cap} yd³ get walked first`);
  }
  if (zip.length === 5 && !s.service_zips.includes(zip)) {
    reviewReasons.push("Outside the standard service area");
  }

  return {
    rawYards,
    yards,
    trips,
    lineItems,
    subtotal,
    total,
    minimumApplied,
    deposit: Math.round(total * s.deposit_rate),
    instantBookable: reviewReasons.length === 0 && yards > 0,
    reviewReasons,
  };
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
