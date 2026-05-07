/**
 * Миграция: RU-поля не трогаем; для каждого *Kz сохраняем существующее значение,
 * если было null/undefined — записываем пустую строку "".
 *
 * Запуск (из frontend/web): pnpm run db:backfill-kz
 *
 * Перед первым запуском колонки в БД должны совпадать со schema.prisma:
 *   pnpm exec prisma db push
 *
 * Обрабатывает: SiteSettings, PageContent (JSON), NewsArticle, Event, Branch.
 */

import { PrismaClient } from "@prisma/client"
import type { Prisma } from "@prisma/client"

const prisma = new PrismaClient()

/** Ключи строковых полей без пары *Kz в JSON CMS (URL, slug, служебные). */
const KEYS_NO_KZ_PAIR = new Set([
  "slug",
  "email",
  "phone",
  "phoneSecondary",
  "password",
  "id",
  "iconName",
  "logoVariant",
  "type",
  "source",
  "dayNum",
  "timeLine",
  "dateLabel",
  "slot",
  "sortOrder",
  "visible",
  "published",
  "isMainBranch",
  "featuredOnHome",
  "align",
  "featured",
])

function shouldAddKzPair(key: string): boolean {
  if (key.endsWith("Kz")) return false
  if (KEYS_NO_KZ_PAIR.has(key)) return false
  if (/Url$/i.test(key) || /Href$/i.test(key)) return false
  return true
}

/** Рекурсивно: для каждого строкового поля без sibling *Kz записать пустую строку. */
function backfillJsonNode(node: unknown): unknown {
  if (node === null || typeof node !== "object") return node
  if (Array.isArray(node)) {
    return node.map((item) => backfillJsonNode(item))
  }
  const o = node as Record<string, unknown>
  for (const k of Object.keys(o)) {
    const v = o[k]
    if (v !== null && typeof v === "object") {
      o[k] = backfillJsonNode(v)
    }
  }
  for (const k of Object.keys(o)) {
    if (!shouldAddKzPair(k)) continue
    const val = o[k]
    if (typeof val !== "string") continue
    const kzKey = `${k}Kz`
    if (o[kzKey] === undefined || o[kzKey] === null) {
      o[kzKey] = ""
    }
  }
  return o
}

function nz(v: string | null | undefined): string {
  return v ?? ""
}

async function migrateSiteSettings(): Promise<{ updated: boolean }> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  })
  if (!row) {
    console.log("[SiteSettings] запись default не найдена — пропуск")
    return { updated: false }
  }
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      orgNameShortKz: nz(row.orgNameShortKz),
      orgNameLongKz: nz(row.orgNameLongKz),
      footerTaglineKz: nz(row.footerTaglineKz),
      addressKz: nz(row.addressKz),
      sanitaryDayKz: nz(row.sanitaryDayKz),
      copyrightLineKz: nz(row.copyrightLineKz),
    },
  })
  console.log("[SiteSettings] ok (id=default)")
  return { updated: true }
}

async function migrateNews(): Promise<number> {
  const rows = await prisma.newsArticle.findMany()
  let n = 0
  for (const row of rows) {
    await prisma.newsArticle.update({
      where: { id: row.id },
      data: {
        titleKz: nz(row.titleKz),
        descriptionKz: nz(row.descriptionKz),
        locationKz: nz(row.locationKz),
        curatorKz: nz(row.curatorKz),
      },
    })
    n += 1
  }
  console.log(`[NewsArticle] обновлено строк: ${n}`)
  return n
}

async function migrateEvents(): Promise<number> {
  const rows = await prisma.event.findMany()
  let n = 0
  for (const row of rows) {
    await prisma.event.update({
      where: { id: row.id },
      data: {
        titleKz: nz(row.titleKz),
        descriptionKz: nz(row.descriptionKz),
        timeDisplayKz: nz(row.timeDisplayKz),
        formatKz: nz(row.formatKz),
        categoryKz: nz(row.categoryKz),
        locationKz: nz(row.locationKz),
        ctaLabelKz: nz(row.ctaLabelKz),
      },
    })
    n += 1
  }
  console.log(`[Event] обновлено строк: ${n}`)
  return n
}

async function migrateBranches(): Promise<number> {
  const rows = await prisma.branch.findMany()
  let n = 0
  for (const row of rows) {
    await prisma.branch.update({
      where: { id: row.id },
      data: {
        titleKz: nz(row.titleKz),
        subtitleKz: nz(row.subtitleKz),
        cityLabelKz: nz(row.cityLabelKz),
        addressKz: nz(row.addressKz),
        descriptionKz: nz(row.descriptionKz),
      },
    })
    n += 1
  }
  console.log(`[Branch] обновлено строк: ${n}`)
  return n
}

async function migratePageContent(): Promise<number> {
  const rows = await prisma.pageContent.findMany()
  let n = 0
  for (const row of rows) {
    const raw = row.sections
    const next = backfillJsonNode(
      JSON.parse(JSON.stringify(raw)) as unknown
    ) as Prisma.InputJsonValue
    await prisma.pageContent.update({
      where: { page: row.page },
      data: { sections: next },
    })
    n += 1
  }
  console.log(`[PageContent] обновлено страниц (записей): ${n}`)
  return n
}

async function verifyTabularKz(): Promise<void> {
  console.log("\n--- проверка (ожидается 0 для *_null) ---")
  const nNews = await prisma.newsArticle.count({
    where: {
      OR: [
        { titleKz: null },
        { descriptionKz: null },
        { locationKz: null },
        { curatorKz: null },
      ],
    },
  })
  const nEv = await prisma.event.count({
    where: {
      OR: [
        { titleKz: null },
        { descriptionKz: null },
        { timeDisplayKz: null },
        { formatKz: null },
        { categoryKz: null },
        { locationKz: null },
        { ctaLabelKz: null },
      ],
    },
  })
  const nBr = await prisma.branch.count({
    where: {
      OR: [
        { titleKz: null },
        { subtitleKz: null },
        { cityLabelKz: null },
        { addressKz: null },
        { descriptionKz: null },
      ],
    },
  })
  const ss = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: {
      orgNameShortKz: true,
      orgNameLongKz: true,
      footerTaglineKz: true,
      addressKz: true,
      sanitaryDayKz: true,
      copyrightLineKz: true,
    },
  })
  const ssNull =
    ss &&
    [
      ss.orgNameShortKz,
      ss.orgNameLongKz,
      ss.footerTaglineKz,
      ss.addressKz,
      ss.sanitaryDayKz,
      ss.copyrightLineKz,
    ].some((v) => v === null)
      ? 1
      : 0
  console.log(`SiteSettings полей Kz с null: ${ssNull}`)
  console.log(`NewsArticle строк с любым null Kz: ${nNews}`)
  console.log(`Event строк с любым null Kz: ${nEv}`)
  console.log(`Branch строк с любым null Kz: ${nBr}`)
}

async function main() {
  console.log("=== backfill-kz-fields: старт ===\n")
  await migrateSiteSettings()
  await migrateNews()
  await migrateEvents()
  await migrateBranches()
  await migratePageContent()
  await verifyTabularKz()
  console.log("\n=== готово ===")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => void prisma.$disconnect())
