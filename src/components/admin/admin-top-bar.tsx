"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAdminShellSession } from "@/components/admin/admin-session-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Панель",
  "/admin/content/home": "Главная страница",
  "/admin/content/news": "Новости",
  "/admin/content/events": "Настройки страницы мероприятий",
  "/admin/events/page-settings": "Страница мероприятий",
  "/admin/events/display": "Настройки отображения: мероприятия",
  "/admin/events/home-section": "Главная секция: афиша",
  "/admin/content/digital-library": "Электронная библиотека",
  "/admin/content/new-arrivals": "Новые поступления",
  "/admin/digital-library": "Электронная библиотека",
  "/admin/digital-library/new": "Добавить книгу",
  "/admin/digital-library/page-settings": "Страница электронной библиотеки",
  "/admin/digital-library/display": "Настройки отображения: электронная библиотека",
  "/admin/digital-library/new-arrivals": "Новые поступления",
  "/admin/digital-library/home-section": "Главная секция: электронная библиотека",
  "/admin/content/local-history": "Краеведение",
  "/admin/site/settings": "Контакты и соцсети",
  "/admin/useful-links": "Полезные ссылки",
  "/admin/profile": "Профиль",
  "/admin/branch/contacts": "Контакты и текст филиала",
  "/admin/branches": "Филиалы",
  "/admin/branches/new": "Новый филиал",
  "/admin/branches/page-settings": "Страница филиалов",
  "/admin/branches/network": "Филиалы: сеть библиотек",
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "А"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AdminTopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { displayName, isSuperAdmin } = useAdminShellSession()
  const title = PAGE_TITLES[pathname] ?? "Раздел"
  const isRoot = pathname === "/admin"

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-6" />
      <Breadcrumb className="hidden min-w-0 sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            {isRoot ? (
              <BreadcrumbPage>Панель</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href="/admin" />}>
                Панель
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isRoot && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 text-muted-foreground"
          onClick={() => void signOut()}
        >
          Выйти
        </Button>
        <Link
          href="/admin/profile"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Профиль"
          title={displayName}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initialsFromName(displayName)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
