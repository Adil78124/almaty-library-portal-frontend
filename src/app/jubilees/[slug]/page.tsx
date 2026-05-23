import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import SiteFooter from "@/components/SiteFooter"
import { fetchBackendJson } from "@/lib/backend"
import {
  appLocaleFromRequestValue,
  L,
  LOCALE_STORAGE_KEY,
  pickLocalized,
} from "@/lib/i18n/app-locale"

export const dynamic = "force-dynamic"

type JubileeCard = {
  slug: string
  titleRu: string
  titleKz: string | null
  imageUrl: string | null
  bioRu: string
  bioKz: string | null
}

type JubileeSections =
  | { type: "jubilees"; data: { items: JubileeCard[] } }
  | { type: string; data: unknown }

function normalizeSlug(input: string) {
  try {
    return decodeURIComponent(input).toLowerCase().normalize("NFC")
  } catch {
    return input.toLowerCase().normalize("NFC")
  }
}

async function getJubileeBySlug(slug: string): Promise<JubileeCard | null> {
  try {
    const { sections } = await fetchBackendJson<{
      page: string
      sections: unknown | null
    }>("/pages?page=jubilees", { cache: "no-store" })
    const arr = Array.isArray(sections) ? (sections as JubileeSections[]) : []
    const block = arr.find((s) => s.type === "jubilees") as
      | { type: "jubilees"; data: { items: JubileeCard[] } }
      | undefined
    const items = Array.isArray(block?.data?.items) ? block!.data.items : []
    const wanted = normalizeSlug(slug)
    const found = items.find((x) => normalizeSlug(x?.slug ?? "") === wanted)
    return found ?? null
  } catch {
    return null
  }
}

export default async function JubileeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  const item = await getJubileeBySlug(slug)
  if (!item) notFound()

  const title = t(L(item.titleRu, item.titleKz ?? ""))
  const bio = t(L(item.bioRu, item.bioKz ?? ""))

  return (
    <div className="antialiased overflow-x-hidden">
      <main className="pt-20 min-w-0">
        <section className="bg-surface px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="mx-auto max-w-5xl min-w-0">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-label tracking-wide uppercase text-on-surface/70">
              <Link className="hover:text-on-surface" href="/">
                {t(L("Главная", "Басты бет"))}
              </Link>
              <span>/</span>
              <Link className="hover:text-on-surface" href="/jubilees">
                {t(L("Юбиляры", "Мерейтой иелері"))}
              </Link>
              <span>/</span>
              <span className="text-on-surface">{title}</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface break-words">
              {title}
            </h1>
          </div>
        </section>

        <section className="bg-surface px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="mx-auto max-w-5xl min-w-0">
            <div className="mt-8 overflow-hidden rounded-2xl border border-outline-variant bg-white">
              <div className="relative bg-surface-container-low">
                {item.imageUrl ? (
                  <img
                    alt={title}
                    className="w-full max-h-[520px] object-cover"
                    src={item.imageUrl}
                  />
                ) : (
                  <div className="h-[320px] w-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-7xl">
                      account_circle
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-10">
                <div className="text-sm sm:text-[15px] md:text-[16px] leading-7 md:leading-8 text-on-surface/85 whitespace-pre-line break-words">
                  {bio}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/jubilees"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00236f] px-5 py-3 text-white font-semibold tracking-tight hover:bg-[#001a54] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                {t(L("Назад к списку", "Тізімге оралу"))}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

