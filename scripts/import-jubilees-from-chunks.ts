/**
 * Альтернативный импорт юбиляров: читает данные из local-history-2026-chunk*.ts
 * вместо public/2026.html. Создаёт PageContent["jubilees"] для страницы /jubilees.
 *
 * Запуск: npx tsx scripts/import-jubilees-from-chunks.ts
 */
import { prisma } from "../src/lib/prisma"
import { localHistory2026Chunk1 } from "./data/local-history-2026-chunk1"
import { localHistory2026Chunk2 } from "./data/local-history-2026-chunk2"
import { localHistory2026Chunk3 } from "./data/local-history-2026-chunk3"
import { localHistory2026Chunk4 } from "./data/local-history-2026-chunk4"
import { localHistory2026Chunk5 } from "./data/local-history-2026-chunk5"

const allRows = [
  ...localHistory2026Chunk1,
  ...localHistory2026Chunk2,
  ...localHistory2026Chunk3,
  ...localHistory2026Chunk4,
  ...localHistory2026Chunk5,
].sort((a, b) => a.sortOrder - b.sortOrder)

async function main() {
  const items = allRows.map((row) => {
    // Если portraitUrl уже выставлен в чанке — берём его,
    // иначе пытаемся найти в LocalHistoryCard (после seed-local-history-2026).
    return {
      slug: row.slug,
      titleRu: row.name,
      titleKz: row.nameKz ?? null,
      imageUrl: row.portraitUrl ?? null,
      bioRu: row.excerpt,
      bioKz: row.excerptKz ?? null,
      sortOrder: row.sortOrder,
    }
  })

  // Если portraitUrl не заполнен в чанках — берём из уже засеянной LocalHistoryCard
  const dbCards = await prisma.localHistoryCard.findMany({
    where: { isActive: true },
    select: { slug: true, portraitUrl: true },
  })
  const portraitBySlug = new Map(dbCards.map((c) => [c.slug, c.portraitUrl]))

  const itemsWithPortraits = items.map((item) => ({
    ...item,
    imageUrl: item.imageUrl ?? portraitBySlug.get(item.slug) ?? null,
  }))

  await prisma.pageContent.upsert({
    where: { page: "jubilees" },
    create: {
      page: "jubilees",
      sections: [{ type: "jubilees", data: { items: itemsWithPortraits } }],
    },
    update: {
      sections: [{ type: "jubilees", data: { items: itemsWithPortraits } }],
    },
  })

  console.log(`Imported ${itemsWithPortraits.length} jubilees into PageContent["jubilees"]`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
