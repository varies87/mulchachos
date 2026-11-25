import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import MetaPixel from "@/components/MetaPixel";
import { SpeedInsights } from "@vercel/speed-insights/next";
import BusinessSchema from "@/components/BusinessSchema";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "800"],
});

const body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

// Measurements are the product. They get their own face.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prestonhollowmulchachos.com"),
  title: {
    default: "Preston Hollow Mulchachos — mulch and rock, delivered and spread",
    template: "%s | Preston Hollow Mulchachos",
  },
  description:
    "Bulk mulch, decomposed granite, and river rock delivered and spread across Dallas and nearby cities. Get an estimate online in about a minute.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Preston Hollow Mulchachos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preston Hollow Mulchachos: mulch and rock, delivered and spread",
    description:
      "Get an estimate online. Bulk mulch and rock delivered and spread across Dallas.",
  },
};

// Mobile-first: fit under the notch, tint the browser chalk to match the brand,
// and lock zoom so taps and swipes never accidentally zoom the page.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#B7655D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-[var(--paper)] text-[var(--ink)] font-[family-name:var(--font-body)] antialiased">
        <BusinessSchema />
        {children}
        <Analytics />
        <MetaPixel />
        <SpeedInsights />
      </body>
    </html>
  );
}
