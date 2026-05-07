import { cookies } from "next/headers"

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/session"
import { getExpectedAdminCredentials } from "@/lib/auth/credentials"
import { prisma } from "@/lib/prisma"
import type { User } from "@prisma/client"

export type ResolvedAdminSession =
  | { kind: "user"; user: User }
  | { kind: "legacy"; email: string }

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function sessionIsSuperAdmin(s: ResolvedAdminSession): boolean {
  return s.kind === "legacy" || s.user.role === "SUPER_ADMIN"
}

/** Проверка доступа к материалу филиала (null = сеть, только супер). */
export function sessionCanAccessBranchResource(
  s: ResolvedAdminSession,
  resourceBranchId: string | null
): boolean {
  if (sessionIsSuperAdmin(s)) return true
  if (s.kind !== "user" || s.user.role !== "ADMIN" || !s.user.branchId) {
    return false
  }
  if (resourceBranchId === null) return false
  return resourceBranchId === s.user.branchId
}

export async function getAdminSession(): Promise<ResolvedAdminSession | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return null
  }
  const payload = await verifyAdminSessionToken(token)
  if (!payload?.email) {
    return null
  }
  const email = normalizeEmail(payload.email)
  const user = await prisma.user.findUnique({
    where: { email },
  })
  if (user) {
    return { kind: "user", user }
  }
  const expected = getExpectedAdminCredentials()
  if (expected.email && email === expected.email.toLowerCase()) {
    return { kind: "legacy", email }
  }
  return null
}

export async function requireSuperAdminSession(): Promise<ResolvedAdminSession | null> {
  const s = await getAdminSession()
  if (!s) return null
  if (sessionIsSuperAdmin(s)) return s
  return null
}

/** @deprecated Используйте getAdminSession / requireSuperAdminSession */
export async function requireAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return null
  }
  return verifyAdminSessionToken(token)
}
