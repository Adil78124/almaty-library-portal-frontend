import { SiteFooterClient } from "@/components/SiteFooterClient"
import { buildSiteFooterPayload } from "@/lib/site/footer-payload"
import { prisma } from "@/lib/prisma"

export default async function SiteFooter() {
  const [site, socialLinks] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "default" },
    }),
    prisma.socialLink.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ])
  const data = buildSiteFooterPayload(site)
  return <SiteFooterClient data={data} socialLinks={socialLinks} />
}
