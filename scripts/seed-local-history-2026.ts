/**
 * Юбиляры 2026 (поэты и писатели Алматинской области) → LocalHistoryCard + заголовок блока на главной.
 *
 * Порядок и фото: `data/kraevedenie-portraits.ts`; файлы — `public/kraevedenie/`
 * (команда `db:import-kraevedenie-portraits`).
 *
 * pnpm -C frontend/web run db:seed-local-history-2026
 */
import fs from "node:fs"
import path from "node:path"

import { prisma } from "../src/lib/prisma"
import {
  KRAEVEDENIE_PORTRAIT_FILES,
  KRAEVEDENIE_SORT_NO_PHOTO,
} from "./data/kraevedenie-portraits"
import { localHistory2026Chunk1 } from "./data/local-history-2026-chunk1"
import { localHistory2026Chunk2 } from "./data/local-history-2026-chunk2"
import { localHistory2026Chunk3 } from "./data/local-history-2026-chunk3"
import { localHistory2026Chunk4 } from "./data/local-history-2026-chunk4"
import { localHistory2026Chunk5 } from "./data/local-history-2026-chunk5"

const OLD_PLACEHOLDER_SLUGS = [
  "abai-kunanbaev",
  "mukhtar-auezov",
  "chokan-valikhanov",
  "ilyas-zhansugurov",
  "saken-seifullin",
  "magzhan-zhumabaev",
  "zhambyl-zhabaev",
] as const

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v)
}

function kraevedeniePortraitUrlIfPresent(slug: string): string | null {
  const row = KRAEVEDENIE_PORTRAIT_FILES.find((x) => x.slug === slug)
  if (!row) return null
  const ext = path.extname(row.oldFile).toLowerCase() || ".jpg"
  const file = path.join(process.cwd(), "public", "kraevedenie", `${slug}${ext}`)
  if (!fs.existsSync(file)) return null
  return `/kraevedenie/${slug}${ext}`
}

const SORT_OVERRIDE: Record<string, number> = {
  ...Object.fromEntries(KRAEVEDENIE_PORTRAIT_FILES.map((r) => [r.slug, r.sortOrder])),
  ...KRAEVEDENIE_SORT_NO_PHOTO,
}

async function main() {
  const rows = [
    ...localHistory2026Chunk1,
    ...localHistory2026Chunk2,
    ...localHistory2026Chunk3,
    ...localHistory2026Chunk4,
    ...localHistory2026Chunk5,
  ]

  let created = 0
  let updated = 0

  for (const r of rows) {
    const portraitUrl = kraevedeniePortraitUrlIfPresent(r.slug) ?? (r.portraitUrl ?? null)
    const sortOrder = SORT_OVERRIDE[r.slug] ?? r.sortOrder

    const existing = r.slug ? await prisma.localHistoryCard.findUnique({ where: { slug: r.slug } }) : null

    const data = {
      name: r.name,
      nameKz: r.nameKz,
      excerpt: r.excerpt,
      excerptKz: r.excerptKz,
      portraitUrl,
      sortOrder,
      isActive: true,
    }

    if (existing) {
      await prisma.localHistoryCard.update({
        where: { id: existing.id },
        data: { ...data, slug: r.slug },
      })
      updated += 1
    } else {
      await prisma.localHistoryCard.create({
        data: { ...data, slug: r.slug },
      })
      created += 1
    }
  }

  const del = await prisma.localHistoryCard.deleteMany({
    where: { slug: { in: [...OLD_PLACEHOLDER_SLUGS] } },
  })

  const home = await prisma.pageContent.findUnique({ where: { page: "home" } })
  if (home?.sections && Array.isArray(home.sections)) {
    const sections = home.sections as unknown[]
    const next = sections.map((s) => {
      if (!isObject(s) || s.type !== "localHistory" || !isObject(s.data)) return s
      return {
        ...s,
        data: {
          ...(s.data as Record<string, unknown>),
          title: "Поэты и писатели — юбиляры Алматинской области в 2026 году",
          titleKz: "Алматы облысы ақын – жазушыларының 2026 жылғы мерейтойлары",
          description:
            "Материалы о юбилейных датах деятелей литературы, культуры и науки, связанных с Алматинской областью.",
          descriptionKz:
            "Алматы облысына қатысты әдебиет, мәдениет және ғылым қайраткерлерінің мерейтойларына арналған материалдар.",
          source: "database",
          database: { limit: 50 },
        },
      }
    })
    await prisma.pageContent.update({
      where: { page: "home" },
      data: { sections: next as object[] },
    })
    console.log("[home] localHistory: заголовок и источник database обновлены")
  } else {
    console.log("[home] PageContent home не найден — заголовок блока не обновлён")
  }

  console.log(
    `[local-history-2026] created: ${created}, updated: ${updated}, removed placeholders: ${del.count}`
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
