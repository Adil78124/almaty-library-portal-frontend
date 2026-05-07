import type { SimplePageSection, SimplePageSlug } from "./types"

const NEWS: SimplePageSection[] = [
  {
    type: "hero",
    data: {
      backgroundImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBShuOMgY6kHuzFpSeZBV1A_9wR89n65zMP24fkd6pmPZVB5GD4bqL89gZjprp6-VHtL0Zr5psqVgWp0IUzCpU4ofTk_g4FyJzCJ28BPfaqhOHSBNoL8Aso6bXF1BJXbIoljNhP43P9lIZCd1wfuaMg2NBrasOWq2T0TemB95yLPsO6xmhWyVkQItOdzrbp1Rx-wAjZTywVKlNebgUNkzO1is3oWQWMM-Y1M13NzkVwL0Xh55l2eeXQRzJf97-xoL14khH42jDXUI6Q",
      backgroundImageAlt: "Интерьер библиотеки",
      backgroundImageAltKz: "Кітапхана интерьері",
      breadcrumbLabel: "Новости",
      breadcrumbLabelKz: "Жаңалықтар",
      title: "Новости",
      titleKz: "Жаңалықтар",
      lead: "Последние события из жизни нашей библиотеки: новые поступления, встречи с авторами и культурные инициативы.",
      leadKz:
        "Кітапхана өміріндегі соңғы оқиғалар: жаңа түсімдер, авторлармен кездесулер және мәдени бастамалар.",
    },
  },
]

const EVENTS: SimplePageSection[] = [
  {
    type: "hero",
    data: {
      backgroundImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuClOtU6rg_OK1CVmKTHQLNNZfuX27OLH_5elW8CVkKrTZoOeh4X84x-oubmMNifc-QNwnFh8b8UQeVmjE62eQBerdQgN4Zw9H-aXyflshYCuRpBGmMJ98988vTMBfFce-7L8LLtX2MEF2_n6PJjIFUULdakG5m1JmoYT80IWCyIyJU-5knl5LaZ-8GAW6R1x4_shCd00KGRbpHAJ7UQUEIkC7lQqOkgdeCNr1WAOBi6_L4KK9dfZ8fjDmxAfO90mb9_TJ5PMwgz6859",
      backgroundImageAlt: "Мероприятия",
      backgroundImageAltKz: "Іс-шаралар",
      breadcrumbLabel: "Мероприятия",
      breadcrumbLabelKz: "Іс-шаралар",
      title: "Мероприятия",
      titleKz: "Іс-шаралар",
      lead: "Актуальная афиша событий, встреч, выставок и культурных программ библиотеки.",
      leadKz:
        "Кітапхананың оқиғалары, кездесулер, көрмелер және мәдени бағдарламаларының өзекті афишасы.",
    },
  },
]

const BRANCHES: SimplePageSection[] = [
  {
    type: "hero",
    data: {
      backgroundImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBzAjFOi2ZaBhh8pyFvEmwdj_BHJoORWN3wapmYBRpkarc97ttRF43p25B1OhQbSWPY9fCbc4SemRU_pLrxbjl4g_bZ4arKpK91hk8c9KcWiXkPuIOWg7jOo2FIK6fohtTUUF1AGqSylNxrugaBB3R-2LVWn012Dv5LiUtO34j63dOxbDzRwKvWefnO8nmpYuozId72_tCc3fgqeD_zrXvQ2hPZeBgQV8OhrO8Zkl0YA7BhftYLc3ASxlDQkoAEp8moQuW6vPbU1I8g",
      backgroundImageAlt: "Библиотечный зал",
      backgroundImageAltKz: "Кітапхана залы",
      breadcrumbLabel: "Филиалы",
      breadcrumbLabelKz: "Филиалдар",
      title: "Филиалы",
      titleKz: "Филиалдар",
      lead: "Районные и городские библиотеки сети с контактной информацией и кратким описанием",
      leadKz:
        "Байланыс ақпараты мен қысқаша сипаттамасы бар аудандық және қалалық кітапханалар.",
    },
  },
]

const STRUCTURE: SimplePageSection[] = [
  {
    type: "hero",
    data: {
      backgroundImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBkQbqNeErOu8GkQ70Am6opUhA8M-zaGle4eiWyimRv8lnamLuF2K6Rp8orfd_Gx9KjJEIxppgaTf8lwbGxgW2L-GA0R6SuG0eOTVnYPiF6EZ-IxktfouMAkpAlc72oOPL9I6JfxYQSJ0EuQL7TlP7Z-bRsXZHvv1Hl5CgMYglOOAwODHwJRFmyGdbk2FnhI1zqZxU8WHde-ZH0gLTHmRYPX60QEso1gZahse0LkV8xvcIYs_Kj-HuPjo16TXHIoI0krM-lLup0cIKZ",
      backgroundImageAlt: "Структура библиотеки",
      backgroundImageAltKz: "Кітапхана құрылымы",
      breadcrumbLabel: "Структура библиотеки",
      breadcrumbLabelKz: "Кітапхана құрылымы",
      title: "Структура библиотеки",
      titleKz: "Кітапхана құрылымы",
      lead: "Информация об отделах, направлениях работы и руководителях библиотечной сети.",
      leadKz:
        "Бөлімдер, жұмыс бағыттары және кітапханалар желісінің басшылары туралы ақпарат.",
    },
  },
]

export function getDefaultSimpleSections(slug: SimplePageSlug): SimplePageSection[] {
  if (slug === "news") return NEWS
  if (slug === "events") return EVENTS
  if (slug === "structure") return STRUCTURE
  return BRANCHES
}
