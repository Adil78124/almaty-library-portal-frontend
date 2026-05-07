"use client"

import { useMemo, useState, useTransition } from "react"

import type { HomeSection } from "@/lib/cms/home/types"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function pickELibrarySection(
  sections: HomeSection[]
): Extract<HomeSection, { type: "eLibrary" }> | null {
  const s = sections.find((x) => x.type === "eLibrary") as
    | Extract<HomeSection, { type: "eLibrary" }>
    | undefined
  return s ?? null
}

export function DigitalLibraryHomeSectionForm({
  initialSections,
}: {
  initialSections: HomeSection[]
}) {
  const { success } = useAdminToast()
  const initial = useMemo(
    () => pickELibrarySection(initialSections),
    [initialSections]
  )

  const [titleRu, setTitleRu] = useState(initial?.data.title ?? "")
  const [titleKz, setTitleKz] = useState(initial?.data.titleKz ?? "")
  const [descriptionRu, setDescriptionRu] = useState(
    initial?.data.description ?? ""
  )
  const [descriptionKz, setDescriptionKz] = useState(
    initial?.data.descriptionKz ?? ""
  )
  const [buttonLabelRu, setButtonLabelRu] = useState(
    initial?.data.buttonLabel ?? ""
  )
  const [buttonLabelKz, setButtonLabelKz] = useState(
    initial?.data.buttonLabelKz ?? ""
  )
  const [buttonHref, setButtonHref] = useState(
    initial?.data.buttonHref ?? "/digital-library"
  )

  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const next = initialSections.map((s) => {
        if (s.type !== "eLibrary") return s
        return {
          type: "eLibrary",
          data: {
            ...s.data,
            title: titleRu.trim() || s.data.title,
            titleKz: titleKz.trim() || undefined,
            description: descriptionRu.trim() || s.data.description,
            descriptionKz: descriptionKz.trim() || undefined,
            buttonLabel: buttonLabelRu.trim() || s.data.buttonLabel,
            buttonLabelKz: buttonLabelKz.trim() || undefined,
            buttonHref: buttonHref.trim() || s.data.buttonHref,
          },
        } satisfies HomeSection
      })

      const res = await fetch("/api/page/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "home", sections: next }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
      }
      if (!res.ok) {
        if (data.issues?.length) {
          setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(data.error ?? "Не удалось сохранить")
        }
        return
      }

      success("Сохранено. Главная страница обновлена.")
    })
  }

  if (!initial) {
    return (
      <p className="text-destructive text-sm">
        Не удалось найти секцию eLibrary в настройках главной страницы.
      </p>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="elib-home-title-ru">Заголовок (RU)</Label>
          <Input
            id="elib-home-title-ru"
            value={titleRu}
            onChange={(e) => setTitleRu(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="elib-home-title-kz">Заголовок (KZ)</Label>
          <Input
            id="elib-home-title-kz"
            value={titleKz}
            onChange={(e) => setTitleKz(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="elib-home-desc-ru">Описание (RU)</Label>
          <Input
            id="elib-home-desc-ru"
            value={descriptionRu}
            onChange={(e) => setDescriptionRu(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="elib-home-desc-kz">Описание (KZ)</Label>
          <Input
            id="elib-home-desc-kz"
            value={descriptionKz}
            onChange={(e) => setDescriptionKz(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="elib-home-btn-ru">Кнопка: текст (RU)</Label>
          <Input
            id="elib-home-btn-ru"
            value={buttonLabelRu}
            onChange={(e) => setButtonLabelRu(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="elib-home-btn-kz">Кнопка: текст (KZ)</Label>
          <Input
            id="elib-home-btn-kz"
            value={buttonLabelKz}
            onChange={(e) => setButtonLabelKz(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="elib-home-href">Кнопка: ссылка</Label>
          <Input
            id="elib-home-href"
            value={buttonHref}
            onChange={(e) => setButtonHref(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" disabled={pending} onClick={save}>
        Сохранить
      </Button>
    </div>
  )
}

