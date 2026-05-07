import type { PrismaClient } from "@prisma/client"

type Row = {
  slug: string
  title: string
  titleKz: string
  excerpt: string
  excerptKz: string
  body: string
  bodyKz: string
  coverImageUrl: string
  publishedAt: Date
  location: string | null
  locationKz: string | null
  curator: string | null
  curatorKz: string | null
}

export const NEWS_SEED_ROWS: Row[] = [
  {
    slug: "updated-reading-room",
    title: "Открытие обновленного зала классической литературы",
    titleKz: "Жаңартылған классикалық әдебиет залының ашылуы",
    excerpt:
      "Мы завершили масштабную реконструкцию восточного крыла. Теперь читателям доступны новые зоны для индивидуальной работы и редкие издания классиков.",
    excerptKz:
      "Шығыс қанатын кең көлемді реконструкция аяқтадық. Енді оқырмандарға жеке жұмыс үшін жаңа аймақтар мен классиктердің сирек басылымдары қолжетімді.",
    body: "Мы завершили масштабную реконструкцию восточного крыла главного здания. Читателям открыт просторный зал классической литературы с новыми рабочими местами и улучшенным освещением.\n\nВ обновлённом пространстве появились зоны для индивидуальной работы, мягкие кресла для длительного чтения и выставочные витрины с редкими изданиями.\n\nПриглашаем всех желающих познакомиться с новым интерьером в любой будний день с 9:00 до 18:00.",
    bodyKz:
      "Бас ғимараттың шығыс қанатын кең көлемді реконструкция аяқтадық. Оқырмандарға жаңа жұмыс орындары мен жарықтандыруы жақсартылған кең классикалық әдебиет залы ашылды.\n\nЖаңартылған кеңістікте жеке жұмыс аймақтары, ұзақ оқуға арналған жұмсақ орындықтар және сирек басылымдармен витриналар пайда болды.\n\nЖаңа интерьермен танысуға барлық қалаушыларды дүйсенбіден жұмаға дейін 9:00–18:00 шақырамыз.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBShuOMgY6kHuzFpSeZBV1A_9wR89n65zMP24fkd6pmPZVB5GD4bqL89gZjprp6-VHtL0Zr5psqVgWp0IUzCpU4ofTk_g4FyJzCJ28BPfaqhOHSBNoL8Aso6bXF1BJXbIoljNhP43P9lIZCd1wfuaMg2NBrasOWq2T0TemB95yLPsO6xmhWyVkQItOdzrbp1Rx-wAjZTywVKlNebgUNkzO1is3oWQWMM-Y1M13NzkVwL0Xh55l2eeXQRzJf97-xoL14khH42jDXUI6Q",
    publishedAt: new Date("2024-06-12T10:00:00.000Z"),
    location: "Главное здание, 2-й этаж",
    locationKz: "Бас ғимарат, 2-қабат",
    curator: "Отдел классической литературы",
    curatorKz: "Классикалық әдебиет бөлімі",
  },
  {
    slug: "rare-manuscripts",
    title: "Поступление коллекции редких манускриптов",
    titleKz: "Сирек қолжазбалар коллекциясының түсуі",
    excerpt:
      "Фонд редких книг пополнился уникальными рукописями XVIII века. Исследователи и студенты могут ознакомиться с ними по предварительной записи.",
    excerptKz:
      "Сирек кітаптар қоры XVIII ғасырдың бірегей қолжазбаларымен толықты. Зерттеушілер мен студенттер олармен алдын ала жазылу арқылы таныса алады.",
    body: "Фонд редких книг нашей библиотеки пополнился уникальным экспонатом. Частный коллекционер передал в дар прижизненное издание философских трудов, датируемое серединой XVIII века.\n\nКнига сохранилась в превосходном состоянии, включая оригинальный кожаный переплет с золотым тиснением.\n\nМы выражаем глубокую благодарность меценатам, способствующим сохранению культурного наследия.",
    bodyKz:
      "Кітапхана сирек кітаптар қоры бірегей экспонатпен толықты. Жеке коллекционер философиялық еңбектердің XVIII ғасырдың ортасына жататын заманында басылған нұсрасын сыйға тартты.\n\nКітап түпнұсқа былғары мұқабасы мен алтын бедерлеуімен бірге тамаша сақталған.\n\nМәдени мұраны сақтауға үлес қосқан меценаттарға алғысымызды білдіреміз.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAD-FaqjgtJdGVy19GkGcSnYFMW0DLR1asaQO42S2eJbDpO5oR9mjZh2RcEKb9JGd8zztDOicWL-ZHPerNu9JgckjdGwQ2T92un306t2arhUM-CczXewEvX8E0QAxFLaKjf44vJF2F5pC_RKlW-UuR_yX44EQ6ZI7e2KultcLPUITE_Oi_XrqwLkpH5HKyq5mYrGlUsTE-xexET7pe98X_26M0eTZiXpgupDpuRuR_0qbanzd60aKJNOpilvxxwZoseJTGtTIo6bWZf",
    publishedAt: new Date("2024-06-08T10:00:00.000Z"),
    location: "Главный архивный корпус",
    locationKz: "Бас мұрағат корпусы",
    curator: "Анна Васильевна Громова",
    curatorKz: "Анна Васильевна Громова",
  },
  {
    slug: "literary-evening",
    title: "Литературный вечер с современными авторами",
    titleKz: "Қазіргі авторлармен әдеби кеш",
    excerpt:
      "В предстоящий четверг состоится встреча с лауреатами премии «Книга года». Вход свободный по читательским билетам.",
    excerptKz:
      "Алдағы бейсенбіде «Жыл кітабы» сыйлығының лауреаттарымен кездесу өтеді. Оқырман билеті бойынша кіру тегін.",
    body: "В предстоящий четверг состоится встреча с лауреатами премии «Книга года». Вход свободный по читательским билетам.\n\nВ программе — чтение отрывков из новых книг, ответы на вопросы аудитории и неформальное общение в кулуарах. Начало в 18:30.\n\nРекомендуем заранее забронировать места в читальном зале через сайт или по телефону справочной службы.",
    bodyKz:
      "Алдағы бейсенбіде «Жыл кітабы» сыйлығының лауреаттарымен кездесу өтеді. Оқырман билеті бойынша кіру тегін.\n\nБағдарламада — жаңа кітаптардан үзінді оқу, аудитория сұрақтарына жауап және фойеде бейресми сұхбат. Басталуы 18:30.\n\nОқу залындағы орындарды сайт арқылы немесе анықтама қызметінің телефоны бойынша алдын ала брондауды ұсынамыз.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8VnqjRlXC2997V2yeZSvuGNYjEyiiJN1sfy0L_p5el9QuodRNVjtaj7WFM_KmQzla9j0vmA-TL6j-z5HtvFZ9LwNjIlgGTKj2Rnv6HuS4RAL6YkwH6lszSoPoMDrEML9UkqJsR2NWbuxWAwD80vy-18AfMoByiyIM2i7RH-7omsRjj4tYuFW_fZnp8S1JceAGxq-5xzd1-SiTgoyXcdxyjcIfBkWg9Rs7DsiPi2ovJN5Zu4oc-BYu_LbiZF5EphXhCTkTEoFkGyt1",
    publishedAt: new Date("2024-06-01T10:00:00.000Z"),
    location: "Конференц-зал, 1-й этаж",
    locationKz: "Конференц-зал, 1-қабат",
    curator: "Организационный отдел",
    curatorKz: "Ұйымдастыру бөлімі",
  },
  {
    slug: "digital-archive",
    title: "Курсы цифровой грамотности для старшего поколения",
    titleKz: "Ұрпақ ағаларына арналған цифрлық сауаттылық курстары",
    excerpt:
      "Запускаем серию бесплатных воркшопов по использованию электронных каталогов и архивов нашей библиотеки.",
    excerptKz:
      "Кітапханамыздың электронды каталогтары мен мұрағаттарын пайдалану бойынша тегін воркшоптар сериясын бастаймыз.",
    body: "Запускаем серию бесплатных воркшопов по использованию электронных каталогов и архивов нашей библиотеки.\n\nУчастники научатся искать книги в онлайн-каталоге, бронировать издания и пользоваться удалёнными ресурсами.\n\nРасписание и запись — на стойке информации или через форму на сайте.",
    bodyKz:
      "Кітапханамыздың электронды каталогтары мен мұрағаттарын пайдалану бойынша тегін воркшоптар сериясын бастаймыз.\n\nҚатысушылар онлайн-каталогта кітап іздеуді, басылымды брондауды және қашықтағы ресурстарды пайдалануды үйренеді.\n\nКесте мен жазылу — ақпарат орталығында немесе сайттағы форма арқылы.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCiHTdpqyMDTdq71aYtyVd1twNawUvp5rWWDQYY32tP4f1qmhqewrhyI4_nbzZvEPf4Z3xEgpAUZb7-wbm1B1Ve8SmlY3iF0DteYjqgdhTEP07O6cOKuBXwUordfiGcPBREH7D7Dv1f4BhrIG_IhrzoF5ZvyyLU5bwhcHRtb4fuZVXkvem22Ak8XUtm25TWDs6_unOzOWTGhdjw26HItThNxL9bhdVKkuGei39HwN6tSIQbMB797uX-V_b5Yzg1CMaY0B0d-cMjyts",
    publishedAt: new Date("2024-05-25T10:00:00.000Z"),
    location: "Компьютерный класс",
    locationKz: "Компьютерлік сынып",
    curator: "Отдел цифровых сервисов",
    curatorKz: "Цифрлық қызметтер бөлімі",
  },
  {
    slug: "library-meeting",
    title: "График работы в праздничные дни",
    titleKz: "Мереке күндері жұмыс кестесі",
    excerpt:
      "Обратите внимание на изменения в расписании работы центрального офиса и филиалов в период июньских праздников.",
    excerptKz:
      "Маусым мерекелері кезінде орталық кеңсе мен филиалдардың жұмыс кестесіндегі өзгерістерге назар аударыңыз.",
    body: "Обратите внимание на изменения в расписании работы центрального офиса и филиалов в период июньских праздников.\n\nВ государственные праздники центральная библиотека работает по сокращённому графику.\n\nЭлектронные сервисы и удалённый доступ к каталогу доступны круглосуточно.",
    bodyKz:
      "Маусым мерекелері кезінде орталық кеңсе мен филиалдардың жұмыс кестесіндегі өзгерістерге назар аударыңыз.\n\nМемлекеттік мереке күндері орталық кітапхана қысқартылған кесте бойынша жұмыс істейді.\n\nЭлектронды қызметтер мен каталогқа қашықтан қолжетімділік тәулік бойы қолжетімді.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-B9EcFzPXYaqhqh1MkObrtaxaQZ-1oo86k7rV68DBUnoHARWrEqLFpdg0527c5N7FkwBMZVFoicrlNziOap443TZOMLbwSk_IZj_aTxGzpT07a1adcmmtl3fvKcJooe4xxCV3PAJlNihfAuvYkJX6D0vjuReFk_-Wc5LzduFN1t7ABW2OEUbRVwFZWQhPjcLppjRvTgKNMsDiTOJdWcKLVKLLs08rLnFOguMBCnajWVDa9WbS5HjlZgA2fzPigccZR-0Hl1awcJ4J",
    publishedAt: new Date("2024-05-18T10:00:00.000Z"),
    location: "Администрация",
    locationKz: "Әкімшілік",
    curator: "Справочная служба",
    curatorKz: "Анықтама қызметі",
  },
  {
    slug: "new-books",
    title: "Выставка «История нашего города в лицах»",
    titleKz: "«Біздің қала тарихы бет-бейнеде» көрмесі",
    excerpt:
      "Уникальная фотовыставка архивных материалов открыта в главном холле библиотеки до конца месяца.",
    excerptKz:
      "Бірегей фотокөрме мұрағат материалдарымен кітапхананың бас холында ай соңына дейін ашық.",
    body: "Уникальная фотовыставка архивных материалов открыта в главном холле библиотеки до конца месяца.\n\nЭкспозиция объединяет портреты жителей региона разных эпох и редкие снимки улиц.\n\nЭкскурсии для школьных групп по предварительной записи. Вход свободный.",
    bodyKz:
      "Бірегей фотокөрме мұрағат материалдарымен кітапхананың бас холында ай соңына дейін ашық.\n\nЭкспозиция әртүрлі дәуірдегі өңір тұрғындарының портреттерін және көшелердің сирек суреттерін біріктіреді.\n\nМектеп топтарына экскурсиялар алдын ала жазылу бойынша. Кіру тегін.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8RvflQrIWY_nqmMOK4mbgcf60A0o-l1JPB3bNVPFvKEdEv6JWhR3oV3rTeFMfuRjVASiw_RCqN_MczmOKPXc6IRMz878EltCeHgzUgC314Z2BcLkk_6MilG5QFX0gagP0fzwG_C04tDraScQ4g6bQtyPsbBZhoR4fO5tj59wFVgPg-H780qTmma4xfrjN4ex2LZpWq4aI4MvQqG5PcBmSQkpB5lKnvfHoHYJFwUVWB6wNlLZP_nfcrsKQP8EBJxqlPpFj9s3p6NAX",
    publishedAt: new Date("2024-05-10T10:00:00.000Z"),
    location: "Главный холл",
    locationKz: "Бас холл",
    curator: "Музей книги",
    curatorKz: "Кітап мұражайы",
  },
  {
    slug: "literary-school",
    title: "Образовательный курс для молодежи: Литературная школа",
    titleKz: "Жастарға арналған білім беру курсы: Әдеби мектеп",
    excerpt:
      "Старт набора на весенний поток курсов творческого письма и критического анализа литературы.",
    excerptKz:
      "Шығармашылық жазу мен әдебиетті сынақтан өткізу курстарының көктемгі ағымына қабылдау басталды.",
    body: "Старт набора на весенний поток курсов творческого письма и критического анализа литературы. Занятия ведут приглашённые преподаватели и действующие авторы.\n\nПрограмма рассчитана на 8 недель: семинары по прозе и поэзии, разбор текстов, встречи с издателями.\n\nПо окончании курса лучшие работы публикуются в сборнике библиотечной серии.",
    bodyKz:
      "Шығармашылық жазу мен әдебиетті сынақтан өткізу курстарының көктемгі ағымына қабылдау басталды. Сабақтарды шақырылған оқытушылар мен белсенді авторлар жүргізеді.\n\nБағдарлама 8 аптаға есептелген: проза мен поэзия бойынша семинарлар, мәтіндерді талдау, баспашылармен кездесулер.\n\nКурс аяқталғаннан кейін үздік жұмыстар кітапханалық серия жинағында жарияланады.",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVK14EH77eJq80ATLYhSI1cBpErTzFdJZNc9BC9YUJC-bK_Gq-n_49HDr1n1ks2llqQnkn93yhNx8kQZPZPzhjImb1mOREhCHR7kBmvoRAL7TX_pRBM-50rTd4S8n8ZG1w8U__-u5qYQuVkaJwxW0KJMpQKLG6XeP3MiIzcr-XrE0bmX0xyivGqpgwxJewq7hIjpRJ3ssmL1789gFgTJ9qWia9XRxqEnkX0u3L_HG4tR_kR9ZAanrOcavP0UsYVxKY_a3lG2G73BV7",
    publishedAt: new Date("2024-05-05T10:00:00.000Z"),
    location: "Мультимедийный класс, 3-й этаж",
    locationKz: "Мультимедиялық сынып, 3-қабат",
    curator: "Литературный отдел",
    curatorKz: "Әдебиет бөлімі",
  },
]

export async function seedNewsIfEmpty(prisma: PrismaClient) {
  const n = await prisma.newsArticle.count()
  if (n > 0) return
  await prisma.newsArticle.createMany({
    data: NEWS_SEED_ROWS.map((r, i) => ({
      slug: r.slug,
      titleRu: r.title,
      titleKz: r.titleKz,
      descriptionRu: `${r.excerpt}\n\n${r.body}`,
      descriptionKz:
        [r.excerptKz?.trim(), r.bodyKz?.trim()].filter(Boolean).join("\n\n") ||
        null,
      coverImageUrl: r.coverImageUrl,
      publishedAt: r.publishedAt,
      location: r.location,
      locationKz: r.locationKz,
      curator: r.curator,
      curatorKz: r.curatorKz,
      status: "PUBLISHED" as const,
      sortOrder: i,
    })),
  })
}
