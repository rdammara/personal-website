import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A fully static site in out/, served by Cloudflare Pages. The content it shows is fetched
  // beforehand by scripts/build-content.mjs; the ask bar is a Pages Function (functions/).
  output: 'export',
  // No image server on static hosting: photos are served as they are
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
  },
};

export default nextConfig;
