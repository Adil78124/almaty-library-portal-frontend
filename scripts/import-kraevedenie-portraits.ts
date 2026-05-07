/**
 * Копирует портреты из web/Краеведения → public/kraevedenie/{slug}.{ext},
 * обновляет portraitUrl и sortOrder в LocalHistoryCard.
 *
 * pnpm -C frontend/web run db:import-kraevedenie-portraits
 */
import fs from "node:fs"
import path from "node:path"

import { prisma } from "../src/lib/prisma"
import {
  KRAEVEDENIE_PORTRAIT_FILES,
  KRAEVEDENIE_SORT_NO_PHOTO,
} from "./data/kraevedenie-portraits"

const PUBLIC_PREFIX = "/kraevedenie"

async function main() {
  const root = process.cwd()
  const srcDir = path.join(root, "Краеведения")
  const destDir = path.join(root, "public", "kraevedenie")

  if (!fs.existsSync(srcDir)) {
    console.error(`Нет папки: ${srcDir}`)
    process.exit(1)
  }
  fs.mkdirSync(destDir, { recursive: true })

  for (const row of KRAEVEDENIE_PORTRAIT_FILES) {
    const from = path.join(srcDir, row.oldFile)
    if (!fs.existsSync(from)) {
      console.warn(`Пропуск (нет файла): ${row.oldFile}`)
      continue
    }
    const ext = path.extname(row.oldFile).toLowerCase() || ".jpg"
    const destName = `${row.slug}${ext}`
    const to = path.join(destDir, destName)
    fs.copyFileSync(from, to)
    const url = `${PUBLIC_PREFIX}/${destName}`

    await prisma.localHistoryCard.update({
      where: { slug: row.slug },
      data: { portraitUrl: url, sortOrder: row.sortOrder },
    })
    console.log(`${row.oldFile} → ${destName}, sort ${row.sortOrder}`)
  }

  for (const [slug, sortOrder] of Object.entries(KRAEVEDENIE_SORT_NO_PHOTO)) {
    await prisma.localHistoryCard.update({
      where: { slug },
      data: { sortOrder },
    })
    console.log(`sort only: ${slug} → ${sortOrder}`)
  }

  console.log("Готово. Исходные файлы в папке «Краеведения» не удалялись — можно удалить вручную.")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
