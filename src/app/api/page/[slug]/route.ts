import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { jsonValidationError } from "@/lib/api/http"
import { requireSuperAdminSession } from "@/lib/auth/require-admin"
import { parseAboutCmsPayload } from "@/lib/cms/about/validate"
import { getAboutPublic } from "@/lib/cms/about/public"
import { getDigitalLibraryPublic } from "@/lib/cms/digital-library/public"
import { parseDigitalLibraryCmsPayload } from "@/lib/cms/digital-library/validate"
import { parseSimpleCmsPayload } from "@/lib/cms/simple-page/validate"
import { getSimplePagePublic } from "@/lib/cms/simple-page/public"
import {
  SIMPLE_PAGE_SLUGS,
  type SimplePageSlug,
} from "@/lib/cms/simple-page/types"
import { getBranchesNetworkPublic } from "@/lib/cms/branches-network/public"
import { parseBranchesNetworkCmsPayload } from "@/lib/cms/branches-network/validate"
import { prisma } from "@/lib/prisma"

function isSimpleSlug(s: string): s is SimplePageSlug {
  return (SIMPLE_PAGE_SLUGS as readonly string[]).includes(s)
}

function revalidateForSlug(slug: string) {
  if (slug === "about") revalidatePath("/about")
  if (slug === "news") revalidatePath("/news")
  if (slug === "events") revalidatePath("/events")
  if (slug === "branches") revalidatePath("/branches")
  if (slug === "branches-network") revalidatePath("/branches")
  if (slug === "digital-library") revalidatePath("/digital-library")
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  if (slug === "about") {
    const data = await getAboutPublic()
    return NextResponse.json({ page: "about", data })
  }

  if (isSimpleSlug(slug)) {
    const data = await getSimplePagePublic(slug)
    return NextResponse.json({ page: slug, data })
  }

  if (slug === "branches-network") {
    const data = await getBranchesNetworkPublic()
    return NextResponse.json({ page: "branches-network", data })
  }

  if (slug === "digital-library") {
    const data = await getDigitalLibraryPublic()
    return NextResponse.json({ page: "digital-library", data })
  }

  return NextResponse.json({ error: "Страница не найдена" }, { status: 404 })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await requireSuperAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
  }

  const { slug } = await context.params

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  if (slug === "about") {
    const parsed = parseAboutCmsPayload(raw)
    if (!parsed.ok) {
      return jsonValidationError(parsed.error)
    }
    await prisma.pageContent.upsert({
      where: { page: "about" },
      create: { page: "about", sections: parsed.data.sections as object[] },
      update: { sections: parsed.data.sections as object[] },
    })
    revalidateForSlug("about")
    return NextResponse.json({ ok: true })
  }

  if (isSimpleSlug(slug)) {
    const parsed = parseSimpleCmsPayload(raw, slug)
    if (!parsed.ok) {
      return jsonValidationError(parsed.error)
    }
    await prisma.pageContent.upsert({
      where: { page: slug },
      create: { page: slug, sections: parsed.data.sections as object[] },
      update: { sections: parsed.data.sections as object[] },
    })
    revalidateForSlug(slug)
    return NextResponse.json({ ok: true })
  }

  if (slug === "branches-network") {
    const parsed = parseBranchesNetworkCmsPayload(raw)
    if (!parsed.ok) {
      return jsonValidationError(parsed.error)
    }
    await prisma.pageContent.upsert({
      where: { page: "branches-network" },
      create: {
        page: "branches-network",
        sections: parsed.data.sections as object[],
      },
      update: { sections: parsed.data.sections as object[] },
    })
    revalidateForSlug("branches-network")
    return NextResponse.json({ ok: true })
  }

  if (slug === "digital-library") {
    const parsed = parseDigitalLibraryCmsPayload(raw)
    if (!parsed.ok) {
      return jsonValidationError(parsed.error)
    }
    await prisma.pageContent.upsert({
      where: { page: "digital-library" },
      create: { page: "digital-library", sections: parsed.data.sections as object[] },
      update: { sections: parsed.data.sections as object[] },
    })
    revalidateForSlug("digital-library")
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Страница не найдена" }, { status: 404 })
}
