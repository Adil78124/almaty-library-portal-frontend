import { LocalHistoryAdmin } from "@/components/admin/local-history-admin"

export default function AdminLocalHistoryCrudPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Краеведение — карточки</h1>
      <p className="text-muted-foreground mb-4 text-sm max-w-2xl">
        Управление карточками блока «Краеведение» (источник: база). Публичный API:{" "}
        <code className="text-xs">GET /api/local-history?activeOnly=1</code>.
      </p>
      <LocalHistoryAdmin />
    </div>
  )
}

