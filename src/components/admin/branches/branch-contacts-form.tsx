"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { BranchSocialLinksEditor } from "@/components/admin/branches/branch-social-links-editor"
import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { requestRevalidate } from "@/services/revalidate"

type BranchPayload = {
  id: string
  name: string
  subtitle: string | null
  cityLabel: string | null
  cardImageUrl: string | null
  heroImageUrl: string | null
  address: string | null
  phone: string | null
  email: string | null
  hours: string | null
  intro: string | null
  about: string | null
  socialLinksJson: string | null
}

const textareaClass = cn(
  "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
)

export function BranchContactsForm({ branchId }: { branchId: string }) {
  const router = useRouter()
  const toast = useAdminToast()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [cityLabel, setCityLabel] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [cardImageUrl, setCardImageUrl] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [hours, setHours] = useState("")
  const [intro, setIntro] = useState("")
  const [about, setAbout] = useState("")
  const [socialLinksJson, setSocialLinksJson] = useState("")
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoadError(null)
      setLoading(true)
      try {
        const res = await fetch(`/api/branches/${encodeURIComponent(branchId)}`, {
          credentials: "include",
        })
        const data = (await res.json().catch(() => ({}))) as BranchPayload & {
          error?: string
        }
        if (!res.ok) {
          setLoadError(data.error ?? "Не удалось загрузить филиал")
          return
        }
        setName(data.name ?? "")
        setSubtitle(data.subtitle ?? "")
        setCityLabel(data.cityLabel ?? "")
        setHeroImageUrl(data.heroImageUrl?.trim() ?? "")
        setCardImageUrl(data.cardImageUrl?.trim() ?? "")
        setAddress(data.address ?? "")
        setPhone(data.phone ?? "")
        setEmail(data.email ?? "")
        setHours(data.hours ?? "")
        setIntro(data.intro ?? "")
        setAbout(data.about ?? "")
        setSocialLinksJson(data.socialLinksJson?.trim() ?? "")
      } catch {
        setLoadError("Ошибка сети при загрузке филиала")
      } finally {
        setLoading(false)
      }
    })()
  }, [branchId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    if (!name.trim()) {
      setSaveError("Укажите название филиала")
      return
    }
    setPending(true)
    try {
      const body: Record<string, string | null> = {
        name: name.trim(),
        subtitle: subtitle.trim() || null,
        cityLabel: cityLabel.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
        cardImageUrl: cardImageUrl.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        hours: hours.trim() || null,
        intro: intro.trim() || null,
        about: about.trim() || null,
        socialLinksJson: socialLinksJson.trim() || null,
      }
      const res = await fetch(
        `/api/branches/${encodeURIComponent(branchId)}/contacts`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
      }
      if (!res.ok) {
        const issueText = data.issues?.map((i) => i.message).join(" ").trim()
        setSaveError(issueText || data.error || "Не удалось сохранить")
        return
      }
      await requestRevalidate(["/branches", `/branches/${branchId}`])
      toast.success("Данные филиала сохранены")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Загрузка данных филиала…</p>
    )
  }

  if (loadError) {
    return <p className="text-destructive text-sm">{loadError}</p>
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto max-w-2xl space-y-8">
      {saveError && (
        <p className="text-destructive text-sm">{saveError}</p>
      )}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Контакты и текст филиала</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Редактирование карточки в каталоге{" "}
          <a className="text-primary underline" href="/branches" target="_blank" rel="noreferrer">
            /branches
          </a>{" "}
          и шапки страницы вашего филиала.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-muted/15 p-5">
        <h2 className="text-base font-semibold tracking-tight">
          Название, подзаголовок и изображения
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          <strong>Название</strong> — заголовок (H1) на странице филиала и имя на
          карточке в списке. <strong>Подзаголовок</strong> — строка под
          заголовком в шапке. <strong>Населённый пункт</strong> — подпись с
          иконкой на карточке в каталоге. <strong>Фото шапки</strong> — фон
          hero; <strong>фото карточки</strong> — картинка в сетке /branches.
        </p>
        <div className="space-y-2">
          <Label htmlFor="c-name">Название филиала</Label>
          <Input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как на сайте"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-subtitle">Подзаголовок в шапке (необязательно)</Label>
          <Input
            id="c-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Короткая строка под названием"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-city">Населённый пункт / район на карточке</Label>
          <Input
            id="c-city"
            value={cityLabel}
            onChange={(e) => setCityLabel(e.target.value)}
            placeholder="например: Семей"
          />
        </div>
        <AdminImageUrlField
          id="c-hero"
          label="Изображение шапки страницы филиала"
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          onUploadError={(msg) => setSaveError(msg)}
        />
        <AdminImageUrlField
          id="c-card"
          label="Фото для карточки в каталоге /branches"
          value={cardImageUrl}
          onChange={setCardImageUrl}
          onUploadError={(msg) => setSaveError(msg)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight">Контакты</h2>
        <div className="space-y-2">
          <Label htmlFor="c-address">Адрес</Label>
          <Input
            id="c-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Улица, дом, город"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-phone">Телефон</Label>
          <Input
            id="c-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 …"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">Email</Label>
          <Input
            id="c-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-hours">Часы работы</Label>
          <textarea
            id="c-hours"
            className={textareaClass}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={"Пн–Пт 9:00–18:00\nСб 10:00–16:00\nВс — выходной"}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight">Тексты на странице</h2>
        <div className="space-y-2">
          <Label htmlFor="c-intro">Вступительный текст</Label>
          <textarea
            id="c-intro"
            className={textareaClass}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="Короткий абзац под шапкой страницы филиала"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-about">О филиале</Label>
          <textarea
            id="c-about"
            className={cn(textareaClass, "min-h-[180px]")}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Основной текст: абзацы разделяйте пустой строкой"
          />
        </div>
      </div>

      <BranchSocialLinksEditor
        key={branchId}
        initialJson={socialLinksJson}
        onChangeJson={setSocialLinksJson}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Сохранение…" : "Сохранить"}
      </Button>
    </form>
  )
}
