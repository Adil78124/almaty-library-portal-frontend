import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function norm(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

function isLocalized(v: unknown): v is { ru: string; kz: string } {
  return (
    !!v &&
    typeof v === "object" &&
    "ru" in (v as any) &&
    "kz" in (v as any)
  )
}

function shouldReplaceKz(cur: { ru: string; kz: string }): boolean {
  const kz = norm(cur.kz)
  const ru = norm(cur.ru)
  if (!kz) return true
  if (ru && kz === ru) return true
  return false
}

function patchLocalizedDeep(cur: any, base: any): { next: any; changed: boolean } {
  if (isLocalized(cur) && isLocalized(base)) {
    if (shouldReplaceKz(cur) && norm(base.kz)) {
      return { next: { ...cur, kz: base.kz }, changed: true }
    }
    return { next: cur, changed: false }
  }

  if (Array.isArray(cur) && Array.isArray(base)) {
    let changed = false
    const next = cur.map((v, i) => {
      const p = patchLocalizedDeep(v, base[i])
      if (p.changed) changed = true
      return p.next
    })
    return { next, changed }
  }

  if (
    cur &&
    base &&
    typeof cur === "object" &&
    typeof base === "object" &&
    !Array.isArray(cur) &&
    !Array.isArray(base)
  ) {
    let changed = false
    const next: any = { ...cur }
    for (const k of Object.keys(cur)) {
      if (!(k in base)) continue
      const p = patchLocalizedDeep((cur as any)[k], (base as any)[k])
      if (p.changed) {
        next[k] = p.next
        changed = true
      }
    }
    return { next, changed }
  }

  return { next: cur, changed: false }
}

async function main() {
  const { getDefaultAboutSections } = await import("../src/lib/cms/about/defaults")
  const { normalizeAboutSectionsFromDb } = await import(
    "../src/lib/cms/about/normalize-localized"
  )

  const defaults = normalizeAboutSectionsFromDb(getDefaultAboutSections())!
  const row = await prisma.pageContent.findUnique({ where: { page: "about" } })
  if (!row) {
    console.log("[about] pageContent missing — skip")
    return
  }

  const curNorm = normalizeAboutSectionsFromDb(row.sections) ?? defaults
  const patched = patchLocalizedDeep(curNorm, defaults)
  if (!patched.changed) {
    console.log("[about] no changes")
    return
  }

  await prisma.pageContent.update({
    where: { page: "about" },
    data: { sections: patched.next as any },
  })

  console.log("[about] updated kz fallbacks → official kz")
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

