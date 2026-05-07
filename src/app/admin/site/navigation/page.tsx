import { SectionPlaceholder } from "@/components/admin/section-placeholder"

export default function AdminNavigationPage() {
  return (
    <SectionPlaceholder
      title="Меню сайта"
      description="Пункты шапки: порядок, подписи RU/KZ, целевые URL."
      items={[
        "Редактирование пунктов верхнего меню",
        "Логотип и название в шапке",
        "Поведение поиска и переключателя языка",
      ]}
    />
  )
}
