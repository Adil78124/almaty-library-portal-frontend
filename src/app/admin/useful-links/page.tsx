import { UsefulLinksAdmin } from "@/components/admin/useful-links-admin"

export default function AdminUsefulLinksPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Полезные ссылки</h1>
      <p className="text-muted-foreground mb-4 text-sm max-w-2xl">
        Управление блоком «Партнеры и ресурсы» на главной странице. Публичный API:{" "}
        <code className="text-xs">GET /api/partner-links?activeOnly=1</code>.
      </p>
      <UsefulLinksAdmin />
    </div>
  )
}

