import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // As fontes do selo (next/og) são lidas do disco; garante que vão para o deploy.
  outputFileTracingIncludes: {
    "/api/badge/[id]": ["./src/assets/fonts/**"],
    "/selo/[id]": ["./src/assets/fonts/**"],
    "/opengraph-image": ["./src/assets/fonts/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
