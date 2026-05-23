/** @type {import('next').NextConfig} */
const configuredBackend =
  process.env.BACKEND_URL ||
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL
const normalizedBackend = configuredBackend?.trim().replace(/\/$/, "")

if (process.env.NODE_ENV === "production") {
  if (!normalizedBackend) {
    throw new Error(
      "BACKEND_URL is not set in production. Set BACKEND_URL/API_INTERNAL_URL/NEXT_PUBLIC_API_URL to the backend origin."
    )
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(normalizedBackend)) {
    throw new Error(
      `Backend URL points to localhost in production: ${normalizedBackend}. Set BACKEND_URL to the deployed backend origin.`
    )
  }
}

const backend = normalizedBackend || "http://127.0.0.1:4000"

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
