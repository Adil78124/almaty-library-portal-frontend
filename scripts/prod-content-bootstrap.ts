import { PrismaClient } from "@prisma/client"

import { seedEventsIfEmpty } from "../prisma/events-seed"
import { seedNewsIfEmpty } from "../prisma/news-seed"
import { buildOfficialAboutSectionsBilingual } from "../src/lib/cms/about/customer-official"
import { getDefaultBranchesNetworkSections } from "../src/lib/cms/branches-network/defaults"
import { getDefaultHomeSections } from "../src/lib/cms/home/defaults"
import { getDefaultSimpleSections } from "../src/lib/cms/simple-page/defaults"

const prisma = new PrismaClient()

async function createPageIfMissing(page: string, sections: object[]) {
  const existing = await prisma.pageContent.findUnique({ where: { page } })
  if (existing) {
    return { page, action: "kept" }
  }
  await prisma.pageContent.create({ data: { page, sections } })
  return { page, action: "created" }
}

async function main() {
  const pages = []

  pages.push(await createPageIfMissing("home", getDefaultHomeSections() as object[]))
  pages.push(
    await createPageIfMissing(
      "about",
      buildOfficialAboutSectionsBilingual() as object[]
    )
  )
  pages.push(await createPageIfMissing("news", getDefaultSimpleSections("news") as object[]))
  pages.push(await createPageIfMissing("events", getDefaultSimpleSections("events") as object[]))
  pages.push(
    await createPageIfMissing("branches", getDefaultSimpleSections("branches") as object[])
  )
  pages.push(
    await createPageIfMissing("structure", getDefaultSimpleSections("structure") as object[])
  )
  pages.push(
    await createPageIfMissing(
      "branches-network",
      getDefaultBranchesNetworkSections() as object[]
    )
  )
  await seedNewsIfEmpty(prisma)
  await seedEventsIfEmpty(prisma)

  const report = {
    pages,
    notes: [
      "Existing PageContent rows were kept unchanged.",
      "News/Event demo rows are inserted only when their tables are empty.",
      "Jubilees are imported separately with: npm run db:import-jubilees-2026",
      "Local-history cards are imported separately with: npm run db:seed-local-history-2026",
    ],
  }

  console.log(JSON.stringify(report, null, 2))
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
