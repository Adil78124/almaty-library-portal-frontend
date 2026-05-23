"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminToast } from "@/components/admin/admin-toast"
import { WorkingHoursEditor } from "@/components/admin/working-hours-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  DEFAULT_WORKING_HOURS,
  normalizeWorkingHoursInput,
  type WorkingHours,
} from "@/lib/working-hours"
import { requestRevalidate } from "@/services/revalidate"

type SiteRow = {
  orgNameShort: string
  orgNameLong: string
  orgNameShortKz: string | null
  orgNameLongKz: string | null
  footerTagline: string | null
  footerTaglineKz: string | null
  address: string | null
  addressKz: string | null
  phone: string | null
  phoneSecondary: string | null
  email: string | null
  sanitaryDayRu: string | null
  sanitaryDayKz: string | null
  workingHours: WorkingHours
  copyrightLine: string | null
  copyrightLineKz: string | null
  privacyUrl: string | null
  termsUrl: string | null
}

const ta = cn(
  "flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
)

export function SiteSettingsContactsForm() {
  const router = useRouter()
  const toast = useAdminToast()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [row, setRow] = useState<SiteRow | null>(null)

  useEffect(() => {
    void (async () => {
      setLoadError(null)
      try {
        const res = await fetch("/api/site-settings", { credentials: "include" })
        const data = (await res.json().catch(() => ({}))) as {
          orgNameShort?: string
          orgNameLong?: string
          orgNameShortKz?: string | null
          orgNameLongKz?: string | null
          footerTagline?: string | null
          footerTaglineKz?: string | null
          address?: string | null
          addressKz?: string | null
          phone?: string | null
          phoneSecondary?: string | null
          email?: string | null
          sanitaryDayRu?: string | null
          sanitaryDayKz?: string | null
          workingHours?: unknown
          copyrightLine?: string | null
          copyrightLineKz?: string | null
          privacyUrl?: string | null
          termsUrl?: string | null
          error?: string
        }
        if (!res.ok) {
          setLoadError(data.error ?? "Не удалось загрузить настройки")
          return
        }
        setRow({
          orgNameShort: data.orgNameShort ?? "",
          orgNameLong: data.orgNameLong ?? "",
          orgNameShortKz: data.orgNameShortKz ?? null,
          orgNameLongKz: data.orgNameLongKz ?? null,
          footerTagline: data.footerTagline ?? null,
          footerTaglineKz: data.footerTaglineKz ?? null,
          address: data.address ?? null,
          addressKz: data.addressKz ?? null,
          phone: data.phone ?? null,
          phoneSecondary: data.phoneSecondary ?? null,
          email: data.email ?? null,
          sanitaryDayRu: data.sanitaryDayRu ?? null,
          sanitaryDayKz: data.sanitaryDayKz ?? null,
          workingHours: normalizeWorkingHoursInput(data.workingHours),
          copyrightLine: data.copyrightLine ?? null,
          copyrightLineKz: data.copyrightLineKz ?? null,
          privacyUrl: data.privacyUrl ?? null,
          termsUrl: data.termsUrl ?? null,
        })
      } catch {
        setLoadError("Ошибка сети")
      }
    })()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!row) return
    setSaving(true)
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgNameShort: row.orgNameShort.trim(),
          orgNameLong: row.orgNameLong.trim(),
          orgNameShortKz: row.orgNameShortKz?.trim() || null,
          orgNameLongKz: row.orgNameLongKz?.trim() || null,
          footerTagline: row.footerTagline?.trim() || null,
          footerTaglineKz: row.footerTaglineKz?.trim() || null,
          address: row.address?.trim() || null,
          addressKz: row.addressKz?.trim() || null,
          phone: row.phone?.trim() || null,
          phoneSecondary: row.phoneSecondary?.trim() || null,
          email: row.email?.trim() || null,
          sanitaryDayRu: row.sanitaryDayRu?.trim() || null,
          sanitaryDayKz: row.sanitaryDayKz?.trim() || null,
          workingHours: row.workingHours ?? DEFAULT_WORKING_HOURS,
          copyrightLine: row.copyrightLine?.trim() || null,
          copyrightLineKz: row.copyrightLineKz?.trim() || null,
          privacyUrl: row.privacyUrl?.trim() || null,
          termsUrl: row.termsUrl?.trim() || null,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setLoadError(data.error ?? "Не удалось сохранить")
        return
      }
      await requestRevalidate(["/", "/contacts", "/about"])
      toast.success("Сохранено")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (loadError && !row) {
    return <p className="text-destructive text-sm">{loadError}</p>
  }
  if (!row) {
    return <p className="text-muted-foreground text-sm">Загрузка…</p>
  }

  function patch<K extends keyof SiteRow>(key: K, value: SiteRow[K]) {
    setRow((r) => (r ? { ...r, [key]: value } : r))
  }

  return (
    <form onSubmit={(e) => void save(e)} className="max-w-2xl space-y-8 pb-24">
      {loadError && (
        <p className="text-destructive text-sm">{loadError}</p>
      )}
      <p className="text-muted-foreground text-sm">
        Эти поля выводятся в подвале сайта и на странице «Контакты». Иконки
        соцсетей настраиваются отдельно в разделе{" "}
        <strong>Соцсети</strong>.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="orgShort">Короткое название (RU)</Label>
          <Input
            id="orgShort"
            value={row.orgNameShort}
            onChange={(e) => patch("orgNameShort", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="orgShortKz">Короткое название (KZ)</Label>
          <Input
            id="orgShortKz"
            value={row.orgNameShortKz ?? ""}
            onChange={(e) => patch("orgNameShortKz", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="orgLong">Полное название (RU)</Label>
          <Input
            id="orgLong"
            value={row.orgNameLong}
            onChange={(e) => patch("orgNameLong", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="orgLongKz">Полное название (KZ)</Label>
          <Input
            id="orgLongKz"
            value={row.orgNameLongKz ?? ""}
            onChange={(e) => patch("orgNameLongKz", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tagline">Текст о библиотеке в подвале (рус.)</Label>
          <textarea
            id="tagline"
            className={ta}
            value={row.footerTagline ?? ""}
            onChange={(e) => patch("footerTagline", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="taglineKz">Текст о библиотеке в подвале (қазақша)</Label>
          <textarea
            id="taglineKz"
            className={ta}
            value={row.footerTaglineKz ?? ""}
            onChange={(e) => patch("footerTaglineKz", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Адрес (рус.)</Label>
          <Input
            id="address"
            value={row.address ?? ""}
            onChange={(e) => patch("address", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addressKz">Мекенжай (қазақша)</Label>
          <Input
            id="addressKz"
            value={row.addressKz ?? ""}
            onChange={(e) => patch("addressKz", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={row.phone ?? ""}
            onChange={(e) => patch("phone", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone2">Доп. телефон</Label>
          <Input
            id="phone2"
            value={row.phoneSecondary ?? ""}
            onChange={(e) => patch("phoneSecondary", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={row.email ?? ""}
            onChange={(e) => patch("email", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <WorkingHoursEditor
            value={row.workingHours}
            onChange={(workingHours) => patch("workingHours", workingHours)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sanRu">Санитарный день (рус.)</Label>
          <Input
            id="sanRu"
            value={row.sanitaryDayRu ?? ""}
            onChange={(e) => patch("sanitaryDayRu", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sanKz">Санитарлық күн (қазақша)</Label>
          <Input
            id="sanKz"
            value={row.sanitaryDayKz ?? ""}
            onChange={(e) => patch("sanitaryDayKz", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="copy">Строка копирайта в подвале (рус.)</Label>
          <Input
            id="copy"
            value={row.copyrightLine ?? ""}
            onChange={(e) => patch("copyrightLine", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="copyKz">Строка копирайта в подвале (қазақша)</Label>
          <Input
            id="copyKz"
            value={row.copyrightLineKz ?? ""}
            onChange={(e) => patch("copyrightLineKz", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priv">URL политики конфиденциальности</Label>
          <Input
            id="priv"
            placeholder="https://…"
            value={row.privacyUrl ?? ""}
            onChange={(e) => patch("privacyUrl", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">URL правил пользования</Label>
          <Input
            id="terms"
            placeholder="https://…"
            value={row.termsUrl ?? ""}
            onChange={(e) => patch("termsUrl", e.target.value || null)}
          />
        </div>
      </div>
      <div className="sticky bottom-4 z-20 rounded-md border bg-background/95 p-3 shadow-lg backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>
    </form>
  )
}
