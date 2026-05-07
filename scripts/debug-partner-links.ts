import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.partnerLink.count()
  console.log("[partner-links] count:", count)

  try {
    // @ts-expect-error - depends on schema migration being applied
    const activeCount = await prisma.partnerLink.count({ where: { isActive: true } })
    console.log("[partner-links] activeCount:", activeCount)
  } catch (e: any) {
    console.log("[partner-links] activeCount query failed:", e?.message ?? String(e))
  }

  const sample = await prisma.partnerLink.findMany({
    orderBy: { sortOrder: "asc" },
    take: 5,
  })
  console.log("[partner-links] sample:", sample)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

