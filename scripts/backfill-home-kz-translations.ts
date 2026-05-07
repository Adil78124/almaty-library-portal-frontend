import { PrismaClient } from "@prisma/client"

type HomeSection =
  | { type: "hero"; data: Record<string, unknown> }
  | { type: "quote"; data: Record<string, unknown> }
  | { type: "ticker"; data: Record<string, unknown> }
  | { type: "statistics"; data: Record<string, unknown> }
  | { type: "afisha"; data: Record<string, unknown> }
  | { type: "eLibrary"; data: Record<string, unknown> }
  | { type: "latestNews"; data: Record<string, unknown> }
  | { type: "newArrivals"; data: Record<string, unknown> }
  | { type: "localHistory"; data: Record<string, unknown> }
  | { type: "mediaGallery"; data: Record<string, unknown> }
  | { type: "usefulLinks"; data: Record<string, unknown> }

const prisma = new PrismaClient()

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function setIfEmptyKz(
  data: Record<string, unknown>,
  keyKz: string,
  value: string
) {
  const cur = data[keyKz]
  if (cur === undefined || cur === null || (typeof cur === "string" && !cur.trim())) {
    data[keyKz] = value
  }
}

function setIfEmpty(
  data: Record<string, unknown>,
  key: string,
  value: string
) {
  const cur = data[key]
  if (cur === undefined || cur === null || (typeof cur === "string" && !cur.trim())) {
    data[key] = value
  }
}

function patchHomeSections(sections: unknown): { next: unknown; changed: boolean } {
  if (!Array.isArray(sections)) return { next: sections, changed: false }
  let changed = false
  const next = sections.map((sRaw) => {
    if (!isRecord(sRaw)) return sRaw
    const type = sRaw.type
    const dataRaw = sRaw.data
    if (typeof type !== "string" || !isRecord(dataRaw)) return sRaw

    const s = sRaw as HomeSection
    const d = { ...(s.data as Record<string, unknown>) }

    if (s.type === "hero") {
      setIfEmpty(d, "backgroundAlt", "Library Background")
      setIfEmptyKz(d, "backgroundAltKz", "Кітапхана туралы фон")
      setIfEmptyKz(d, "titleLine1Kz", "Алматы облыстық")
      setIfEmptyKz(d, "titleLine2Kz", "орталық әмбебап кітапхана")
    }

    if (s.type === "statistics") {
      const cards = Array.isArray(d.cards) ? d.cards : []
      const cardsNext = cards.map((c) => {
        if (!isRecord(c)) return c
        // Находим нужные метки по RU-лейблу и добавляем KZ при пустоте.
        const label = typeof c.label === "string" ? c.label.trim() : ""
        const nextCard = { ...c }
        if (label === "Общий объем книжного фонда") {
          setIfEmptyKz(nextCard, "labelKz", "Кітап қорының жалпы көлемі")
        } else if (label === "Книги на казахском языке") {
          setIfEmptyKz(nextCard, "labelKz", "Қазақ тіліндегі кітаптар")
        } else if (label === "Число зарегистрированных читателей") {
          setIfEmptyKz(nextCard, "labelKz", "Тіркелген оқырмандар саны")
        } else if (label === "Новые поступления") {
          setIfEmptyKz(nextCard, "labelKz", "Жаңа түсімдер")
        }
        if (JSON.stringify(nextCard) !== JSON.stringify(c)) changed = true
        return nextCard
      })
      d.cards = cardsNext
    }

    if (s.type === "afisha") {
      setIfEmptyKz(d, "kickerKz", "Іс-шаралар афишасы")
      setIfEmptyKz(d, "titleKz", "Алдағы іс-шаралар")
    }

    if (s.type === "eLibrary") {
      setIfEmptyKz(d, "titleKz", "Электронды кітапхана")
      setIfEmptyKz(
        d,
        "descriptionKz",
        "Мыңдаған цифрланған басылымдарға, ғылыми мақалаларға және сирек құжаттарға бір батырмамен қол жеткізу"
      )
      setIfEmptyKz(d, "buttonLabelKz", "Электронды кітапханаға өту")
    }

    if (s.type === "latestNews") {
      setIfEmptyKz(d, "kickerKz", "Оқиғалар")
      setIfEmptyKz(d, "titleKz", "Соңғы жаңалықтар")
    }

    if (s.type === "newArrivals") {
      setIfEmptyKz(d, "titleKz", "ЖАҢА ТҮСІМДЕР")
      setIfEmptyKz(
        d,
        "subtitleKz",
        "Қорымызға жаңадан түскен кітаптар мен басылымдар"
      )
    }

    if (JSON.stringify(d) !== JSON.stringify(s.data)) {
      changed = true
      return { ...sRaw, data: d }
    }
    return sRaw
  })
  return { next, changed }
}

async function main() {
  const row = await prisma.pageContent.findUnique({ where: { page: "home" } })
  if (!row) {
    console.log("[home] pageContent отсутствует — нечего заполнять")
    return
  }
  const { next, changed } = patchHomeSections(row.sections)
  if (!changed) {
    console.log("[home] KZ-поля уже заполнены (или нет подходящих секций)")
    return
  }
  await prisma.pageContent.update({
    where: { page: "home" },
    data: { sections: next as any },
  })
  console.log("[home] ok: KZ-переводы заполнены (где было пусто)")
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

