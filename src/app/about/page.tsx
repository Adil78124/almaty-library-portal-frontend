import { AboutPageView } from "@/components/about/about-page-view"
import SiteFooter from "@/components/SiteFooter"
import { getAboutPublic } from "@/lib/cms/about/public"

export default async function AboutPage() {
  const data = await getAboutPublic()
  return (
    <>
      <AboutPageView data={data} />
      <SiteFooter />
    </>
  )
}
