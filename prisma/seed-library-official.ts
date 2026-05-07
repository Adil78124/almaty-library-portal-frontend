/**
 * Заполняет БД согласованными данными заказчика (инфо.docx).
 * Запуск: pnpm exec tsx prisma/seed-library-official.ts
 */
import { PrismaClient } from "@prisma/client"

import {
  OFFICIAL_CONTACTS,
  OFFICIAL_ORG,
  OFFICIAL_SANITARY,
  OFFICIAL_WORKING_HOURS,
  buildOfficialAboutSectionsBilingual,
} from "../src/lib/cms/about/customer-official"

const prisma = new PrismaClient()

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      orgNameShort: OFFICIAL_ORG.orgNameShort,
      orgNameLong: OFFICIAL_ORG.orgNameLong,
      orgNameShortKz: OFFICIAL_ORG.orgNameShortKz,
      orgNameLongKz: OFFICIAL_ORG.orgNameLongKz,
      footerTagline: OFFICIAL_ORG.footerTaglineRu,
      footerTaglineKz: OFFICIAL_ORG.footerTaglineKz,
      address: OFFICIAL_CONTACTS.addressRu,
      addressKz: OFFICIAL_CONTACTS.addressKz,
      phone: OFFICIAL_CONTACTS.phone,
      phoneSecondary: OFFICIAL_CONTACTS.phoneSecondary,
      email: OFFICIAL_CONTACTS.email,
      workingHours: OFFICIAL_WORKING_HOURS as object,
      sanitaryDayRu: OFFICIAL_SANITARY.ru,
      sanitaryDayKz: OFFICIAL_SANITARY.kz,
      copyrightLine: `© ${OFFICIAL_ORG.orgNameLong}`,
      copyrightLineKz: `© ${OFFICIAL_ORG.orgNameLongKz}`,
    } as never,
    update: {
      orgNameShort: OFFICIAL_ORG.orgNameShort,
      orgNameLong: OFFICIAL_ORG.orgNameLong,
      orgNameShortKz: OFFICIAL_ORG.orgNameShortKz,
      orgNameLongKz: OFFICIAL_ORG.orgNameLongKz,
      footerTagline: OFFICIAL_ORG.footerTaglineRu,
      footerTaglineKz: OFFICIAL_ORG.footerTaglineKz,
      address: OFFICIAL_CONTACTS.addressRu,
      addressKz: OFFICIAL_CONTACTS.addressKz,
      phone: OFFICIAL_CONTACTS.phone,
      phoneSecondary: OFFICIAL_CONTACTS.phoneSecondary,
      email: OFFICIAL_CONTACTS.email,
      workingHours: OFFICIAL_WORKING_HOURS as object,
      sanitaryDayRu: OFFICIAL_SANITARY.ru,
      sanitaryDayKz: OFFICIAL_SANITARY.kz,
      copyrightLine: `© ${OFFICIAL_ORG.orgNameLong}`,
      copyrightLineKz: `© ${OFFICIAL_ORG.orgNameLongKz}`,
    } as never,
  })

  const sections = buildOfficialAboutSectionsBilingual() as object[]

  // Устаревший slug: контент «О библиотеке» теперь только в page "about" (двуязычный JSON).
  await prisma.pageContent.deleteMany({ where: { page: "about_kz" } })

  await prisma.pageContent.upsert({
    where: { page: "about" },
    create: { page: "about", sections },
    update: { sections },
  })

  console.log("OK: SiteSettings + PageContent about (двуязычный JSON) обновлены.")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
