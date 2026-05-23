import Link from "next/link"
import {
  BookMarked,
  CalendarDays,
  Home,
  Landmark,
  Library,
  MapPinned,
  Newspaper,
  PanelTop,
  Phone,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  getAdminSession,
  sessionIsSuperAdmin,
} from "@/lib/auth/require-admin"
import { cn } from "@/lib/utils"

const quickLinksSuper = [
  {
    href: "/admin/branches",
    title: "Филиалы сети",
    description: "Создание филиалов для /branches и назначение админов",
    icon: MapPinned,
  },
  {
    href: "/admin/content/home",
    title: "Главная страница",
    description: "Hero, цитата, бегущая строка, метрики",
    icon: Home,
  },
  {
    href: "/admin/news",
    title: "Новости (материалы)",
    description: "Создание и редактирование статей для /news",
    icon: Newspaper,
  },
  {
    href: "/admin/content/news",
    title: "Шапка страницы «Новости»",
    description: "Тексты страницы /news; карточки на главной — из «Новости (материалы)»",
    icon: PanelTop,
  },
  {
    href: "/admin/events",
    title: "Мероприятия (материалы)",
    description: "Создание и редактирование событий: постеры, даты, публикация",
    icon: CalendarDays,
  },
  {
    href: "/admin/content/events",
    title: "Настройки страницы мероприятий",
    description: "Только шапка /events: заголовок, лид и фон; не сами события",
    icon: PanelTop,
  },
  {
    href: "/admin/digital-library/home-section",
    title: "Блок электронной библиотеки на главной",
    description: "Тизер и карточки для главной страницы",
    icon: Library,
  },
  {
    href: "/admin/content/new-arrivals",
    title: "Новые поступления",
    description: "Книжные карточки для главной",
    icon: BookMarked,
  },
  {
    href: "/admin/content/local-history",
    title: "Краеведение",
    description: "Персоны и материалы раздела",
    icon: Landmark,
  },
] as const

const quickLinksBranch = [
  {
    href: "/admin/news",
    title: "Новости (материалы)",
    description: "Статьи вашего филиала для раздела /news",
    icon: Newspaper,
  },
  {
    href: "/admin/news/display",
    title: "Отображение новостей филиала",
    description: "Блок новостей на странице вашего филиала",
    icon: PanelTop,
  },
  {
    href: "/admin/events",
    title: "Мероприятия (материалы)",
    description: "Афиша и карточки мероприятий вашего филиала",
    icon: CalendarDays,
  },
  {
    href: "/admin/events/display",
    title: "Отображение мероприятий филиала",
    description: "Блок мероприятий на странице вашего филиала",
    icon: PanelTop,
  },
  {
    href: "/admin/branch/contacts",
    title: "Контакты филиала",
    description: "Адрес, телефон, email, часы работы и ссылки",
    icon: Phone,
  },
] as const

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  const isSuper = session ? sessionIsSuperAdmin(session) : false
  const quickLinks = isSuper ? quickLinksSuper : quickLinksBranch

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Панель</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl leading-relaxed">
          {isSuper
            ? "Навигация слева соответствует разделам публичного сайта. Ниже — быстрые переходы к редактированию контента."
            : "Вы управляете материалами своего филиала: новости и мероприятия. Общий контент сайта доступен главному администратору."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-muted p-2 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "xs" }),
                      "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    Открыть
                  </span>
                </div>
                <CardTitle className="text-base leading-snug">{title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
