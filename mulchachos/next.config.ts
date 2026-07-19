import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Material photos are served from Supabase storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },

  // Old SiteGround URLs go here once you have crawled the current site.
  // async redirects() {
  //   return [{ source: "/old-page", destination: "/estimate", permanent: true }];
  // },
};

export default nextConfig;
