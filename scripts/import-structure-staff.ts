/**
 * Импорт сотрудников (директора филиалов) в таблицу Staff.
 * Читает фото из public/structurpageimg/ (доступно в frontend-контейнере).
 *
 * Запуск: npx tsx scripts/import-structure-staff.ts
 */
import fs from "node:fs/promises"
import path from "node:path"

import { prisma } from "../src/lib/prisma"

type RawStaff = {
  fullNameRu: string
  birthDate: string
  branchRu: string
  phone: string
}

function cyrToLat(input: string): string {
  const map: Record<string, string> = {
    а: "a", ә: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d",
    е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i", к: "k",
    қ: "q", л: "l", м: "m", н: "n", ң: "ng", о: "o", ө: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ұ: "u", ү: "u",
    ф: "f", х: "h", һ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ы: "y", і: "i", э: "e", ю: "yu", я: "ya",
  }
  return input
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
}

function fileKey(name: string): string {
  return cyrToLat(name).replace(/[^a-z0-9]/g, "").toLowerCase()
}

function slugifyBase(input: string): string {
  return cyrToLat(input)
    .replace(/[\s]+/g, " ")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("8")) {
    return "+7" + digits.slice(1)
  }
  if (digits.length === 10) {
    return "+7" + digits
  }
  return raw
}

const PEOPLE: RawStaff[] = [
  { fullNameRu: "Турсунова Аида Джапаровна",        birthDate: "25.10.1971", branchRu: "Ұйғыр ауданы",          phone: "87084426278" },
  { fullNameRu: "Ибрагимова Ақбота Қажымұханқызы",  birthDate: "07.02.1990", branchRu: "Балқаш ауданы",         phone: "87478717201" },
  { fullNameRu: "Әжікеева Қымбат Нұрданбекқызы",    birthDate: "25.04.1992", branchRu: "Райымбек ауданы",       phone: "8 775 825-25-66" },
  { fullNameRu: "Будугулова Карлыгаш Турановна",     birthDate: "01.06.1965", branchRu: "Іле ауданы",            phone: "87714946402" },
  { fullNameRu: "Отеева Улдархан Кахановна",         birthDate: "27.07.1967", branchRu: "Қарасай ауданы",        phone: "87478470828" },
  { fullNameRu: "Жанабилова Дариға Адилжановна",     birthDate: "24.12.1983", branchRu: "Еңбекшіқазақ ауданы",  phone: "87075322932" },
  { fullNameRu: "Ахметова Индира Алиевна",           birthDate: "18.01.1979", branchRu: "Кеген ауданы",          phone: "87056002080" },
  { fullNameRu: "Хармысов Махамбет Касымканович",    birthDate: "19.01.1963", branchRu: "Талғар ауданы",         phone: "8-705-210-58-41" },
  { fullNameRu: "Ақтанова Айгүл Бегімбайқызы",      birthDate: "29.07.1989", branchRu: "Қонаев қаласы",         phone: "8 771 557 34 89" },
  { fullNameRu: "Әділхан Әділжан Әділханұлы",       birthDate: "20.05.1972", branchRu: "Алатау қаласы",         phone: "87011223278" },
]

async function main() {
  const imgDir = path.resolve(process.cwd(), "public", "structurpageimg")

  let files: string[] = []
  try {
    files = await fs.readdir(imgDir)
  } catch {
    console.warn(`[staff] structurpageimg not found at ${imgDir} — will import without photos`)
  }

  const byKey = new Map<string, string>()
  for (const f of files) {
    const base = f.replace(/\.[^.]+$/, "")
    byKey.set(base.replace(/[^a-z0-9]/gi, "").toLowerCase(), f)
  }

  await prisma.staff.deleteMany()

  for (let i = 0; i < PEOPLE.length; i++) {
    const p = PEOPLE[i]!
    const slug = `${fileKey(p.fullNameRu)}-${slugifyBase(p.branchRu)}`
    const dateParts = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(p.birthDate)
    const birthDate = dateParts
      ? new Date(Date.UTC(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1])))
      : null

    const key = fileKey(p.fullNameRu)
    let filename = byKey.get(key)
    if (!filename) {
      const parts = p.fullNameRu.split(/\s+/).filter(Boolean)
      const lf = parts.slice(0, 2).join("")
      filename =
        byKey.get(fileKey(lf)) ??
        [...byKey.entries()].find(([k]) => k.includes(fileKey(lf)))?.[1]
    }
    if (!filename) {
      const surname = p.fullNameRu.split(/\s+/)[0] ?? ""
      const sk = fileKey(surname)
      filename =
        byKey.get(sk) ??
        [...byKey.entries()].find(([k]) => k.includes(sk) || sk.includes(k))?.[1]
    }

    const imageUrl = filename ? `/structurpageimg/${filename}` : null

    await prisma.staff.create({
      data: {
        slug,
        fullNameRu: p.fullNameRu,
        fullNameKz: p.fullNameRu,
        birthDate,
        phone: normalizePhone(p.phone),
        positionRu: "Директор",
        positionKz: "Директор",
        branchRu: p.branchRu,
        branchKz: p.branchRu,
        imageUrl,
        sortOrder: i,
        isActive: true,
      },
    })
    console.log(`  ${p.fullNameRu} → ${imageUrl ?? "no photo"}`)
  }

  const count = await prisma.staff.count()
  console.log(`[staff] imported: ${count}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
