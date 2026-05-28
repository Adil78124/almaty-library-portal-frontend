import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { newArrivalCreateSchema } from "@/lib/validators/content"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const activeOnly =
    url.searchParams.get("activeOnly") === "1" ||
    url.searchParams.get("activeOnly") === "true"

  const items = await prisma.newArrival.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const session = await requireSuperAdminSession()
  if (!session) {
    return jsonError("Требуется доступ супер-админа", 403)
  }

  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = newArrivalCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.newArrival.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    })

    await Promise.all(
      existing.map((arrival, index) =>
        tx.newArrival.update({
          where: { id: arrival.id },
          data: { sortOrder: index + 2 },
        })
      )
    )

    return tx.newArrival.create({
      data: {
        ...parsed.data,
        sortOrder: 1,
      },
    })
  })
  return NextResponse.json(item, { status: 201 })
}
