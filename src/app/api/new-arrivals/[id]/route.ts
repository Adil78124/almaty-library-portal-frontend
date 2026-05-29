import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { newArrivalUpdateSchema } from "@/lib/validators/content"

type Params = { params: Promise<{ id: string }> }

async function normalizeNewArrivalOrder() {
  const items = await prisma.newArrival.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  })
  await Promise.all(
    items.map((item, index) =>
      prisma.newArrival.update({
        where: { id: item.id },
        data: { sortOrder: index + 1 },
      })
    )
  )
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const item = await prisma.newArrival.findUnique({ where: { id } })
  if (!item) return jsonError("Не найдено", 404)
  return NextResponse.json(item)
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireSuperAdminSession()
  if (!session) return jsonError("Требуется доступ супер-админа", 403)

  const { id } = await params
  const raw = await parseJson<unknown>(request)
  if (raw === null) return jsonError("Некорректный JSON", 400)

  const parsed = newArrivalUpdateSchema.safeParse(raw)
  if (!parsed.success) return jsonValidationError(parsed.error)

  try {
    const item = await prisma.newArrival.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json(item)
  } catch {
    return jsonError("Не найдено", 404)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSuperAdminSession()
  if (!session) return jsonError("Требуется доступ супер-админа", 403)

  const { id } = await params
  try {
    await prisma.newArrival.delete({ where: { id } })
    await normalizeNewArrivalOrder()
    return new NextResponse(null, { status: 204 })
  } catch {
    return jsonError("Не найдено", 404)
  }
}
