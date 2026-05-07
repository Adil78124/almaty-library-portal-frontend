import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type DemoTranslation = {
  slug: string
  titleKz: string
  descriptionKz: string
}

const DEMO_NEWS_KZ: DemoTranslation[] = [
  {
    slug: "demo-hours",
    titleKz: "Хабарландыру: жұмыс кестесінің өзгеруі",
    descriptionKz:
      "Мереке күндері кітапхана қысқартылған кесте бойынша жұмыс істейді. Электронды қызметтер тәулік бойы қолжетімді.",
  },
  {
    slug: "demo-rare-books",
    titleKz: "Қор сирек басылымдармен толықты",
    descriptionKz:
      "Сирек кітаптар қоры жаңа даналармен толықты. Коллекцияға қол жеткізу алдын ала жазылу арқылы жүзеге асады.",
  },
  {
    slug: "demo-reading-hall",
    titleKz: "Жаңа оқу залы ашылды",
    descriptionKz:
      "Негізгі ғимаратта жаңа оқу және өздігінен жұмыс істеу аймағы ашылды. Келушілерді жаңартылған кеңістікпен танысуға шақырамыз.",
  },
]

async function main() {
  let updated = 0
  for (const tr of DEMO_NEWS_KZ) {
    const row = await prisma.newsArticle.findUnique({ where: { slug: tr.slug } })
    if (!row) continue

    const patch: Record<string, any> = {}
    if (!row.titleKz?.trim()) patch.titleKz = tr.titleKz
    if (!row.descriptionKz?.trim()) patch.descriptionKz = tr.descriptionKz

    if (Object.keys(patch).length === 0) continue
    await prisma.newsArticle.update({ where: { id: row.id }, data: patch })
    updated += 1
  }

  console.log(`[demo-news] обновлено новостей: ${updated}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

