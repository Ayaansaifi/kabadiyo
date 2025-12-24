import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all images (e.g., from Google auth)
      },
    ],
    formats: ['image/avif', 'image/webp'], // Use modern formats
    minimumCacheTTL: 60,
  },
  compress: true, // Enable Gzip compression
  poweredByHeader: false, // Security: Remove X-Powered-By
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // Skip TS errors during Vercel builds
  },
  experimental: {
    // optimizeCss: true, // Enable if 'critical' package is installed
    // scrollRestoration: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
