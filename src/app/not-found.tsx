import Link from "next/link"

import SiteFooter from "@/components/SiteFooter"

export default function NotFound() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <main className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 py-16 pt-24 text-center sm:px-6">
        <p className="text-sm font-bold uppercase text-primary">404</p>
        <h1 className="mt-4 break-words text-2xl font-black tracking-tight text-on-surface sm:text-3xl md:text-4xl">
          Страница не найдена / Бет табылмады
        </h1>
        <p className="mt-4 max-w-md break-words text-base leading-relaxed text-on-surface-variant">
          Адрес указан неверно или страница была удалена. Проверьте ссылку или
          вернитесь на главную страницу.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          На главную
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}
