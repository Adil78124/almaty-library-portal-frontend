import type { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { socialLinkUpdateSchema } from "@/lib/validators/content"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const item = await prisma.socialLink.findUnique({ where: { id } })
  if (!item) {
    return jsonError("Не найдено", 404)
  }
  return NextResponse.json(item)
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = socialLinkUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  try {
    const d = parsed.data
    const data: Prisma.SocialLinkUpdateInput = {}
    if (d.label !== undefined) data.label = d.label
    if (d.labelKz !== undefined) data.labelKz = d.labelKz
    if (d.icon !== undefined) {
      data.icon = d.icon ?? "link"
    }
    if (d.url !== undefined) data.url = d.url
    if (d.sortOrder !== undefined) data.sortOrder = d.sortOrder
    const item = await prisma.socialLink.update({
      where: { id },
      data,
    })
    return NextResponse.json(item)
  } catch {
    return jsonError("Не найдено", 404)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    await prisma.socialLink.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return jsonError("Не найдено", 404)
  }
}
