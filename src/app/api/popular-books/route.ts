import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { popularBookCreateSchema } from "@/lib/validators/content"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly =
      searchParams.get("activeOnly") === "1" ||
      searchParams.get("activeOnly") === "true"

    const items = await prisma.popularBook.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error("[api/popular-books][GET] failed", e)
    return jsonError("Ошибка сервера при загрузке популярных книг", 500)
  }
}

export async function POST(request: Request) {
  const session = await requireSuperAdminSession()
  if (!session) return jsonError("Требуется доступ супер-админа", 403)

  const raw = await parseJson<unknown>(request)
  if (raw === null) return jsonError("Некорректный JSON", 400)

  const parsed = popularBookCreateSchema.safeParse(raw)
  if (!parsed.success) return jsonValidationError(parsed.error)

  const item = await prisma.popularBook.create({ data: parsed.data })
  return NextResponse.json(item, { status: 201 })
}

