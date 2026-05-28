import { NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { jsonError } from "@/lib/api/http"
import { getAdminSession } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"
import { safeUploadName, uploadsRootDir } from "@/lib/uploads"

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return jsonError("Требуется вход в админку", 401)
  }

  if (
    session.kind === "user" &&
    session.user.role === "ADMIN" &&
    !session.user.branchId
  ) {
    return jsonError("У учётной записи не задан филиал", 403)
  }

  const form = await request.formData().catch(() => null)
  if (!form) return jsonError("Некорректные данные формы", 400)

  const file = form.get("file")
  if (!(file instanceof File)) {
    return jsonError("Файл не найден (поле file)", 400)
  }

  // Simple protection: images only (can be expanded later)
  if (!file.type.startsWith("image/")) {
    return jsonError("Разрешены только изображения", 400)
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const uploadsDir = uploadsRootDir()
  await mkdir(uploadsDir, { recursive: true })

  const filename = `${Date.now()}-${safeUploadName(file.name)}`
  const abs = path.join(uploadsDir, filename)
  await writeFile(abs, bytes)

  const url = `/uploads/${filename}`

  // Store in media library for reuse
  await prisma.mediaAsset.create({
    data: {
      url,
      filename: safeUploadName(file.name),
      mimeType: file.type,
    },
  })

  return NextResponse.json({ url })
}

