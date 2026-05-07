import { z } from "zod"

import type { BranchesNetworkSection } from "./types"
import { BRANCHES_NETWORK_SECTION_ORDER } from "./types"

const sectionSchema = z.object({
  type: z.literal("branchesNetwork"),
  data: z.object({
    titleRu: z.string(),
    titleKz: z.string().optional(),
    leadRu: z.string(),
    leadKz: z.string().optional(),
    bodyRu: z.string(),
    bodyKz: z.string().optional(),
    imageUrl: z.string().optional(),
    imageAltRu: z.string().optional(),
    imageAltKz: z.string().optional(),
  }),
})

const payloadSchema = z.object({
  page: z.literal("branches-network"),
  sections: z.array(sectionSchema).length(BRANCHES_NETWORK_SECTION_ORDER.length),
})

export function parseBranchesNetworkCmsPayload(
  raw: unknown
):
  | {
      ok: true
      data: { page: "branches-network"; sections: BranchesNetworkSection[] }
    }
  | { ok: false; error: z.ZodError } {
  const r = payloadSchema.safeParse(raw)
  if (!r.success) {
    return { ok: false, error: r.error }
  }
  const types = r.data.sections.map((s) => s.type)
  for (let i = 0; i < BRANCHES_NETWORK_SECTION_ORDER.length; i++) {
    if (types[i] !== BRANCHES_NETWORK_SECTION_ORDER[i]) {
      return {
        ok: false,
        error: new z.ZodError([
          {
            code: "custom",
            message: `Ожидался блок ${BRANCHES_NETWORK_SECTION_ORDER[i]} на позиции ${i}`,
            path: ["sections", i, "type"],
          },
        ]),
      }
    }
  }
  return {
    ok: true,
    data: {
      page: "branches-network",
      sections: r.data.sections as BranchesNetworkSection[],
    },
  }
}

