import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function isBlank(v: unknown): boolean {
  return v == null || (typeof v === "string" && v.trim() === "")
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

/**
 * Заполняет локализованные узлы вида { ru, kz } где kz пусто:
 * kz := ru
 *
 * Это НЕ “перевод”, а безопасный fallback, чтобы не было пустых KZ-полей.
 */
function backfillJsonLocalized(node: unknown): { next: unknown; changed: boolean } {
  if (Array.isArray(node)) {
    let changed = false
    const next = node.map((v) => {
      const r = backfillJsonLocalized(v)
      changed ||= r.changed
      return r.next
    })
    return { next, changed }
  }
  if (!isRecord(node)) return { next: node, changed: false }

  // localized object
  if (typeof node.ru === "string" && "kz" in node) {
    const kz = (node as any).kz
    if (isBlank(kz)) {
      return { next: { ...node, kz: node.ru }, changed: true }
    }
  }

  let changed = false
  const out: Record<string, unknown> = { ...node }

  // SimplePage-style fields: title + titleKz, lead + leadKz, breadcrumbLabel + breadcrumbLabelKz, etc.
  // If *Kz is blank and base field is a string, fill Kz := base.
  for (const [k, v] of Object.entries(node)) {
    if (!k.endsWith("Kz")) continue
    if (!isBlank(v)) continue
    const baseKey = k.slice(0, -2)
    const baseVal = (node as any)[baseKey]
    if (typeof baseVal === "string" && baseVal.trim()) {
      out[k] = baseVal
      changed = true
    }
  }

  for (const [k, v] of Object.entries(node)) {
    if (k === "ru" || k === "kz") continue
    const r = backfillJsonLocalized(v)
    if (r.changed) {
      changed = true
      out[k] = r.next
    }
  }
  return { next: out, changed }
}

async function main() {
  let nUpdates = 0
  const PLACEHOLDER = "Мәлімет жоқ"
  const CTA_PLACEHOLDER = "Толығырақ"

  // SiteSettings singleton (only KZ fields, fallback from RU fields where possible)
  const site = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  if (site) {
    const patch: Record<string, any> = {}
    if (isBlank(site.orgNameShortKz)) patch.orgNameShortKz = site.orgNameShort
    if (isBlank(site.orgNameLongKz)) patch.orgNameLongKz = site.orgNameLong
    if (isBlank(site.footerTaglineKz) && site.footerTagline) patch.footerTaglineKz = site.footerTagline
    if (isBlank(site.addressKz) && site.address) patch.addressKz = site.address
    if (isBlank(site.sanitaryDayKz) && site.sanitaryDayRu) patch.sanitaryDayKz = site.sanitaryDayRu
    if (isBlank(site.copyrightLineKz) && site.copyrightLine) patch.copyrightLineKz = site.copyrightLine
    if (Object.keys(patch).length) {
      await prisma.siteSettings.update({ where: { id: "default" }, data: patch })
      nUpdates += 1
    }
  }

  // News
  const news = await prisma.newsArticle.findMany({
    select: { id: true, titleRu: true, titleKz: true, descriptionRu: true, descriptionKz: true, location: true, locationKz: true, curator: true, curatorKz: true },
  })
  for (const r of news) {
    const patch: Record<string, any> = {}
    if (isBlank(r.titleKz)) patch.titleKz = r.titleRu
    if (isBlank(r.descriptionKz)) patch.descriptionKz = r.descriptionRu
    if (isBlank(r.locationKz)) patch.locationKz = (r.location ?? PLACEHOLDER)
    if (isBlank(r.curatorKz)) patch.curatorKz = (r.curator ?? PLACEHOLDER)
    if (Object.keys(patch).length) {
      await prisma.newsArticle.update({ where: { id: r.id }, data: patch })
      nUpdates += 1
    }
  }

  // Events
  const events = await prisma.event.findMany({
    select: {
      id: true,
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
  for (const r of events) {
    const patch: Record<string, any> = {}
    if (isBlank(r.titleKz)) patch.titleKz = r.titleRu
    if (isBlank(r.descriptionKz)) patch.descriptionKz = r.descriptionRu
    if (isBlank(r.timeDisplayKz)) patch.timeDisplayKz = (r.timeDisplay ?? null)
    if (isBlank(r.formatKz)) patch.formatKz = (r.format ?? null)
    if (isBlank(r.categoryKz)) patch.categoryKz = (r.category ?? null)
    if (isBlank(r.locationKz)) patch.locationKz = (r.location ?? null)
    if (isBlank(r.ctaLabelKz)) patch.ctaLabelKz = ((r.ctaLabel ?? "").trim() || CTA_PLACEHOLDER)
    if (Object.keys(patch).length) {
      await prisma.event.update({ where: { id: r.id }, data: patch })
      nUpdates += 1
    }
  }

  // Branches
  const branches = await prisma.branch.findMany({
    select: { id: true, titleRu: true, titleKz: true, descriptionRu: true, descriptionKz: true, subtitle: true, subtitleKz: true, cityLabel: true, cityLabelKz: true, address: true, addressKz: true },
  })
  for (const r of branches) {
    const patch: Record<string, any> = {}
    if (isBlank(r.titleKz)) patch.titleKz = r.titleRu
    if (isBlank(r.descriptionKz)) patch.descriptionKz = (r.descriptionRu.trim() ? r.descriptionRu : PLACEHOLDER)
    if (isBlank(r.subtitleKz)) patch.subtitleKz = (r.subtitle ?? PLACEHOLDER)
    if (isBlank(r.cityLabelKz)) patch.cityLabelKz = (r.cityLabel ?? PLACEHOLDER)
    if (isBlank(r.addressKz)) patch.addressKz = (r.address ?? PLACEHOLDER)
    if (Object.keys(patch).length) {
      await prisma.branch.update({ where: { id: r.id }, data: patch })
      nUpdates += 1
    }
  }

  // DigitalLibraryItem
  const books = await prisma.digitalLibraryItem.findMany({
    select: { id: true, titleRu: true, titleKz: true, descriptionRu: true, descriptionKz: true, author: true, authorKz: true },
  })
  for (const r of books) {
    const patch: Record<string, any> = {}
    if (isBlank(r.titleKz)) patch.titleKz = r.titleRu
    if (isBlank(r.descriptionKz)) patch.descriptionKz = (r.descriptionRu.trim() ? r.descriptionRu : PLACEHOLDER)
    if (isBlank(r.authorKz)) patch.authorKz = r.author
    if (Object.keys(patch).length) {
      await prisma.digitalLibraryItem.update({ where: { id: r.id }, data: patch })
      nUpdates += 1
    }
  }

  // NewArrival
  const arrivals = await prisma.newArrival.findMany({ select: { id: true, title: true, titleKz: true, author: true, authorKz: true } })
  for (const r of arrivals) {
    const patch: Record<string, any> = {}
    if (isBlank(r.titleKz)) patch.titleKz = r.title
    if (isBlank(r.authorKz)) patch.authorKz = r.author
    if (Object.keys(patch).length) {
      await prisma.newArrival.update({ where: { id: r.id }, data: patch })
      nUpdates += 1
    }
  }

  // LocalHistoryCard
  const lh = await prisma.localHistoryCard.findMany({ select: { id: true, name: true, nameKz: true, excerpt: true, excerptKz: true } })
  for (const r of lh) {
    const patch: Record<string, any> = {}
    if (isBlank(r.nameKz)) patch.nameKz = r.name
    if (isBlank(r.excerptKz)) patch.excerptKz = r.excerpt
    if (Object.keys(patch).length) {
      await prisma.localHistoryCard.update({ where: { id: r.id }, data: patch })
      nUpdates += 1
    }
  }

  // SocialLink labelKz fallback = label
  const sl = await prisma.socialLink.findMany({ select: { id: true, label: true, labelKz: true } })
  for (const r of sl) {
    if (isBlank(r.labelKz)) {
      await prisma.socialLink.update({ where: { id: r.id }, data: { labelKz: r.label } })
      nUpdates += 1
    }
  }

  // NavItem labelKz fallback = labelRu
  const nav = await prisma.navItem.findMany({ select: { id: true, labelRu: true, labelKz: true } })
  for (const r of nav) {
    if (isBlank(r.labelKz)) {
      await prisma.navItem.update({ where: { id: r.id }, data: { labelKz: r.labelRu } })
      nUpdates += 1
    }
  }

  // PageContent JSON
  const pages = await prisma.pageContent.findMany({ select: { page: true, sections: true } })
  for (const p of pages) {
    const r = backfillJsonLocalized(p.sections)
    if (r.changed) {
      await prisma.pageContent.update({ where: { page: p.page }, data: { sections: r.next as any } })
      nUpdates += 1
    }
  }

  console.log(`[fill-kz] updated rows: ${nUpdates}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

