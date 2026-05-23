import { NextResponse } from "next/server"
import { z } from "zod"

import {
  branchDisplaySettingsKey,
  DEFAULT_BRANCH_DISPLAY_SETTINGS,
  type BranchDisplayKind,
} from "@/lib/branch-display-settings"
import { getAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

const kindSchema = z.enum(["news", "events"])
const payloadSchema = z.object({
  enabled: z.boolean().optional(),
  limit: z.number().int().min(1).max(20).optional(),
})

type Params = { params: Promise<{ kind: string }> }

async function getBranchAdminContext(kindRaw: string) {
  const kind = kindSchema.safeParse(kindRaw)
  if (!kind.success) {
    return { error: NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 }) }
  }

  const session = await getAdminSession()
  if (
    !session ||
    session.kind !== "user" ||
    session.user.role !== "ADMIN" ||
    !session.user.branchId
  ) {
    return {
      error: NextResponse.json(
        { error: "Доступно только администратору филиала" },
        { status: 403 }
      ),
    }
  }

  return {
    kind: kind.data as BranchDisplayKind,
    branchId: session.user.branchId,
  }
}

export async function GET(_req: Request, { params }: Params) {
  const { kind: kindRaw } = await params
  const context = await getBranchAdminContext(kindRaw)
  if ("error" in context) return context.error

  const page = branchDisplaySettingsKey(context.kind, context.branchId)
  const row = await prisma.pageContent.findUnique({ where: { page } })
  return NextResponse.json({
    ...DEFAULT_BRANCH_DISPLAY_SETTINGS,
    ...(row?.sections && typeof row.sections === "object" ? row.sections : {}),
  })
}

export async function PATCH(req: Request, { params }: Params) {
  const { kind: kindRaw } = await params
  const context = await getBranchAdminContext(kindRaw)
  if ("error" in context) return context.error

  const raw = await req.json().catch(() => null)
  const parsed = payloadSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные настройки" },
      { status: 400 }
    )
  }

  const settings = {
    ...DEFAULT_BRANCH_DISPLAY_SETTINGS,
    ...parsed.data,
  }
  const page = branchDisplaySettingsKey(context.kind, context.branchId)
  await prisma.pageContent.upsert({
    where: { page },
    create: { page, sections: settings },
    update: { sections: settings },
  })

  return NextResponse.json(settings)
}

