// Tells Google this is a real local business serving specific Dallas
// neighborhoods — the backbone of showing up in "mulch delivery near me"
// searches. Rendered once site-wide from the root layout.

const AREAS = [
  "Dallas",
  "University Park",
  "Highland Park",
  "Farmers Branch",
  "Addison",
  "Carrollton",
  "Irving",
  "Coppell",
  "Richardson",
  "Garland",
  "Grand Prairie",
  "Plano",
  "Grapevine",
  "Lewisville",
  "Flower Mound",
  "Duncanville",
  "DeSoto",
  "Cedar Hill",
  "Mesquite",
];

export default function BusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": "https://prestonhollowmulchachos.com/#business",
    name: "Preston Hollow Mulchachos",
    description:
      "Bulk mulch, decomposed granite, and river rock delivered and spread across the Dallas–Fort Worth metroplex.",
    url: "https://prestonhollowmulchachos.com",
    telephone: "214-708-7503",
    priceRange: "$$",
    image: "https://prestonhollowmulchachos.com/logo.png",
    areaServed: AREAS.map((name) => ({ "@type": "City", name })),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dallas",
      addressRegion: "TX",
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
