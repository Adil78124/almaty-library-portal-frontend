import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { digitalBookUpdateSchema } from "@/lib/validators/content"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const item = await prisma.digitalBook.findUnique({ where: { id } })
  if (!item) return jsonError("Не найдено", 404)
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSuperAdminSession()
  if (!session) return jsonError("Требуется доступ супер-админа", 403)

  const { id } = await params
  const raw = await parseJson<unknown>(request)
  if (raw === null) return jsonError("Некорректный JSON", 400)

  const parsed = digitalBookUpdateSchema.safeParse(raw)
  if (!parsed.success) return jsonValidationError(parsed.error)

  try {
    const item = await prisma.digitalBook.update({ where: { id }, data: parsed.data })
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
    await prisma.digitalBook.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return jsonError("Не найдено", 404)
  }
}

