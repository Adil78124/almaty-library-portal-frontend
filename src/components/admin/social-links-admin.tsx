"use client"

import type { SocialLink } from "@prisma/client"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ICON_PRESET_CUSTOM,
  joinSocialIconFromSelect,
  splitSocialIconForSelect,
  type SocialIconFormPreset,
} from "@/lib/social-icon-form"
import { SOCIAL_ICON_SELECT_OPTIONS } from "@/lib/social-icons"

type FormState = {
  iconPreset: SocialIconFormPreset
  iconCustom: string
  label: string
  labelKz: string
  logoUrl: string
  url: string
  sortOrder: number
}

function splitIconForm(stored: string): Pick<FormState, "iconPreset" | "iconCustom"> {
  return splitSocialIconForSelect(stored)
}

function joinIconForm(preset: SocialIconFormPreset, custom: string): string {
  return joinSocialIconFromSelect(preset, custom)
}

const emptyForm: FormState = {
  iconPreset: "link",
  iconCustom: "",
  label: "",
  labelKz: "",
  logoUrl: "",
  url: "",
  sortOrder: 0,
}

export function SocialLinksAdmin() {
  const { success } = useAdminToast()
  const [items, setItems] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState(emptyForm)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch("/api/social-links")
    if (!res.ok) {
      setError("Не удалось загрузить список")
      setItems([])
      return
    }
    const data = (await res.json()) as SocialLink[]
    setItems(data)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await load()
      if (!cancelled) {
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch("/api/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icon: joinIconForm(form.iconPreset, form.iconCustom),
          label: form.label.trim(),
          labelKz: form.labelKz.trim() || null,
          logoUrl: form.logoUrl.trim() || null,
          url: form.url.trim(),
          sortOrder: form.sortOrder,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          issues?: { path: string; message: string }[]
        }
        if (body.issues?.length) {
          setError(body.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(
            typeof body.error === "string"
              ? body.error
              : "Ошибка сохранения (проверьте URL)"
          )
        }
        return
      }
      success("Добавлено.")
      setForm(emptyForm)
      await load()
    } finally {
      setCreating(false)
    }
  }

  function startEdit(row: SocialLink) {
    setEditingId(row.id)
    setEditDraft({
      ...splitIconForm(row.icon),
      label: row.label,
      labelKz: row.labelKz ?? "",
      logoUrl: ((row as SocialLink & { logoUrl?: string | null }).logoUrl ?? ""),
      url: row.url,
      sortOrder: row.sortOrder,
    })
  }

  async function saveEdit() {
    if (!editingId) return
    setSavingId(editingId)
    setError(null)
    try {
      const res = await fetch(`/api/social-links/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icon: joinIconForm(editDraft.iconPreset, editDraft.iconCustom),
          label: editDraft.label.trim(),
          labelKz: editDraft.labelKz.trim() || null,
          logoUrl: editDraft.logoUrl.trim() || null,
          url: editDraft.url.trim(),
          sortOrder: editDraft.sortOrder,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          issues?: { path: string; message: string }[]
        }
        if (body.issues?.length) {
          setError(body.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(
            typeof body.error === "string" ? body.error : "Ошибка сохранения"
          )
        }
        return
      }
      success("Сохранено.")
      setEditingId(null)
      await load()
    } finally {
      setSavingId(null)
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить эту ссылку?")) return
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/social-links/${id}`, { method: "DELETE" })
      if (!res.ok) {
        setError("Не удалось удалить")
        return
      }
      success("Удалено.")
      if (editingId === id) {
        setEditingId(null)
      }
      await load()
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Загрузка…
      </div>
    )
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Добавить ссылку</h2>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-icon">Иконка</Label>
            <select
              id="new-icon"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              value={form.iconPreset}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  iconPreset: e.target.value as SocialIconFormPreset,
                }))
              }
            >
              {SOCIAL_ICON_SELECT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
              <option value={ICON_PRESET_CUSTOM}>Другой ключ…</option>
            </select>
            {form.iconPreset === ICON_PRESET_CUSTOM ? (
              <Input
                id="new-icon-custom"
                value={form.iconCustom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, iconCustom: e.target.value }))
                }
                placeholder="Латиница, цифры, дефис (например: mastodon)"
                className="mt-2 font-mono text-sm"
                aria-label="Свой ключ иконки"
              />
            ) : null}
            <p className="text-muted-foreground text-xs">
              Неизвестный ключ в базе сохраняется, на сайте показывается
              универсальная иконка ссылки.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-sort">Порядок</Label>
            <Input
              id="new-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sortOrder: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-label">Подпись RU (для доступности)</Label>
            <Input
              id="new-label"
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              placeholder="Instagram"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-label-kz">Подпись KZ (необязательно)</Label>
            <Input
              id="new-label-kz"
              value={form.labelKz}
              onChange={(e) =>
                setForm((f) => ({ ...f, labelKz: e.target.value }))
              }
              placeholder="Қазақша"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <AdminImageUrlField
              label="Логотип вместо SVG (необязательно)"
              value={form.logoUrl}
              onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
              urlPlaceholder="URL логотипа или загрузите файл"
              onUploadError={(msg) => setError(msg)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-url">URL</Label>
            <Input
              id="new-url"
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://…"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Сохранение…
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Добавить
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Порядок</TableHead>
              <TableHead>Иконка</TableHead>
              <TableHead>Подпись RU</TableHead>
              <TableHead>Подпись KZ</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[140px] text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Пока нет ссылок. Добавьте первую или выполните{" "}
                  <code className="text-xs">npm run db:seed</code>.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  {editingId === row.id ? (
                    <>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          value={editDraft.sortOrder}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              sortOrder:
                                Number.parseInt(e.target.value, 10) || 0,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <select
                          className="border-input bg-background mb-2 w-full max-w-[220px] rounded-md border px-2 py-1 text-sm"
                          value={editDraft.iconPreset}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              iconPreset: e.target.value as SocialIconFormPreset,
                            }))
                          }
                        >
                          {SOCIAL_ICON_SELECT_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                          <option value={ICON_PRESET_CUSTOM}>Другой ключ…</option>
                        </select>
                        {editDraft.iconPreset === ICON_PRESET_CUSTOM ? (
                          <Input
                            className="font-mono text-xs"
                            value={editDraft.iconCustom}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                iconCustom: e.target.value,
                              }))
                            }
                            placeholder="Ключ иконки"
                          />
                        ) : null}
                        <AdminImageUrlField
                          compact
                          className="mt-3"
                          label="Логотип"
                          value={editDraft.logoUrl}
                          onChange={(url) =>
                            setEditDraft((d) => ({ ...d, logoUrl: url }))
                          }
                          urlPlaceholder="URL или файл"
                          onUploadError={(msg) => setError(msg)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editDraft.label}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              label: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editDraft.labelKz}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              labelKz: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="url"
                          value={editDraft.url}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, url: e.target.value }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          className="mr-2"
                          disabled={savingId === row.id}
                          onClick={() => void saveEdit()}
                        >
                          OK
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Отмена
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{row.sortOrder}</TableCell>
                      <TableCell>
                        {(() => {
                          const preset = SOCIAL_ICON_SELECT_OPTIONS.find(
                            (o) => o.value === row.icon
                          )
                          return preset ? (
                            <span className="text-sm">
                              {preset.label}{" "}
                              <span className="text-muted-foreground font-mono text-xs">
                                {row.icon}
                              </span>
                            </span>
                          ) : (
                            <span
                              className="font-mono text-xs"
                              title="Произвольный ключ"
                            >
                              {row.icon}
                            </span>
                          )
                        })()}
                      </TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                        {row.labelKz ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">
                        <a
                          className="text-primary hover:underline"
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          title="Изменить"
                          disabled={savingId !== null}
                          onClick={() => startEdit(row)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          title="Удалить"
                          disabled={savingId !== null}
                          onClick={() => void remove(row.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
