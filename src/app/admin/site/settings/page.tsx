import { SiteSettingsContactsForm } from "@/components/admin/site-settings-contacts-form"
import { SocialLinksAdmin } from "@/components/admin/social-links-admin"

export default function AdminSiteSettingsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Контакты и соцсети</h1>
      <SiteSettingsContactsForm />

      <div className="mt-10 flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Соцсети</h2>
        <p className="text-muted-foreground mb-4 text-sm max-w-2xl">
          Иконки и ссылки выводятся в подвале сайта и в блоке «Мы в соцсетях» на
          странице «Контакты».
        </p>
        <SocialLinksAdmin />
      </div>
    </div>
  )
}
