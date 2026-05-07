import { NewsArticleForm } from "@/components/admin/news/news-article-form"

export default function AdminNewsNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Новая новость</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Заполните блоки ниже и сохраните материал.
        </p>
      </div>
      <NewsArticleForm mode="create" />
    </div>
  )
}
