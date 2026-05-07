"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  Home,
  LayoutDashboard,
  Library,
  Link2,
  Landmark,
  MapPinned,
  Newspaper,
  PanelLeftClose,
  Phone,
  Settings2,
  UserRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAdminShellSession } from "@/components/admin/admin-session-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const contentItems = [
  {
    href: "/admin/content/home",
    label: "Главная страница",
    icon: Home,
    description: "Hero, бегущая строка, метрики",
  },
  {
    href: "/admin/content/structure",
    label: "Структура библиотеки",
    icon: Building2,
    description: "Шапка страницы /structure",
  },
  {
    href: "/admin/content/about",
    label: "О библиотеке",
    icon: Building2,
    description: "Страница /about, блоки сверху вниз",
  },
] as const

const siteItems = [
  { href: "/admin/site/settings", label: "Контакты и соцсети", icon: Settings2 },
] as const

function NavLink({
  href,
  label,
  icon: Icon,
  tooltip,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  tooltip?: string
}) {
  const pathname = usePathname()
  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={tooltip ?? label}
        render={<Link href={href} />}
      >
        <Icon className="text-sidebar-foreground/80" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SubNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={active}
        render={<Link href={href} />}
      >
        <span>{label}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

export function AdminAppSidebar() {
  const { toggleSidebar } = useSidebar()
  const { isSuperAdmin } = useAdminShellSession()
  const pathname = usePathname()
  const [newsOpen, setNewsOpen] = React.useState(true)
  const [elibOpen, setElibOpen] = React.useState(true)
  const [branchesOpen, setBranchesOpen] = React.useState(true)
  const [eventsOpen, setEventsOpen] = React.useState(true)

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black">
            А
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-none">
              Админка
            </p>
            <p className="truncate text-xs text-sidebar-foreground/65 mt-1">
              Областная библиотека
            </p>
          </div>
        </div>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full justify-center gap-2"
            )}
          >
            <BookOpen className="size-3.5" />
            На сайт
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavLink href="/admin" label="Панель" icon={LayoutDashboard} />
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/admin/branches")}
                    tooltip="Филиалы"
                    render={<Link href="/admin/branches" />}
                  >
                    <MapPinned className="text-sidebar-foreground/80" />
                    <span>Филиалы</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    className="opacity-100"
                    aria-label={branchesOpen ? "Скрыть подпункты" : "Показать подпункты"}
                    aria-expanded={branchesOpen}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setBranchesOpen((v) => !v)
                    }}
                    render={
                      <button type="button">
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-200",
                            branchesOpen ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>
                    }
                  />
                  {branchesOpen ? (
                    <SidebarMenuSub>
                      <SubNavLink href="/admin/branches" label="Все филиалы" />
                      <SubNavLink href="/admin/branches/new" label="Добавить филиал" />
                      <SubNavLink href="/admin/branches/page-settings" label="Страница филиалов" />
                      <SubNavLink href="/admin/branches/network" label="Сеть библиотек" />
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/news")}
                  tooltip="Новости"
                  render={<Link href="/admin/news" />}
                >
                  <Newspaper className="text-sidebar-foreground/80" />
                  <span>Новости</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  className="opacity-100"
                  aria-label={newsOpen ? "Скрыть подпункты" : "Показать подпункты"}
                  aria-expanded={newsOpen}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setNewsOpen((v) => !v)
                  }}
                  render={
                    <button type="button">
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          newsOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  }
                />
                {newsOpen ? (
                  <SidebarMenuSub>
                  <SubNavLink href="/admin/news" label="Все новости" />
                  <SubNavLink href="/admin/news/new" label="Создать новость" />
                  <SubNavLink href="/admin/news/page-settings" label="Страница новостей" />
                  <SubNavLink href="/admin/news/display" label="Настройки отображения" />
                  <SubNavLink href="/admin/news/home-section" label="Главная секция" />
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/events")}
                  tooltip="Мероприятия"
                  render={<Link href="/admin/events" />}
                >
                  <CalendarDays className="text-sidebar-foreground/80" />
                  <span>Мероприятия</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  className="opacity-100"
                  aria-label={eventsOpen ? "Скрыть подпункты" : "Показать подпункты"}
                  aria-expanded={eventsOpen}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEventsOpen((v) => !v)
                  }}
                  render={
                    <button type="button">
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          eventsOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  }
                />
                {eventsOpen ? (
                  <SidebarMenuSub>
                    <SubNavLink href="/admin/events" label="Все мероприятия" />
                    <SubNavLink href="/admin/events/new" label="Создать мероприятие" />
                    <SubNavLink href="/admin/events/page-settings" label="Страница мероприятий" />
                    <SubNavLink href="/admin/events/display" label="Настройки отображения" />
                    <SubNavLink href="/admin/events/home-section" label="Главная секция" />
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/admin/digital-library")}
                    tooltip="Электронная библиотека"
                    render={<Link href="/admin/digital-library" />}
                  >
                    <Library className="text-sidebar-foreground/80" />
                    <span>Электронная библиотека</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    className="opacity-100"
                    aria-label={elibOpen ? "Скрыть подпункты" : "Показать подпункты"}
                    aria-expanded={elibOpen}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setElibOpen((v) => !v)
                    }}
                    render={
                      <button type="button">
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-200",
                            elibOpen ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>
                    }
                  />
                  {elibOpen ? (
                    <SidebarMenuSub>
                      <SubNavLink href="/admin/digital-library" label="Все ресурсы" />
                      <SubNavLink href="/admin/digital-library/new" label="Добавить книгу" />
                      <SubNavLink href="/admin/digital-library/new-arrivals" label="Новые поступления" />
                      <SubNavLink
                        href="/admin/digital-library/page-settings"
                        label="Страница электронной библиотеки"
                      />
                      <SubNavLink
                        href="/admin/digital-library/display"
                        label="Настройки отображения"
                      />
                      <SubNavLink
                        href="/admin/digital-library/home-section"
                        label="Главная секция"
                      />
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              )}
              {isSuperAdmin && (
                <NavLink
                  href="/admin/local-history"
                  label="Краеведение (карточки)"
                  icon={Landmark}
                />
              )}
              {!isSuperAdmin && (
                <NavLink
                  href="/admin/branch/contacts"
                  label="Контакты и текст филиала"
                  icon={Phone}
                />
              )}
              {isSuperAdmin &&
                contentItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    tooltip={
                      "description" in item && item.description
                        ? `${item.label} — ${item.description}`
                        : item.label
                    }
                  />
                ))}

              {isSuperAdmin &&
                siteItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Link
          href="/admin/profile"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-1 w-full justify-start gap-2 text-sidebar-foreground/80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          )}
        >
          <UserRound className="size-4" />
          <span className="group-data-[collapsible=icon]:sr-only">Профиль</span>
          <span className="group-data-[collapsible=icon]:hidden">Профиль</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sidebar-foreground/80 group-data-[collapsible=icon]:px-0"
          onClick={toggleSidebar}
        >
          <PanelLeftClose className="size-4" />
          <span className="group-data-[collapsible=icon]:sr-only">
            Свернуть панель
          </span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
