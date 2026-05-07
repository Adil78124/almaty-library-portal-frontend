import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { partnerLinkCreateSchema } from "@/lib/validators/content"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activeOnly =
    searchParams.get("activeOnly") === "1" ||
    searchParams.get("activeOnly") === "true"

  const items = await prisma.partnerLink.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const session = await requireSuperAdminSession()
  if (!session) return jsonError("Требуется доступ супер-админа", 403)

  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = partnerLinkCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const item = await prisma.partnerLink.create({ data: parsed.data })
  return NextResponse.json(item, { status: 201 })
}
