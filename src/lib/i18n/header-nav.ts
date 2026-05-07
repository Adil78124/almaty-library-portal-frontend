import type { Localized } from "@/lib/i18n/app-locale"
import { L } from "@/lib/i18n/app-locale"

export type NavLinkDef = { href: string; label: Localized }

/** Статические пункты шапки (до выноса в NavItem из БД). */
export const HEADER_NAV_LINKS: NavLinkDef[] = [
  { href: "/about", label: L("О библиотеке", "Кітапхана туралы") },
  { href: "/structure", label: L("Структура библиотеки", "Кітапхана құрылымы") },
  { href: "/branches", label: L("Филиалы", "Филиалдар") },
  { href: "/jubilees", label: L("Юбиляры", "Мерейтой иелері") },
  {
    href: "/digital-library",
    label: L("Электронная библиотека", "Электронды кітапхана"),
  },
  { href: "/events", label: L("Мероприятия", "Іс-шаралар") },
  { href: "/news", label: L("Новости", "Жаңалықтар") },
  { href: "/contacts", label: L("Контакты", "Байланыс") },
]
