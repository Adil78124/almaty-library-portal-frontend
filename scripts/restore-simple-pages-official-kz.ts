import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type SimpleSlug = "news" | "events" | "branches"

function norm(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

function same(a: unknown, b: unknown): boolean {
  const aa = norm(a)
  const bb = norm(b)
  return !!aa && !!bb && aa === bb
}

function patchHeroKzIfFallback(raw: any, defaults: any) {
  if (!raw?.data || !defaults?.data) return { next: raw, changed: false }
  const d = { ...raw.data }
  const def = defaults.data
  let changed = false

  const fields: [string, string][] = [
    ["backgroundImageAltKz", "backgroundImageAlt"],
    ["breadcrumbLabelKz", "breadcrumbLabel"],
    ["titleKz", "title"],
    ["leadKz", "lead"],
  ]

  for (const [kzKey, ruKey] of fields) {
    const kzVal = d[kzKey]
    const ruVal = d[ruKey]
    // если KZ пусто ИЛИ равно RU — считаем это fallback и ставим официальный перевод
    if (!norm(kzVal) || same(kzVal, ruVal)) {
      if (norm(def[kzKey])) {
        d[kzKey] = def[kzKey]
        changed = true
      }
    }
  }

  return { next: { ...raw, data: d }, changed }
}

async function main() {
  const { getDefaultSimpleSections } = await import("../src/lib/cms/simple-page/defaults")

  const slugs: SimpleSlug[] = ["news", "events", "branches"]
  let updated = 0

  for (const slug of slugs) {
    const defaults = getDefaultSimpleSections(slug)
    const row = await prisma.pageContent.findUnique({ where: { page: slug } })
    if (!row) continue
    const sections = row.sections as any[]
    if (!Array.isArray(sections) || sections.length === 0) continue

    const sec0 = sections[0]
    const def0 = defaults[0]
    if (sec0?.type !== "hero" || def0?.type !== "hero") continue

    const patched = patchHeroKzIfFallback(sec0, def0)
    if (!patched.changed) continue

    const next = [...sections]
    next[0] = patched.next
    await prisma.pageContent.update({ where: { page: slug }, data: { sections: next as any } })
    updated += 1
  }

  console.log(`[simple-pages] updated: ${updated}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

