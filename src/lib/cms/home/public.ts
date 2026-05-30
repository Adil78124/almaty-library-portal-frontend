import { cookies } from "next/headers"

import {
  appLocaleFromRequestValue,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/app-locale"
import { prisma } from "@/lib/prisma"
import type { HomeAfishaData, HomeSection } from "./types"
import { DEFAULT_AFISHA_INFO } from "./types"
import { HOME_SECTION_ORDER } from "./types"
import { resolveHomeSections } from "./resolve"
import type { ResolvedHome } from "./types"

function normalizeHomeEditorSections(sections: HomeSection[]): HomeSection[] {
  return sections.map((s) =>
    s.type === "latestNews"
      ? {
          type: "latestNews",
          data: {
            kicker: s.data.kicker,
            kickerKz: s.data.kickerKz,
            title: s.data.title,
            titleKz: s.data.titleKz,
          },
        }
      : s.type === "afisha"
        ? ({
            type: "afisha",
            data: {
              kicker: s.data.kicker,
              kickerKz: s.data.kickerKz,
              title: s.data.title,
              titleKz: s.data.titleKz,
              infoTitle:
                s.data.infoTitle ?? DEFAULT_AFISHA_INFO.title,
              infoTitleKz:
                s.data.infoTitleKz ?? DEFAULT_AFISHA_INFO.titleKz,
              infoDescription:
                s.data.infoDescription ?? DEFAULT_AFISHA_INFO.description,
              infoDescriptionKz:
                s.data.infoDescriptionKz ??
                DEFAULT_AFISHA_INFO.descriptionKz,
            },
          } satisfies { type: "afisha"; data: HomeAfishaData })
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
  return normalizeHomeEditorSections(raw)
}
