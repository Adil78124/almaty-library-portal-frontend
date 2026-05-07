import { PrismaClient } from "@prisma/client"

type Localized = { ru: string; kz: string }

const prisma = new PrismaClient()

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isLocalized(v: unknown): v is Localized {
  return (
    isRecord(v) &&
    typeof v.ru === "string" &&
    typeof v.kz === "string"
  )
}

function setKzIfEmpty(loc: unknown, kz: string): unknown {
  if (!isLocalized(loc)) return loc
  if (!loc.kz.trim()) return { ...loc, kz }
  return loc
}

function patchAboutSections(sections: unknown): { next: unknown; changed: boolean } {
  if (!Array.isArray(sections)) return { next: sections, changed: false }
  let changed = false
  const next = sections.map((s) => {
    if (!isRecord(s) || !isRecord(s.data) || typeof s.type !== "string") return s
    const type = s.type
    const d = { ...(s.data as Record<string, unknown>) }

    if (type === "hero") {
      d.breadcrumbLabel = setKzIfEmpty(d.breadcrumbLabel, "Кітапхана туралы")
      d.title = setKzIfEmpty(d.title, "Кітапхана туралы")
      d.lead = setKzIfEmpty(
        d.lead,
        "Алматы облыстық әмбебап кітапханасы — білімге, ақпаратқа және мәдени мұраға еркін қолжетімділікті қамтамасыз ететін заманауи мәдени-ақпараттық орталық. Кітапхана кең ауқымды пайдаланушыларға қызмет көрсетеді, баспа және электрондық ресурстар ұсынады, сондай-ақ мәдени-ағартушылық іс-шаралар ұйымдастырады."
      )
      // Если где-то в KZ alt/названии встречается “универсалды” — исправим.
      if (isLocalized(d.imageAlt) && d.imageAlt.kz.includes("универсалды")) {
        d.imageAlt = { ...d.imageAlt, kz: d.imageAlt.kz.replaceAll("универсалды", "әмбебап") }
      }
    }

    if (type === "roleIntro") {
      d.kicker = setKzIfEmpty(d.kicker, "Миссиясы")
      // Пользовательский перевод: “Қызмет бағыты”
      d.title = setKzIfEmpty(d.title, "Қызмет бағыты")
      // paragraphs: [mission, history]
      if (Array.isArray(d.paragraphs)) {
        const ps = d.paragraphs.slice()
        if (ps[0] != null) {
          ps[0] = setKzIfEmpty(
            ps[0],
            "Қоғамның зияткерлік әлеуетін дамытуға ықпал ету, оқуды насихаттау және ақпаратқа тең қолжетімділікті қамтамасыз ету."
          )
        }
        if (ps[1] != null) {
          ps[1] = setKzIfEmpty(
            ps[1],
            "Кітапхана 1949 жылы құрылған. Өз қызметі барысында өңірдің жетекші мәдени мекемелерінің біріне айналып, заманауи технологияларды белсенді енгізіп, қызмет түрлерін кеңейтуде."
          )
        }
        d.paragraphs = ps
      }
      d.sideImageAlt = setKzIfEmpty(d.sideImageAlt, "Кітапхана қоры")
    }

    if (type === "timeline") {
      d.title = setKzIfEmpty(d.title, "Тарихы")
      if (Array.isArray(d.items)) {
        d.items = d.items.map((it) => {
          if (!isRecord(it)) return it
          const nextIt = { ...it }
          nextIt.year = setKzIfEmpty(nextIt.year, "1949")
          // Вторая точка: Сегодня → Бүгін
          if (isLocalized(nextIt.year) && nextIt.year.ru.trim() === "Сегодня") {
            nextIt.year = setKzIfEmpty(nextIt.year, "Бүгін")
          }
          // Основание → Құрылуы
          if (isLocalized(nextIt.title) && nextIt.title.ru.trim() === "Основание") {
            nextIt.title = setKzIfEmpty(nextIt.title, "Құрылуы")
          }
          // Современный этап → Қазіргі кезең
          if (isLocalized(nextIt.title) && nextIt.title.ru.trim() === "Современный этап") {
            nextIt.title = setKzIfEmpty(nextIt.title, "Қазіргі кезең")
          }
          // Блоки текста
          if (isLocalized(nextIt.body) && nextIt.body.ru.includes("Библиотека была основана")) {
            nextIt.body = setKzIfEmpty(
              nextIt.body,
              "Кітапхана 1949 жылы құрылды. Өз қызметі барысында өңірдің жетекші мәдени мекемелерінің біріне айналып, заманауи технологияларды белсенді енгізіп, қызмет аясын кеңейтті."
            )
          }
          if (isLocalized(nextIt.body) && nextIt.body.ru.includes("развивает цифровые сервисы")) {
            nextIt.body = setKzIfEmpty(
              nextIt.body,
              "Кітапхана цифрлық қызметтерді дамытып, қорын кеңейтіп, бүкіл өңір оқырмандарына арналған мәдени-ағартушылық іс-шаралар өткізеді."
            )
          }
          return nextIt
        })
      }
    }

    if (type === "space") {
      d.title = setKzIfEmpty(d.title, "Біздің кеңістік")
      d.lead = setKzIfEmpty(
        d.lead,
        "Оқу залдары, қор сақтау орындары және цифрлық ресурстармен жұмыс істеу аймақтары."
      )
      if (Array.isArray(d.slides)) {
        d.slides = d.slides.map((sl) => {
          if (!isRecord(sl)) return sl
          const nextSl = { ...sl }
          if (isLocalized(nextSl.imageAlt) && nextSl.imageAlt.ru.trim() === "Читальный зал") {
            nextSl.imageAlt = setKzIfEmpty(nextSl.imageAlt, "Оқу залы")
          }
          if (isLocalized(nextSl.caption) && nextSl.caption.ru.trim() === "Читальный зал") {
            nextSl.caption = setKzIfEmpty(nextSl.caption, "Оқу залы")
          }
          if (isLocalized(nextSl.imageAlt) && nextSl.imageAlt.ru.trim() === "Книжный фонд") {
            nextSl.imageAlt = setKzIfEmpty(nextSl.imageAlt, "Кітап қоры")
          }
          if (isLocalized(nextSl.caption) && nextSl.caption.ru.trim() === "Книжный фонд") {
            nextSl.caption = setKzIfEmpty(nextSl.caption, "Кітап қоры")
          }
          if (isLocalized(nextSl.imageAlt) && nextSl.imageAlt.ru.trim() === "Сервисы для читателей") {
            nextSl.imageAlt = setKzIfEmpty(nextSl.imageAlt, "Оқырмандарға арналған қызметтер")
          }
          if (isLocalized(nextSl.caption) && nextSl.caption.ru.trim() === "Обслуживание читателей") {
            nextSl.caption = setKzIfEmpty(nextSl.caption, "Оқырмандарға қызмет көрсету")
          }
          return nextSl
        })
      }
    }

    if (type === "quote") {
      d.quote = setKzIfEmpty(d.quote, "Басшылық")
    }

    if (type === "cta") {
      d.title = setKzIfEmpty(d.title, "Кітапхана өміріне қосылыңыз")
      d.lead = setKzIfEmpty(d.lead, "Іс-шаралар, жаңалықтар және электрондық ресурстар — сайтта қолжетімді")
      d.primaryLabel = setKzIfEmpty(d.primaryLabel, "Іс-шаралар")
      d.secondaryLabel = setKzIfEmpty(d.secondaryLabel, "Электронды кітапхана")
    }

    // Общая правка “универсалды” → “әмбебап” внутри локализованных строк
    for (const k of Object.keys(d)) {
      const v = d[k]
      if (isLocalized(v) && v.kz.includes("универсалды")) {
        d[k] = { ...v, kz: v.kz.replaceAll("универсалды", "әмбебап") }
      }
    }

    if (JSON.stringify(d) !== JSON.stringify(s.data)) {
      changed = true
      return { ...s, data: d }
    }
    return s
  })
  return { next, changed }
}

async function main() {
  const row = await prisma.pageContent.findUnique({ where: { page: "about" } })
  if (!row) {
    console.log("[about] pageContent отсутствует — нечего заполнять")
    return
  }
  const { next, changed } = patchAboutSections(row.sections)
  if (!changed) {
    console.log("[about] KZ-поля уже заполнены (или нет подходящих секций)")
    return
  }
  await prisma.pageContent.update({
    where: { page: "about" },
    data: { sections: next as any },
  })
  console.log("[about] ok: KZ-переводы заполнены (где было пусто)")
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

