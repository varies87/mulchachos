import MaterialSwatch from "@/components/MaterialSwatch";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";

// Revalidate hourly; admin saves call revalidatePath for anything sooner.
export const revalidate = 3600;

const STEPS = [
  {
    n: "01",
    title: "Measure your beds",
    body: "Length times width, in feet. Rough is fine — the estimator rounds to the quarter yard and we confirm on site.",
  },
  {
    n: "02",
    title: "We haul it in",
    body: "Delivery lands the morning of the job. Nothing sits in your driveway overnight.",
  },
  {
    n: "03",
    title: "We spread and edge",
    body: "Even three-inch depth, clean bed lines, walks blown off. You come home and it is done.",
  },
];

const RECENT = [
  { area: "Preston Hollow", detail: "14 yd³ black hardwood, front and side beds" },
  { area: "University Park", detail: "6 yd³ cedar, raised vegetable boxes" },
  { area: "Bluffview", detail: "9 yd³ decomposed granite, side yard path" },
];

export default async function Home() {
  const [materials, settings] = await Promise.all([
    getActiveMaterials(),
    getPricingSettings(),
  ]);

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight"
