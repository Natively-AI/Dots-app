import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build to avoid patching issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on type errors during deployment
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
