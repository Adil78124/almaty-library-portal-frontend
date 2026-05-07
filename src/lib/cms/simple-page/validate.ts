import { z } from "zod"

import type { SimplePageSection, SimplePageSlug } from "./types"
import { SIMPLE_PAGE_SECTION_ORDER } from "./types"

const sectionSchema = z.object({
  type: z.literal("hero"),
  data: z.object({
    backgroundImageUrl: z.string(),
    backgroundImageAlt: z.string(),
    backgroundImageAltKz: z.string().optional(),
    breadcrumbLabel: z.string(),
    breadcrumbLabelKz: z.string().optional(),
    title: z.string(),
    titleKz: z.string().optional(),
    lead: z.string(),
    leadKz: z.string().optional(),
  }),
})

const payloadSchema = z.object({
  page: z.enum(["news", "events", "branches", "structure"]),
  sections: z
    .array(sectionSchema)
    .length(SIMPLE_PAGE_SECTION_ORDER.length),
})

export function parseSimpleCmsPayload(
  raw: unknown,
  expectedSlug: SimplePageSlug
):
  | { ok: true; data: { page: SimplePageSlug; sections: SimplePageSection[] } }
  | { ok: false; error: z.ZodError } {
  const r = payloadSchema.safeParse(raw)
  if (!r.success) {
    return { ok: false, error: r.error }
  }
  if (r.data.page !== expectedSlug) {
    return {
      ok: false,
      error: new z.ZodError([
        {
          code: "custom",
          message: `В теле запроса page=${r.data.page}, ожидалось ${expectedSlug}`,
          path: ["page"],
        },
      ]),
    }
  }
  const types = r.data.sections.map((s) => s.type)
  for (let i = 0; i < SIMPLE_PAGE_SECTION_ORDER.length; i++) {
    if (types[i] !== SIMPLE_PAGE_SECTION_ORDER[i]) {
      return {
        ok: false,
        error: new z.ZodError([
          {
            code: "custom",
            message: `Ожидался блок ${SIMPLE_PAGE_SECTION_ORDER[i]} на позиции ${i}`,
            path: ["sections", i, "type"],
          },
        ]),
      }
    }
  }
  return {
    ok: true,
    data: { page: expectedSlug, sections: r.data.sections as SimplePageSection[] },
  }
}
