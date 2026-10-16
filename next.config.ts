import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf.js loads its worker file at runtime, which breaks if it is bundled
  serverExternalPackages: ['pdfjs-dist'],
  env: {
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
  },
};

export default nextConfig;
