import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function looksLikeTestSlug(slug: string): boolean {
  const s = slug.toLowerCase()
  return (
    s.includes("провер") ||
    s.includes("test") ||
    s.includes("demo-") ||
    s.includes("prover")
  )
}

async function main() {
  // ВНИМАНИЕ: demo-* оставляем (они используются как пример на витрине),
  // а вот явные "проверка" / мусор удаляем.
  const news = await prisma.newsArticle.findMany({ select: { id: true, slug: true } })
  const newsToDelete = news.filter((n) => {
    const s = n.slug.toLowerCase()
    if (s.startsWith("demo-")) return false
    return looksLikeTestSlug(n.slug)
  })

  const events = await prisma.event.findMany({ select: { id: true, slug: true } })
  const eventsToDelete = events.filter((e) => {
    // demo events у нас не "demo-" по slug, оставляем всё кроме явной "провер"
    return e.slug.toLowerCase().includes("провер")
  })

  for (const n of newsToDelete) {
    await prisma.newsArticle.delete({ where: { id: n.id } })
  }
  for (const e of eventsToDelete) {
    await prisma.event.delete({ where: { id: e.id } })
  }

  console.log(`[cleanup] deleted news: ${newsToDelete.length}`)
  console.log(`[cleanup] deleted events: ${eventsToDelete.length}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

