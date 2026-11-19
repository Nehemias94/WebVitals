import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: `use cache` + cacheTag/cacheLife para lecturas cacheadas
  // y streaming con <Suspense> para datos dinámicos (cookies, searchParams).
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // La API de Laravel suele correr en 127.0.0.1 durante el desarrollo y sirve
    // las imágenes desde /storage. Next 16 bloquea IPs locales por defecto.
    dangerouslyAllowLocalIP: process.env.ALLOW_LOCAL_IMAGES !== "false",
  },
  async redirects() {
    return [{ source: "/", destination: "/products", permanent: false }];
  },
};

export default nextConfig;
