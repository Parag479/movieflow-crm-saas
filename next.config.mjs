/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_LYkqfO5VHE1x@ep-steep-band-b4jget58-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
    DIRECT_URL: process.env.DIRECT_URL || "postgresql://neondb_owner:npg_LYkqfO5VHE1x@ep-steep-band-b4jget58.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
    JWT_SECRET: process.env.JWT_SECRET || "movieflow-super-secret-jwt-key-2026-production",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "movieflow-super-secret-refresh-key-2026-production",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "MovieFlow CRM SaaS",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;
