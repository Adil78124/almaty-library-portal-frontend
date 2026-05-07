import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  LoginPageAsideCaption,
  LoginPageBrandLink,
} from "@/components/login-page-chrome"
import { LoginForm } from "@/components/login-form"
import { safeAdminRedirectPath } from "@/lib/auth/safe-redirect"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/session"

type Props = {
  searchParams: Promise<{ from?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { from } = await searchParams
  const redirectTo = safeAdminRedirectPath(from)

  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (token) {
    const session = await verifyAdminSessionToken(token)
    if (session) {
      redirect(redirectTo)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <LoginPageBrandLink />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        <LoginPageAsideCaption />
      </div>
    </div>
  )
}
