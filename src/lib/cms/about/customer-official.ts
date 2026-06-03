import { L } from "@/lib/i18n/app-locale"

import type { AboutSection } from "./types"

/** Согласованные с заказчиком тексты (источник: инфо.docx). */
export const OFFICIAL_ORG = {
  orgNameShort: "АООЦУБ",
  orgNameLong: "Алматинская областная центральная универсальная библиотека",
  orgNameShortKz: "АООӘК",
  orgNameLongKz: "Алматы облыстық орталық әмбебап кітапхана",
  footerTaglineRu:
    "Современный культурно-информационный центр со свободным доступом к знаниям, информации и культурному наследию.",
  footerTaglineKz:
    "Білім мен ақпаратқа, мәдени мұраға еркін қол жеткізуді қамтамасыз ететін заманауи мәдени-ақпараттық орталық.",
} as const

export const OFFICIAL_CONTACTS = {
  addressRu: "г. Алматы, ул. С. Татибекова, 27",
  addressKz: "Алматы қаласы, С. Тәтібеков көшесі, 27",
  phone: "+7 (771) 409 9100",
  phoneSecondary: "+7 (702) 191 52 57",
  email: "almatyoblkitaphana@mail.ru",
} as const

export const OFFICIAL_SANITARY = {
  ru: "последний рабочий день каждого месяца",
  kz: "әр айдың соңғы жұмыс күні",
} as const

export const OFFICIAL_WORKING_HOURS = {
  monday: { isOpen: true, from: "08:00", to: "17:30" },
  tuesday: { isOpen: true, from: "08:00", to: "17:30" },
  wednesday: { isOpen: true, from: "08:00", to: "17:30" },
  thursday: { isOpen: true, from: "08:00", to: "17:30" },
  friday: { isOpen: true, from: "08:00", to: "17:30" },
  saturday: { isOpen: true, from: "10:00", to: "17:00" },
  sunday: { isOpen: false },
} as const

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4MpEYMETmNGcSkX-vGkoHAc2TvB7FYCiYr-hOCKy3uG1BLRaNgiCmy_oyLofvpCQxdCrELkgw9qIQ05zQ8Aj2ePbrPM-5k2AKxc9MIkb1wHxaxhwVgazLiLR93eKB82dDYzfvfJ35pmmM6_fxIFFXZEn0V_X2RoK7fEintP1-sVskOthl1QsfXHN6AtIJHMvKbAnA_zTMCN5aciHuAto2pg__dBSmiiLJcaRc84OXRLJ-BqsKTwVjw0P5tKWUNcJ0wHpgtSEj2oL8"

const SIDE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCPMjXPq863e-sfwq53J9rdPtNlXcAOxxVTFOerRTIgvpLEX7OcOiTdjV7iNwmaLeEhznGtTWxe_ZwJU9SN3EXzeLrg-0H7JINblDlX3hKaeZbFr5svE_YnSQN6z77giH7QfUGXeVc7UuibubqOqZW1joq4SIO675-GjtMdcmdG89bjROAGMosV-51jDpedjQU69j9xq9Md0d3SGWpL0Fnm7_QiMr4-H6u40PJSDQPTUBnb-oFEynHE035oPlahcp0Ld8fE60XuWLsw"

const INTRO_RU =
  "Алматинская областная универсальная библиотека — это современный культурно-информационный центр, обеспечивающий свободный доступ к знаниям, информации и культурному наследию. Библиотека обслуживает широкий круг пользователей, предоставляя печатные и электронные ресурсы, а также организуя культурно-просветительские мероприятия."

const MISSION_RU =
  "Содействие развитию интеллектуального потенциала общества, продвижение чтения и обеспечение равного доступа к информации."

const HISTORY_RU =
  "Библиотека была основана в 1949 году. За годы своей деятельности она стала одним из ведущих культурных учреждений региона, активно внедряя современные технологии и расширяя спектр услуг."

const INTRO_KK =
  "Алматы облыстық әмбебап кітапханасы – заманауи мәдени-ақпараттық орталық, ол пайдаланушыларға білім мен ақпаратқа еркін қол жеткізуге мүмкіндік береді. Кітапхана оқырмандарға баспа және электронды ресурстар ұсынып, түрлі мәдени-ағартушылық іс-шаралар ұйымдастырады."

const MISSION_KK =
  "Қоғамның зияткерлік әлеуетін дамытуға ықпал ету, кітап оқуды насихаттау және ақпаратқа тең қолжетімділікті қамтамасыз ету."

const HISTORY_KK =
  "Кітапхана 1949 жылы құрылған. Өз қызметі барысында өңірдегі жетекші мәдени мекемелердің біріне айналып, заманауи технологияларды енгізіп келеді."

const DEPTS_RU = [
  "Отдел развития библиотек и связей с общественностью",
  "Отдел обслуживания читателей",
  "Отдел информационно-библиографического обеспечения",
  "Отдел комплектования и обработки литературы",
  "Отдел технического обслуживания и программного обеспечения",
  "Отдел хранения книжного фонда",
  "Отдел искусства и литературы",
] as const

const DEPTS_KK = [
  "Кітапханаларды дамыту және қоғаммен байланыс бөлімі",
  "Оқырмандарға қызмет көрсету бөлімі",
  "Ақпараттық-библиографиялық қамтамасыздандыру бөлімі",
  "Әдебиеттерді толықтыру, өңдеу бөлімі",
  "Техникалық қызмет көрсету және бағдарламалық қамтамасыз ету бөлімі",
  "Кітап қорын сақтау бөлімі",
  "Өнер және әдебиет бөлімі",
] as const

const ICONS = [
  "hub",
  "groups",
  "menu_book",
  "inventory_2",
  "computer",
  "local_library",
  "palette",
] as const

const BODY_DEPT_RU = "Структурное подразделение библиотеки."
const BODY_DEPT_KK = "Кітапхананың құрылымдық бөлімі."

const TIMELINE2_RU =
  "Библиотека развивает цифровые сервисы, расширяет фонд и проводит культурно-просветительские мероприятия для читателей всего региона."
const TIMELINE2_KK =
  "Кітапхана сандық қызметтерді дамытады, қорды кеңейтеді және өңір оқырмандарына арналған мәдени-ағартушылық іс-шаралар өткізеді."

function deptCardsBilingual(): AboutSection {
  return {
    type: "mission",
    data: {
      cards: DEPTS_RU.map((ru, i) => ({
        iconName: ICONS[i] ?? "apartment",
        title: L(ru, DEPTS_KK[i] ?? ""),
        body: L(BODY_DEPT_RU, BODY_DEPT_KK),
      })),
    },
  }
}

/** Одна страница «О библиотеке»: все тексты как { ru, kz }. */
export function buildOfficialAboutSectionsBilingual(): AboutSection[] {
  const sections: AboutSection[] = [
    {
      type: "hero",
      data: {
        imageUrl: HERO_IMG,
        imageAlt: L(
          "Алматинская областная универсальная библиотека",
          "Алматы облыстық әмбебап кітапханасы"
        ),
        breadcrumbLabel: L("О библиотеке", "Кітапхана туралы"),
        title: L("О библиотеке", "Кітапхана туралы"),
        lead: L(INTRO_RU, INTRO_KK),
      },
    },
    {
      type: "director",
      data: {
        title: L("Директор библиотеки", "Кітапхана директоры"),
        name: L("Тоқабаева Ғалия Сламбайқызы", "Тоқабаева Ғалия Сламбайқызы"),
        position: L("Директор", "Директор"),
        body: L(
          "Директор библиотеки координирует развитие учреждения, работу с читателями и внедрение современных библиотечных сервисов.",
          "Кітапхана директоры мекеменің дамуын, оқырмандармен жұмысты және заманауи кітапханалық қызметтерді үйлестіреді."
        ),
        imageUrl: "/placeholder.svg",
        imageAlt: L("Директор библиотеки", "Кітапхана директоры"),
      },
    },
    {
      type: "roleIntro",
      data: {
        kicker: L("Миссия", "Миссиясы"),
        title: L("Направление деятельности", "Басты бағыттар"),
        paragraphs: [L(MISSION_RU, MISSION_KK), L(HISTORY_RU, HISTORY_KK)],
        sideImageUrl: SIDE_IMG,
        sideImageAlt: L("Фонд библиотеки", "Кітап қоры"),
      },
    },
    {
      type: "timeline",
      data: {
        title: L("История", "Тарихы"),
        items: [
          {
            year: L("1949", "1949"),
            title: L("Основание", "Құрылуы"),
            body: L(HISTORY_RU, HISTORY_KK),
            align: "left",
          },
          {
            year: L("Сегодня", "Бүгінгі күн"),
            title: L("Современный этап", "Заманауи кезең"),
            body: L(TIMELINE2_RU, TIMELINE2_KK),
            align: "right",
          },
        ],
      },
    },
    deptCardsBilingual(),
    {
      type: "facts",
      data: {
        stats: [
          { value: L("1949", "1949"), label: L("год основания", "құрылған жылы") },
          {
            value: L("7", "7"),
            label: L(
              "структурных подразделений",
              "құрылымдық бөлім"
            ),
          },
          {
            value: L("100%", "100%"),
            label: L(
              "фокус на доступ к информации",
              "ақпаратқа қолжетімділік"
            ),
          },
        ],
      },
    },
    {
      type: "cta",
      data: {
        title: L(
          "Присоединяйтесь к жизни библиотеки",
          "Кітапхана өміріне қосылыңыз"
        ),
        lead: L(
          "Мероприятия, новости и электронные ресурсы — на сайте.",
          "Іс-шаралар, жаңалықтар және электронды ресурстар — сайтта."
        ),
        primaryLabel: L("Мероприятия", "Іс-шаралар"),
        primaryHref: "/events",
        secondaryLabel: L("Электронная библиотека", "Электронды кітапхана"),
        secondaryHref: "https://elib.obllibrary.kz",
      },
    },
  ]
  return sections
}
