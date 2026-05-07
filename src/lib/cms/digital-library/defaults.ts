import { L } from "@/lib/i18n/app-locale"

import type { DigitalLibrarySection } from "./types"

export function getDefaultDigitalLibrarySections(): DigitalLibrarySection[] {
  return [
    {
      type: "hero",
      data: {
        backgroundImageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAH5q0MmxUrIi2Sq9F3PxHravWkbTrG3Jq9-fa_r0BuhB6Iba4HV0w3uUThHESqR0rexkToyTOUF1RaWdNawXr7xfBHs7iyh3XuKRkFSPL1a3fdHzoMJMgMFtpsQZoeX-5NLk4zzVmnXw6HvgD5K7ZIPgKOZMWhSAEKJ128MVQ2lVInX8ZhcpUkfeJ5f9UUMnpIZ0UmmD8QTYly4YeSgLnELZjao0vY_fed9YXx8eCeh-G61_NupdhA4gVm9lHG-EQo3I7lrqkyv5Ct",
        backgroundImageAlt: L(
          "Modern library interior with high ceilings and vast shelves of books in soft atmospheric lighting",
          "Жоғары төбелі, кең кітап сөрелері бар заманауи кітапхана интерьері"
        ),
        breadcrumbLabel: L("Электронная библиотека", "Электронды кітапхана"),
        title: L("Электронная библиотека", "Электронды кітапхана"),
        lead: L(
          "Доступ к электронным книгам, текстовым материалам и цифровым ресурсам библиотеки из любой точки мира.",
          "Кітапхананың электронды кітаптарына, мәтіндік материалдар мен сандық ресурстарға әлемнің кез келген жерінен қолжетімділік."
        ),
      },
    },
    {
      type: "bento",
      data: {
        cards: [
          {
            iconName: "new_releases",
            title: L("Новые поступления", "Жаңа түсімдер"),
            body: L(
              "Последние обновления нашего цифрового фонда и свежие публикации.",
              "Сандық қорымыздың соңғы жаңартулары мен жаңа жарияланымдар."
            ),
            tone: "primaryFixed",
          },
          {
            iconName: "star",
            title: L("Популярные книги", "Танымал кітаптар"),
            body: L(
              "Топ-выбор читателей нашей электронной библиотеки за последний месяц.",
              "Өткен айдағы электронды кітапхана оқырмандарының таңдауы."
            ),
            tone: "neutral",
          },
        ],
      },
    },
    {
      type: "help",
      data: {
        title: L(
          "Как пользоваться электронной библиотекой",
          "Электронды кітапхананы қалай пайдалану керек"
        ),
        steps: [
          L(
            "Используйте поиск для нахождения нужной книги или материала",
            "Қажетті кітап немесе материалды табу үшін іздеуді пайдаланыңыз"
          ),
          L("Откройте карточку материала", "Материал карточкасын ашыңыз"),
          L(
            "Выберите «Читать» для онлайн-просмотра или «Скачать» для офлайн-доступа",
            "Онлайн қарау үшін «Оқу» немесе офлайн үшін «Жүктеу» таңдаңыз"
          ),
        ],
        formats: ["PDF", "EPUB", "DJVU", "FB2"],
      },
    },
    {
      type: "access",
      data: {
        title: L("Правила доступа", "Қолжетімділік ережелері"),
        body: L(
          "Некоторые издания защищены авторским правом и доступны только в читальных залах филиалов библиотеки.",
          "Кейбір басылымдар авторлық құқықпен қорғалған және тек кітапхана филиалдарының оқу залдарында қолжетімді."
        ),
      },
    },
    {
      type: "cta",
      data: {
        title: L("Откройте цифровой фонд библиотеки", "Кітапхананың сандық қорын ашыңыз"),
        lead: L(
          "Более 500 000 материалов уже доступны для вашего образования и вдохновения в любой точке планеты.",
          "500 000-нан астам материал сіздің білім алуыңыз бен шабытыңызға планетаның кез келген нүктесінде қолжетімді."
        ),
        primaryLabel: L("Перейти ко всем материалам", "Барлық материалдарға өту"),
        primaryHref: "/digital-library",
        secondaryLabel: L("Связаться с библиотекой", "Кітапханаға хабарласу"),
        secondaryHref: "/contacts",
      },
    },
  ]
}

