import { NewArrivalsAdmin } from "@/components/admin/new-arrivals-admin"

export default function AdminDigitalLibraryNewArrivalsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Новые поступления</h1>
      <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
        Управление списком новых поступлений, отображаемых на сайте.
      </p>
      <NewArrivalsAdmin />
    </div>
  )
}

