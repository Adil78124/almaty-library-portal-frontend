import SiteFooter from "@/components/SiteFooter"
import { HomePageView } from "@/components/home/home-page-view"
import { getHomePagePublic } from "@/lib/cms/home/public"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const data = await getHomePagePublic()
  return (
    <>
      <HomePageView data={data} />
      <SiteFooter />
    </>
  )
}
