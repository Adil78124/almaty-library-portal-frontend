"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { BranchType } from "@prisma/client"

import type { BranchRow } from "@/lib/branch-row"

import { BranchSocialLinksEditor } from "@/components/admin/branches/branch-social-links-editor"
import { BranchAdministratorManager } from "@/components/admin/branches/branch-administrator-manager"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const TYPES: { value: BranchType; label: string }[] = [
  { value: "REGIONAL", label: "Областная / региональная" },
  { value: "CITY", label: "Городская" },
  { value: "DISTRICT", label: "Районная" },
]

type Props =
  | { mode: "create" }
  | { mode: "edit"; branch: BranchRow }

export function BranchAdminForm(props: Props) {
  const router = useRouter()
  const toast = useAdminToast()
  const isEdit = props.mode === "edit"
  const b = isEdit ? props.branch : null

  const [titleRu, setTitleRu] = useState(b?.titleRu ?? "")
  const [titleKz, setTitleKz] = useState(b?.titleKz ?? "")
  const [type, setType] = useState<BranchType>(b?.type ?? "DISTRICT")
  const [published, setPublished] = useState(b?.published ?? true)
  const [isMainBranch, setIsMainBranch] = useState(b?.isMainBranch ?? false)
  const [subtitle, setSubtitle] = useState(b?.subtitle ?? "")
  const [cityLabel, setCityLabel] = useState(b?.cityLabel ?? "")
  const [address, setAddress] = useState(b?.address ?? "")
  const [phone, setPhone] = useState(b?.phone ?? "")
  const [email, setEmail] = useState(b?.email ?? "")
  const [hours, setHours] = useState(b?.hours ?? "")
  const [socialLinksJson, setSocialLinksJson] = useState(
    () => b?.socialLinksJson?.trim() ?? ""
  )
  const [descriptionRu, setDescriptionRu] = useState(b?.descriptionRu ?? "")
  const [descriptionKz, setDescriptionKz] = useState(b?.descriptionKz ?? "")
  const [cardImageUrl, setCardImageUrl] = useState(b?.cardImageUrl ?? "")
  const [heroImageUrl, setHeroImageUrl] = useState(b?.heroImageUrl ?? "")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const body = {
        titleRu: titleRu.trim(),
        titleKz: titleKz.trim() || null,
        descriptionRu: descriptionRu.trim(),
        descriptionKz: descriptionKz.trim() || null,
        type,
        published,
        isMainBranch,
        subtitle: subtitle.trim() || null,
        cityLabel: cityLabel.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        hours: hours.trim() || null,
        socialLinksJson: socialLinksJson.trim() || null,
        cardImageUrl: cardImageUrl.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
      }
      const url =
        isEdit && b
          ? `/api/branches/${encodeURIComponent(b.id)}`
          : "/api/branches"
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Ошибка сохранения")
        return
      }
      toast.success(isEdit ? "Филиал обновлён" : "Филиал создан")
      router.push("/admin/branches")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto max-w-2xl space-y-6">
      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="b-title-ru">Название (RU)</Label>
          <Input
            id="b-title-ru"
            required
            value={titleRu}
            onChange={(e) => setTitleRu(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-title-kz">Название (KZ)</Label>
          <Input
            id="b-title-kz"
            value={titleKz}
            onChange={(e) => setTitleKz(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-type">Тип</Label>
          <select
            id="b-type"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
              "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            )}
            value={type}
            onChange={(e) => setType(e.target.value as BranchType)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-3 justify-end pb-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Публиковать на сайте
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isMainBranch}
              onChange={(e) => setIsMainBranch(e.target.checked)}
            />
            Главный филиал (бейдж на карточке)
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="b-desc-ru">Описание (RU)</Label>
          <textarea
            id="b-desc-ru"
            className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            value={descriptionRu}
            onChange={(e) => setDescriptionRu(e.target.value)}
            placeholder="Абзацы — пустой строкой. Первый абзац часто используется как лид."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-desc-kz">Описание (KZ)</Label>
          <textarea
            id="b-desc-kz"
            className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            value={descriptionKz}
            onChange={(e) => setDescriptionKz(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="b-sub">Краткое описание (подзаголовок)</Label>
        <Input
          id="b-sub"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Для карточки и шапки страницы филиала"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="b-city">Населённый пункт / район</Label>
          <Input
            id="b-city"
            value={cityLabel}
            onChange={(e) => setCityLabel(e.target.value)}
            placeholder="напр. г. Конаев"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-addr">Адрес</Label>
          <Input
            id="b-addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="b-phone">Телефон</Label>
          <Input
            id="b-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-email">Email</Label>
          <Input
            id="b-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="b-hours">Часы работы</Label>
        <textarea
          id="b-hours"
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder={"Пн–Пт 9:00–18:00\nСб 10:00–14:00"}
        />
      </div>

      <BranchSocialLinksEditor
        key={isEdit && b ? b.id : "new-branch"}
        initialJson={socialLinksJson}
        onChangeJson={setSocialLinksJson}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="b-card-img">URL фото для карточки в списке</Label>
          <Input
            id="b-card-img"
            value={cardImageUrl}
            onChange={(e) => setCardImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-hero-img">URL фото шапки на странице филиала</Label>
          <Input
            id="b-hero-img"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>

      {isEdit && b && (
        <>
          <BranchAdministratorManager branchId={b.id} />
          <p className="text-muted-foreground text-xs">
            Ссылка на публичную страницу:{" "}
            <a
              className="text-primary underline"
              href={`/branches/${b.id}`}
              target="_blank"
              rel="noreferrer"
            >
              /branches/{b.id}
            </a>
          </p>
        </>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохранение…" : isEdit ? "Сохранить" : "Создать"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/branches")}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}
