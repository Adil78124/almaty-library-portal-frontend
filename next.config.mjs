/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_URL || "http://127.0.0.1:4000"

const nextConfig = {
  /** Не бандлить Prisma в SSR-чанки Turbopack — иначе после `prisma generate` остаётся старая схема (например hoursWeekdays). */
  serverExternalPackages: ["@prisma/client", "prisma"],

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: "/auth",
        destination: `${backend}/auth`,
      },
      {
        source: "/auth/:path*",
        destination: `${backend}/auth/:path*`,
      },
      {
        source: "/users",
        destination: `${backend}/users`,
      },
      {
        source: "/users/:path*",
        destination: `${backend}/users/:path*`,
      },
      {
        source: "/api/branches",
        destination: `${backend}/branches`,
      },
      {
        source: "/api/branches/:path*",
        destination: `${backend}/branches/:path*`,
      },
      {
        source: "/api/news",
        destination: `${backend}/api/news`,
      },
      {
        source: "/api/news/:path*",
        destination: `${backend}/api/news/:path*`,
      },
      {
        source: "/api/events",
        destination: `${backend}/api/events`,
      },
      {
        source: "/api/events/:path*",
        destination: `${backend}/api/events/:path*`,
      },
      {
        source: "/api/site-settings",
        destination: `${backend}/api/site-settings`,
      },
      {
        source: "/api/upload",
        destination: `${backend}/api/upload`,
      },
      {
        source: "/api/staff",
        destination: `${backend}/staff`,
      },
      {
        source: "/api/staff/:path*",
        destination: `${backend}/staff/:path*`,
      },
    ]
  },
}

export default nextConfig
