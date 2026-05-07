import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function norm(v: string | null | undefined): string {
  return (v ?? "").trim()
}

function isBlank(v: string | null | undefined): boolean {
  return !norm(v)
}

function isPlaceholder(v: string | null | undefined): boolean {
  const s = norm(v).toLowerCase()
  return (
    s === "мәлімет жоқ" ||
    s === "ақпарат жоқ" ||
    s === "филиал" ||
    s === "бөлімше"
  )
}

async function main() {
  const rows = await prisma.branch.findMany({
    select: {
      id: true,
      titleRu: true,
      titleKz: true,
      descriptionRu: true,
      descriptionKz: true,
      subtitle: true,
      subtitleKz: true,
      cityLabel: true,
      cityLabelKz: true,
      address: true,
      addressKz: true,
    },
  })

  let updated = 0

  for (const b of rows) {
    const patch: Record<string, any> = {}

    // Название: если это заглушка/пусто — ставим казахский термин.
    if (isBlank(b.titleKz) || isPlaceholder(b.titleKz) || norm(b.titleKz) === norm(b.titleRu)) {
      // Если RU выглядит как реальное название (не "Филиал"), оставляем как есть,
      // иначе ставим "Бөлімше".
      patch.titleKz = norm(b.titleRu).toLowerCase() === "филиал" || !norm(b.titleRu)
        ? "Бөлімше"
        : b.titleRu
    }

    // Описание: если нет нормального текста — ставим нейтральную казахскую заглушку.
    if (
      isBlank(b.descriptionKz) ||
      isPlaceholder(b.descriptionKz) ||
      norm(b.descriptionKz) === norm(b.descriptionRu)
    ) {
      patch.descriptionKz = norm(b.descriptionRu)
        ? b.descriptionRu
        : "Ақпарат кейінірек қосылады."
    }

    // Подзаголовок / город / адрес: если пусто/заглушка/равно RU — ставим казахскую заглушку.
    const shortPlaceholder = "Ақпарат жоқ"
    if (isBlank(b.subtitleKz) || isPlaceholder(b.subtitleKz) || norm(b.subtitleKz) === norm(b.subtitle)) {
      patch.subtitleKz = isBlank(b.subtitle) ? shortPlaceholder : b.subtitle
    }
    if (isBlank(b.cityLabelKz) || isPlaceholder(b.cityLabelKz) || norm(b.cityLabelKz) === norm(b.cityLabel)) {
      patch.cityLabelKz = isBlank(b.cityLabel) ? shortPlaceholder : b.cityLabel
    }
    if (isBlank(b.addressKz) || isPlaceholder(b.addressKz) || norm(b.addressKz) === norm(b.address)) {
      patch.addressKz = isBlank(b.address) ? shortPlaceholder : b.address
    }

    if (Object.keys(patch).length === 0) continue

    await prisma.branch.update({
      where: { id: b.id },
      data: patch,
    })
    updated += 1
  }

  console.log(`[branches-kz] updated: ${updated}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

