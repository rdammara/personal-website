import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .next/standalone gets only the files the running site needs (~150 MB instead of the
  // ~1 GB node_modules); deploy.sh runs the site and the sync scripts from there
  output: 'standalone',
  // Files the build's tracing can't see, because nothing a page imports reaches them
  outputFileTracingIncludes: {
    '/*': [
      // pdf.js loads its worker file by path at runtime
      './node_modules/pdfjs-dist/legacy/build/**',
      // The sync scripts run from the standalone folder too
      './scripts/**',
      './node_modules/@notionhq/client/**',
    ],
  },
  // Uploads and synced images are data, not code: the running site reads them from
  // shared storage, so the build must not copy whatever is in storage/ at build time
  outputFileTracingExcludes: {
    '/*': ['./storage/**'],
  },
  // pdf.js loads its worker file at runtime, which breaks if it is bundled
  serverExternalPackages: ['pdfjs-dist'],
  env: {
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
  },
};

export default nextConfig;
