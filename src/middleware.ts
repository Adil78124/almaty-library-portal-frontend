import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/session"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    const login = new URL("/login", request.url)
    login.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }

  const session = await verifyAdminSessionToken(token)
  if (!session) {
    const login = new URL("/login", request.url)
    login.searchParams.set("from", request.nextUrl.pathname)
    const res = NextResponse.redirect(login)
    res.cookies.delete(ADMIN_SESSION_COOKIE)
    return res
  }

  const path = request.nextUrl.pathname
  const isBranchAdmin = session.role === "ADMIN"
  if (
    isBranchAdmin &&
    (path.startsWith("/admin/content") ||
      path.startsWith("/admin/site") ||
      path.startsWith("/admin/branches"))
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
