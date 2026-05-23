import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type ManualLink = {
  href: string
  title: string
  titleKz?: string | null
  logoUrl?: string
  logoVariant?: "round" | "rect"
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v)
}

function s(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

function toManualLinks(raw: unknown): ManualLink[] {
  if (!Array.isArray(raw)) return []
  const out: ManualLink[] = []
  for (const it of raw) {
    if (!isObject(it)) continue
    const href = s(it.href)
    const title = s(it.title)
    if (!href || !title) continue
    out.push({
      href,
      title,
      titleKz: s(it.titleKz) || null,
      logoUrl: s(it.logoUrl) || undefined,
      logoVariant:
        it.logoVariant === "rect" || it.logoVariant === "round"
          ? (it.logoVariant as any)
          : undefined,
    })
  }
  return out
}

async function readHomeManualUsefulLinks(): Promise<ManualLink[]> {
  const row = await prisma.pageContent.findUnique({ where: { page: "home" } })
  const sections = row?.sections as any[] | undefined
  if (!Array.isArray(sections)) return []
  const sec = sections.find((x) => x && x.type === "usefulLinks")
  if (!sec || !isObject(sec) || !isObject(sec.data)) return []
  const data = sec.data as any
  return toManualLinks(data.manualLinks)
}

async function main() {
  const manual = await readHomeManualUsefulLinks()
  if (manual.length === 0) {
    console.log("[useful-links] no manualLinks found in home — nothing to import")
    return
  }

  let created = 0
  let updated = 0

  for (let i = 0; i < manual.length; i++) {
    const m = manual[i]!
    const sortOrder = i + 1
    const existing = await prisma.partnerLink.findFirst({
      where: { href: m.href, title: m.title },
    })

    const logoUrl = m.logoUrl?.trim() || "/images/logo.png"

    if (existing) {
      await prisma.partnerLink.update({
        where: { id: existing.id },
        data: {
          title: m.title,
          titleKz: m.titleKz ?? null,
          href: m.href,
          logoUrl,
          sortOrder,
          isActive: true,
        },
      })
      updated++
    } else {
      await prisma.partnerLink.create({
        data: {
          title: m.title,
          titleKz: m.titleKz ?? null,
          href: m.href,
          logoUrl,
          sortOrder,
          isActive: true,
        } as any,
      })
      created++
    }
  }

  console.log(
    `[useful-links] imported from home manualLinks — created: ${created}, updated: ${updated}`
  )
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

