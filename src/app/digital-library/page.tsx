import SiteFooter from "@/components/SiteFooter"
import { getDigitalLibraryPublic } from "@/lib/cms/digital-library/public"

import DigitalLibraryPageClient from "./digital-library-page-client"

export default async function DigitalLibraryPage() {
  const cms = await getDigitalLibraryPublic()
  return (
    <>
      <DigitalLibraryPageClient cms={cms} />
      <SiteFooter />
    </>
  )
}
