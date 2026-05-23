import { DigitalLibraryAdmin } from "@/components/admin/digital-library-admin"

export default function AdminDigitalLibraryCrudPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Электронная библиотека</h1>
      <p className="text-muted-foreground mb-4 text-sm max-w-2xl">
        Ресурсы для блока «Электронная библиотека» на главной странице. Отдельная
        внутренняя страница <code className="text-xs">/digital-library</code> теперь
        перенаправляет на внешний сайт заказчика. Публичный API:{" "}
        <code className="text-xs">GET /api/digital-books?activeOnly=1</code>.
      </p>
      <DigitalLibraryAdmin />
    </div>
  )
}
