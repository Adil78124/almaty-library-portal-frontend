import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type SeedRow = {
  slug: string
  titleKz: string
  excerptKz: string
  bodyKz: string
  formatKz: string
  categoryKz: string
  locationKz: string
}

/**
 * Этот скрипт НЕ переводит автоматически все события.
 * Он аккуратно заполняет KZ только для наших демо-афиш из `prisma/events-seed.ts`
 * (если KZ поля в БД пустые/NULL).
 */
async function main() {
  // tsx умеет импортировать TS напрямую; используем именованный экспорт,
  // чтобы не зависеть от ESM-вывода (.js) и shape модуля.
  const mod = await import("../prisma/events-seed")
  const rows = (mod as any).EVENT_SEED_ROWS as any[] | undefined
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("[events] seed rows не найдены — пропуск")
    return
  }

  const seed: SeedRow[] = rows
    .map((r) => ({
      slug: String(r.slug),
      titleKz: String(r.titleKz ?? "").trim(),
      excerptKz: String(r.excerptKz ?? "").trim(),
      bodyKz: String(r.bodyKz ?? "").trim(),
      formatKz: String(r.formatKz ?? "").trim(),
      categoryKz: String(r.categoryKz ?? "").trim(),
      locationKz: String(r.locationKz ?? "").trim(),
    }))
    .filter((r) => r.slug && r.titleKz)

  let updated = 0
  for (const s of seed) {
    const row = await prisma.event.findUnique({ where: { slug: s.slug } })
    if (!row) continue

    const descKz = [s.excerptKz, s.bodyKz].filter(Boolean).join("\n\n") || null
    const patch: Record<string, any> = {}

    if (!row.titleKz?.trim()) patch.titleKz = s.titleKz
    if (!row.descriptionKz?.trim() && descKz) patch.descriptionKz = descKz
    if (!row.formatKz?.trim() && s.formatKz) patch.formatKz = s.formatKz
    if (!row.categoryKz?.trim() && s.categoryKz) patch.categoryKz = s.categoryKz
    if (!row.locationKz?.trim() && s.locationKz) patch.locationKz = s.locationKz

    if (Object.keys(patch).length === 0) continue

    await prisma.event.update({
      where: { id: row.id },
      data: patch,
    })
    updated += 1
  }

  console.log(`[events] обновлено событий: ${updated}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

