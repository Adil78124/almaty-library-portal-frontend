import { notFound } from "next/navigation"

import {
  NewsArticleForm,
  type SerializedNewsArticle,
} from "@/components/admin/news/news-article-form"
import {
  getAdminSession,
  sessionCanAccessBranchResource,
} from "@/lib/auth/require-admin"
import { prisma } from "@/lib/prisma"

type Props = { params: Promise<{ id: string }> }

export default async function AdminNewsEditPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session) notFound()

  const { id } = await params
  const article = await prisma.newsArticle.findUnique({ where: { id } })
  if (!article) notFound()
  if (
    !sessionCanAccessBranchResource(
      session,
      (article as { branchId: string | null }).branchId ?? null
    )
  ) {
    notFound()
  }

  const initial = JSON.parse(
    JSON.stringify(article)
  ) as SerializedNewsArticle

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Редактирование</h1>
        <p className="text-muted-foreground mt-1 text-sm truncate">
          {article.titleRu}
        </p>
      </div>
      <NewsArticleForm mode="edit" initial={initial} />
    </div>
  )
}
