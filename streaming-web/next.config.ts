import type { NextConfig } from "next";

/**
 * Image hosts are driven by NEXT_PUBLIC_IMAGE_HOSTS so the backend's CDN can be
 * allowed without touching code. Hosts not listed here still render, just
 * without Next's optimiser (see src/components/ui/Artwork.tsx).
 */
const imageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
};

export default nextConfig;
