import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // As fontes e o logo do selo (next/og) são lidos do disco; garante que vão para o deploy.
  outputFileTracingIncludes: {
    "/api/badge/[id]": ["./src/assets/fonts/**", "./src/assets/logos/**"],
    "/selo/[id]": ["./src/assets/fonts/**", "./src/assets/logos/**"],
    "/opengraph-image": ["./src/assets/fonts/**", "./src/assets/logos/**"],
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
