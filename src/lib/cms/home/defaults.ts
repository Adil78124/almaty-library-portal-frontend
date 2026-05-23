import type { HomeSection } from "./types"

const BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5c0vwXfTeNC1AaHELlTsgyqBVBWHLT_5m0czaeghM0gnzUNOFyUNf7y8OUpF_t7sjojmVXtHTWEzj5_r0btWSFJ1kxaB6vvIwqtvtgu9L_fqPTD7T77dAjVG_HLEOS2L9FpJaK_UZXEmZ7M3jBsWotG9RCjlU3H0kwbJRuWBU6XvndLotEdP7MTviCqjUuh7JkWdsoKxW6tJtgqtIxIY15VMnO0_SanZD01FOuzYaR5vFEG00-vaEoSC_I98VYWPCiRmKMxiyjXQN"

const EV1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCILjEDJU6rmjEPtpOZEqgXOjvtd12D-vtz1BH2rWpQjKzMMTyRxYYElg5MShHzS-zgdmtAyNHcccJr0279ohF57VlTmRTidGfPdsuMQ-62A4Sf-reXa07RFA-Pf0A_gdmhZX2COZvO1qCXJUoaoOz2hJHoenr4F78d0NYdAuFzjs-rj9rCedHRaGQv4s1YAthRt1f2NJHjgwm_Tproiy5vcdJXmVHV5HkwFzBRKxQuKY3V9PyP4KzSL78yoPq-tQlAtUGnpmZJnju3"
const EV2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDjtK58q3Tyqw5PO7Y6TyknmRWjPiGSEmTJ_pVYxAbQIolqRU7sUAemli63U6uzYvalM7ciQQ0hl31fKA3A0-6pbUhZEX_6pAk2z4t_GE6BMjbAtCwbaRSd3qgWMCLs-7ygyavf2zKFCe-clQwN7Ie9pJc1Va9e1HMpma6XbgYpdZHnOGATShE8Bf8EsLMzCxCuVoICcDoPqX7ONj1M6QCgJfXqdQdWNJNIT7qJaZn2UOilQ8HxDGYj-SiDMmr190kML9tygJpbJqq2"
const EV3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBVK14EH77eJq80ATLYhSI1cBpErTzFdJZNc9BC9YUJC-bK_Gq-n_49HDr1n1ks2llqQnkn93yhNx8kQZPZPzhjImb1mOREhCHR7kBmvoRAL7TX_pRBM-50rTd4S8n8ZG1w8U__-u5qYQuVkaJwxW0KJMpQKLG6XeP3MiIzcr-XrE0bmX0xyivGqpgwxJewq7hIjpRJ3ssmL1789gFgTJ9qWia9XRxqEnkX0u3L_HG4tR_kR9ZAanrOcavP0UsYVxKY_a3lG2G73BV7"
const EV4 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCXHeEmP48-jcuA7xvUNXI3qRl9OFIcd5XSyeDKB0CHByLzjKztq5MJ2byGBD5uCXXne2V5NzZT5uhqds_FD_Jq1nEgjLdwRj3K0ePABBknFp0IfyyXlN4A8RtueN8tzYo-jp1hVu-hcN9a8HfzDjcEusQnQzuBiMK3fCzSCGYt6IT6azFZrVw1Lb-kA4Nsnca6Zr_Y4I-Zo52a6wP4lxW2XGIKdxYJgQTYfg81ywPN9ZOwDtN-mwmrEiqbdqYU0BtvDNaiV64QSqWU"

const B1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyaPqr0VuTVh_FoUSUQFr5TSQHvVPqfG0jDqSmONcc1OrmAD-GMLVd-bauz5nYr_bsu3aKjAdDmkF895nr6Psj-ERMC0iRGOjbJcygkK1nh-0H-E2YIhAugxJQqJmfdcTmS1Xkald6xTpT0enHJzlvA8XmL4Jt03g19SchwGheJ9Smu6CvCggagq2fWjOKgLRck2fcXa5jPB9dt3LjxPPg6gjxJ1qmMqvZnOOALpnVtKpnAUzrRg51ToMt2b1PRpabwi20ni02tS2T"
const B2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZcvykO3Rf9T7OAaM0sya225fvsv7K621Qex6XYLT8d5HUBSpQawifg8QbJ4n19KOznTR0VqBIiwtXVVtT9OKIBT_dwxDBZach2iciatV2OcSjV8fDR3QBk63AVOg_va35p8l_b8btbapkIu-mPoIan7YT-5CuK3YYj1RT3WkZwHlELwFv8_sY-YNjmUP87iDePaVI201fGGJqzCEVavoI4P2I-5-2tFrQPHrr2XY22Tx_OD1QeOtaULnI81mDWHWoc2hXDqjkTUIW"
const B3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDUnzeKJWdXNzlBGTO5tjzjsH_Eenbdx1lt7zHIcnF9rk0gOyfgoeu92gjsts-_oCQpGtRE4bLqLqUSgi7L1fKkO95VpGAGFpQ5i7eVrQKviPfw6dPUcFkPqcVrmXPteq6DBa6bDqNx13flhLkTQtxKBhHhPnQwraG6e-5OCGpGQGvM5bjqm2e0KVRy435Rwwjgxo3krMDf4Y6s9Fy4GRnyIk3blr0FUZUdcn0QAwo2TV_dRgbkdbn8BSN-KzfvhggmYeKt3a5dpglB"
const B4 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB58TT9-WrZUgIZjehLZAYIDRi4SmKo-AGwyexRoIZYt5T_saYbqGJwezRhLLl00yQdkEIBP5O4NzOwue-WDey3RyHbxYJ9u-9yccpttfAbtiqxV7RPuQ87dRFDSBIMjX2hXJvPD8dc49n2kp0mOiRO21OLpermWUlitNBC5Zqn9hPGDxNnd3YEecXV2ZDPWWlOcXTWn6gCIMHlXJjHP4zLPrq4oQzNnDngDubFp7Y623ooVbqjLuUFALe5APUFWROBI_w385aa8tbs"
const B5 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpP2qrGBJaD3nZFbFnr-Qurk5WoluQcbRnA6T9P5S1PgmnTJp6tWG3szugwTn3-w26LVbOSGr2XH6A09giqxV1u9-5SoJ6sapqYLTICnsbaI7OwAtqCo56GOVddPALQVkClHlSh1FZKdoFqXAGOWUuF-s4z1L2mGrJQkiGNXi8l0fYaasFEKIHk2LwKbCO_2R8Ubhri23RrX9tpQic_3FmWsDai3jjg2jJvp0E1T8qrqGEVV9YHvOULqd8DT0EqzZMt5nE1I-w-Jp2"
const B6 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqhycCBCqLnypiTSDwtSi2hMgcPdo8PEynr7QHckAnafc0u-biDwqy8VQN7l5lNLSJBKlzDzTzEdPZU6DaOf7XIv_APjCOqZ3tUsdwJcYxvxr7amp5BQuxioac6vIAEWLEpvRlozl35IgUePjGjP9OngQXW7eYDoCp8F8jxJpxdMk0_BwUzrmD6bEIOexlgx18HulvdBX3aEtPj0qvgsSoW9M6nFJLQpBtFW6svvIGf59XWEgMjsuoFjlSfzDM5-9F8Xj6hO2UdPda"

const LH1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcm0YloQK4u_p0WAfziM-McN1VNppfafIts3kHvEO0U2Qqb2_blmiuHkPI_reIRxU3dMMbwQ-Mu9Ke1jwpDwDVmOQW0CGvUEw9WFIeC9w3R-f54bKJq-thH2lrT721HiJR32VezQzgoU5TsnFo-yGmDt871tlHZ2hKbDDFPkVBLGBXC7hrW1tWVRE51H5MQY_2KscRi2xL25FD_lJJ3hfXvvLwfqpTslCadXWqE51NoB9mE3uDI7CtHHmKKcNFguO3MdoXJEu9tIxO"
const LH2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB7FEye3p2yOU34v6_Dc_WT8dGjUgJt1g3dDzAWDe2qJsGGJ53jWDA_95TXQaNSqeGsNAL5JJvThqZ9X6WvAmHZCWENBMwY3uk2XoDxBOQ5umYjwRsItzw_iQvRO5Nm7TbUQClPHZg4Bj1A2Bmr9AS8ZJN8i20vGDQN8wRFN1tCCSea3YNkw1ZHJPiLkHa3jw2co4rr_sVeop-taSbPvWvLhvrR8vp9W9tpALBEMJl3wD19smrJ3wkHtlabbFIWE-vHvGvcP0dZ8M54"
const LH3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDXTmlEv8GH8UFAQ1AOqaBX7h901IHJnEi547LT13qIk4gHYsx01gw-cxRMFv3nR3luOz4wqjkTCYN2-sKRxduZzoK9C0gMVbXKcfRDE5ZvUwHdNp0SbnS4WHMfbR1RtvrRAuL7Mp1M9lB1oogAQ7_4eTIvQq8ZN-ac29uT7nE02G60f_7D89waRLWD_r4XtfLJuX42xmpAhKP8zczCfuajrFP2HWif6FuU95GzgOn8ZMPmGqoj_igaKDXBka3snOFQsd3XKSa_cai4"

export function getDefaultHomeSections(): HomeSection[] {
  return [
    {
      type: "hero",
      data: {
        backgroundImageUrl: BG,
        backgroundAlt: "Library Background",
        backgroundAltKz: "Кітапхана туралы фон",
        titleLine1: "Алматинская областная",
        titleLine1Kz: "Алматы облыстық",
        titleLine2: "центральная универсальная библиотека",
        titleLine2Kz: "орталық әмбебап кітапхана",
      },
    },
    {
      type: "quote",
      data: {
        text: "«Ғылым таппай мақтанба, орын таппай баптанба.»",
        textKz: "«Ғылым таппай мақтанба, орын таппай баптанба.»",
        author: "Абай Құнанбайұлы",
        authorKz: "Абай Құнанбайұлы",
      },
    },
    {
      type: "ticker",
      data: {
        items: [
          { text: "Новости библиотеки", textKz: "Кітапхана жаңалықтары" },
          { text: "Новые поступления", textKz: "Жаңа түсімдер" },
          { text: "Мероприятия", textKz: "Іс-шаралар" },
          { text: "Объявления", textKz: "Хабарландырулар" },
        ],
      },
    },
    {
      type: "statistics",
      data: {
        cards: [
          {
            iconName: "library_books",
            valueText: "450k+",
            valueTextKz: "",
            label: "Общий объем книжного фонда",
            labelKz: "Кітап қорының жалпы көлемі",
          },
          {
            iconName: "translate",
            valueText: "120k+",
            valueTextKz: "",
            label: "Книги на казахском языке",
            labelKz: "Қазақ тіліндегі кітаптар",
          },
          {
            iconName: "group",
            valueText: "15k+",
            valueTextKz: "",
            label: "Число зарегистрированных читателей",
            labelKz: "Тіркелген оқырмандар саны",
          },
          {
            iconName: "new_releases",
            valueText: "2.5k",
            valueTextKz: "",
            label: "Новые поступления",
            labelKz: "Жаңа түсімдер",
          },
        ],
      },
    },
    {
      type: "afisha",
      data: {
        kicker: "Афиша",
        kickerKz: "Афиша",
        title: "Предстоящие мероприятия",
        titleKz: "Алдағы іс-шаралар",
      },
    },
    {
      type: "eLibrary",
      data: {
        title: "Электронная библиотека",
        titleKz: "Электронды кітапхана",
        description:
          "Доступ к тысячам оцифрованных изданий, научных статей и редких документов в один клик.",
        descriptionKz:
          "Мыңдаған сандық басылымдарға, ғылыми мақалаларға және сирек құжаттарға бір шертумен қол жеткізу.",
        buttonLabel: "Перейти в электронную библиотеку",
        buttonLabelKz: "Электронды кітапханаға өту",
        buttonHref: "https://elib.obllibrary.kz",
        source: "manual",
        manualBooks: [
          { coverUrl: B1, title: "Абай жолы. I том", author: "М. Ауэзов" },
          { coverUrl: B2, title: "История Казахстана", author: "А. Кузембайулы" },
          { coverUrl: B3, title: "Слова назидания", author: "Абай Кунанбаев" },
          { coverUrl: B4, title: "Кан мен тер", author: "А. Нурпеисов" },
          { coverUrl: B5, title: "Мир без границ", author: "Современная проза" },
          { coverUrl: B6, title: "Цифровое будущее", author: "Научное издание" },
        ],
      },
    },
    {
      type: "latestNews",
      data: {
        kicker: "События",
        kickerKz: "Оқиғалар",
        title: "Последние новости",
        titleKz: "Соңғы жаңалықтар",
      },
    },
    {
      type: "newArrivals",
      data: {
        title: "НОВЫЕ ПОСТУПЛЕНИЯ",
        titleKz: "ЖАҢА ТҮСІМДЕР",
        subtitle: "Последние книги и издания, пополнившие наш фонд.",
        subtitleKz: "Қорымызды толықтырған соңғы кітаптар мен басылымдар.",
        source: "database",
        database: { limit: 6 },
        manualBooks: [
          {
            coverUrl: EV2,
            title: "Путь Абая",
            author: "М. Ауэзов",
            detailHref: "#",
          },
          {
            coverUrl: B2,
            title: "Великая Степь",
            author: "А. Касымов",
            detailHref: "#",
          },
          {
            coverUrl: B3,
            title: "Философия Духа",
            author: "С. Садвакасов",
            detailHref: "#",
          },
          {
            coverUrl: B4,
            title: "Забытое наследие",
            author: "Т. Жургенов",
            detailHref: "#",
          },
          {
            coverUrl: B5,
            title: "Ритмы Города",
            author: "Е. Брусиловский",
            detailHref: "#",
          },
          {
            coverUrl: B6,
            title: "Будущее Цифры",
            author: "О. Сулейменов",
            detailHref: "#",
          },
        ],
      },
    },
    {
      type: "localHistory",
      data: {
        title: "Краеведение",
        titleKz: "Өңіртану",
        description:
          "Краткие материалы об исторических личностях региона и культурном наследии.",
        descriptionKz:
          "Өңірдің тарихи тұлғалары мен мәдени мұрасы туралы қысқаша материалдар.",
        source: "manual",
        manualCards: [
          {
            portraitUrl: LH1,
            name: "Абай Кунанбаев",
            nameKz: "Абай Құнанбайұлы",
            excerpt:
              "Поэт, философ, основоположник новой казахской реалистической литературы...",
            excerptKz:
              "Ақын, философ, қазақ әдебиетіндегі жаңа реализм бағытының негізін қалаушы...",
          },
          {
            portraitUrl: LH2,
            name: "Мухтар Ауэзов",
            nameKz: "Мұхтар Әуезов",
            excerpt:
              "Выдающийся казахский писатель, драматург и ученый, академик АН КазССР...",
            excerptKz:
              "Қазақтың көрнекті жазушысы, драматургі және ғалымы, Қазақ ССР ҒА академигі...",
          },
          {
            portraitUrl: LH3,
            name: "Чокан Валиханов",
            nameKz: "Шоқан Уәлиханов",
            excerpt:
              "Казахский ученый, просветитель, историк, этнограф и географ...",
            excerptKz:
              "Қазақ ғалымы, ағартушы, тарихшы, этнограф және географ...",
          },
          {
            name: "Историческая личность",
            nameKz: "Тарихи тұлға",
            excerpt:
              "Карточка для будущего материала раздела краеведения...",
            excerptKz: "Өңіртану бөлімі үшін болашақ материал карточкасы...",
          },
        ],
      },
    },
    {
      type: "mediaGallery",
      data: {
        title: "Медиагалерея",
        titleKz: "Медиа галерея",
        videos: [
          { position: 1, youtubeUrl: "" },
          { position: 2, youtubeUrl: "" },
          { position: 3, youtubeUrl: "" },
          { position: 4, youtubeUrl: "" },
          { position: 5, youtubeUrl: "" },
        ],
      },
    },
    {
      type: "usefulLinks",
      data: {
        kicker: "Партнеры и ресурсы",
        kickerKz: "Серіктестер мен ресурстар",
        title: "Полезные ссылки",
        titleKz: "Пайдалы сілтемелер",
        source: "manual",
        manualLinks: [
          {
            href: "https://www.gov.kz/memleket/entities/mam",
            title: "Министерство культуры и информации РК",
            titleKz: "ҚР Мәдениет және ақпарат министрлігі",
            logoUrl: "/images/Emblem_of_Kazakhstan_(2014-2018).png",
            logoVariant: "round",
          },
          {
            href: "https://www.gov.kz/memleket/entities/almobl",
            title: "Акимат Алматинской области",
            titleKz: "Алматы облысының әкімдігі",
            logoUrl: "/images/logo.png",
            logoVariant: "round",
          },
          {
            href: "https://kazneb.kz/",
            title: "Национальная электронная библиотека РК",
            titleKz: "Қазақстан ұлттық электронды кітапханасы",
            logoUrl: "/images/kazneb.png",
            logoVariant: "rect",
          },
        ],
      },
    },
  ]
}
