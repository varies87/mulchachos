import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans, JetBrains_Mono } from "next/font/google";
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
    "Bulk mulch, decomposed granite, and river rock delivered and spread across Preston Hollow, University Park, and North Dallas. Price your beds in under a minute.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Preston Hollow Mulchachos",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-[var(--paper)] text-[var(--ink)] font-[family-name:var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
