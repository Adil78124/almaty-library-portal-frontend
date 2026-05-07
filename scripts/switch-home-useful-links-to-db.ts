import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v)
}

async function main() {
  const row = await prisma.pageContent.findUnique({ where: { page: "home" } })
  if (!row) {
    console.log("[home] PageContent missing — skip")
    return
  }

  const sections = row.sections as unknown
  if (!Array.isArray(sections)) {
    console.log("[home] sections not array — skip")
    return
  }

  let changed = false
  const next = sections.map((s) => {
    if (!isObject(s) || s.type !== "usefulLinks" || !isObject(s.data)) return s
    const data: any = { ...s.data }
    if (data.source !== "database") {
      data.source = "database"
      changed = true
    }
    if (!data.database || !isObject(data.database)) {
      data.database = { limit: 8 }
      changed = true
    } else if (typeof data.database.limit !== "number") {
      data.database = { ...data.database, limit: 8 }
      changed = true
    }
    return { ...s, data }
  })

  if (!changed) {
    console.log("[home] usefulLinks already database — no changes")
    return
  }

  await prisma.pageContent.update({
    where: { page: "home" },
    data: { sections: next as any },
  })

  console.log("[home] usefulLinks source switched to database")
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

