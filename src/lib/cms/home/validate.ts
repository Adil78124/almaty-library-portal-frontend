import { z } from "zod"

import { HOME_SECTION_ORDER } from "./types"
import type { HomeSection } from "./types"

const heroData = z.object({
  backgroundImageUrl: z.string(),
  backgroundAlt: z.string().optional(),
  backgroundAltKz: z.string().optional(),
  titleLine1: z.string(),
  titleLine1Kz: z.string().optional(),
  titleLine2: z.string(),
  titleLine2Kz: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleKz: z.string().optional(),
})

const tickerLineSchema = z.object({
  text: z.string(),
  textKz: z.string().nullable().optional(),
})

const tickerData = z.object({
  items: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.map((x) =>
            typeof x === "string" ? { text: x, textKz: undefined } : x
          )
        : val,
    z.array(tickerLineSchema)
  ),
})

const sectionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), data: heroData }),
  z.object({
    type: z.literal("quote"),
    data: z.object({
      text: z.string(),
      textKz: z.string().optional(),
      author: z.string().optional(),
      authorKz: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("ticker"),
    data: tickerData,
  }),
  z.object({
    type: z.literal("statistics"),
    data: z.object({
      cards: z.array(
        z.object({
          iconName: z.string(),
          valueText: z.string(),
          valueTextKz: z.string().nullable().optional(),
          label: z.string(),
          labelKz: z.string().nullable().optional(),
        })
      ),
    }),
  }),
  z.object({
    type: z.literal("afisha"),
    data: z.object({
      kicker: z.string(),
      kickerKz: z.string().optional(),
      title: z.string(),
      titleKz: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("eLibrary"),
    data: z.object({
      title: z.string(),
      titleKz: z.string().optional(),
      description: z.string(),
      descriptionKz: z.string().optional(),
      buttonLabel: z.string(),
      buttonLabelKz: z.string().optional(),
      buttonHref: z.string(),
      source: z.enum(["manual", "database"]),
      manualBooks: z
        .array(
          z.object({
            coverUrl: z.string(),
            title: z.string(),
            titleKz: z.string().nullable().optional(),
            author: z.string(),
            authorKz: z.string().nullable().optional(),
          })
        )
        .optional(),
      database: z
        .object({
          limit: z.number().optional(),
          showOnHomeOnly: z.boolean().optional(),
        })
        .optional(),
    }),
  }),
  z.object({
    type: z.literal("latestNews"),
    data: z.object({
      kicker: z.string(),
      kickerKz: z.string().optional(),
      title: z.string(),
      titleKz: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("newArrivals"),
    data: z.object({
      title: z.string(),
      titleKz: z.string().optional(),
      subtitle: z.string(),
      subtitleKz: z.string().optional(),
      source: z.enum(["manual", "database"]),
      manualBooks: z
        .array(
          z.object({
            coverUrl: z.string(),
            title: z.string(),
            titleKz: z.string().nullable().optional(),
            author: z.string(),
            authorKz: z.string().nullable().optional(),
            detailHref: z.string(),
          })
        )
        .optional(),
      database: z.object({ limit: z.number().optional() }).optional(),
    }),
  }),
  z.object({
    type: z.literal("localHistory"),
    data: z.object({
      title: z.string(),
      titleKz: z.string().optional(),
      description: z.string().optional(),
      descriptionKz: z.string().optional(),
      source: z.enum(["manual", "database"]),
      manualCards: z
        .array(
          z.object({
            portraitUrl: z.string().optional(),
            slug: z.string().nullable().optional(),
            name: z.string(),
            nameKz: z.string().nullable().optional(),
            excerpt: z.string(),
            excerptKz: z.string().nullable().optional(),
          })
        )
        .optional(),
      database: z.object({ limit: z.number().optional() }).optional(),
    }),
  }),
  z.object({
    type: z.literal("mediaGallery"),
    data: z.object({
      title: z.string(),
      titleKz: z.string().optional(),
      videos: z.array(
        z.object({
          position: z.union([
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
          ]),
          youtubeUrl: z.string(),
        })
      ),
    }),
  }),
  z.object({
    type: z.literal("usefulLinks"),
    data: z.object({
      kicker: z.string(),
      kickerKz: z.string().optional(),
      title: z.string(),
      titleKz: z.string().optional(),
      source: z.enum(["manual", "database"]),
      manualLinks: z
        .array(
          z.object({
            href: z.string(),
            title: z.string(),
            titleKz: z.string().nullable().optional(),
            logoUrl: z.string(),
            logoVariant: z.enum(["round", "rect"]),
          })
        )
        .optional(),
      database: z.object({ limit: z.number().optional() }).optional(),
    }),
  }),
])

const payloadSchema = z.object({
  page: z.literal("home"),
  sections: z
    .array(sectionSchema)
    .min(HOME_SECTION_ORDER.length)
    .max(HOME_SECTION_ORDER.length),
})

export function parseHomeCmsPayload(
  raw: unknown
): { ok: true; data: { page: "home"; sections: HomeSection[] } } | { ok: false; error: z.ZodError } {
  const r = payloadSchema.safeParse(raw)
  if (!r.success) {
    return { ok: false, error: r.error }
  }
  const types = r.data.sections.map((s) => s.type)
  for (let i = 0; i < HOME_SECTION_ORDER.length; i++) {
    if (types[i] !== HOME_SECTION_ORDER[i]) {
      return {
        ok: false,
        error: new z.ZodError([
          {
            code: "custom",
            message: `Ожидался блок ${HOME_SECTION_ORDER[i]} на позиции ${i}, получено ${String(types[i])}`,
            path: ["sections", i, "type"],
          },
        ]),
      }
    }
  }
  return {
    ok: true,
    data: { page: "home", sections: r.data.sections as HomeSection[] },
  }
}
