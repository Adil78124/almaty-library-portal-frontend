import { z } from "zod"

import type { DigitalLibrarySection } from "./types"
import { DIGITAL_LIBRARY_SECTION_ORDER } from "./types"

const loc = z.object({ ru: z.string(), kz: z.string() })

const heroSchema = z.object({
  type: z.literal("hero"),
  data: z.object({
    backgroundImageUrl: z.string(),
    backgroundImageAlt: loc,
    breadcrumbLabel: loc,
    title: loc,
    lead: loc,
  }),
})

const toneSchema = z.enum(["secondaryFixed", "tertiaryFixed", "primaryFixed", "neutral"])

const bentoSchema = z.object({
  type: z.literal("bento"),
  data: z.object({
    cards: z
      .array(
        z.object({
          iconName: z.string(),
          title: loc,
          body: loc,
          tone: toneSchema,
        })
      )
      .length(2),
  }),
})

const helpSchema = z.object({
  type: z.literal("help"),
  data: z.object({
    title: loc,
    steps: z.array(loc).length(3),
    formats: z.array(z.string()).min(1),
  }),
})

const accessSchema = z.object({
  type: z.literal("access"),
  data: z.object({
    title: loc,
    body: loc,
  }),
})

const ctaSchema = z.object({
  type: z.literal("cta"),
  data: z.object({
    title: loc,
    lead: loc,
    primaryLabel: loc,
    primaryHref: z.string(),
    secondaryLabel: loc,
    secondaryHref: z.string(),
  }),
})

const sectionSchema = z.discriminatedUnion("type", [
  heroSchema,
  bentoSchema,
  helpSchema,
  accessSchema,
  ctaSchema,
])

const payloadSchema = z.object({
  page: z.literal("digital-library"),
  sections: z.array(sectionSchema).length(DIGITAL_LIBRARY_SECTION_ORDER.length),
})

export function parseDigitalLibraryCmsPayload(
  raw: unknown
):
  | { ok: true; data: { page: "digital-library"; sections: DigitalLibrarySection[] } }
  | { ok: false; error: z.ZodError } {
  const r = payloadSchema.safeParse(raw)
  if (!r.success) return { ok: false, error: r.error }

  const types = r.data.sections.map((s) => s.type)
  for (let i = 0; i < DIGITAL_LIBRARY_SECTION_ORDER.length; i++) {
    if (types[i] !== DIGITAL_LIBRARY_SECTION_ORDER[i]) {
      return {
        ok: false,
        error: new z.ZodError([
          {
            code: "custom",
            message: `Ожидался блок ${DIGITAL_LIBRARY_SECTION_ORDER[i]} на позиции ${i}, получено ${String(types[i])}`,
            path: ["sections", i, "type"],
          },
        ]),
      }
    }
  }

  return {
    ok: true,
    data: {
      page: "digital-library",
      sections: r.data.sections as DigitalLibrarySection[],
    },
  }
}

