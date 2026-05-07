import { DigitalLibraryAdmin } from "@/components/admin/digital-library-admin"

export default function AdminDigitalLibraryCrudPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Электронная библиотека</h1>
      <p className="text-muted-foreground mb-4 text-sm max-w-2xl">
        Контент страницы <code className="text-xs">/digital-library</code>: основной
        список и блок «Популярные сейчас». Публичные API:{" "}
        <code className="text-xs">GET /api/digital-books?activeOnly=1</code> и{" "}
        <code className="text-xs">GET /api/popular-books?activeOnly=1</code>.
      </p>
      <DigitalLibraryAdmin />
    </div>
  )
}

