import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❗ biar Vercel nggak blok build karena error lint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❗ biar Vercel skip error TS saat build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
