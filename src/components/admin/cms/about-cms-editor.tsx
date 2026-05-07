"use client"

import { useState, useTransition } from "react"

import type { AboutSection } from "@/lib/cms/about/types"
import { ABOUT_SECTION_ORDER } from "@/lib/cms/about/types"
import { LocalizedTwinFields } from "@/components/admin/cms/localized-twin-fields"
import { L, type Localized } from "@/lib/i18n/app-locale"

function C(v: Localized | string): Localized {
  return typeof v === "string" ? L(v, "") : v
}

function ruPrev(v: Localized | string): string {
  return C(v).ru.trim()
}
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
import {
  RepeatableListProvider,
  RepeatableEditorRow,
  confirmListDelete,
  useRepeatableListControls,
} from "@/components/admin/cms/repeatable-list-context"

function AboutRepeatableToolbar() {
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

const LABELS: Record<(typeof ABOUT_SECTION_ORDER)[number], string> = {
  hero: "1. Hero",
  roleIntro: "2. Наша роль (две колонки)",
  timeline: "3. История",
  mission: "4. Миссия (сетка карточек)",
  facts: "5. Цифры",
  space: "6. Наше пространство",
  quote: "7. Цитата и текст",
  cta: "8. Призыв к действию",
}

type Props = {
  initialSections: AboutSection[]
}

export function AboutCmsEditor({ initialSections }: Props) {
  const { success } = useAdminToast()
  const [sections, setSections] = useState<AboutSection[]>(initialSections)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const orderedOk =
    sections.length === ABOUT_SECTION_ORDER.length &&
    sections.every((s, i) => s.type === ABOUT_SECTION_ORDER[i])

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/page/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "about", sections }),
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

  function setAt(i: number, next: AboutSection) {
    setSections((prev) => {
      const c = [...prev]
      c[i] = next
      return c
    })
  }

  return (
    <RepeatableListProvider>
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            О библиотеке
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Блоки в порядке публичной страницы. Сохранение отправляет все 8
            секций.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AboutRepeatableToolbar />
          <Button disabled={pending || !orderedOk} onClick={save}>
            {pending ? "Сохранение…" : "Сохранить всю страницу"}
          </Button>
        </div>
      </div>
      {!orderedOk ? (
        <p className="text-destructive text-sm">Нарушен порядок секций.</p>
      ) : null}
      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
      {sections.map((sec, index) => (
        <Card key={`${sec.type}-${index}`}>
          <CardHeader>
            <CardTitle className="text-lg">{LABELS[sec.type]}</CardTitle>
            <CardDescription>{sec.type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sec.type === "hero" ? (
              <>
                <AdminImageUrlField
                  label="Фон (hero)"
                  value={sec.data.imageUrl}
                  onChange={(url) =>
                    setAt(index, {
                      type: "hero",
                      data: { ...sec.data, imageUrl: url },
                    })
                  }
                  onUploadError={(msg) => setError(msg)}
                  urlPlaceholder="URL фона"
                />
                <LocalizedTwinFields
                  labelRu="Alt (RU)"
                  labelKz="Alt (KZ)"
                  value={sec.data.imageAlt}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "hero",
                      data: { ...sec.data, imageAlt: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Крошка (RU)"
                  labelKz="Крошка (KZ)"
                  value={sec.data.breadcrumbLabel}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "hero",
                      data: { ...sec.data, breadcrumbLabel: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Заголовок (RU)"
                  labelKz="Заголовок (KZ)"
                  value={sec.data.title}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "hero",
                      data: { ...sec.data, title: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Лид (RU)"
                  labelKz="Лид (KZ)"
                  multiline
                  value={sec.data.lead}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "hero",
                      data: { ...sec.data, lead: loc },
                    })
                  }
                />
              </>
            ) : null}

            {sec.type === "roleIntro" ? (
              <>
                <LocalizedTwinFields
                  labelRu="Кикер (RU)"
                  labelKz="Кикер (KZ)"
                  value={sec.data.kicker}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "roleIntro",
                      data: { ...sec.data, kicker: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Заголовок (RU)"
                  labelKz="Заголовок (KZ)"
                  value={sec.data.title}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "roleIntro",
                      data: { ...sec.data, title: loc },
                    })
                  }
                />
                <label className="text-sm font-medium">Абзац 1</label>
                <LocalizedTwinFields
                  multiline
                  value={sec.data.paragraphs[0]}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "roleIntro",
                      data: {
                        ...sec.data,
                        paragraphs: [loc, sec.data.paragraphs[1]],
                      },
                    })
                  }
                />
                <label className="text-sm font-medium">Абзац 2</label>
                <LocalizedTwinFields
                  multiline
                  value={sec.data.paragraphs[1]}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "roleIntro",
                      data: {
                        ...sec.data,
                        paragraphs: [sec.data.paragraphs[0], loc],
                      },
                    })
                  }
                />
                <AdminImageUrlField
                  label="Боковое фото"
                  value={sec.data.sideImageUrl}
                  onChange={(url) =>
                    setAt(index, {
                      type: "roleIntro",
                      data: { ...sec.data, sideImageUrl: url },
                    })
                  }
                  onUploadError={(msg) => setError(msg)}
                  urlPlaceholder="URL изображения"
                />
                <LocalizedTwinFields
                  labelRu="Alt бокового (RU)"
                  labelKz="Alt бокового (KZ)"
                  value={sec.data.sideImageAlt}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "roleIntro",
                      data: { ...sec.data, sideImageAlt: loc },
                    })
                  }
                />
              </>
            ) : null}

            {sec.type === "timeline" ? (
              <div className="space-y-4">
                <LocalizedTwinFields
                  labelRu="Заголовок секции (RU)"
                  labelKz="Заголовок секции (KZ)"
                  value={sec.data.title}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "timeline",
                      data: { ...sec.data, title: loc },
                    })
                  }
                />
                <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sec.data.items.map((it, j) => (
                  <RepeatableEditorRow
                    key={`tl-${j}`}
                    summary={
                      <span className="break-words">
                        {ruPrev(it.year) || "—"}{" "}
                        <span className="text-muted-foreground font-normal">
                          {ruPrev(it.title) || "Точка без заголовка"}
                        </span>
                      </span>
                    }
                  >
                    <div className="space-y-2">
                    <LocalizedTwinFields
                      labelRu="Год / подпись (RU)"
                      labelKz="Год / подпись (KZ)"
                      value={it.year}
                      onChange={(loc) => {
                        const items = [...sec.data.items]
                        items[j] = { ...it, year: loc }
                        setAt(index, { type: "timeline", data: { ...sec.data, items } })
                      }}
                    />
                    <LocalizedTwinFields
                      labelRu="Заголовок (RU)"
                      labelKz="Заголовок (KZ)"
                      value={it.title}
                      onChange={(loc) => {
                        const items = [...sec.data.items]
                        items[j] = { ...it, title: loc }
                        setAt(index, { type: "timeline", data: { ...sec.data, items } })
                      }}
                    />
                    <LocalizedTwinFields
                      labelRu="Текст (RU)"
                      labelKz="Текст (KZ)"
                      multiline
                      value={it.body}
                      onChange={(loc) => {
                        const items = [...sec.data.items]
                        items[j] = { ...it, body: loc }
                        setAt(index, { type: "timeline", data: { ...sec.data, items } })
                      }}
                    />
                    <select
                      className="border-input h-9 w-full rounded-md border px-2 text-sm"
                      value={it.align}
                      onChange={(e) => {
                        const items = [...sec.data.items]
                        items[j] = {
                          ...it,
                          align: e.target.value as "left" | "right",
                        }
                        setAt(index, { type: "timeline", data: { ...sec.data, items } })
                      }}
                    >
                      <option value="left">Текст слева</option>
                      <option value="right">Текст справа</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!confirmListDelete("Удалить эту точку таймлайна?")) return
                        setAt(index, {
                          type: "timeline",
                          data: {
                            ...sec.data,
                            items: sec.data.items.filter((_, k) => k !== j),
                          },
                        })
                      }}
                    >
                      Удалить точку
                    </Button>
                    </div>
                  </RepeatableEditorRow>
                ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setAt(index, {
                      type: "timeline",
                      data: {
                        ...sec.data,
                        items: [
                          ...sec.data.items,
                          {
                            year: L("", ""),
                            title: L("", ""),
                            body: L("", ""),
                            align: "left",
                          },
                        ],
                      },
                    })
                  }
                >
                  Добавить точку
                </Button>
              </div>
            ) : null}

            {sec.type === "mission" ? (
              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sec.data.cards.map((c, j) => (
                  <RepeatableEditorRow
                    key={`mission-${j}`}
                    summary={
                      <span className="break-words">
                        {ruPrev(c.title) || "Карточка миссии"}
                      </span>
                    }
                  >
                    <div className="space-y-2">
                    <Input
                      placeholder="Иконка Material"
                      value={c.iconName}
                      onChange={(e) => {
                        const cards = [...sec.data.cards]
                        cards[j] = { ...c, iconName: e.target.value }
                        setAt(index, { type: "mission", data: { cards } })
                      }}
                    />
                    <LocalizedTwinFields
                      labelRu="Заголовок (RU)"
                      labelKz="Заголовок (KZ)"
                      value={c.title}
                      onChange={(loc) => {
                        const cards = [...sec.data.cards]
                        cards[j] = { ...c, title: loc }
                        setAt(index, { type: "mission", data: { cards } })
                      }}
                    />
                    <LocalizedTwinFields
                      labelRu="Текст (RU)"
                      labelKz="Текст (KZ)"
                      multiline
                      value={c.body}
                      onChange={(loc) => {
                        const cards = [...sec.data.cards]
                        cards[j] = { ...c, body: loc }
                        setAt(index, { type: "mission", data: { cards } })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!confirmListDelete("Удалить эту карточку?")) return
                        setAt(index, {
                          type: "mission",
                          data: {
                            cards: sec.data.cards.filter((_, k) => k !== j),
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
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setAt(index, {
                      type: "mission",
                      data: {
                        cards: [
                          ...sec.data.cards,
                          {
                            iconName: "library_books",
                            title: L("", ""),
                            body: L("", ""),
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

            {sec.type === "facts" ? (
              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sec.data.stats.map((s, j) => (
                  <RepeatableEditorRow
                    key={`fact-${j}`}
                    summary={
                      <span className="break-words">
                        {ruPrev(s.value) || "—"}{" "}
                        <span className="text-muted-foreground font-normal">
                          {ruPrev(s.label) || "Подпись"}
                        </span>
                      </span>
                    }
                  >
                    <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="min-w-0 flex-1 space-y-2">
                      <LocalizedTwinFields
                        labelRu="Значение (RU)"
                        labelKz="Значение (KZ)"
                        value={s.value}
                        onChange={(loc) => {
                          const stats = [...sec.data.stats]
                          stats[j] = { ...s, value: loc }
                          setAt(index, { type: "facts", data: { stats } })
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <LocalizedTwinFields
                        labelRu="Подпись (RU)"
                        labelKz="Подпись (KZ)"
                        value={s.label}
                        onChange={(loc) => {
                          const stats = [...sec.data.stats]
                          stats[j] = { ...s, label: loc }
                          setAt(index, { type: "facts", data: { stats } })
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        if (!confirmListDelete("Удалить эту строку?")) return
                        setAt(index, {
                          type: "facts",
                          data: {
                            stats: sec.data.stats.filter((_, k) => k !== j),
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
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setAt(index, {
                      type: "facts",
                      data: {
                        stats: [
                          ...sec.data.stats,
                          { value: L("", ""), label: L("", "") },
                        ],
                      },
                    })
                  }
                >
                  Добавить
                </Button>
              </div>
            ) : null}

            {sec.type === "space" ? (
              <div className="space-y-3">
                <LocalizedTwinFields
                  labelRu="Заголовок (RU)"
                  labelKz="Заголовок (KZ)"
                  value={sec.data.title}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "space",
                      data: { ...sec.data, title: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Лид (RU)"
                  labelKz="Лид (KZ)"
                  multiline
                  value={sec.data.lead}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "space",
                      data: { ...sec.data, lead: loc },
                    })
                  }
                />
                <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sec.data.slides.map((sl, j) => (
                  <RepeatableEditorRow
                    key={`slide-${j}`}
                    summary={
                      <span className="break-words">
                        {ruPrev(sl.caption) ||
                          sl.imageUrl?.trim() ||
                          `Слайд ${j + 1}`}
                      </span>
                    }
                  >
                    <div className="space-y-2">
                    <AdminImageUrlField
                      compact
                      label="Изображение слайда"
                      value={sl.imageUrl}
                      onChange={(url) => {
                        const slides = [...sec.data.slides]
                        slides[j] = { ...sl, imageUrl: url }
                        setAt(index, { type: "space", data: { ...sec.data, slides } })
                      }}
                      onUploadError={(msg) => setError(msg)}
                      urlPlaceholder="URL изображения"
                    />
                    <LocalizedTwinFields
                      labelRu="Alt (RU)"
                      labelKz="Alt (KZ)"
                      value={sl.imageAlt}
                      onChange={(loc) => {
                        const slides = [...sec.data.slides]
                        slides[j] = { ...sl, imageAlt: loc }
                        setAt(index, { type: "space", data: { ...sec.data, slides } })
                      }}
                    />
                    <LocalizedTwinFields
                      labelRu="Подпись (RU)"
                      labelKz="Подпись (KZ)"
                      value={sl.caption}
                      onChange={(loc) => {
                        const slides = [...sec.data.slides]
                        slides[j] = { ...sl, caption: loc }
                        setAt(index, { type: "space", data: { ...sec.data, slides } })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!confirmListDelete("Удалить этот слайд?")) return
                        setAt(index, {
                          type: "space",
                          data: {
                            ...sec.data,
                            slides: sec.data.slides.filter((_, k) => k !== j),
                          },
                        })
                      }}
                    >
                      Удалить слайд
                    </Button>
                    </div>
                  </RepeatableEditorRow>
                ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setAt(index, {
                      type: "space",
                      data: {
                        ...sec.data,
                        slides: [
                          ...sec.data.slides,
                          {
                            imageUrl: "",
                            imageAlt: L("", ""),
                            caption: L("", ""),
                          },
                        ],
                      },
                    })
                  }
                >
                  Добавить слайд
                </Button>
              </div>
            ) : null}

            {sec.type === "quote" ? (
              <>
                <LocalizedTwinFields
                  labelRu="Заголовок блока (RU)"
                  labelKz="Заголовок блока (KZ)"
                  value={sec.data.quote}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "quote",
                      data: { ...sec.data, quote: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Текст (RU)"
                  labelKz="Текст (KZ)"
                  multiline
                  value={sec.data.body}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "quote",
                      data: { ...sec.data, body: loc },
                    })
                  }
                />
              </>
            ) : null}

            {sec.type === "cta" ? (
              <>
                <LocalizedTwinFields
                  labelRu="Заголовок (RU)"
                  labelKz="Заголовок (KZ)"
                  value={sec.data.title}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "cta",
                      data: { ...sec.data, title: loc },
                    })
                  }
                />
                <LocalizedTwinFields
                  labelRu="Текст (RU)"
                  labelKz="Текст (KZ)"
                  multiline
                  value={sec.data.lead}
                  onChange={(loc) =>
                    setAt(index, {
                      type: "cta",
                      data: { ...sec.data, lead: loc },
                    })
                  }
                />
                <div className="flex flex-col gap-4">
                  <LocalizedTwinFields
                    labelRu="Кнопка 1 (RU)"
                    labelKz="Кнопка 1 (KZ)"
                    value={sec.data.primaryLabel}
                    onChange={(loc) =>
                      setAt(index, {
                        type: "cta",
                        data: { ...sec.data, primaryLabel: loc },
                      })
                    }
                  />
                  <Input
                    placeholder="Ссылка 1"
                    value={sec.data.primaryHref}
                    onChange={(e) =>
                      setAt(index, {
                        type: "cta",
                        data: { ...sec.data, primaryHref: e.target.value },
                      })
                    }
                  />
                  <LocalizedTwinFields
                    labelRu="Кнопка 2 (RU)"
                    labelKz="Кнопка 2 (KZ)"
                    value={sec.data.secondaryLabel}
                    onChange={(loc) =>
                      setAt(index, {
                        type: "cta",
                        data: { ...sec.data, secondaryLabel: loc },
                      })
                    }
                  />
                  <Input
                    placeholder="Ссылка 2"
                    value={sec.data.secondaryHref}
                    onChange={(e) =>
                      setAt(index, {
                        type: "cta",
                        data: { ...sec.data, secondaryHref: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            ) : null}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || !orderedOk}
              onClick={save}
            >
              Сохранить всю страницу
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
    </RepeatableListProvider>
  )
}
