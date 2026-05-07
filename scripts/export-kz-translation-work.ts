import { PrismaClient } from "@prisma/client"
import { writeFileSync } from "node:fs"

const prisma = new PrismaClient()

function norm(v: string | null | undefined): string {
  return (v ?? "").trim()
}

function same(a: string | null | undefined, b: string | null | undefined): boolean {
  const aa = norm(a)
  const bb = norm(b)
  if (!aa || !bb) return false
  return aa === bb
}

async function main() {
  const out: any = {
    generatedAt: new Date().toISOString(),
    news: [],
    events: [],
    branches: [],
    digitalLibrary: [],
    newArrivals: [],
    localHistory: [],
    navItems: [],
    socialLinks: [],
    siteSettings: null,
    pageContent: [],
  }

  // SiteSettings: fields where KZ is blank or equals RU
  const site = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  if (site) {
    out.siteSettings = {
      id: "default",
      orgNameShort: site.orgNameShort,
      orgNameShortKz: site.orgNameShortKz,
      orgNameLong: site.orgNameLong,
      orgNameLongKz: site.orgNameLongKz,
      footerTagline: site.footerTagline,
      footerTaglineKz: site.footerTaglineKz,
      address: site.address,
      addressKz: site.addressKz,
      sanitaryDayRu: site.sanitaryDayRu,
      sanitaryDayKz: site.sanitaryDayKz,
      copyrightLine: site.copyrightLine,
      copyrightLineKz: site.copyrightLineKz,
    }
  }

  // News
  const news = await prisma.newsArticle.findMany({
    select: {
      id: true,
      slug: true,
      titleRu: true,
      titleKz: true,
      descriptionRu: true,
      descriptionKz: true,
      location: true,
      locationKz: true,
      curator: true,
      curatorKz: true,
    },
  })
  out.news = news
    .filter((r) => !norm(r.titleKz) || same(r.titleRu, r.titleKz) || !norm(r.descriptionKz) || same(r.descriptionRu, r.descriptionKz))
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      titleRu: r.titleRu,
      titleKz: r.titleKz,
      descriptionRu: r.descriptionRu,
      descriptionKz: r.descriptionKz,
      location: r.location,
      locationKz: r.locationKz,
      curator: r.curator,
      curatorKz: r.curatorKz,
    }))

  // Events
  const events = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      titleRu: true,
      titleKz: true,
      descriptionRu: true,
      descriptionKz: true,
      timeDisplay: true,
      timeDisplayKz: true,
      format: true,
      formatKz: true,
      category: true,
      categoryKz: true,
      location: true,
      locationKz: true,
      ctaLabel: true,
      ctaLabelKz: true,
    },
  })
  out.events = events
    .filter((r) => !norm(r.titleKz) || same(r.titleRu, r.titleKz) || !norm(r.descriptionKz) || same(r.descriptionRu, r.descriptionKz))
    .map((r) => ({ ...r }))

  // Branches
  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      titleRu: true,
      titleKz: true,
      descriptionRu: true,
      descriptionKz: true,
      subtitle: true,
      subtitleKz: true,
      cityLabel: true,
      cityLabelKz: true,
      address: true,
      addressKz: true,
    },
  })
  out.branches = branches
    .filter((r) => !norm(r.titleKz) || same(r.titleRu, r.titleKz) || !norm(r.descriptionKz) || same(r.descriptionRu, r.descriptionKz))
    .map((r) => ({ ...r }))

  // Digital library
  const dl = await prisma.digitalLibraryItem.findMany({
    select: { id: true, titleRu: true, titleKz: true, descriptionRu: true, descriptionKz: true, author: true, authorKz: true },
  })
  out.digitalLibrary = dl
    .filter((r) => !norm(r.titleKz) || same(r.titleRu, r.titleKz) || !norm(r.descriptionKz) || same(r.descriptionRu, r.descriptionKz) || !norm(r.authorKz) || same(r.author, r.authorKz))
    .map((r) => ({ ...r }))

  // New arrivals
  const arr = await prisma.newArrival.findMany({ select: { id: true, title: true, titleKz: true, author: true, authorKz: true } })
  out.newArrivals = arr
    .filter((r) => !norm(r.titleKz) || same(r.title, r.titleKz) || !norm(r.authorKz) || same(r.author, r.authorKz))
    .map((r) => ({ ...r }))

  // Local history
  const lh = await prisma.localHistoryCard.findMany({ select: { id: true, slug: true, name: true, nameKz: true, excerpt: true, excerptKz: true } })
  out.localHistory = lh
    .filter((r) => !norm(r.nameKz) || same(r.name, r.nameKz) || !norm(r.excerptKz) || same(r.excerpt, r.excerptKz))
    .map((r) => ({ ...r }))

  // Nav items
  const nav = await prisma.navItem.findMany({ select: { id: true, href: true, labelRu: true, labelKz: true } })
  out.navItems = nav
    .filter((r) => !norm(r.labelKz) || same(r.labelRu, r.labelKz))
    .map((r) => ({ ...r }))

  // Social links
  const sl = await prisma.socialLink.findMany({ select: { id: true, label: true, labelKz: true, url: true } })
  out.socialLinks = sl
    .filter((r) => !norm(r.labelKz) || same(r.label, r.labelKz))
    .map((r) => ({ ...r }))

  // PageContent sections (raw JSON) — we just dump, translation will be applied by dedicated scripts per page.
  const pages = await prisma.pageContent.findMany({ select: { page: true, sections: true } })
  out.pageContent = pages

  const outPath = "scripts/_kz-translation-work.json"
  writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8")
  console.log(`[export] written: ${outPath}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

