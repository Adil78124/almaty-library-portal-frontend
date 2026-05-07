import { prisma } from "@/lib/prisma"

export function normalizeLocalHistorySlug(input: string) {
  try {
    return decodeURIComponent(input).toLowerCase().normalize("NFC")
  } catch {
    return input.toLowerCase().normalize("NFC")
  }
}

export type LocalHistoryCardPayload = {
  id: string
  slug: string | null
  name: string
  nameKz: string | null
  excerpt: string
  excerptKz: string | null
  portraitUrl: string | null
}

export function toLocalHistoryPayload(row: {
  id: string
  slug: string | null
  name: string
  nameKz: string | null
  excerpt: string
  excerptKz: string | null
  portraitUrl: string | null
}): LocalHistoryCardPayload {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameKz: row.nameKz,
    excerpt: row.excerpt,
    excerptKz: row.excerptKz,
    portraitUrl: row.portraitUrl,
  }
}

export async function findLocalHistoryBySlugParam(slugParam: string) {
  const wanted = normalizeLocalHistorySlug(slugParam)
  const rows = await prisma.localHistoryCard.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
  const row =
    rows.find((r) => r.slug && normalizeLocalHistorySlug(r.slug) === wanted) ??
    null
  return row
}

export async function findOtherLocalHistoryCards(
  excludeId: string,
  limit: number
) {
  return prisma.localHistoryCard.findMany({
    where: {
      isActive: true,
      id: { not: excludeId },
      slug: { not: null },
    },
    orderBy: { sortOrder: "asc" },
    take: limit,
  })
}

export async function getHomeLocalHistoryHeading(): Promise<{
  title: string
  titleKz: string | null
}> {
  const row = await prisma.pageContent.findUnique({ where: { page: "home" } })
  const sections = row?.sections
  if (!Array.isArray(sections)) {
    return { title: "Краеведение", titleKz: "Өңіртану" }
  }
  const lh = sections.find(
    (s) => !!s && typeof s === "object" && (s as { type?: string }).type === "localHistory"
  ) as { data?: Record<string, unknown> } | undefined
  const d = lh?.data
  if (!d || typeof d !== "object") {
    return { title: "Краеведение", titleKz: "Өңіртану" }
  }
  const title = typeof d.title === "string" && d.title.trim() ? d.title : "Краеведение"
  const titleKz =
    typeof d.titleKz === "string" && d.titleKz.trim() ? d.titleKz.trim() : null
  return { title, titleKz }
}
