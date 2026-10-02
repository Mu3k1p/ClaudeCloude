import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Rumdul";

export const metadata: Metadata = {
  title: { default: brand, template: `%s · ${brand}` },
  description: "A personal media universe. Films, series, documentaries and photography, curated from Phnom Penh.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
