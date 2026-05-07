import { SectionPlaceholder } from "@/components/admin/section-placeholder"

export default function AdminLocalHistoryPage() {
  return (
    <SectionPlaceholder
      title="Краеведение"
      description="Карточки персон и материалов блока «Краеведение» на главной."
      items={[
        "Портрет, имя, краткое описание",
        "Ссылка на полную биографию или статью",
      ]}
    />
  )
}
