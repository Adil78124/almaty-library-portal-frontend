import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
await prisma.$executeRawUnsafe(
  `UPDATE Branch SET titleRu = 'Филиал' WHERE titleRu IS NULL OR TRIM(COALESCE(titleRu,'')) = ''`
)
await prisma.$disconnect()
console.log("fixed Branch.titleRu nulls")
