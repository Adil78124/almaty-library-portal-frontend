"use client"

import { useState, useTransition } from "react"

import type { SimplePageSection, SimplePageSlug } from "@/lib/cms/simple-page/types"
import { SIMPLE_PAGE_SECTION_ORDER } from "@/lib/cms/simple-page/types"
import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const TITLES: Record<SimplePageSlug, string> = {
  news: "Страница «Новости»",
  events: "Настройки страницы мероприятий",
  branches: "Страница «Филиалы»",
  structure: "Страница «Структура библиотеки»",
}

const INTRO_UNDER_TITLE: Partial<Record<SimplePageSlug, string>> = {
  events:
    "Здесь редактируются только заголовок страницы, подзаголовок и описание в шапке (блок hero на /events). Создание и редактирование событий — в разделе «Мероприятия».",
}

type Props = {
  pageSlug: SimplePageSlug
  initialSections: SimplePageSection[]
}

export function SimplePageCmsEditor({ pageSlug, initialSections }: Props) {
  const { success } = useAdminToast()
  const [sections, setSections] = useState<SimplePageSection[]>(initialSections)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const hero = sections[0]
  const orderedOk =
    sections.length === SIMPLE_PAGE_SECTION_ORDER.length &&
    sections.every((s, i) => s.type === SIMPLE_PAGE_SECTION_ORDER[i])

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/page/${pageSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pageSlug, sections }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
      }
      if (!res.ok) {
        if (data.issues?.length) {
          setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(data.error ?? "Ошибка сохранения")
        }
        return
      }
      success("Сохранено.")
    })
  }

  if (hero?.type !== "hero") {
    return <p className="text-destructive text-sm">Некорректные данные страницы.</p>
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {TITLES[pageSlug]}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {INTRO_UNDER_TITLE[pageSlug] ??
              "Шапка страницы (как на сайте сверху). Сохранение — полный массив секций."}
          </p>
        </div>
        <Button disabled={pending || !orderedOk} onClick={save}>
          {pending ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>
      {!orderedOk ? (
        <p className="text-destructive text-sm">Нарушен порядок секций.</p>
      ) : null}
      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Hero / шапка</CardTitle>
          <CardDescription>
            Фон, хлебные крошки, заголовок и лид — шапка публичной страницы на
            сайте.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminImageUrlField
            label="Фон"
            value={hero.data.backgroundImageUrl}
            onChange={(url) =>
              setSections([
                {
                  type: "hero",
                  data: {
                    ...hero.data,
                    backgroundImageUrl: url,
                  },
                },
              ])
            }
            onUploadError={(msg) => setError(msg)}
            urlPlaceholder="URL фона страницы"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Alt изображения (RU)</label>
            <Input
              value={hero.data.backgroundImageAlt}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: {
                      ...hero.data,
                      backgroundImageAlt: e.target.value,
                    },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alt изображения (KZ)</label>
            <Input
              value={hero.data.backgroundImageAltKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: {
                      ...hero.data,
                      backgroundImageAltKz: e.target.value,
                    },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Хлебные крошки (RU)</label>
            <Input
              value={hero.data.breadcrumbLabel}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: {
                      ...hero.data,
                      breadcrumbLabel: e.target.value,
                    },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Хлебные крошки (KZ)</label>
            <Input
              value={hero.data.breadcrumbLabelKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: {
                      ...hero.data,
                      breadcrumbLabelKz: e.target.value,
                    },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок (RU)</label>
            <Input
              value={hero.data.title}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: { ...hero.data, title: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок (KZ)</label>
            <Input
              value={hero.data.titleKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: { ...hero.data, titleKz: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Лид (RU)</label>
            <Input
              value={hero.data.lead}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: { ...hero.data, lead: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Лид (KZ)</label>
            <Input
              value={hero.data.leadKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "hero",
                    data: { ...hero.data, leadKz: e.target.value },
                  },
                ])
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-4">
          <Separator />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || !orderedOk}
            onClick={save}
          >
            Сохранить страницу
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
