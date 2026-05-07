import type { PrismaClient } from "@prisma/client"

type Row = {
  slug: string
  title: string
  titleKz: string
  excerpt: string
  excerptKz: string
  body: string
  bodyKz: string
  posterUrl: string
  startsAt: Date
  timeDisplay: string
  format: string
  formatKz: string
  category: string
  categoryKz: string
  location: string
  locationKz: string
}

export const EVENT_SEED_ROWS: Row[] = [
  {
    slug: "digital-art-exhibition",
    title: "Цифровое искусство: Грани реальности",
    titleKz: "Цифрлық өнер: Шындық шекаралары",
    excerpt:
      "Интерактивная выставка на стыке классической живописи и алгоритмических технологий.",
    excerptKz:
      "Классикалық сурет өнері мен алгоритмдік технологиялар тоғысқан интерактивті көрме.",
    body: "Экспозиция представляет инсталляции, созданные в соавторстве художников и цифровых авторов.\n\nПосетители могут взаимодействовать с частью работ через сенсорные панели.\n\nВыставка работает ежедневно, вход по читательскому билету.",
    bodyKz:
      "Көрме суретшілер мен цифрлық авторлардың бірлескен инсталляцияларын ұсынады.\n\nКелушілер жұмыстардың бір бөлігімен сенсорлық панельдер арқылы өзара әрекеттесе алады.\n\nКөрме күнделікті жұмыс істейді, кіру оқырман билеті бойынша.",
    posterUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBewkm_xxfqTpxHV3fjZ2mJZaaFvMKDTjFZgF0WKD31fZGeB2MW4EZ2CsB1jq0i_UMNxThml0j2iNA3FACcfvaZOqtWpvKy7HkDZfcCf9JELzPE7DfJaYufIhCJONamL0X6y3dmAz03rHC7fPvMeEVVByNOrLA13nXNLjzfB5wtlBSnQwSSbO5inGJu8lSB4v9nzmkhg4r8vzPvob6VWfP4t0bGo2BEu_YLEBsIN7phN_gnnJFfqH1NpZD0QwIeFIb91zSqHgUVLHFc",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    timeDisplay: "18:00",
    format: "Офлайн",
    formatKz: "Офлайн",
    category: "Выставка",
    categoryKz: "Көрме",
    location: "Выставочный зал",
    locationKz: "Көрме залы",
  },
  {
    slug: "book-club-classics",
    title: "Литературный клуб: Обсуждение классики",
    titleKz: "Әдеби клуб: Классиканы талқылау",
    excerpt:
      "Разбор произведений классиков в контексте современной этики. Уютная атмосфера и живая дискуссия.",
    excerptKz:
      "Классиктердің шығармаларын қазіргі этика контекстінде талдау. Жайлы атмосфера мен тірі пікірталас.",
    body: "Встреча клуба посвящена обсуждению классических произведений и их отклику у современного читателя.\n\nМодератор поможет выстроить конструктивную дискуссию.\n\nРегистрация не обязательна.",
    bodyKz:
      "Клуб кездесуі классикалық шығармалар мен олардың қазіргі оқырмандағы әсерін талқылауға арналған.\n\nМодератор конструктивті пікірталас құруға көмектеседі.\n\nТіркелу міндетті емес.",
    posterUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCn0r6nW6gYG44uXkCQXx8tfEzFAIrDu6JeL_3c2K4RnaCIFa_1Cq7bO0AH9ALzhTqMC1gGK4_TBpazUytTo7mYK5UoQ-BG5QLfU-okl3lo2g804pM3W8bqBqdhLkddlbRdrJ_i9iexreTY09vxMatn9Ukad-S16eJopHTNf7HzbJUfxo3lWKy87H0sSaJBPPOUmVZEBqxGIuxTfBsOM-n3jKiK5gCrq3DfRRQavYU6lazo-deSgL05hqlsi6pFnwzsDeQK2WOZj_3h",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
    timeDisplay: "15:00",
    format: "Офлайн",
    formatKz: "Офлайн",
    category: "Встреча",
    categoryKz: "Кездесу",
    location: "Малый зал",
    locationKz: "Кіші зал",
  },
  {
    slug: "digital-hygiene-webinar",
    title: "Вебинар: Цифровая гигиена",
    titleKz: "Вебинар: Цифрлық гигиена",
    excerpt:
      "Практические советы по защите персональных данных и управлению цифровым следом в интернете.",
    excerptKz:
      "Жеке деректерді қорғау және интернеттегі цифрлық ізді басқару бойынша практикалық кеңестер.",
    body: "Спикеры расскажут о настройках приватности, менеджерах паролей и типичных угрозах фишинга.\n\nПодойдёт для любого уровня подготовки.\n\nПодключение по ссылке, которая придёт перед началом.",
    bodyKz:
      "Спикерлер құпиялылық баптаулары, пароль менеджерлері және фишинг қауіптері туралы айтады.\n\nКез келген дайындық деңгейіне сәйкес келеді.\n\nБасталуына дейін келетін сілтеме арқылы қосылу.",
    posterUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCU_HvEmIdXe-4lvsiDU0nVR381q3P_5nIZJC92BSXOcjxsSpX1hOxv5bkFqM9Zvoa2OnpbRiP6Wio_xzlpJdHOUPvYut_BB0XCh3gluPx--mtihicFnrNFzwoMLXm1bTtawwnt7xYok6iN8IZ5flHxerMOhQLGk8Sut2saSeqp-Gk___Qx-HicQw9SYGew0ySIGyYj3ApbAHCwq7ksR8aUD66htnmDahhivpZcZEhr0nDKhB--dfbnPKqGUre0XwYqv0sknAUOU4xQ",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    timeDisplay: "11:00",
    format: "Онлайн",
    formatKz: "Онлайн",
    category: "Лекция",
    categoryKz: "Дәріс",
    location: "Онлайн",
    locationKz: "Онлайн",
  },
]

export async function seedEventsIfEmpty(prisma: PrismaClient) {
  const n = await prisma.event.count()
  if (n > 0) return
  await prisma.event.createMany({
    data: EVENT_SEED_ROWS.map((r, i) => ({
      slug: r.slug,
      titleRu: r.title,
      titleKz: r.titleKz,
      descriptionRu: `${r.excerpt}\n\n${r.body}`,
      descriptionKz:
        [r.excerptKz?.trim(), r.bodyKz?.trim()].filter(Boolean).join("\n\n") ||
        null,
      posterUrl: r.posterUrl,
      startsAt: r.startsAt,
      timeDisplay: r.timeDisplay,
      format: r.format,
      formatKz: r.formatKz,
      category: r.category,
      categoryKz: r.categoryKz,
      location: r.location,
      locationKz: r.locationKz,
      status: "PUBLISHED" as const,
      sortOrder: i,
    })),
  })
}
