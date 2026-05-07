/**
 * Переименовывает portrait-файлы в public/images (imageN.* → slug-от-ФИО.*),
 * правит ссылки в public/2026.html и обновляет imageUrl в PageContent (page=jubilees).
 *
 * Запуск: pnpm -C frontend/web run db:rename-jubilee-portraits
 */
import fs from "node:fs"
import path from "node:path"

import { prisma } from "../src/lib/prisma"
import { buildPortraitRenames, JUBILEE_PORTRAIT_ROWS } from "./jubilee-portrait-files"

async function main() {
  const root = process.cwd()
  const imagesDir = path.join(root, "public", "images")
  const htmlPath = path.join(root, "public", "2026.html")

  const oldToNew = buildPortraitRenames()
  let renamedCount = 0

  for (const row of JUBILEE_PORTRAIT_ROWS) {
    const from = path.join(imagesDir, row.oldFile)
    const toName = oldToNew[row.oldFile]
    const to = path.join(imagesDir, toName)
    if (!fs.existsSync(from)) {
      console.warn(`skip (нет файла): ${row.oldFile}`)
      continue
    }
    if (path.resolve(from) === path.resolve(to)) continue
    fs.renameSync(from, to)
    renamedCount += 1
  }

  console.log(`Переименовано файлов: ${renamedCount}`)

  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, "utf8")
    for (const [oldFile, newFile] of Object.entries(oldToNew)) {
      const a = `images/${oldFile}`
      const b = `images/${newFile}`
      html = html.split(a).join(b)
    }
    fs.writeFileSync(htmlPath, html, "utf8")
    console.log("Обновлены пути к картинкам в public/2026.html")
  }

  const row = await prisma.pageContent.findUnique({ where: { page: "jubilees" } })
  if (!row?.sections) {
    console.log(
      "Нет PageContent jubilees — после переименования запусти: pnpm run db:import-jubilees-2026"
    )
    return
  }

  const sections = structuredClone(row.sections) as unknown[]
  const block = sections.find(
    (s) => typeof s === "object" && s !== null && (s as { type?: string }).type === "jubilees"
  ) as { type: string; data: { items: { imageUrl?: string | null }[] } } | undefined

  if (!block?.data?.items) {
    console.log("Блок jubilees не найден в PageContent")
    return
  }

  for (const item of block.data.items) {
    if (!item.imageUrl || typeof item.imageUrl !== "string") continue
    for (const [oldFile, newFile] of Object.entries(oldToNew)) {
      if (item.imageUrl === `/images/${oldFile}`) {
        item.imageUrl = `/images/${newFile}`
        break
      }
    }
  }

  await prisma.pageContent.update({
    where: { page: "jubilees" },
    data: { sections: sections as object[] },
  })
  console.log("Обновлены imageUrl в БД (PageContent → jubilees)")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
