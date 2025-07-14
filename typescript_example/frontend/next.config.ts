import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://server:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
