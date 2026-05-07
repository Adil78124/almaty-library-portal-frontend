import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type DemoRow = {
  titleRu: string
  slug: string
  descriptionRu: string
  coverImageUrl: string
  publishedAt: Date
}

const DEMO: DemoRow[] = [
  {
    titleRu: "Открыт новый читальный зал",
    slug: "demo-reading-hall",
    descriptionRu:
      "В главном здании открылась новая зона для чтения и самостоятельной работы. Приглашаем посетителей познакомиться с обновлённым пространством.\n\nВ зале — удобные рабочие места, хорошее освещение и доступ к электронному каталогу.\n\nЖдём вас ежедневно по графику работы библиотеки.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBShuOMgY6kHuzFpSeZBV1A_9wR89n65zMP24fkd6pmPZVB5GD4bqL89gZjprp6-VHtL0Zr5psqVgWp0IUzCpU4ofTk_g4FyJzCJ28BPfaqhOHSBNoL8Aso6bXF1BJXbIoljNhP43P9lIZCd1wfuaMg2NBrasOWq2T0TemB95yLPsO6xmhWyVkQItOdzrbp1Rx-wAjZTywVKlNebgUNkzO1is3oWQWMM-Y1M13NzkVwL0Xh55l2eeXQRzJf97-xoL14khH42jDXUI6Q",
    publishedAt: new Date(),
  },
  {
    titleRu: "Пополнение фонда редкими изданиями",
    slug: "demo-rare-books",
    descriptionRu:
      "Фонд редких книг пополнился новыми экземплярами. Доступ к коллекции — по предварительной записи.\n\nДля работы с материалами требуется предварительная запись через справочную службу.\n\nБерегите книги — это часть культурного наследия.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAD-FaqjgtJdGVy19GkGcSnYFMW0DLR1asaQO42S2eJbDpO5oR9mjZh2RcEKb9JGd8zztDOicWL-ZHPerNu9JgckjdGwQ2T92un306t2arhUM-CczXewEvX8E0QAxFLaKjf44vJF2F5pC_RKlW-UuR_yX44EQ6ZI7e2KultcLPUITE_Oi_XrqwLkpH5HKyq5mYrGlUsTE-xexET7pe98X_26M0eTZiXpgupDpuRuR_0qbanzd60aKJNOpilvxxwZoseJTGtTIo6bWZf",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    titleRu: "Объявление: изменение графика работы",
    slug: "demo-hours",
    descriptionRu:
      "В праздничные дни библиотека работает по сокращённому графику. Электронные сервисы доступны круглосуточно.\n\nПожалуйста, уточняйте расписание у стойки информации или по телефону.\n\nЭлектронные сервисы доступны круглосуточно.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-B9EcFzPXYaqhqh1MkObrtaxaQZ-1oo86k7rV68DBUnoHARWrEqLFpdg0527c5N7FkwBMZVFoicrlNziOap443TZOMLbwSk_IZj_aTxGzpT07a1adcmmtl3fvKcJooe4xxCV3PAJlNihfAuvYkJX6D0vjuReFk_-Wc5LzduFN1t7ABW2OEUbRVwFZWQhPjcLppjRvTgKNMsDiTOJdWcKLVKLLs08rLnFOguMBCnajWVDa9WbS5HjlZgA2fzPigccZR-0Hl1awcJ4J",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

async function main() {
  // 1) удалить «проверочную» новость пользователя (на всякий случай — по ключевым словам)
  await prisma.newsArticle.deleteMany({
    where: {
      OR: [
        { titleRu: { contains: "провер" } },
        { titleRu: { contains: "Провер" } },
        { titleRu: { contains: "test" } },
        { titleRu: { contains: "Test" } },
        { slug: { contains: "prover" } },
        { slug: { contains: "test" } },
      ],
    },
  })

  // 2) добавить демо-новости, но не дублировать по slug
  for (const row of DEMO) {
    await prisma.newsArticle.upsert({
      where: { slug: row.slug },
      create: {
        slug: row.slug,
        titleRu: row.titleRu,
        titleKz: null,
        descriptionRu: row.descriptionRu,
        descriptionKz: null,
        coverImageUrl: row.coverImageUrl,
        publishedAt: row.publishedAt,
        status: "PUBLISHED",
        sortOrder: 0,
      },
      update: {
        titleRu: row.titleRu,
        descriptionRu: row.descriptionRu,
        coverImageUrl: row.coverImageUrl,
        publishedAt: row.publishedAt,
        status: "PUBLISHED",
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

