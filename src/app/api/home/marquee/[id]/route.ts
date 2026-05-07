import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { marqueeUpdateSchema } from "@/lib/validators/content"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = marqueeUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  try {
    const item = await prisma.marqueeItem.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json(item)
  } catch {
    return jsonError("Элемент не найден", 404)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    await prisma.marqueeItem.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return jsonError("Элемент не найден", 404)
  }
}
