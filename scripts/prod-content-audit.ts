import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const EXPECTED_PAGES = [
  "home",
  "about",
  "news",
  "events",
  "branches",
  "structure",
  "branches-network",
  "digital-library",
  "jubilees",
] as const

function maskDatabaseUrl(raw: string | undefined) {
  if (!raw) return null
  try {
    const u = new URL(raw)
    const auth = u.username ? `${u.username}:***@` : ""
    return `${u.protocol}//${auth}${u.host}${u.pathname}`
  } catch {
    if (raw.startsWith("file:")) return raw
    return raw.slice(0, 20) + "..."
  }
}

async function countPublicContent() {
  const [
    pageRows,
    newsTotal,
    newsPublic,
    eventsTotal,
    eventsPublic,
    branchesTotal,
    branchesPublic,
    staffTotal,
    staffActive,
    galleryTotal,
    digitalLibraryTotal,
    digitalLibraryHome,
    digitalBooksTotal,
    digitalBooksActive,
    popularBooksTotal,
    popularBooksActive,
    newArrivalsTotal,
    newArrivalsActive,
    localHistoryTotal,
    localHistoryActive,
    partnerLinksTotal,
    partnerLinksActive,
  ] = await Promise.all([
    prisma.pageContent.findMany({
      select: { page: true, updatedAt: true },
      orderBy: { page: "asc" },
    }),
    prisma.newsArticle.count(),
    prisma.newsArticle.count({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
    }),
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.branch.count(),
    prisma.branch.count({ where: { published: true } }),
    prisma.staff.count(),
    prisma.staff.count({ where: { isActive: true } }),
    prisma.galleryItem.count(),
    prisma.digitalLibraryItem.count(),
    prisma.digitalLibraryItem.count({ where: { showOnHome: true } }),
    prisma.digitalBook.count(),
    prisma.digitalBook.count({ where: { isActive: true } }),
    prisma.popularBook.count(),
    prisma.popularBook.count({ where: { isActive: true } }),
    prisma.newArrival.count(),
    prisma.newArrival.count({ where: { isActive: true } }),
    prisma.localHistoryCard.count(),
    prisma.localHistoryCard.count({ where: { isActive: true } }),
    prisma.partnerLink.count(),
    prisma.partnerLink.count({ where: { isActive: true } }),
  ])

  const presentPages = pageRows.map((p) => p.page)

  return {
    pages: {
      present: presentPages,
      missing: EXPECTED_PAGES.filter((p) => !presentPages.includes(p)),
    },
    news: { total: newsTotal, public: newsPublic },
    events: { total: eventsTotal, public: eventsPublic },
    branches: { total: branchesTotal, public: branchesPublic },
    staff: { total: staffTotal, active: staffActive },
    gallery: { total: galleryTotal },
    digitalLibraryItems: {
      total: digitalLibraryTotal,
      showOnHome: digitalLibraryHome,
    },
    digitalBooks: { total: digitalBooksTotal, active: digitalBooksActive },
    popularBooks: { total: popularBooksTotal, active: popularBooksActive },
    newArrivals: { total: newArrivalsTotal, active: newArrivalsActive },
    localHistory: { total: localHistoryTotal, active: localHistoryActive },
    partnerLinks: { total: partnerLinksTotal, active: partnerLinksActive },
  }
}

async function checkBackendEndpoints() {
  const base = (
    process.env.BACKEND_URL ||
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).trim().replace(/\/$/, "")

  if (!base) {
    return { skipped: true, reason: "BACKEND_URL/API_INTERNAL_URL/NEXT_PUBLIC_API_URL is not set" }
  }

  const endpoints = [
    "/api/news?limit=3&sort=desc",
    "/api/events?limit=3&sort=asc",
    "/branches?public=1",
    "/staff?activeOnly=1",
    "/pages?page=home",
    "/pages?page=digital-library",
    "/pages?page=jubilees",
  ]

  const results = []
  for (const path of endpoints) {
    const url = `${base}${path}`
    try {
      const res = await fetch(url, { cache: "no-store" })
      const text = await res.text()
      let size: number | null = null
      try {
        const json = JSON.parse(text)
        if (Array.isArray(json)) size = json.length
        else if (Array.isArray(json?.sections)) size = json.sections.length
      } catch {
        size = null
      }
      results.push({ path, status: res.status, ok: res.ok, size })
    } catch (error) {
      results.push({
        path,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  return { skipped: false, base, results }
}

async function main() {
  const report = {
    checkedAt: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV ?? null,
      databaseUrl: maskDatabaseUrl(process.env.DATABASE_URL),
      backendUrl:
        process.env.BACKEND_URL ||
        process.env.API_INTERNAL_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        null,
    },
    db: await countPublicContent(),
    backendEndpoints: await checkBackendEndpoints(),
  }

  console.log(JSON.stringify(report, null, 2))
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
