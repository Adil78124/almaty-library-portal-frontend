import { NextResponse } from "next/server"
import { z } from "zod"

import { jsonValidationError } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  homeLimit: z.number().int().min(1).max(30),
  homeAutoRefresh: z.boolean(),
  homePollSeconds: z.number().int().min(10).max(3600).nullable(),
})

const DEFAULTS = { homeLimit: 12, homeAutoRefresh: false, homePollSeconds: 60 } as const

export async function GET() {
  const row = await prisma.pageContent.findUnique({
    where: { page: "digital-library:display" },
  })
  const raw = (row?.sections ?? {}) as any
  const parsed = schema.safeParse({
    homeLimit: typeof raw.homeLimit === "number" ? raw.homeLimit : DEFAULTS.homeLimit,
    homeAutoRefresh:
      typeof raw.homeAutoRefresh === "boolean"
        ? raw.homeAutoRefresh
        : DEFAULTS.homeAutoRefresh,
    homePollSeconds:
      raw.homePollSeconds === null || typeof raw.homePollSeconds === "number"
        ? raw.homePollSeconds
        : DEFAULTS.homePollSeconds,
  })
  return NextResponse.json(parsed.success ? parsed.data : DEFAULTS)
}

export async function POST(request: Request) {
  const session = await requireSuperAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }

  await prisma.pageContent.upsert({
    where: { page: "digital-library:display" },
    create: { page: "digital-library:display", sections: parsed.data as object },
    update: { sections: parsed.data as object },
  })

  return NextResponse.json({ ok: true })
}

