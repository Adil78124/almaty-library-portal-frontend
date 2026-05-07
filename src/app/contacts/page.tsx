import SiteFooter from "@/components/SiteFooter"
import {
  ContactsPagePublic,
  type ContactsPagePayload,
} from "@/components/contacts/contacts-page-public"
import {
  SITE_CONTACT_FALLBACK,
} from "@/lib/site-contact-fallbacks"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function ContactsPage() {
  const [site, socialLinks] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
  ])

  const payload: ContactsPagePayload = {
    address: site?.address ?? SITE_CONTACT_FALLBACK.address,
    addressKz:
      site?.addressKz?.trim() || SITE_CONTACT_FALLBACK.addressKz || null,
    phone: site?.phone ?? SITE_CONTACT_FALLBACK.phone,
    phoneSecondary:
      site?.phoneSecondary?.trim() ||
      SITE_CONTACT_FALLBACK.phoneSecondary ||
      null,
    email: site?.email ?? SITE_CONTACT_FALLBACK.email,
    workingHoursRaw: site?.workingHours ?? null,
    sanitaryRu: site?.sanitaryDayRu?.trim() || null,
    sanitaryKz: site?.sanitaryDayKz?.trim() || null,
    socialLinks: JSON.parse(JSON.stringify(socialLinks)) as ContactsPagePayload["socialLinks"],
  }

  return (
    <div className="text-on-surface">
      <ContactsPagePublic data={payload} />
      <SiteFooter />
    </div>
  )
}
