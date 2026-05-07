import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type SeedRow = {
  slug: string
  titleKz: string
  excerptKz: string
  bodyKz: string
  locationKz: string | null
  curatorKz: string | null
}

async function main() {
  const mod = await import("../prisma/news-seed")
  const rows = (mod as any).NEWS_SEED_ROWS as any[] | undefined
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("[news] seed rows не найдены — пропуск")
    return
  }

  const seed: SeedRow[] = rows
    .map((r) => ({
      slug: String(r.slug),
      titleKz: String(r.titleKz ?? "").trim(),
      excerptKz: String(r.excerptKz ?? "").trim(),
      bodyKz: String(r.bodyKz ?? "").trim(),
      locationKz:
        r.locationKz == null ? null : String(r.locationKz ?? "").trim(),
      curatorKz: r.curatorKz == null ? null : String(r.curatorKz ?? "").trim(),
    }))
    .filter((r) => r.slug && r.titleKz)

  let updated = 0
  for (const s of seed) {
    const row = await prisma.newsArticle.findUnique({ where: { slug: s.slug } })
    if (!row) continue

    const descKz =
      [s.excerptKz, s.bodyKz].filter(Boolean).join("\n\n") || null
    const patch: Record<string, any> = {}

    if (!row.titleKz?.trim()) patch.titleKz = s.titleKz
    if (!row.descriptionKz?.trim() && descKz) patch.descriptionKz = descKz
    if (!row.locationKz?.trim() && s.locationKz?.trim())
      patch.locationKz = s.locationKz
    if (!row.curatorKz?.trim() && s.curatorKz?.trim())
      patch.curatorKz = s.curatorKz

    if (Object.keys(patch).length === 0) continue
    await prisma.newsArticle.update({ where: { id: row.id }, data: patch })
    updated += 1
  }

  console.log(`[news] обновлено новостей: ${updated}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

