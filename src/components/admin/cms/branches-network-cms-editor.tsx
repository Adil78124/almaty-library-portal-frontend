"use client"

import { useState, useTransition } from "react"

import type { BranchesNetworkSection } from "@/lib/cms/branches-network/types"
import { BRANCHES_NETWORK_SECTION_ORDER } from "@/lib/cms/branches-network/types"
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
import { Textarea } from "@/components/ui/textarea"

type Props = {
  initialSections: BranchesNetworkSection[]
}

export function BranchesNetworkCmsEditor({ initialSections }: Props) {
  const { success } = useAdminToast()
  const [sections, setSections] =
    useState<BranchesNetworkSection[]>(initialSections)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const network = sections[0]
  const orderedOk =
    sections.length === BRANCHES_NETWORK_SECTION_ORDER.length &&
    sections.every((s, i) => s.type === BRANCHES_NETWORK_SECTION_ORDER[i])

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/page/branches-network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "branches-network", sections }),
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

  if (network?.type !== "branchesNetwork") {
    return <p className="text-destructive text-sm">Некорректные данные страницы.</p>
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Блок «Сеть библиотек»
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Нижняя секция на странице /branches (заголовок, лид, текст и картинка).
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
          <CardTitle className="text-lg">Секция</CardTitle>
          <CardDescription>
            Тексты на двух языках. Тело — простой текст с переносами строк; строки,
            начинающиеся с <code>*</code>, будут показаны как пункты списка.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок (RU)</label>
            <Input
              value={network.data.titleRu}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, titleRu: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок (KZ)</label>
            <Input
              value={network.data.titleKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, titleKz: e.target.value },
                  },
                ])
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Лид (RU)</label>
            <Textarea
              value={network.data.leadRu}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, leadRu: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Лид (KZ)</label>
            <Textarea
              value={network.data.leadKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, leadKz: e.target.value },
                  },
                ])
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Текст (RU)</label>
            <Textarea
              className="min-h-[220px]"
              value={network.data.bodyRu}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, bodyRu: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Текст (KZ)</label>
            <Textarea
              className="min-h-[220px]"
              value={network.data.bodyKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, bodyKz: e.target.value },
                  },
                ])
              }
            />
          </div>

          <Separator />

          <AdminImageUrlField
            label="Изображение секции"
            value={network.data.imageUrl ?? ""}
            onChange={(url) =>
              setSections([
                {
                  type: "branchesNetwork",
                  data: { ...network.data, imageUrl: url || undefined },
                },
              ])
            }
            onUploadError={(msg) => setError(msg)}
            urlPlaceholder="URL изображения"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Alt изображения (RU)</label>
            <Input
              value={network.data.imageAltRu ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, imageAltRu: e.target.value },
                  },
                ])
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alt изображения (KZ)</label>
            <Input
              value={network.data.imageAltKz ?? ""}
              onChange={(e) =>
                setSections([
                  {
                    type: "branchesNetwork",
                    data: { ...network.data, imageAltKz: e.target.value },
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
            Сохранить
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

