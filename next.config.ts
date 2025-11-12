import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Treat warnings as errors during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ensure TypeScript errors fail the build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
