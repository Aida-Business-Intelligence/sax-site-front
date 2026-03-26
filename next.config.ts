import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STANDALONE_BUILD === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      // DigitalOcean Spaces CDN — imagens públicas (logo, favicon, parceiros, imóveis)
      {
        protocol: "https",
        hostname: "arvis.sfo3.digitaloceanspaces.com",
        pathname: "/**",
      },
      // Dev / local contra o backend direto
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev-sax.arvis.com.br",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api-sax.arvis.com.br",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
