import { PrismaClient } from "@prisma/client"

const p = new PrismaClient()

async function main() {
  const total = await p.branch.count()
  const byType = await p.branch.groupBy({ by: ["type"], _count: true })
  const users = await p.user.findMany({
    select: { email: true, role: true, branchId: true, name: true },
  })
  console.log("Branch total:", total)
  console.log("By type:", JSON.stringify(byType, null, 2))
  console.log("Users:", JSON.stringify(users, null, 2))
}

main()
  .finally(() => p.$disconnect())
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
