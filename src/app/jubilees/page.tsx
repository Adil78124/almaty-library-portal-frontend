import Link from "next/link"
import { cookies } from "next/headers"

import SiteFooter from "@/components/SiteFooter"
import { fetchBackendJson } from "@/lib/backend"
import {
  appLocaleFromRequestValue,
  L,
  LOCALE_STORAGE_KEY,
  pickLocalized,
} from "@/lib/i18n/app-locale"

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

async function getJubilees(): Promise<JubileeCard[]> {
  const { sections } = await fetchBackendJson<{
    page: string
    sections: unknown | null
  }>("/pages?page=jubilees", { cache: "no-store" })
  const arr = Array.isArray(sections) ? (sections as JubileeSections[]) : []
  const block = arr.find((s) => s.type === "jubilees") as
    | { type: "jubilees"; data: { items: JubileeCard[] } }
    | undefined
  const items = Array.isArray(block?.data?.items) ? block!.data.items : []
  return items.filter((x) => typeof x?.titleRu === "string")
}

export default async function JubileesPage() {
  const jar = await cookies()
  const locale = appLocaleFromRequestValue(jar.get(LOCALE_STORAGE_KEY)?.value)
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  let items: JubileeCard[] = []
  let backendOk = true
  try {
    items = await getJubilees()
  } catch {
    backendOk = false
  }

  const short = (text: string, maxLen: number) => {
    const t = text.replace(/\s+/g, " ").trim()
    if (t.length <= maxLen) return t
    return `${t.slice(0, maxLen).trim()}…`
  }

  return (
    <div className="antialiased">
      <main className="pt-20">
        <section className="relative flex h-[380px] items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="h-full w-full bg-gradient-to-r from-[#00236f] via-[#1e3a8a] to-[#0b4aa1]" />
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,white,transparent_55%)]" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
            <nav className="mb-6 flex text-sm font-label tracking-wide uppercase text-white/70">
              <Link className="hover:text-white" href="/">
                {t(L("Главная", "Басты бет"))}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{t(L("Юбиляры", "Мерейтой иелері"))}</span>
            </nav>
            <h1 className="mb-4 max-w-3xl text-5xl font-bold leading-[1.1] text-white tracking-tight md:text-6xl">
              {t(L("Юбиляры", "Мерейтой иелері"))}
            </h1>
            <p className="max-w-2xl text-xl font-light text-white/80">
              {t(
                L(
                  "Подборка материалов о выдающихся людях и деятелях культуры.",
                  "Мәдениет қайраткерлері мен танымал тұлғалар туралы жинақ."
                )
              )}
            </p>
          </div>
        </section>

        <section className="bg-surface px-8 py-16">
          <div className="mx-auto max-w-7xl">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-outline-variant bg-white p-8 text-on-surface">
                <div className="text-lg font-semibold tracking-tight">
                  {t(L("Пока нет данных", "Деректер әзірге жоқ"))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground max-w-2xl">
                  {t(
                    L(
                      backendOk
                        ? "Контент страницы должен быть загружен в базу (PageContent: page=jubilees)."
                        : "Backend недоступен. Запусти backend (порт 4000) и обнови страницу.",
                      backendOk
                        ? "Бет мазмұны базаға жүктелуі керек (PageContent: page=jubilees)."
                        : "Backend қолжетімсіз. Backend-ті (4000 порт) іске қосып, бетті жаңартыңыз."
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-7 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((it, idx) => {
                  const title = t(L(it.titleRu, it.titleKz ?? ""))
                  const bio = t(L(it.bioRu, it.bioKz ?? ""))
                  const teaser = short(bio, 320)
                  return (
                    <article
                      key={`${it.titleRu}-${idx}`}
                      className="group h-full rounded-2xl bg-white border border-outline-variant overflow-hidden shadow-[0_16px_40px_-22px_rgba(25,28,30,0.35)] hover:shadow-[0_22px_55px_-26px_rgba(25,28,30,0.45)] transition-shadow"
                    >
                      <div className="flex h-full flex-col">
                        <div className="relative bg-surface-container-low h-64 md:h-72">
                          {it.imageUrl ? (
                            <img
                              alt={title}
                              className="h-full w-full object-cover"
                              src={it.imageUrl}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-6xl">
                                account_circle
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex flex-1 flex-col p-7 md:p-8">
                          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                            {title}
                          </h2>
                          <p className="mt-4 flex-1 min-h-0 text-[15px] leading-7 text-on-surface/80">
                            {teaser}
                          </p>
                          <div className="mt-auto flex w-full justify-center pt-6">
                            <Link
                              href={`/jubilees/${encodeURIComponent(it.slug)}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#00236f] px-5 py-3 text-white font-semibold tracking-tight hover:bg-[#001a54] transition-colors"
                            >
                              {t(L("Подробнее", "Толығырақ"))}
                              <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

