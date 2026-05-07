import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const PEOPLE = [
  {
    slug: "abai-kunanbaev",
    name: "Абай Кунанбаев",
    nameKz: "Абай Құнанбайұлы",
    excerpt:
      "Поэт, философ и просветитель. Основоположник новой казахской реалистической литературы.",
    excerptKz:
      "Ақын, философ және ағартушы. Қазақ әдебиетіндегі жаңа реализм бағытының негізін қалаушы.",
    sortOrder: 1,
  },
  {
    slug: "mukhtar-auezov",
    name: "Мухтар Ауэзов",
    nameKz: "Мұхтар Әуезов",
    excerpt:
      "Писатель и драматург, один из крупнейших деятелей казахской культуры. Автор эпопеи «Абай жолы».",
    excerptKz:
      "Жазушы және драматург, қазақ мәдениетінің ірі тұлғаларының бірі. «Абай жолы» эпопеясының авторы.",
    sortOrder: 2,
  },
  {
    slug: "chokan-valikhanov",
    name: "Чокан Валиханов",
    nameKz: "Шоқан Уәлиханов",
    excerpt:
      "Учёный, этнограф и путешественник. Исследователь истории и культуры народов Центральной Азии.",
    excerptKz:
      "Ғалым, этнограф және саяхатшы. Орталық Азия халықтарының тарихы мен мәдениетін зерттеуші.",
    sortOrder: 3,
  },
  {
    slug: "ilyas-zhansugurov",
    name: "Ильяс Жансугуров",
    nameKz: "Ілияс Жансүгіров",
    excerpt:
      "Поэт и общественный деятель. Один из основателей казахской советской литературы.",
    excerptKz:
      "Ақын және қоғам қайраткері. Қазақ кеңес әдебиетінің негізін қалаушылардың бірі.",
    sortOrder: 4,
  },
  {
    slug: "saken-seifullin",
    name: "Сакен Сейфуллин",
    nameKz: "Сәкен Сейфуллин",
    excerpt:
      "Поэт и писатель, общественный деятель. Внёс значительный вклад в развитие литературы и культуры.",
    excerptKz:
      "Ақын, жазушы, қоғам қайраткері. Әдебиет пен мәдениеттің дамуына зор үлес қосты.",
    sortOrder: 5,
  },
  {
    slug: "magzhan-zhumabaev",
    name: "Магжан Жумабаев",
    nameKz: "Мағжан Жұмабаев",
    excerpt:
      "Поэт, публицист и педагог. Один из ярчайших представителей казахской поэзии XX века.",
    excerptKz:
      "Ақын, публицист және педагог. ХХ ғасырдағы қазақ поэзиясының ең жарқын өкілдерінің бірі.",
    sortOrder: 6,
  },
  {
    slug: "zhambyl-zhabaev",
    name: "Жамбыл Жабаев",
    nameKz: "Жамбыл Жабаев",
    excerpt:
      "Акын-импровизатор, певец народной поэзии. Олицетворение традиций устного поэтического искусства.",
    excerptKz:
      "Айтыскер ақын, халық поэзиясының жыршысы. Ауыз әдебиеті дәстүрлерінің көрнекті өкілі.",
    sortOrder: 7,
  },
] as const

async function main() {
  let created = 0
  let updated = 0

  for (const p of PEOPLE) {
    const existing = await prisma.localHistoryCard.findUnique({
      where: { slug: p.slug },
    })
    if (existing) {
      await prisma.localHistoryCard.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          nameKz: p.nameKz,
          excerpt: p.excerpt,
          excerptKz: p.excerptKz,
          sortOrder: p.sortOrder,
          isActive: true,
        },
      })
      updated += 1
    } else {
      await prisma.localHistoryCard.create({
        data: {
          slug: p.slug,
          name: p.name,
          nameKz: p.nameKz,
          excerpt: p.excerpt,
          excerptKz: p.excerptKz,
          sortOrder: p.sortOrder,
          isActive: true,
          portraitUrl: null,
        },
      })
      created += 1
    }
  }

  console.log(`[local-history] created: ${created}, updated: ${updated}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

