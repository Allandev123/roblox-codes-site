import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Match Next.js env file precedence (.env.local overrides .env in development).
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thumbnails.roblox.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
