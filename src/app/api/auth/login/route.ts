import { NextResponse } from "next/server"
import { z } from "zod"

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  createFullAdminSessionToken,
} from "@/lib/auth/session"
import { validateAdminLogin } from "@/lib/auth/credentials"
import { verifyPassword } from "@/lib/auth/password"
import { jsonError, jsonValidationError, parseJson } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"

const bodySchema = z
  .object({
    login: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1),
  })
  .transform((d) => ({
    keyRaw: (d.login ?? d.email ?? "").trim(),
    password: d.password,
  }))
  .pipe(
    z.object({
      keyRaw: z.string().min(1, "Укажите логин"),
      password: z.string().min(1),
    })
  )

function normalizeKey(s: string): string {
  return s.trim().toLowerCase()
}

export async function POST(request: Request) {
  const raw = await parseJson<unknown>(request)
  if (raw === null) {
    return jsonError("Некорректный JSON", 400)
  }
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }

  const { keyRaw, password } = parsed.data
  const key = normalizeKey(keyRaw)

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: key }, { login: key }],
    },
  })

  if (user) {
    const ok = await verifyPassword(password, user.password)
    if (!ok) {
      return jsonError("Неверный логин или пароль", 401)
    }
    let token: string
    try {
      token = await createFullAdminSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ошибка создания сессии"
      return jsonError(message, 500)
    }
    const maxAge = 60 * 60 * 24 * 7
    const res = NextResponse.json({ ok: true })
    res.cookies.set({
      ...adminSessionCookieOptions(maxAge),
      value: token,
    })
    return res
  }

  if (key.includes("@") && validateAdminLogin(keyRaw, password)) {
    let token: string
    try {
      token = await createAdminSessionToken(keyRaw.trim())
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ошибка создания сессии"
      return jsonError(message, 500)
    }
    const maxAge = 60 * 60 * 24 * 7
    const res = NextResponse.json({ ok: true })
    res.cookies.set({
      ...adminSessionCookieOptions(maxAge),
      value: token,
    })
    return res
  }

  return jsonError("Неверный логин или пароль", 401)
}
