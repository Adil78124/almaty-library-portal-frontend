import { NextResponse } from "next/server"

import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { homeMetricCreateSchema } from "@/lib/validators/content"

export async function GET() {
  const items = await prisma.homeMetric.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = homeMetricCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }
  const item = await prisma.homeMetric.create({ data: parsed.data })
  return NextResponse.json(item, { status: 201 })
}
