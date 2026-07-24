// One shared format for carrying an estimate from the estimator to the
// /request-estimate page. Kept small and readable so the URL a customer might
// copy or bookmark still means something: a link is a saved quote.

export interface QuoteLinkState {
  material: string; // slug
  beds: { length: number; width: number }[];
  depth: number;
  zip: string;
  fabric: boolean;
  access: boolean;
  edging: boolean;
}

const flag = (v: boolean) => (v ? "1" : "0");

/** Estimator state → query string, e.g. m=cedar-mulch&b=40x6_20x8&d=3&wf=1 */
export function encodeQuote(s: QuoteLinkState): string {
  const p = new URLSearchParams();
  p.set("m", s.material);
  const beds = s.beds
    .filter((b) => b.length > 0 && b.width > 0)
    .map((b) => `${b.length}x${b.width}`)
    .join("_");
  if (beds) p.set("b", beds);
  p.set("d", String(s.depth));
  if (s.zip) p.set("z", s.zip);
  if (s.fabric) p.set("wf", flag(s.fabric));
  if (s.access) p.set("la", flag(s.access));
  if (s.edging) p.set("ed", flag(s.edging));
  return p.toString();
}

/** Query params → estimator state, tolerant of anything missing or malformed. */
export function decodeQuote(params: Record<string, string | undefined>): QuoteLinkState {
  const beds = (params.b ?? "")
    .split("_")
    .map((pair) => {
      const [l, w] = pair.split("x").map((n) => Number(n));
      return { length: Number.isFinite(l) ? l : 0, width: Number.isFinite(w) ? w : 0 };
    })
    .filter((b) => b.length > 0 && b.width > 0);

  const depth = Number(params.d);

  return {
    material: params.m ?? "",
    beds,
    depth: [2, 3, 4].includes(depth) ? depth : 3,
    zip: (params.z ?? "").replace(/\D/g, "").slice(0, 5),
    fabric: params.wf === "1",
    access: params.la === "1",
    edging: params.ed === "1",
  };
}
