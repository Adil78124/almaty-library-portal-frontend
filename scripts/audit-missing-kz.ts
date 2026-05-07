import { PrismaClient } from "@prisma/client"
import { writeFileSync } from "node:fs"

const prisma = new PrismaClient()

type MissingRow = {
  model: string
  id: string
  fields: string[]
  hint?: string
  samplePaths?: string[]
}

function isBlank(v: unknown): boolean {
  return v == null || (typeof v === "string" && v.trim() === "")
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function walkJsonForLocalizedMissingKz(
  node: unknown,
  path: string[],
  out: { path: string; ru?: string }[]
) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkJsonForLocalizedMissingKz(v, [...path, String(i)], out))
    return
  }
  if (!isRecord(node)) return

  // localized object shape: { ru: string, kz: string }
  if (typeof node.ru === "string" && "kz" in node) {
    const kz = node.kz
    if (isBlank(kz)) {
      out.push({ path: path.join("."), ru: node.ru })
    }
  }

  // SimplePage-style fields: *Kz missing while base exists.
  for (const [k, v] of Object.entries(node)) {
    if (!k.endsWith("Kz")) continue
    if (!isBlank(v)) continue
    const baseKey = k.slice(0, -2)
    const baseVal = (node as any)[baseKey]
    if (typeof baseVal === "string" && baseVal.trim()) {
      out.push({ path: [...path, k].join("."), ru: baseVal })
    }
  }

  for (const [k, v] of Object.entries(node)) {
    if (k === "ru" || k === "kz") continue
    walkJsonForLocalizedMissingKz(v, [...path, k], out)
  }
}

async function main() {
  const missing: MissingRow[] = []

  // SiteSettings (singleton)
  const site = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  if (site) {
    const fields: string[] = []
    if (isBlank(site.orgNameShortKz)) fields.push("orgNameShortKz")
    if (isBlank(site.orgNameLongKz)) fields.push("orgNameLongKz")
    if (isBlank(site.footerTaglineKz)) fields.push("footerTaglineKz")
    if (isBlank(site.addressKz)) fields.push("addressKz")
    if (isBlank(site.sanitaryDayKz)) fields.push("sanitaryDayKz")
    if (isBlank(site.copyrightLineKz)) fields.push("copyrightLineKz")
    if (fields.length) missing.push({ model: "SiteSettings", id: "default", fields })
  }

  // News
  const news = await prisma.newsArticle.findMany({
    select: { id: true, slug: true, titleKz: true, descriptionKz: true, locationKz: true, curatorKz: true },
  })
  for (const r of news) {
    const fields: string[] = []
    if (isBlank(r.titleKz)) fields.push("titleKz")
    if (isBlank(r.descriptionKz)) fields.push("descriptionKz")
    if (isBlank(r.locationKz)) fields.push("locationKz")
    if (isBlank(r.curatorKz)) fields.push("curatorKz")
    if (fields.length) missing.push({ model: "NewsArticle", id: r.id, fields, hint: r.slug })
  }

  // Events
  const events = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      titleKz: true,
      descriptionKz: true,
      timeDisplayKz: true,
      formatKz: true,
      categoryKz: true,
      locationKz: true,
      ctaLabelKz: true,
    },
  })
  for (const r of events) {
    const fields: string[] = []
    if (isBlank(r.titleKz)) fields.push("titleKz")
    if (isBlank(r.descriptionKz)) fields.push("descriptionKz")
    if (isBlank(r.timeDisplayKz)) fields.push("timeDisplayKz")
    if (isBlank(r.formatKz)) fields.push("formatKz")
    if (isBlank(r.categoryKz)) fields.push("categoryKz")
    if (isBlank(r.locationKz)) fields.push("locationKz")
    if (isBlank(r.ctaLabelKz)) fields.push("ctaLabelKz")
    if (fields.length) missing.push({ model: "Event", id: r.id, fields, hint: r.slug })
  }

  // Branches
  const branches = await prisma.branch.findMany({
    select: { id: true, titleKz: true, descriptionKz: true, subtitleKz: true, cityLabelKz: true, addressKz: true },
  })
  for (const r of branches) {
    const fields: string[] = []
    if (isBlank(r.titleKz)) fields.push("titleKz")
    if (isBlank(r.descriptionKz)) fields.push("descriptionKz")
    if (isBlank(r.subtitleKz)) fields.push("subtitleKz")
    if (isBlank(r.cityLabelKz)) fields.push("cityLabelKz")
    if (isBlank(r.addressKz)) fields.push("addressKz")
    if (fields.length) missing.push({ model: "Branch", id: r.id, fields })
  }

  // Digital library (books)
  const items = await prisma.digitalLibraryItem.findMany({
    select: { id: true, titleKz: true, descriptionKz: true, authorKz: true },
  })
  for (const r of items) {
    const fields: string[] = []
    if (isBlank(r.titleKz)) fields.push("titleKz")
    if (isBlank(r.descriptionKz)) fields.push("descriptionKz")
    if (isBlank(r.authorKz)) fields.push("authorKz")
    if (fields.length) missing.push({ model: "DigitalLibraryItem", id: r.id, fields })
  }

  // New arrivals
  const arrivals = await prisma.newArrival.findMany({ select: { id: true, titleKz: true, authorKz: true } })
  for (const r of arrivals) {
    const fields: string[] = []
    if (isBlank(r.titleKz)) fields.push("titleKz")
    if (isBlank(r.authorKz)) fields.push("authorKz")
    if (fields.length) missing.push({ model: "NewArrival", id: r.id, fields })
  }

  // Local history
  const lh = await prisma.localHistoryCard.findMany({ select: { id: true, slug: true, nameKz: true, excerptKz: true } })
  for (const r of lh) {
    const fields: string[] = []
    if (isBlank(r.nameKz)) fields.push("nameKz")
    if (isBlank(r.excerptKz)) fields.push("excerptKz")
    if (fields.length) missing.push({ model: "LocalHistoryCard", id: r.id, fields, hint: r.slug ?? undefined })
  }

  // Social links
  const sl = await prisma.socialLink.findMany({ select: { id: true, labelKz: true, label: true } })
  for (const r of sl) {
    if (isBlank(r.labelKz)) {
      missing.push({ model: "SocialLink", id: r.id, fields: ["labelKz"], hint: r.label })
    }
  }

  // Nav items (if used)
  const nav = await prisma.navItem.findMany({ select: { id: true, labelKz: true, labelRu: true, href: true } })
  for (const r of nav) {
    if (isBlank(r.labelKz)) {
      missing.push({ model: "NavItem", id: r.id, fields: ["labelKz"], hint: r.href })
    }
  }

  // PageContent JSON: {ru,kz}
  const pages = await prisma.pageContent.findMany({ select: { page: true, sections: true } })
  for (const p of pages) {
    const misses: { path: string; ru?: string }[] = []
    walkJsonForLocalizedMissingKz(p.sections, [p.page, "sections"], misses)
    if (misses.length) {
      missing.push({
        model: "PageContent",
        id: p.page,
        fields: [`sections: missing kz localized nodes = ${misses.length}`],
        samplePaths: misses.slice(0, 25).map((m) => m.path),
      })
    }
  }

  const outPath = "scripts/_audit-missing-kz.json"
  writeFileSync(outPath, JSON.stringify({ total: missing.length, missing }, null, 2), "utf-8")
  console.log(`[audit] missing records: ${missing.length}`)
  console.log(`[audit] written: ${outPath}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

