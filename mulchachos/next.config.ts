import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF/WebP at the size each spot actually needs, instead of
    // shipping full-resolution JPGs to phones.
    formats: ["image/avif", "image/webp"],
    // Material photos are served from Supabase storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },

  // Old SiteGround URLs go here once you have crawled the current site.
  // async redirects() {
  //   return [{ source: "/old-page", destination: "/estimate", permanent: true }];
  // },
};

export default nextConfig;
