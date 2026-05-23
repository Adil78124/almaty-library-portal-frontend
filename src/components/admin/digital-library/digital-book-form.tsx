"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { useAdminToast } from "@/components/admin/admin-toast"
import { AdminImageUrlField } from "@/components/admin/admin-image-url-field"
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
import { Label } from "@/components/ui/label"
import { createDigitalBook, createNewArrival } from "@/services/api"

export function DigitalBookForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success } = useAdminToast()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [titleRu, setTitleRu] = useState("")
  const [titleKz, setTitleKz] = useState("")
  const [authorRu, setAuthorRu] = useState("")
  const [authorKz, setAuthorKz] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [order, setOrder] = useState("0")
  const preset = searchParams.get("preset")
  const [alsoNewArrivals, setAlsoNewArrivals] = useState(preset === "new-arrivals")

  function save() {
    setError(null)
    if (!titleRu.trim() || !titleKz.trim() || !authorRu.trim() || !authorKz.trim()) {
      setError("Заполните название и автора на RU и KZ.")
      return
    }

    startTransition(async () => {
      const res = await createDigitalBook({
        titleRu: titleRu.trim(),
        titleKz: titleKz.trim(),
        authorRu: authorRu.trim(),
        authorKz: authorKz.trim(),
        imageUrl: imageUrl.trim() || null,
        fileUrl: fileUrl.trim() || null,
        externalUrl: externalUrl.trim() || null,
        isActive,
        order: Number(order) || 0,
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
        id?: string
      }

      if (!res.ok) {
        if (data.issues?.length) {
          setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("; "))
        } else {
          setError(data.error ?? "Ошибка создания")
        }
        return
      }

      // Дополнительные места (не нарушая существующие модели).
      if (alsoNewArrivals) {
        const maxOrder = Number(order) || 0
        const detailUrl = (externalUrl || fileUrl || "").trim() || null
        const r2 = await createNewArrival({
          title: titleRu.trim(),
          titleKz: titleKz.trim(),
          author: authorRu.trim(),
          authorKz: authorKz.trim(),
          coverUrl: imageUrl.trim() || null,
          detailUrl,
          sortOrder: maxOrder,
          isActive: true,
        })
        if (!r2.ok) {
          const msg = (await r2.json().catch(() => ({}))) as { error?: string }
          setError(msg.error ?? "Книга создана, но не удалось добавить в «Новые поступления»")
          return
        }
      }

      success("Создано.")
      router.push("/admin/digital-library?created=1")
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
          <CardDescription>Название и автор (RU/KZ)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-title-ru">Название (RU)</Label>
              <Input
                id="book-title-ru"
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-title-kz">Название (KZ)</Label>
              <Input
                id="book-title-kz"
                value={titleKz}
                onChange={(e) => setTitleKz(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-author-ru">Автор (RU)</Label>
              <Input
                id="book-author-ru"
                value={authorRu}
                onChange={(e) => setAuthorRu(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-author-kz">Автор (KZ)</Label>
              <Input
                id="book-author-kz"
                value={authorKz}
                onChange={(e) => setAuthorKz(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-order">Порядок</Label>
              <Input
                id="book-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Показывать на сайте
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Куда добавить</div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={alsoNewArrivals}
                onChange={(e) => setAlsoNewArrivals(e.target.checked)}
              />
              Также добавить в «Новые поступления»
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Файлы и ссылки</CardTitle>
          <CardDescription>Обложка, файл и внешняя ссылка</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminImageUrlField
            label="Обложка"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            urlPlaceholder="URL обложки (или загрузить файл)"
            onUploadError={(msg) => setError(msg)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-file-url">Файл (URL)</Label>
              <Input
                id="book-file-url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="PDF/DOC/DOCX…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-external-url">Внешняя ссылка (URL)</Label>
              <Input
                id="book-external-url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="button" disabled={pending} onClick={save}>
            {pending ? "Создание…" : "Создать"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

