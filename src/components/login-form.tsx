"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useLocale } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"
import { safeAdminRedirectPath } from "@/lib/auth/safe-redirect"
import { L, pickLocalized } from "@/lib/i18n/app-locale"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  redirectTo = "/admin",
  ...props
}: React.ComponentProps<"form"> & { redirectTo?: string }) {
  const router = useRouter()
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const target = safeAdminRedirectPath(redirectTo)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = e.currentTarget
    const login = (form.elements.namedItem("login") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(
          data.error ?? t(L("Не удалось войти", "Кіру мүмкін болмады"))
        )
        return
      }
      router.push(target)
      router.refresh()
    } catch {
      setError(
        t(
          L(
            "Сетевая ошибка. Попробуйте снова.",
            "Желілік қате. Қайта көріңіз."
          )
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t(L("Вход в админку", "Админкаға кіру"))}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t(
              L(
                "Введите логин и пароль учётной записи администратора",
                "Әкімші тіркелгінің логині мен құпия сөзін енгізіңіз"
              )
            )}
          </p>
        </div>
        {error ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Field>
          <FieldLabel htmlFor="login">
            {t(L("Логин", "Логин"))}
          </FieldLabel>
          <Input
            id="login"
            name="login"
            type="text"
            placeholder="oblkitap-portal"
            autoComplete="username"
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">
              {t(L("Пароль", "Құпия сөз"))}
            </FieldLabel>
            <span className="ml-auto text-sm text-muted-foreground">
              {t(L("Забыли пароль?", "Құпия сөзді ұмыттыңыз ба?"))}{" "}
              <span className="text-muted-foreground/80">
                {t(
                  L(
                    "Обратитесь к администратору сервера",
                    "Сервер әкімшісіне хабарласыңыз"
                  )
                )}
              </span>
            </span>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t(L("Вход…", "Кіру…"))
              : t(L("Войти", "Кіру"))}
          </Button>
        </Field>
        <FieldSeparator>
          {t(L("или", "немесе"))}
        </FieldSeparator>
        <Field>
          <Button variant="outline" type="button" className="w-full" disabled>
            {t(L("Вход через SSO (позже)", "SSO арқылы кіру (кейін)"))}
          </Button>
          <FieldDescription className="text-center">
            {t(L("Нет доступа?", "Қолжетімділік жоқ па?"))}{" "}
            <Link href="/contacts" className="underline underline-offset-4">
              {t(L("Контакты библиотеки", "Кітапхана байланыстары"))}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
