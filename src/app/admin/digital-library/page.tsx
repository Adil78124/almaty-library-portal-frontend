import { DigitalLibraryAdmin } from "@/components/admin/digital-library-admin"

export default function AdminDigitalLibraryCrudPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">
        Ресурсы электронной библиотеки
      </h1>
      <p className="text-muted-foreground mb-4 max-w-3xl text-sm leading-relaxed">
        Здесь редактируются книги и ссылки, которые показываются в блоках сайта.
        Если ресурс открывается на внешнем сайте заказчика, укажите внешнюю
        ссылку. Раздел «Новые поступления» управляется отдельно.
      </p>
      <DigitalLibraryAdmin />
    </div>
  )
}
