import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ensure TypeScript errors fail the build
    ignoreBuildErrors: false,
  },
  output: 'standalone',
};

export default nextConfig;
