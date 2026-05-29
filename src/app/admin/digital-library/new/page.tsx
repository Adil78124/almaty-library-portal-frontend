import { DigitalBookForm } from "@/components/admin/digital-library/digital-book-form"

export default function AdminDigitalLibraryNewResourcePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Добавить ресурс</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl leading-relaxed">
          Создание записи для электронных книг (RU/KZ) с обложкой и ссылками.
        </p>
      </div>
      <DigitalBookForm />
    </div>
  )
}

