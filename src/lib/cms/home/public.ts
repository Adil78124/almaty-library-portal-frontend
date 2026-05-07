import { cookies } from "next/headers"

import {
  appLocaleFromRequestValue,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"
import { prisma } from "@/lib/prisma"
import type { HomeSection } from "./types"
import { HOME_SECTION_ORDER } from "./types"
import { resolveHomeSections } from "./resolve"
import type { ResolvedHome } from "./types"

function normalizeLatestNewsInSections(sections: HomeSection[]): HomeSection[] {
  return sections.map((s) =>
    s.type === "latestNews"
      ? {
          type: "latestNews",
          data: {
            kicker: s.data.kicker,
            kickerKz: (s.data as any).kickerKz,
            title: s.data.title,
            titleKz: (s.data as any).titleKz,
          },
        }
      : s
  )
}

export async function getHomePagePublic(): Promise<ResolvedHome> {
  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)
  const row = await prisma.pageContent.findUnique({
    where: { page: "home" },
  })
  const sections = row?.sections as HomeSection[] | undefined
  return resolveHomeSections(sections, prisma, locale)
}

export async function getHomeSectionsRaw(): Promise<HomeSection[]> {
  const { getDefaultHomeSections } = await import("./defaults")
  const defaults = getDefaultHomeSections()
  const row = await prisma.pageContent.findUnique({
    where: { page: "home" },
  })
  const raw = row?.sections as HomeSection[] | undefined
  if (
    !raw ||
    raw.length !== HOME_SECTION_ORDER.length ||
    !raw.every((s, i) => s.type === HOME_SECTION_ORDER[i])
  ) {
    return defaults
  }
  return normalizeLatestNewsInSections(raw)
}
