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
  titleRu: string
  titleKz: string | null
  subtitle: string | null
  subtitleKz: string | null
  cityLabel: string | null
  cityLabelKz: string | null
  cardImageUrl: string | null
  heroImageUrl: string | null
  address: string | null
  addressKz: string | null
  phone: string | null
  email: string | null
  hours: string | null
  descriptionRu: string | null
  descriptionKz: string | null
  socialLinksJson: string | null
}

const textareaClass = cn(
  "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
)

function splitBranchDescription(description: string | null | undefined) {
  const paragraphs = (description ?? "")
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
  return {
    intro: paragraphs[0] ?? "",
    about: paragraphs.slice(1).join("\n\n"),
  }
}

function joinBranchDescription(intro: string, about: string) {
  return [intro.trim(), about.trim()].filter(Boolean).join("\n\n")
}

export function BranchContactsForm({ branchId }: { branchId: string }) {
  const router = useRouter()
  const toast = useAdminToast()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [nameKz, setNameKz] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [subtitleKz, setSubtitleKz] = useState("")
  const [cityLabel, setCityLabel] = useState("")
  const [cityLabelKz, setCityLabelKz] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [cardImageUrl, setCardImageUrl] = useState("")
  const [address, setAddress] = useState("")
  const [addressKz, setAddressKz] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [hours, setHours] = useState("")
  const [intro, setIntro] = useState("")
  const [about, setAbout] = useState("")
  const [introKz, setIntroKz] = useState("")
  const [aboutKz, setAboutKz] = useState("")
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
        const description = splitBranchDescription(data.descriptionRu)
        const descriptionKz = splitBranchDescription(data.descriptionKz)
        setName(data.titleRu ?? "")
        setNameKz(data.titleKz ?? "")
        setSubtitle(data.subtitle ?? "")
        setSubtitleKz(data.subtitleKz ?? "")
        setCityLabel(data.cityLabel ?? "")
        setCityLabelKz(data.cityLabelKz ?? "")
        setHeroImageUrl(data.heroImageUrl?.trim() ?? "")
        setCardImageUrl(data.cardImageUrl?.trim() ?? "")
        setAddress(data.address ?? "")
        setAddressKz(data.addressKz ?? "")
        setPhone(data.phone ?? "")
        setEmail(data.email ?? "")
        setHours(data.hours ?? "")
        setIntro(description.intro)
        setAbout(description.about)
        setIntroKz(descriptionKz.intro)
        setAboutKz(descriptionKz.about)
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
        titleRu: name.trim(),
        titleKz: nameKz.trim() || null,
        subtitle: subtitle.trim() || null,
        subtitleKz: subtitleKz.trim() || null,
        cityLabel: cityLabel.trim() || null,
        cityLabelKz: cityLabelKz.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
        cardImageUrl: cardImageUrl.trim() || null,
        address: address.trim() || null,
        addressKz: addressKz.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        hours: hours.trim() || null,
        descriptionRu: joinBranchDescription(intro, about),
        descriptionKz: joinBranchDescription(introKz, aboutKz) || null,
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
    <form onSubmit={(e) => void submit(e)} className="w-full space-y-8">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name-ru">Название филиала (RU)</Label>
            <Input
              id="c-name-ru"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как на сайте"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-name-kz">Название филиала (KZ)</Label>
            <Input
              id="c-name-kz"
              value={nameKz}
              onChange={(e) => setNameKz(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-subtitle-ru">Подзаголовок в шапке (RU)</Label>
            <Input
              id="c-subtitle-ru"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Короткая строка под названием"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-subtitle-kz">Подзаголовок в шапке (KZ)</Label>
            <Input
              id="c-subtitle-kz"
              value={subtitleKz}
              onChange={(e) => setSubtitleKz(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-city-ru">Населённый пункт / район (RU)</Label>
            <Input
              id="c-city-ru"
              value={cityLabel}
              onChange={(e) => setCityLabel(e.target.value)}
              placeholder="например: Семей"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-city-kz">Населённый пункт / район (KZ)</Label>
            <Input
              id="c-city-kz"
              value={cityLabelKz}
              onChange={(e) => setCityLabelKz(e.target.value)}
            />
          </div>
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
          label="Фото карточки и основное фото на странице филиала"
          value={cardImageUrl}
          onChange={setCardImageUrl}
          onUploadError={(msg) => setSaveError(msg)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight">Контакты</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-address-ru">Адрес (RU)</Label>
            <Input
              id="c-address-ru"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Улица, дом, город"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-address-kz">Адрес (KZ)</Label>
            <Input
              id="c-address-kz"
              value={addressKz}
              onChange={(e) => setAddressKz(e.target.value)}
            />
          </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-intro-ru">Вступительный текст (RU)</Label>
            <textarea
              id="c-intro-ru"
              className={textareaClass}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Короткий абзац под шапкой страницы филиала"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-intro-kz">Вступительный текст (KZ)</Label>
            <textarea
              id="c-intro-kz"
              className={textareaClass}
              value={introKz}
              onChange={(e) => setIntroKz(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-about-ru">О филиале (RU)</Label>
            <textarea
              id="c-about-ru"
              className={cn(textareaClass, "min-h-[180px]")}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Основной текст: абзацы разделяйте пустой строкой"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-about-kz">О филиале (KZ)</Label>
            <textarea
              id="c-about-kz"
              className={cn(textareaClass, "min-h-[180px]")}
              value={aboutKz}
              onChange={(e) => setAboutKz(e.target.value)}
            />
          </div>
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
