import type { MetadataRoute } from "next";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";

export const dynamic = "force-dynamic";

const BASE = "https://prestonhollowmulchachos.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/estimate",
    "/materials",
    "/about",
    "/request-estimate",
  ].map((path) => ({
    url: BASE + path,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [materials, settings] = await Promise.all([
      getActiveMaterials(),
      getPricingSettings(),
    ]);

    const materialPages: MetadataRoute.Sitemap = materials.map((m) => ({
      url: `${BASE}/materials/${m.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const zipPages: MetadataRoute.Sitemap = settings.service_zips.map((z) => ({
      url: `${BASE}/delivery/${z}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticPages, ...materialPages, ...zipPages];
  } catch {
    return staticPages;
  }
}
