"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"

import {
  parseYoutubeVideoId,
  youtubeThumbnailHq,
} from "@/lib/youtube"

import { normalizeHomeTickerItems } from "@/lib/cms/home/filter-display"
import type { HomeSection, HomeTickerLine } from "@/lib/cms/home/types"
import { HOME_SECTION_ORDER } from "@/lib/cms/home/types"
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
import { UsefulLinksAdmin } from "@/components/admin/useful-links-admin"
import {
  RepeatableListProvider,
  RepeatableEditorRow,
  confirmListDelete,
  useRepeatableListControls,
} from "@/components/admin/cms/repeatable-list-context"

function RepeatableToolbar() {
  const { collapseAll, expandAll } = useRepeatableListControls()
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
        Свернуть всё
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={expandAll}>
        Развернуть всё
      </Button>
    </>
  )
}

const LABELS: Record<(typeof HOME_SECTION_ORDER)[number], string> = {
  hero: "1. Hero",
  quote: "2. Цитата",
  ticker: "3. Бегущая строка",
  statistics: "4. Статистика (карточки)",
  afisha: "5. Афиша",
  eLibrary: "6. Электронная библиотека",
  latestNews: "7. Последние новости",
  newArrivals: "8. Новые поступления",
  localHistory: "9. Краеведение",
  mediaGallery: "10. Медиагалерея",
  usefulLinks: "11. Полезные ссылки",
}

type Props = {
  initialSections: HomeSection[]
}

function normalizeInitialHomeSections(sections: HomeSection[]): HomeSection[] {
  return sections.map((s) =>
    s.type === "ticker"
      ? {
          type: "ticker",
          data: {
            items: normalizeHomeTickerItems(
              s.data.items as (string | HomeTickerLine)[]
            ),
          },
        }
      : s.type === "mediaGallery"
        ? {
            type: "mediaGallery",
            data: {
              title: (s as any).data?.title ?? "Медиагалерея",
              titleKz: (s as any).data?.titleKz ?? "",
              videos:
                Array.isArray((s as any).data?.videos) && (s as any).data.videos.length
                  ? (s as any).data.videos
                  : (() => {
                      const legacy: string[] = []
                      const main = String((s as any).data?.videoUrl ?? "").trim()
                      if (main) legacy.push(main)
                      const thumbs = Array.isArray((s as any).data?.thumbUrls)
                        ? ((s as any).data.thumbUrls as unknown[]).map((x) =>
                            String(x)
                          )
                        : []
                      legacy.push(...thumbs)
                      const uniq = Array.from(
                        new Set(legacy.map((x) => x.trim()).filter(Boolean))
                      )
                      const five = uniq.slice(0, 5)
                      return [
                        { position: 1, youtubeUrl: five[0] ?? "" },
                        { position: 2, youtubeUrl: five[1] ?? "" },
                        { position: 3, youtubeUrl: five[2] ?? "" },
                        { position: 4, youtubeUrl: five[3] ?? "" },
                        { position: 5, youtubeUrl: five[4] ?? "" },
                      ]
                    })(),
            },
          }
        : s
  )
}

export function HomeCmsEditor({ initialSections }: Props) {
  const { success } = useAdminToast()
  const [sections, setSections] = useState<HomeSection[]>(() =>
    normalizeInitialHomeSections(initialSections)
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const orderedOk = useMemo(() => {
    return sections.length === HOME_SECTION_ORDER.length &&
      sections.every((s, i) => s.type === HOME_SECTION_ORDER[i])
  }, [sections])

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/page/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "home", sections }),
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
      success("Сохранено. Главная страница обновлена.")
    })
  }

  function setSectionAt(index: number, next: HomeSection) {
    setSections((prev) => {
      const copy = [...prev]
      copy[index] = next
      return copy
    })
  }

  return (
    <RepeatableListProvider>
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Главная страница
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Блоки в том же порядке, что и на сайте. Сохранение отправляет все
            секции на сервер.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <RepeatableToolbar />
          <Button disabled={pending || !orderedOk} onClick={save}>
            {pending ? "Сохранение…" : "Сохранить всю страницу"}
          </Button>
        </div>
      </div>
      {!orderedOk ? (
        <p className="text-destructive text-sm">
          Нарушен порядок или число блоков. Ожидается {HOME_SECTION_ORDER.length}{" "}
          секций: {HOME_SECTION_ORDER.join(", ")}.
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
      {sections.map((sec, index) => (
        <Card key={`${sec.type}-${index}`} className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">{LABELS[sec.type]}</CardTitle>
            <CardDescription>Тип: {sec.type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sec.type === "hero" ? (
              <>
                <AdminImageUrlField
                  label="Фон hero"
                  value={sec.data.backgroundImageUrl}
                  onChange={(url) =>
                    setSectionAt(index, {
                      type: "hero",
                      data: { ...sec.data, backgroundImageUrl: url },
                    })
                  }
                  onUploadError={(msg) => setError(msg)}
                  urlPlaceholder="URL фонового изображения"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alt фона (RU)</label>
                  <Input
                    value={sec.data.backgroundAlt ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "hero",
                        data: { ...sec.data, backgroundAlt: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alt фона (KZ)</label>
                  <Input
                    value={sec.data.backgroundAltKz ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "hero",
                        data: { ...sec.data, backgroundAltKz: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Заголовок 1 (RU)</label>
                    <Input
                      value={sec.data.titleLine1}
                      onChange={(e) =>
                        setSectionAt(index, {
                          type: "hero",
                          data: { ...sec.data, titleLine1: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Заголовок 1 (KZ)</label>
                    <Input
                      value={sec.data.titleLine1Kz ?? ""}
                      onChange={(e) =>
                        setSectionAt(index, {
                          type: "hero",
                          data: { ...sec.data, titleLine1Kz: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Заголовок 2 (RU)</label>
                    <Input
                      value={sec.data.titleLine2}
                      onChange={(e) =>
                        setSectionAt(index, {
                          type: "hero",
                          data: { ...sec.data, titleLine2: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Заголовок 2 (KZ)</label>
                    <Input
                      value={sec.data.titleLine2Kz ?? ""}
                      onChange={(e) =>
                        setSectionAt(index, {
                          type: "hero",
                          data: { ...sec.data, titleLine2Kz: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Подзаголовок (RU)</label>
                  <Input
                    value={sec.data.subtitle ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "hero",
                        data: { ...sec.data, subtitle: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Подзаголовок (KZ)</label>
                  <Input
                    value={sec.data.subtitleKz ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "hero",
                        data: { ...sec.data, subtitleKz: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            ) : null}

            {sec.type === "quote" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст цитаты (RU)</label>
                  <Input
                    value={sec.data.text}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "quote",
                        data: { ...sec.data, text: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст цитаты (KZ)</label>
                  <Input
                    value={sec.data.textKz ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "quote",
                        data: { ...sec.data, textKz: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Автор (RU)</label>
                  <Input
                    value={sec.data.author ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "quote",
                        data: { ...sec.data, author: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Автор (KZ)</label>
                  <Input
                    value={sec.data.authorKz ?? ""}
                    onChange={(e) =>
                      setSectionAt(index, {
                        type: "quote",
                        data: { ...sec.data, authorKz: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            ) : null}

            {sec.type === "ticker" ? (
              <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
                {sec.data.items.map((t, j) => (
                  <div key={j} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Строка (RU)"
                        value={t.text}
                        onChange={(e) => {
                          const items = [...sec.data.items]
                          items[j] = { ...t, text: e.target.value }
                          setSectionAt(index, {
                            type: "ticker",
                            data: { items },
                          })
                        }}
                      />
                      <Input
                        placeholder="Строка (KZ)"
                        value={t.textKz ?? ""}
                        onChange={(e) => {
                          const items = [...sec.data.items]
                          items[j] = { ...t, textKz: e.target.value || null }
                          setSectionAt(index, {
                            type: "ticker",
                            data: { items },
                          })
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        if (!confirmListDelete("Удалить эту строку бегущей строки?"))
                          return
                        const items = sec.data.items.filter((_, k) => k !== j)
                        setSectionAt(index, {
                          type: "ticker",
                          data: { items },
                        })
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSectionAt(index, {
                      type: "ticker",
                      data: {
                        items: [
                          ...sec.data.items,
                          { text: "Новая строка", textKz: "" },
                        ],
                      },
                    })
                  }
                >
                  Добавить строку
                </Button>
              </div>
            ) : null}

            {sec.type === "statistics" ? (
              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sec.data.cards.map((c, j) => (
                  <RepeatableEditorRow
                    key={`stat-${j}`}
                    summary={
                      <span>
                        {c.label?.trim() || c.valueText?.trim() || "Карточка"}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({j + 1})
                        </span>
                      </span>
                    }
                  >
                    <div className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          placeholder="Иконка (Material)"
                          value={c.iconName}
                          onChange={(e) => {
                            const cards = [...sec.data.cards]
                            cards[j] = { ...c, iconName: e.target.value }
                            setSectionAt(index, {
                              type: "statistics",
                              data: { cards },
                            })
                          }}
                        />
                        <Input
                          placeholder="Значение (RU)"
                          value={c.valueText}
                          onChange={(e) => {
                            const cards = [...sec.data.cards]
                            cards[j] = { ...c, valueText: e.target.value }
                            setSectionAt(index, {
                              type: "statistics",
                              data: { cards },
                            })
                          }}
                        />
                        <Input
                          placeholder="Подпись (RU)"
                          value={c.label}
                          onChange={(e) => {
                            const cards = [...sec.data.cards]
                            cards[j] = { ...c, label: e.target.value }
                            setSectionAt(index, {
                              type: "statistics",
                              data: { cards },
                            })
                          }}
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          placeholder="Значение (KZ)"
                          value={c.valueTextKz ?? ""}
                          onChange={(e) => {
                            const cards = [...sec.data.cards]
                            cards[j] = {
                              ...c,
                              valueTextKz: e.target.value || null,
                            }
                            setSectionAt(index, {
                              type: "statistics",
                              data: { cards },
                            })
                          }}
                        />
                        <Input
                          placeholder="Подпись (KZ)"
                          value={c.labelKz ?? ""}
                          onChange={(e) => {
                            const cards = [...sec.data.cards]
                            cards[j] = { ...c, labelKz: e.target.value || null }
                            setSectionAt(index, {
                              type: "statistics",
                              data: { cards },
                            })
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!confirmListDelete("Удалить эту карточку статистики?"))
                            return
                          const cards = sec.data.cards.filter((_, k) => k !== j)
                          setSectionAt(index, {
                            type: "statistics",
                            data: { cards },
                          })
                        }}
                      >
                        Удалить карточку
                      </Button>
                    </div>
                  </RepeatableEditorRow>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSectionAt(index, {
                      type: "statistics",
                      data: {
                        cards: [
                          ...sec.data.cards,
                          {
                            iconName: "menu_book",
                            valueText: "0",
                            valueTextKz: "",
                            label: "Подпись",
                            labelKz: "",
                          },
                        ],
                      },
                    })
                  }
                >
                  Добавить карточку
                </Button>
              </div>
            ) : null}

            {sec.type === "afisha" ? (
              <AfishaEditor
                sec={sec}
                onChange={(next) => setSectionAt(index, next)}
              />
            ) : null}

            {sec.type === "eLibrary" ? (
              <ELibraryEditor
                sec={sec}
                onChange={(next) => setSectionAt(index, next)}
              />
            ) : null}

            {sec.type === "latestNews" ? (
              <NewsEditor sec={sec} onChange={(next) => setSectionAt(index, next)} />
            ) : null}

            {sec.type === "newArrivals" ? (
              <ArrivalsEditor
                sec={sec}
                onChange={(next) => setSectionAt(index, next)}
              />
            ) : null}

            {sec.type === "localHistory" ? (
              <LocalHistoryEditor
                sec={sec}
                onChange={(next) => setSectionAt(index, next)}
              />
            ) : null}

            {sec.type === "mediaGallery" ? (
              <GalleryEditor
                sec={sec}
                onChange={(next) => setSectionAt(index, next)}
              />
            ) : null}

            {sec.type === "usefulLinks" ? (
              <LinksEditor sec={sec} onChange={(next) => setSectionAt(index, next)} />
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2 border-t pt-4">
            <Separator />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || !orderedOk}
              onClick={save}
            >
              Сохранить (вся страница)
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
    </RepeatableListProvider>
  )
}

function AfishaEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "afisha" }>
  onChange: (s: Extract<HomeSection, { type: "afisha" }>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Карточки афиши на сайте подставляются автоматически из раздела{" "}
        <strong>«Мероприятия»</strong> (статус «Опубликовано», указана дата
        начала, событие ещё не прошло). Количество на главной и автообновление — в{" "}
        <strong>«Мероприятия → Настройки отображения»</strong>.
      </p>
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
        Настройки заголовков секции «Афиша» на главной перенесены в раздел{" "}
        <Link
          className="font-semibold underline-offset-4 hover:underline"
          href="/admin/events/home-section"
        >
          «Мероприятия → Главная секция»
        </Link>
        . Главная страница не должна быть вторым местом настройки мероприятий.
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange(sec)}>
        Обновить превью секции
      </Button>
    </div>
  )
}

function ELibraryEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "eLibrary" }>
  onChange: (s: Extract<HomeSection, { type: "eLibrary" }>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
        Настройки секции «Электронная библиотека» на главной перенесены в раздел{" "}
        <Link
          className="font-semibold underline-offset-4 hover:underline"
          href="/admin/digital-library/home-section"
        >
          «Электронная библиотека → Главная секция»
        </Link>
        . Главная страница не должна быть вторым местом управления электронной
        библиотекой.
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange(sec)}>
        Обновить превью секции
      </Button>
    </div>
  )
}

// BookRows removed: управление секцией eLibrary перенесено в Digital Library feature.

function NewsEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "latestNews" }>
  onChange: (s: Extract<HomeSection, { type: "latestNews" }>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Карточки новостей на сайте подставляются автоматически из раздела{" "}
        <strong>«Новости (материалы)»</strong> (опубликованные записи). Количество
        на главной и автообновление настраиваются в{" "}
        <strong>«Новости → Настройки отображения»</strong>.
      </p>
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
        Настройки заголовков секции новостей на главной перенесены в раздел{" "}
        <Link className="font-semibold underline-offset-4 hover:underline" href="/admin/news/home-section">
          «Новости → Главная секция»
        </Link>
        . Главная страница не должна быть вторым местом настройки новостей.
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange(sec)}
      >
        Обновить превью секции
      </Button>
    </div>
  )
}

function ArrivalsEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "newArrivals" }>
  onChange: (s: Extract<HomeSection, { type: "newArrivals" }>) => void
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Заголовок (RU, uppercase на сайте)"
        value={sec.data.title}
        onChange={(e) =>
          onChange({
            type: "newArrivals",
            data: { ...sec.data, title: e.target.value },
          })
        }
      />
      <Input
        placeholder="Заголовок (KZ)"
        value={sec.data.titleKz ?? ""}
        onChange={(e) =>
          onChange({
            type: "newArrivals",
            data: { ...sec.data, titleKz: e.target.value },
          })
        }
      />
      <Input
        placeholder="Подзаголовок (RU)"
        value={sec.data.subtitle}
        onChange={(e) =>
          onChange({
            type: "newArrivals",
            data: { ...sec.data, subtitle: e.target.value },
          })
        }
      />
      <Input
        placeholder="Подзаголовок (KZ)"
        value={sec.data.subtitleKz ?? ""}
        onChange={(e) =>
          onChange({
            type: "newArrivals",
            data: { ...sec.data, subtitleKz: e.target.value },
          })
        }
      />
      <select
        className="border-input h-9 w-full rounded-md border px-3 text-sm"
        value={sec.data.source}
        onChange={(e) =>
          onChange({
            type: "newArrivals",
            data: {
              ...sec.data,
              source: e.target.value as "manual" | "database",
            },
          })
        }
      >
        <option value="manual">Вручную</option>
        <option value="database">Из таблицы поступлений</option>
      </select>
      {sec.data.source === "database" ? (
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs">
            Лимит из базы (1–8, на сайте — горизонтальный скролл)
          </label>
          <Input
            type="number"
            min={1}
            max={8}
            value={sec.data.database?.limit ?? 6}
            onChange={(e) =>
              onChange({
                type: "newArrivals",
                data: {
                  ...sec.data,
                  database: {
                    limit: Math.min(
                      8,
                      Math.max(1, Number(e.target.value) || 6)
                    ),
                  },
                },
              })
            }
          />
        </div>
      ) : (
        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
          {(sec.data.manualBooks ?? []).map((b, j) => (
            <RepeatableEditorRow
              key={`arrival-${j}`}
              summary={
                <span className="break-words">
                  {b.title?.trim() || "Книга без названия"}
                  {b.author?.trim() ? (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · {b.author.trim()}
                    </span>
                  ) : null}
                </span>
              }
            >
              <div className="space-y-2">
                <AdminImageUrlField
                  compact
                  label="Обложка"
                  value={b.coverUrl}
                  onChange={(url) => {
                    const m = [...(sec.data.manualBooks ?? [])]
                    m[j] = { ...b, coverUrl: url }
                    onChange({
                      type: "newArrivals",
                      data: { ...sec.data, manualBooks: m },
                    })
                  }}
                  urlPlaceholder="URL обложки"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Название (RU)"
                    value={b.title}
                    onChange={(e) => {
                      const m = [...(sec.data.manualBooks ?? [])]
                      m[j] = { ...b, title: e.target.value }
                      onChange({
                        type: "newArrivals",
                        data: { ...sec.data, manualBooks: m },
                      })
                    }}
                  />
                  <Input
                    placeholder="Название (KZ)"
                    value={b.titleKz ?? ""}
                    onChange={(e) => {
                      const m = [...(sec.data.manualBooks ?? [])]
                      m[j] = { ...b, titleKz: e.target.value || null }
                      onChange({
                        type: "newArrivals",
                        data: { ...sec.data, manualBooks: m },
                      })
                    }}
                  />
                  <Input
                    placeholder="Автор (RU)"
                    value={b.author}
                    onChange={(e) => {
                      const m = [...(sec.data.manualBooks ?? [])]
                      m[j] = { ...b, author: e.target.value }
                      onChange({
                        type: "newArrivals",
                        data: { ...sec.data, manualBooks: m },
                      })
                    }}
                  />
                  <Input
                    placeholder="Автор (KZ)"
                    value={b.authorKz ?? ""}
                    onChange={(e) => {
                      const m = [...(sec.data.manualBooks ?? [])]
                      m[j] = { ...b, authorKz: e.target.value || null }
                      onChange({
                        type: "newArrivals",
                        data: { ...sec.data, manualBooks: m },
                      })
                    }}
                  />
                  <Input
                    placeholder="Ссылка"
                    className="sm:col-span-2"
                    value={b.detailHref}
                    onChange={(e) => {
                      const m = [...(sec.data.manualBooks ?? [])]
                      m[j] = { ...b, detailHref: e.target.value }
                      onChange({
                        type: "newArrivals",
                        data: { ...sec.data, manualBooks: m },
                      })
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!confirmListDelete("Удалить эту книгу из поступлений?"))
                      return
                    onChange({
                      type: "newArrivals",
                      data: {
                        ...sec.data,
                        manualBooks: (sec.data.manualBooks ?? []).filter(
                          (_, i) => i !== j
                        ),
                      },
                    })
                  }}
                >
                  Удалить книгу
                </Button>
              </div>
            </RepeatableEditorRow>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={(sec.data.manualBooks ?? []).length >= 8}
            onClick={() => {
              if ((sec.data.manualBooks ?? []).length >= 8) return
              onChange({
                type: "newArrivals",
                data: {
                  ...sec.data,
                  manualBooks: [
                    ...(sec.data.manualBooks ?? []),
                    {
                      coverUrl: "",
                      title: "",
                      titleKz: "",
                      author: "",
                      authorKz: "",
                      detailHref: "#",
                    },
                  ],
                },
              })
            }}
          >
            Добавить книгу (макс. 8)
          </Button>
        </div>
      )}
    </div>
  )
}

function LocalHistoryEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "localHistory" }>
  onChange: (s: Extract<HomeSection, { type: "localHistory" }>) => void
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Заголовок (RU)"
        value={sec.data.title}
        onChange={(e) =>
          onChange({
            type: "localHistory",
            data: { ...sec.data, title: e.target.value },
          })
        }
      />
      <Input
        placeholder="Заголовок (KZ)"
        value={sec.data.titleKz ?? ""}
        onChange={(e) =>
          onChange({
            type: "localHistory",
            data: { ...sec.data, titleKz: e.target.value },
          })
        }
      />
      <div className="space-y-1">
        <label className="text-sm font-medium">Описание раздела (RU)</label>
        <Input
          placeholder="Текст под заголовком на сайте (сохраняется вместе со страницей)"
          value={sec.data.description ?? ""}
          onChange={(e) =>
            onChange({
              type: "localHistory",
              data: { ...sec.data, description: e.target.value },
            })
          }
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Описание раздела (KZ)</label>
        <Input
          value={sec.data.descriptionKz ?? ""}
          onChange={(e) =>
            onChange({
              type: "localHistory",
              data: { ...sec.data, descriptionKz: e.target.value },
            })
          }
        />
      </div>
      <select
        className="border-input h-9 w-full rounded-md border px-3 text-sm"
        value={sec.data.source}
        onChange={(e) =>
          onChange({
            type: "localHistory",
            data: {
              ...sec.data,
              source: e.target.value as "manual" | "database",
            },
          })
        }
      >
        <option value="manual">Карточки вручную</option>
        <option value="database">Из базы краеведения</option>
      </select>
      {sec.data.source === "database" ? (
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs">
            Лимит карточек из базы
          </label>
          <Input
            type="number"
            min={1}
            max={24}
            value={sec.data.database?.limit ?? 8}
            onChange={(e) =>
              onChange({
                type: "localHistory",
                data: {
                  ...sec.data,
                  database: {
                    limit: Math.min(
                      24,
                      Math.max(1, Number(e.target.value) || 8)
                    ),
                  },
                },
              })
            }
          />
        </div>
      ) : (
        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
          {(sec.data.manualCards ?? []).map((c, j) => (
            <RepeatableEditorRow
              key={`lh-${j}`}
              summary={
                <span className="break-words">
                  {c.name?.trim() || "Карточка без имени"}
                </span>
              }
            >
              <div className="space-y-2">
                <AdminImageUrlField
                  compact
                  label="Портрет"
                  value={c.portraitUrl ?? ""}
                  onChange={(url) => {
                    const m = [...(sec.data.manualCards ?? [])]
                    m[j] = { ...c, portraitUrl: url }
                    onChange({
                      type: "localHistory",
                      data: { ...sec.data, manualCards: m },
                    })
                  }}
                  urlPlaceholder="URL портрета"
                />
                <Input
                  placeholder="Имя (RU)"
                  value={c.name}
                  onChange={(e) => {
                    const m = [...(sec.data.manualCards ?? [])]
                    m[j] = { ...c, name: e.target.value }
                    onChange({
                      type: "localHistory",
                      data: { ...sec.data, manualCards: m },
                    })
                  }}
                />
                <Input
                  placeholder="Имя (KZ)"
                  value={c.nameKz ?? ""}
                  onChange={(e) => {
                    const m = [...(sec.data.manualCards ?? [])]
                    m[j] = { ...c, nameKz: e.target.value || null }
                    onChange({
                      type: "localHistory",
                      data: { ...sec.data, manualCards: m },
                    })
                  }}
                />
                <Input
                  placeholder="Текст (RU)"
                  value={c.excerpt}
                  onChange={(e) => {
                    const m = [...(sec.data.manualCards ?? [])]
                    m[j] = { ...c, excerpt: e.target.value }
                    onChange({
                      type: "localHistory",
                      data: { ...sec.data, manualCards: m },
                    })
                  }}
                />
                <Input
                  placeholder="Текст (KZ)"
                  value={c.excerptKz ?? ""}
                  onChange={(e) => {
                    const m = [...(sec.data.manualCards ?? [])]
                    m[j] = { ...c, excerptKz: e.target.value || null }
                    onChange({
                      type: "localHistory",
                      data: { ...sec.data, manualCards: m },
                    })
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!confirmListDelete("Удалить эту карточку?")) return
                    onChange({
                      type: "localHistory",
                      data: {
                        ...sec.data,
                        manualCards: (sec.data.manualCards ?? []).filter(
                          (_, i) => i !== j
                        ),
                      },
                    })
                  }}
                >
                  Удалить
                </Button>
              </div>
            </RepeatableEditorRow>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              onChange({
                type: "localHistory",
                data: {
                  ...sec.data,
                  manualCards: [
                    ...(sec.data.manualCards ?? []),
                    { name: "", excerpt: "" },
                  ],
                },
              })
            }
          >
            Добавить карточку
          </Button>
        </div>
      )}
    </div>
  )
}

function GalleryEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "mediaGallery" }>
  onChange: (s: Extract<HomeSection, { type: "mediaGallery" }>) => void
}) {
  const videos = useMemo(() => {
    const base = [
      { position: 1 as const, youtubeUrl: "" },
      { position: 2 as const, youtubeUrl: "" },
      { position: 3 as const, youtubeUrl: "" },
      { position: 4 as const, youtubeUrl: "" },
      { position: 5 as const, youtubeUrl: "" },
    ]
    const from = Array.isArray(sec.data.videos) ? sec.data.videos : []
    for (const v of from) {
      const idx = base.findIndex((b) => b.position === v.position)
      if (idx >= 0) base[idx] = { ...base[idx], youtubeUrl: v.youtubeUrl ?? "" }
    }
    return base
  }, [sec.data.videos])

  function setVideoAt(
    pos: 1 | 2 | 3 | 4 | 5,
    youtubeUrl: string
  ) {
    const next = videos.map((v) =>
      v.position === pos ? { ...v, youtubeUrl } : v
    )
    onChange({
      type: "mediaGallery",
      data: { ...sec.data, videos: next },
    })
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Заголовок (RU)"
        value={sec.data.title}
        onChange={(e) =>
          onChange({
            type: "mediaGallery",
            data: { ...sec.data, title: e.target.value },
          })
        }
      />
      <Input
        placeholder="Заголовок (KZ)"
        value={sec.data.titleKz ?? ""}
        onChange={(e) =>
          onChange({
            type: "mediaGallery",
            data: { ...sec.data, titleKz: e.target.value },
          })
        }
      />

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Укажите ссылки YouTube для 5 видео. На главной странице видео
          показываются в фиксированных позициях: 1 — главное, 2–5 — сбоку.
        </p>

        <div className="grid gap-3">
          {videos.map((v) => {
            const id = parseYoutubeVideoId(v.youtubeUrl)
            return (
              <div key={`mg-${v.position}`} className="rounded-md border border-border/80 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1 space-y-2">
                    <label className="text-sm font-medium">
                      Видео {v.position}{" "}
                      <span className="text-muted-foreground font-normal">
                        {v.position === 1 ? "(главное)" : "(сбоку)"}
                      </span>
                    </label>
                    <Input
                      placeholder="YouTube ссылка или ID"
                      value={v.youtubeUrl}
                      onChange={(e) => setVideoAt(v.position, e.target.value)}
                    />
                    {!v.youtubeUrl.trim() ? (
                      <p className="text-muted-foreground text-xs">
                        Пусто — позиция скрывается на сайте.
                      </p>
                    ) : !id ? (
                      <p className="text-destructive text-xs">
                        Не удалось распознать YouTube ID из ссылки.
                      </p>
                    ) : null}
                  </div>
                  {id ? (
                    <img
                      alt=""
                      className="h-20 w-32 shrink-0 rounded object-cover"
                      src={youtubeThumbnailHq(id)}
                    />
                  ) : (
                    <div className="h-20 w-32 shrink-0 rounded bg-muted" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LinksEditor({
  sec,
  onChange,
}: {
  sec: Extract<HomeSection, { type: "usefulLinks" }>
  onChange: (s: Extract<HomeSection, { type: "usefulLinks" }>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
        Сами ссылки (логотип/URL/порядок/активность) редактируются здесь же, прямо в
        редакторе главной. Заголовки секции — ниже.
      </div>
      <UsefulLinksAdmin />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Подзаголовок (RU)"
          value={sec.data.kicker}
          onChange={(e) =>
            onChange({
              type: "usefulLinks",
              data: { ...sec.data, kicker: e.target.value },
            })
          }
        />
        <Input
          placeholder="Подзаголовок (KZ)"
          value={sec.data.kickerKz ?? ""}
          onChange={(e) =>
            onChange({
              type: "usefulLinks",
              data: { ...sec.data, kickerKz: e.target.value },
            })
          }
        />
        <Input
          placeholder="Заголовок (RU)"
          value={sec.data.title}
          onChange={(e) =>
            onChange({
              type: "usefulLinks",
              data: { ...sec.data, title: e.target.value },
            })
          }
        />
        <Input
          placeholder="Заголовок (KZ)"
          value={sec.data.titleKz ?? ""}
          onChange={(e) =>
            onChange({
              type: "usefulLinks",
              data: { ...sec.data, titleKz: e.target.value },
            })
          }
        />
      </div>
      <select
        className="border-input h-9 w-full rounded-md border px-3 text-sm"
        value={sec.data.source}
        onChange={(e) =>
          onChange({
            type: "usefulLinks",
            data: {
              ...sec.data,
              source: e.target.value as "manual" | "database",
            },
          })
        }
      >
        <option value="manual">Ссылки вручную</option>
        <option value="database">Из таблицы partner links</option>
      </select>
      {sec.data.source === "database" ? (
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs">
            Лимит из базы (1–8)
          </label>
          <Input
            type="number"
            min={1}
            max={8}
            value={sec.data.database?.limit ?? 8}
            onChange={(e) =>
              onChange({
                type: "usefulLinks",
                data: {
                  ...sec.data,
                  database: {
                    limit: Math.min(
                      8,
                      Math.max(1, Number(e.target.value) || 8)
                    ),
                  },
                },
              })
            }
          />
        </div>
      ) : (
        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
          {(sec.data.manualLinks ?? []).map((l, j) => (
            <RepeatableEditorRow
              key={`link-${j}`}
              summary={
                <span className="break-words">
                  {l.title?.trim() || "Ссылка без названия"}
                  {l.href?.trim() ? (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · {l.href.trim().slice(0, 48)}
                      {l.href.trim().length > 48 ? "…" : ""}
                    </span>
                  ) : null}
                </span>
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="URL (https://…)"
                  value={l.href}
                  onChange={(e) => {
                    const m = [...(sec.data.manualLinks ?? [])]
                    m[j] = { ...l, href: e.target.value }
                    onChange({
                      type: "usefulLinks",
                      data: { ...sec.data, manualLinks: m },
                    })
                  }}
                />
                <Input
                  placeholder="Заголовок (RU)"
                  value={l.title}
                  onChange={(e) => {
                    const m = [...(sec.data.manualLinks ?? [])]
                    m[j] = { ...l, title: e.target.value }
                    onChange({
                      type: "usefulLinks",
                      data: { ...sec.data, manualLinks: m },
                    })
                  }}
                />
                <Input
                  placeholder="Заголовок (KZ)"
                  value={l.titleKz ?? ""}
                  onChange={(e) => {
                    const m = [...(sec.data.manualLinks ?? [])]
                    m[j] = { ...l, titleKz: e.target.value || null }
                    onChange({
                      type: "usefulLinks",
                      data: { ...sec.data, manualLinks: m },
                    })
                  }}
                />
                <div className="sm:col-span-2">
                  <AdminImageUrlField
                    compact
                    label="Логотип"
                    value={l.logoUrl}
                    onChange={(url) => {
                      const m = [...(sec.data.manualLinks ?? [])]
                      m[j] = { ...l, logoUrl: url }
                      onChange({
                        type: "usefulLinks",
                        data: { ...sec.data, manualLinks: m },
                      })
                    }}
                    urlPlaceholder="URL логотипа"
                  />
                </div>
                <select
                  className="border-input h-9 rounded-md border px-2 text-sm"
                  value={l.logoVariant}
                  onChange={(e) => {
                    const m = [...(sec.data.manualLinks ?? [])]
                    m[j] = {
                      ...l,
                      logoVariant: e.target.value as "round" | "rect",
                    }
                    onChange({
                      type: "usefulLinks",
                      data: { ...sec.data, manualLinks: m },
                    })
                  }}
                >
                  <option value="round">Круг</option>
                  <option value="rect">Прямоугольник</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="sm:col-span-2"
                  onClick={() => {
                    if (!confirmListDelete("Удалить эту ссылку?")) return
                    onChange({
                      type: "usefulLinks",
                      data: {
                        ...sec.data,
                        manualLinks: (sec.data.manualLinks ?? []).filter(
                          (_, i) => i !== j
                        ),
                      },
                    })
                  }}
                >
                  Удалить
                </Button>
              </div>
            </RepeatableEditorRow>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={(sec.data.manualLinks ?? []).length >= 8}
            onClick={() => {
              if ((sec.data.manualLinks ?? []).length >= 8) return
              onChange({
                type: "usefulLinks",
                data: {
                  ...sec.data,
                  manualLinks: [
                    ...(sec.data.manualLinks ?? []),
                    {
                      href: "",
                      title: "",
                      titleKz: "",
                      logoUrl: "/images/logo.png",
                      logoVariant: "round",
                    },
                  ],
                },
              })
            }}
          >
            Добавить ссылку (макс. 8)
          </Button>
        </div>
      )}
    </div>
  )
}
