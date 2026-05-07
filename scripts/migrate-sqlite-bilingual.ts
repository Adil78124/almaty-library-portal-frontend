/**
 * Одноразовая миграция SQLite: title/description → titleRu, titleKz, descriptionRu, descriptionKz
 * для NewsArticle, Event, Branch, DigitalLibraryItem.
 * Безопасно: если колонки уже в новом формате — выход без изменений.
 *
 * Запуск: pnpm exec tsx scripts/migrate-sqlite-bilingual.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type ColRow = { name: string }

async function tableColumns(table: string): Promise<string[]> {
  const rows = (await prisma.$queryRawUnsafe(
    `PRAGMA table_info("${table}")`
  )) as ColRow[]
  return (rows as { name: string }[]).map((r) => r.name)
}

async function exec(sql: string) {
  await prisma.$executeRawUnsafe(sql)
}

async function main() {
  const news = await tableColumns("NewsArticle")
  if (news.includes("title") && !news.includes("titleRu")) {
    await exec(`ALTER TABLE NewsArticle ADD COLUMN descriptionRu TEXT`)
    await exec(`ALTER TABLE NewsArticle ADD COLUMN descriptionKz TEXT`)
    await exec(
      `UPDATE NewsArticle SET descriptionRu = COALESCE(excerpt, '') || char(10) || char(10) || COALESCE(body, '')`
    )
    await exec(
      `UPDATE NewsArticle SET descriptionKz = CASE WHEN COALESCE(TRIM(excerptKz), '') != '' OR COALESCE(TRIM(bodyKz), '') != '' THEN COALESCE(excerptKz, '') || char(10) || char(10) || COALESCE(bodyKz, '') ELSE NULL END`
    )
    for (const c of ["excerpt", "excerptKz", "body", "bodyKz"]) {
      if (news.includes(c)) await exec(`ALTER TABLE NewsArticle DROP COLUMN "${c}"`)
    }
    await exec(`ALTER TABLE NewsArticle RENAME COLUMN title TO titleRu`)
  }

  const ev = await tableColumns("Event")
  if (ev.includes("title") && !ev.includes("titleRu")) {
    await exec(`ALTER TABLE Event ADD COLUMN descriptionRu TEXT DEFAULT ''`)
    await exec(`ALTER TABLE Event ADD COLUMN descriptionKz TEXT`)
    await exec(
      `UPDATE Event SET descriptionRu = COALESCE(excerpt, '') || char(10) || char(10) || COALESCE(body, ''), descriptionKz = CASE WHEN COALESCE(TRIM(excerptKz), '') != '' OR COALESCE(TRIM(bodyKz), '') != '' THEN COALESCE(excerptKz, '') || char(10) || char(10) || COALESCE(bodyKz, '') ELSE NULL END`
    )
    for (const c of ["excerpt", "excerptKz", "body", "bodyKz"]) {
      if (ev.includes(c)) await exec(`ALTER TABLE Event DROP COLUMN "${c}"`)
    }
    await exec(`ALTER TABLE Event RENAME COLUMN title TO titleRu`)
  }

  const br = await tableColumns("Branch")
  if (br.includes("name") && !br.includes("titleRu")) {
    await exec(`ALTER TABLE Branch ADD COLUMN titleRu TEXT`)
    await exec(`ALTER TABLE Branch ADD COLUMN titleKz TEXT`)
    await exec(`ALTER TABLE Branch ADD COLUMN descriptionRu TEXT DEFAULT ''`)
    await exec(`ALTER TABLE Branch ADD COLUMN descriptionKz TEXT`)
    await exec(
      `UPDATE Branch SET titleRu = name, titleKz = nameKz, descriptionRu = COALESCE(intro, '') || char(10) || char(10) || COALESCE(about, ''), descriptionKz = CASE WHEN COALESCE(TRIM(introKz), '') != '' OR COALESCE(TRIM(aboutKz), '') != '' THEN COALESCE(introKz, '') || char(10) || char(10) || COALESCE(aboutKz, '') ELSE NULL END`
    )
    for (const c of ["name", "nameKz", "intro", "introKz", "about", "aboutKz"]) {
      if (br.includes(c)) await exec(`ALTER TABLE Branch DROP COLUMN "${c}"`)
    }
  }

  const dig = await tableColumns("DigitalLibraryItem")
  if (dig.includes("title") && !dig.includes("titleRu")) {
    await exec(`ALTER TABLE DigitalLibraryItem ADD COLUMN titleRu TEXT`)
    await exec(
      `ALTER TABLE DigitalLibraryItem ADD COLUMN descriptionRu TEXT DEFAULT ''`
    )
    await exec(`ALTER TABLE DigitalLibraryItem ADD COLUMN descriptionKz TEXT`)
    await exec(
      `UPDATE DigitalLibraryItem SET titleRu = title, descriptionRu = '', descriptionKz = NULL`
    )
    if (dig.includes("title")) await exec(`ALTER TABLE DigitalLibraryItem DROP COLUMN title`)
  }

  console.log("[migrate-sqlite-bilingual] done")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
