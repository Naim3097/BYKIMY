import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TypeScript errors verified separately via `tsc --noEmit`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
