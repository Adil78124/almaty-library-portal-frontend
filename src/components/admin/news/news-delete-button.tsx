"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { deleteNewsArticle } from "@/services/api"
import { pathsAfterNewsDelete, requestRevalidate } from "@/services/revalidate"

type Props = {
  id: string
  slug: string
  title: string
}

export function NewsDeleteButton({ id, slug, title }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onDelete() {
    if (
      !confirm(
        `Удалить новость «${title}»? Это действие нельзя отменить.`
      )
    ) {
      return
    }
    setPending(true)
    try {
      const res = await deleteNewsArticle(id)
      if (!res.ok) {
        alert("Не удалось удалить")
        return
      }
      await requestRevalidate(pathsAfterNewsDelete({ id, slug }))
      router.push("/admin/news")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={onDelete}
    >
      {pending ? "Удаление…" : "Удалить"}
    </Button>
  )
}
