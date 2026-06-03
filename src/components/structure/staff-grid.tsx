"use client"

import { useLocale } from "@/components/i18n/locale-provider"
import { L, pickDbField, pickLocalized } from "@/lib/i18n/app-locale"

export type StaffApiItem = {
  id: string
  fullNameRu: string
  fullNameKz: string | null
  birthDate: string | null
  phone: string | null
  email: string | null
  positionRu: string | null
  positionKz: string | null
  branchRu: string
  branchKz: string | null
  imageUrl: string | null
}

export type StaffSectionApiItem = {
  id: string
  titleRu: string
  titleKz: string | null
  sortOrder: number
  staff: StaffApiItem[]
}

function formatBirthDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = String(d.getUTCFullYear())
  return `${dd}.${mm}.${yyyy}`
}

export function StaffGrid({ sections }: { sections: StaffSectionApiItem[] }) {
  const { locale } = useLocale()
  const t = (v: Parameters<typeof pickLocalized>[0]) => pickLocalized(v, locale)

  if (sections.length === 0) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-dashed p-10 text-center text-on-surface-variant">
          {t(L("Список сотрудников пока пуст.", "Қызметкерлер тізімі әзірше бос."))}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {sections.map((section) => (
        <section key={section.id} className="space-y-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="break-words text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              {pickDbField(section.titleRu, section.titleKz, locale)}
            </h2>
          </div>

          {section.staff.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-on-surface-variant">
              {t(L("В этой секции пока нет сотрудников.", "Бұл бөлімде әзірше қызметкерлер жоқ."))}
            </div>
          ) : (
            <div className="scroll-smooth flex flex-nowrap gap-6 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch]">
              {section.staff.map((p) => {
                const name = pickDbField(p.fullNameRu, p.fullNameKz, locale)
                const branch = pickDbField(p.branchRu, p.branchKz, locale)
                const position = pickDbField(p.positionRu ?? "", p.positionKz, locale)
                return (
                  <div
                    key={p.id}
                    className="w-[min(100%,460px)] shrink-0 flex-none overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
                      <img
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
                        src={p.imageUrl?.trim() || "/placeholder.svg"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      <div className="relative z-10 flex h-full w-full items-center justify-center p-3">
                        <img
                          alt={name}
                          className="h-full w-full object-contain drop-shadow-sm"
                          src={p.imageUrl?.trim() || "/placeholder.svg"}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 p-7">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-secondary">
                        {position || t(L("Сотрудник", "Қызметкер"))}
                      </div>
                      <div className="text-xl font-extrabold leading-snug text-on-surface">
                        {name}
                      </div>
                      <div className="text-base text-on-surface-variant">{branch}</div>

                      <div className="space-y-2 pt-3 text-sm text-on-surface-variant">
                        {p.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">call</span>
                            <a className="hover:underline" href={`tel:${p.phone}`}>
                              {p.phone}
                            </a>
                          </div>
                        ) : null}
                        {p.email ? (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">mail</span>
                            <a className="break-all hover:underline" href={`mailto:${p.email}`}>
                              {p.email}
                            </a>
                          </div>
                        ) : null}
                        {p.birthDate ? (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                            <span>{formatBirthDate(p.birthDate)}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
