"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  branchSocialLinksToJson,
  parseBranchSocialLinksJson,
} from "@/lib/branch-social-links"
import {
  ICON_PRESET_CUSTOM,
  joinSocialIconFromSelect,
  splitSocialIconForSelect,
  type SocialIconFormPreset,
} from "@/lib/social-icon-form"
import { SOCIAL_ICON_SELECT_OPTIONS } from "@/lib/social-icons"
import { cn } from "@/lib/utils"

type Row = {
  id: string
  label: string
  labelKz: string
  url: string
  iconPreset: SocialIconFormPreset
  iconCustom: string
}

function newRow(): Row {
  return {
    id: crypto.randomUUID(),
    label: "",
    labelKz: "",
    url: "",
    ...splitSocialIconForSelect("link"),
  }
}

function draftsFromJson(json: string): Row[] {
  const links = parseBranchSocialLinksJson(json || null)
  if (links.length === 0) return []
  return links.map((l) => ({
    id: crypto.randomUUID(),
    label: l.label,
    labelKz: l.labelKz ?? "",
    url: l.url,
    ...splitSocialIconForSelect(l.icon ?? "link"),
  }))
}

type Props = {
  /** Текущее значение socialLinksJson при монтировании */
  initialJson: string
  onChangeJson: (json: string) => void
  className?: string
}

export function BranchSocialLinksEditor({
  initialJson,
  onChangeJson,
  className,
}: Props) {
  const [rows, setRows] = useState<Row[]>(() => draftsFromJson(initialJson))

  function pushJson(next: Row[]) {
    setRows(next)
    onChangeJson(branchSocialLinksToJson(next.map(rowToLink)))
  }

  function rowToLink(r: Row): {
    label: string
    labelKz?: string | null
    url: string
    icon?: string
  } {
    const icon = joinSocialIconFromSelect(r.iconPreset, r.iconCustom)
    return {
      label: r.label,
      labelKz: r.labelKz.trim() || null,
      url: r.url,
      icon: icon === "link" ? undefined : icon,
    }
  }

  function updateRow(
    id: string,
    patch: Partial<
      Pick<Row, "label" | "labelKz" | "url" | "iconPreset" | "iconCustom">
    >
  ) {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    pushJson(next)
  }

  function addRow() {
    pushJson([...rows, newRow()])
  }

  function removeRow(id: string) {
    pushJson(rows.filter((r) => r.id !== id))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-base">Соцсети и ссылки</Label>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Добавьте строки: подпись для посетителей, полный адрес (https://…) и
          при желании иконку. Сохранится автоматически в нужном формате для
          сайта.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground rounded-md border border-dashed px-4 py-6 text-center text-sm">
          Пока нет ссылок. Нажмите «Добавить ссылку», чтобы указать Instagram,
          сайт или другой ресурс.
        </p>
      ) : (
        <ul className="space-y-6">
          {rows.map((r, index) => (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-muted/20 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Ссылка {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeRow(r.id)}
                >
                  <Trash2 className="mr-1 size-4" />
                  Удалить
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`bsl-label-${r.id}`}>Подпись (RU)</Label>
                  <Input
                    id={`bsl-label-${r.id}`}
                    value={r.label}
                    onChange={(e) => updateRow(r.id, { label: e.target.value })}
                    placeholder="Например: Instagram или Сайт филиала"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`bsl-label-kz-${r.id}`}>Подпись (KZ)</Label>
                  <Input
                    id={`bsl-label-kz-${r.id}`}
                    value={r.labelKz}
                    onChange={(e) =>
                      updateRow(r.id, { labelKz: e.target.value })
                    }
                    placeholder="Қазақша подпись (міндетті емес)"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`bsl-url-${r.id}`}>Адрес ссылки</Label>
                  <Input
                    id={`bsl-url-${r.id}`}
                    type="url"
                    value={r.url}
                    onChange={(e) => updateRow(r.id, { url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`bsl-icon-${r.id}`}>Иконка на сайте</Label>
                  <select
                    id={`bsl-icon-${r.id}`}
                    className={cn(
                      "border-input bg-background ring-offset-background flex h-9 w-full max-w-md rounded-md border px-3 text-sm",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    )}
                    value={r.iconPreset}
                    onChange={(e) =>
                      updateRow(r.id, {
                        iconPreset: e.target.value as SocialIconFormPreset,
                      })
                    }
                  >
                    {SOCIAL_ICON_SELECT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                    <option value={ICON_PRESET_CUSTOM}>Другой ключ…</option>
                  </select>
                  {r.iconPreset === ICON_PRESET_CUSTOM ? (
                    <Input
                      className="mt-2 max-w-md font-mono text-xs"
                      value={r.iconCustom}
                      onChange={(e) =>
                        updateRow(r.id, { iconCustom: e.target.value })
                      }
                      placeholder="Латиницей, например: mastodon"
                      aria-label="Свой ключ иконки"
                    />
                  ) : null}
                  <p className="text-muted-foreground text-xs">
                    Неизвестный ключ на сайте показывается как обычная ссылка.
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="mr-2 size-4" />
        Добавить ссылку
      </Button>
    </div>
  )
}
