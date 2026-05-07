"use client"

import { useState, useTransition } from "react"

import type { Localized } from "@/lib/i18n/app-locale"
import type { DigitalLibrarySection } from "@/lib/cms/digital-library/types"
import { DIGITAL_LIBRARY_SECTION_ORDER } from "@/lib/cms/digital-library/types"
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

type Props = {
  initialSections: DigitalLibrarySection[]
}

function updateLoc(
  cur: Localized,
  patch: Partial<Localized>
): Localized {
  return { ru: patch.ru ?? cur.ru, kz: patch.kz ?? cur.kz }
}

export function DigitalLibraryCmsEditor({ initialSections }: Props) {
  const { success } = useAdminToast()
  const [sections, setSections] = useState<DigitalLibrarySection[]>(initialSections)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const orderedOk =
    sections.length === DIGITAL_LIBRARY_SECTION_ORDER.length &&
    sections.every((s, i) => s.type === DIGITAL_LIBRARY_SECTION_ORDER[i])

  const hero = sections[0]
  const bento = sections[1]
  const help = sections[2]
  const access = sections[3]
  const cta = sections[4]

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/page/digital-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "digital-library", sections }),
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

  if (
    hero?.type !== "hero" ||
    bento?.type !== "bento" ||
    help?.type !== "help" ||
    access?.type !== "access" ||
    cta?.type !== "cta"
  ) {
    return <p className="text-destructive text-sm">Некорректные данные страницы.</p>
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Электронная библиотека</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Редактирование шапки и статических блоков страницы{" "}
            <code className="text-xs">/digital-library</code>. Книги и «Популярно сейчас»
            редактируются в разделе «Админ → Электронная библиотека».
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
          <CardDescription>Фон, хлебные крошки, заголовок и подзаголовок.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminImageUrlField
            label="Фон"
            value={hero.data.backgroundImageUrl}
            onChange={(url) =>
              setSections((prev) => [
                { type: "hero", data: { ...prev[0].data, backgroundImageUrl: url } } as any,
                prev[1],
                prev[2],
                prev[3],
                prev[4],
              ])
            }
            onUploadError={(msg) => setError(msg)}
            urlPlaceholder="URL фонового изображения"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt изображения (RU)</label>
              <Input
                value={hero.data.backgroundImageAlt.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: {
                        ...h.data,
                        backgroundImageAlt: updateLoc(h.data.backgroundImageAlt, {
                          ru: e.target.value,
                        }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt изображения (KZ)</label>
              <Input
                value={hero.data.backgroundImageAlt.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: {
                        ...h.data,
                        backgroundImageAlt: updateLoc(h.data.backgroundImageAlt, {
                          kz: e.target.value,
                        }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Хлебные крошки (RU)</label>
              <Input
                value={hero.data.breadcrumbLabel.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: {
                        ...h.data,
                        breadcrumbLabel: updateLoc(h.data.breadcrumbLabel, {
                          ru: e.target.value,
                        }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Хлебные крошки (KZ)</label>
              <Input
                value={hero.data.breadcrumbLabel.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: {
                        ...h.data,
                        breadcrumbLabel: updateLoc(h.data.breadcrumbLabel, {
                          kz: e.target.value,
                        }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (RU)</label>
              <Input
                value={hero.data.title.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: { ...h.data, title: updateLoc(h.data.title, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (KZ)</label>
              <Input
                value={hero.data.title.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: { ...h.data, title: updateLoc(h.data.title, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Лид (RU)</label>
              <Input
                value={hero.data.lead.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: { ...h.data, lead: updateLoc(h.data.lead, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Лид (KZ)</label>
              <Input
                value={hero.data.lead.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const h = next[0] as typeof hero
                    next[0] = {
                      ...h,
                      data: { ...h.data, lead: updateLoc(h.data.lead, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Карточки (2 блока)</CardTitle>
          <CardDescription>
            Иконка (Material Symbol), заголовок и текст. Кнопка «Открыть раздел» на
            сайте убрана — остаётся только контент карточки.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bento.data.cards.map((c, idx) => (
            <div key={`bento-${idx}`} className="rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Иконка
                  </label>
                  <Input
                    value={c.iconName}
                    onChange={(e) =>
                      setSections((prev) => {
                        const next = [...prev]
                        const s = next[1] as typeof bento
                        const cards = [...s.data.cards] as any
                        cards[idx] = { ...cards[idx], iconName: e.target.value }
                        next[1] = { ...s, data: { ...s.data, cards } }
                        return next
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Tone
                  </label>
                  <Input
                    value={c.tone}
                    onChange={(e) =>
                      setSections((prev) => {
                        const next = [...prev]
                        const s = next[1] as typeof bento
                        const cards = [...s.data.cards] as any
                        cards[idx] = { ...cards[idx], tone: e.target.value }
                        next[1] = { ...s, data: { ...s.data, cards } }
                        return next
                      })
                    }
                    placeholder="primaryFixed | neutral (или другое из списка)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Заголовок (RU)</label>
                  <Input
                    value={c.title.ru}
                    onChange={(e) =>
                      setSections((prev) => {
                        const next = [...prev]
                        const s = next[1] as typeof bento
                        const cards = [...s.data.cards] as any
                        cards[idx] = {
                          ...cards[idx],
                          title: updateLoc(cards[idx].title, { ru: e.target.value }),
                        }
                        next[1] = { ...s, data: { ...s.data, cards } }
                        return next
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Заголовок (KZ)</label>
                  <Input
                    value={c.title.kz}
                    onChange={(e) =>
                      setSections((prev) => {
                        const next = [...prev]
                        const s = next[1] as typeof bento
                        const cards = [...s.data.cards] as any
                        cards[idx] = {
                          ...cards[idx],
                          title: updateLoc(cards[idx].title, { kz: e.target.value }),
                        }
                        next[1] = { ...s, data: { ...s.data, cards } }
                        return next
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст (RU)</label>
                  <Input
                    value={c.body.ru}
                    onChange={(e) =>
                      setSections((prev) => {
                        const next = [...prev]
                        const s = next[1] as typeof bento
                        const cards = [...s.data.cards] as any
                        cards[idx] = {
                          ...cards[idx],
                          body: updateLoc(cards[idx].body, { ru: e.target.value }),
                        }
                        next[1] = { ...s, data: { ...s.data, cards } }
                        return next
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст (KZ)</label>
                  <Input
                    value={c.body.kz}
                    onChange={(e) =>
                      setSections((prev) => {
                        const next = [...prev]
                        const s = next[1] as typeof bento
                        const cards = [...s.data.cards] as any
                        cards[idx] = {
                          ...cards[idx],
                          body: updateLoc(cards[idx].body, { kz: e.target.value }),
                        }
                        next[1] = { ...s, data: { ...s.data, cards } }
                        return next
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Сайдбар: инструкция</CardTitle>
          <CardDescription>Заголовок, 3 шага и форматы файлов.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (RU)</label>
              <Input
                value={help.data.title.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[2] as typeof help
                    next[2] = {
                      ...s,
                      data: { ...s.data, title: updateLoc(s.data.title, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (KZ)</label>
              <Input
                value={help.data.title.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[2] as typeof help
                    next[2] = {
                      ...s,
                      data: { ...s.data, title: updateLoc(s.data.title, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          {help.data.steps.map((step, idx) => (
            <div key={`step-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Шаг {idx + 1} (RU)</label>
                <Input
                  value={step.ru}
                  onChange={(e) =>
                    setSections((prev) => {
                      const next = [...prev]
                      const s = next[2] as typeof help
                      const steps = [...s.data.steps] as any
                      steps[idx] = updateLoc(steps[idx], { ru: e.target.value })
                      next[2] = { ...s, data: { ...s.data, steps } }
                      return next
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Шаг {idx + 1} (KZ)</label>
                <Input
                  value={step.kz}
                  onChange={(e) =>
                    setSections((prev) => {
                      const next = [...prev]
                      const s = next[2] as typeof help
                      const steps = [...s.data.steps] as any
                      steps[idx] = updateLoc(steps[idx], { kz: e.target.value })
                      next[2] = { ...s, data: { ...s.data, steps } }
                      return next
                    })
                  }
                />
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Форматы (через запятую)</label>
            <Input
              value={help.data.formats.join(", ")}
              onChange={(e) =>
                setSections((prev) => {
                  const next = [...prev]
                  const s = next[2] as typeof help
                  const formats = e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                  next[2] = { ...s, data: { ...s.data, formats } }
                  return next
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Правила доступа</CardTitle>
          <CardDescription>
            Текст без ссылки «Узнать подробнее» (ссылка на сайте убрана).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (RU)</label>
              <Input
                value={access.data.title.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[3] as typeof access
                    next[3] = {
                      ...s,
                      data: { ...s.data, title: updateLoc(s.data.title, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (KZ)</label>
              <Input
                value={access.data.title.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[3] as typeof access
                    next[3] = {
                      ...s,
                      data: { ...s.data, title: updateLoc(s.data.title, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Текст (RU)</label>
              <Input
                value={access.data.body.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[3] as typeof access
                    next[3] = {
                      ...s,
                      data: { ...s.data, body: updateLoc(s.data.body, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Текст (KZ)</label>
              <Input
                value={access.data.body.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[3] as typeof access
                    next[3] = {
                      ...s,
                      data: { ...s.data, body: updateLoc(s.data.body, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. CTA</CardTitle>
          <CardDescription>Заголовок, лид и две кнопки (текст + ссылка).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (RU)</label>
              <Input
                value={cta.data.title.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: { ...s.data, title: updateLoc(s.data.title, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок (KZ)</label>
              <Input
                value={cta.data.title.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: { ...s.data, title: updateLoc(s.data.title, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Лид (RU)</label>
              <Input
                value={cta.data.lead.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: { ...s.data, lead: updateLoc(s.data.lead, { ru: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Лид (KZ)</label>
              <Input
                value={cta.data.lead.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: { ...s.data, lead: updateLoc(s.data.lead, { kz: e.target.value }) },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Кнопка 1: текст (RU)</label>
              <Input
                value={cta.data.primaryLabel.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: {
                        ...s.data,
                        primaryLabel: updateLoc(s.data.primaryLabel, { ru: e.target.value }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Кнопка 1: текст (KZ)</label>
              <Input
                value={cta.data.primaryLabel.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: {
                        ...s.data,
                        primaryLabel: updateLoc(s.data.primaryLabel, { kz: e.target.value }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Кнопка 1: ссылка</label>
            <Input
              value={cta.data.primaryHref}
              onChange={(e) =>
                setSections((prev) => {
                  const next = [...prev]
                  const s = next[4] as typeof cta
                  next[4] = { ...s, data: { ...s.data, primaryHref: e.target.value } }
                  return next
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Кнопка 2: текст (RU)</label>
              <Input
                value={cta.data.secondaryLabel.ru}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: {
                        ...s.data,
                        secondaryLabel: updateLoc(s.data.secondaryLabel, { ru: e.target.value }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Кнопка 2: текст (KZ)</label>
              <Input
                value={cta.data.secondaryLabel.kz}
                onChange={(e) =>
                  setSections((prev) => {
                    const next = [...prev]
                    const s = next[4] as typeof cta
                    next[4] = {
                      ...s,
                      data: {
                        ...s.data,
                        secondaryLabel: updateLoc(s.data.secondaryLabel, { kz: e.target.value }),
                      },
                    }
                    return next
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Кнопка 2: ссылка</label>
            <Input
              value={cta.data.secondaryHref}
              onChange={(e) =>
                setSections((prev) => {
                  const next = [...prev]
                  const s = next[4] as typeof cta
                  next[4] = { ...s, data: { ...s.data, secondaryHref: e.target.value } }
                  return next
                })
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

