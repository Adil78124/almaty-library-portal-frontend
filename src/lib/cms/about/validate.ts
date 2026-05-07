import { z } from "zod"

import type { AboutSection } from "./types"
import { ABOUT_SECTION_ORDER } from "./types"
import { normalizeAboutSectionsFromDb } from "./normalize-localized"

const loc = z.object({
  ru: z.string(),
  kz: z.string(),
})

const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    data: z.object({
      imageUrl: z.string(),
      imageAlt: loc,
      breadcrumbLabel: loc,
      title: loc,
      lead: loc,
    }),
  }),
  z.object({
    type: z.literal("roleIntro"),
    data: z.object({
      kicker: loc,
      title: loc,
      paragraphs: z.tuple([loc, loc]),
      sideImageUrl: z.string(),
      sideImageAlt: loc,
    }),
  }),
  z.object({
    type: z.literal("timeline"),
    data: z.object({
      title: loc,
      items: z.array(
        z.object({
          year: loc,
          title: loc,
          body: loc,
          align: z.enum(["left", "right"]),
        })
      ),
    }),
  }),
  z.object({
    type: z.literal("mission"),
    data: z.object({
      cards: z.array(
        z.object({
          iconName: z.string(),
          title: loc,
          body: loc,
        })
      ),
    }),
  }),
  z.object({
    type: z.literal("facts"),
    data: z.object({
      stats: z.array(
        z.object({
          value: loc,
          label: loc,
        })
      ),
    }),
  }),
  z.object({
    type: z.literal("space"),
    data: z.object({
      title: loc,
      lead: loc,
      slides: z.array(
        z.object({
          imageUrl: z.string(),
          imageAlt: loc,
          caption: loc,
        })
      ),
    }),
  }),
  z.object({
    type: z.literal("quote"),
    data: z.object({
      quote: loc,
      body: loc,
    }),
  }),
  z.object({
    type: z.literal("cta"),
    data: z.object({
      title: loc,
      lead: loc,
      primaryLabel: loc,
      primaryHref: z.string(),
      secondaryLabel: loc,
      secondaryHref: z.string(),
    }),
  }),
])

const payloadSchema = z.object({
  page: z.literal("about"),
  sections: z
    .array(sectionSchema)
    .length(ABOUT_SECTION_ORDER.length),
})

export function parseAboutCmsPayload(
  raw: unknown
):
  | { ok: true; data: { page: "about"; sections: AboutSection[] } }
  | { ok: false; error: z.ZodError } {
  const body = raw as { page?: string; sections?: unknown } | null
  const normalized = normalizeAboutSectionsFromDb(body?.sections)
  const toParse =
    normalized != null ? { page: "about", sections: normalized } : raw

  const r = payloadSchema.safeParse(toParse)
  if (!r.success) {
    return { ok: false, error: r.error }
  }
  const types = r.data.sections.map((s) => s.type)
  for (let i = 0; i < ABOUT_SECTION_ORDER.length; i++) {
    if (types[i] !== ABOUT_SECTION_ORDER[i]) {
      return {
        ok: false,
        error: new z.ZodError([
          {
            code: "custom",
            message: `Ожидался блок ${ABOUT_SECTION_ORDER[i]} на позиции ${i}, получено ${String(types[i])}`,
            path: ["sections", i, "type"],
          },
        ]),
      }
    }
  }
  return {
    ok: true,
    data: { page: "about", sections: r.data.sections as AboutSection[] },
  }
}
