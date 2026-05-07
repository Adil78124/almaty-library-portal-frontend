import { randomBytes, scrypt } from "node:crypto"
import { promisify } from "node:util"

import { PrismaClient } from "@prisma/client"

import { seedNewsIfEmpty } from "./news-seed"
import { seedEventsIfEmpty } from "./events-seed"
import {
  OFFICIAL_CONTACTS,
  OFFICIAL_ORG,
  OFFICIAL_SANITARY,
  OFFICIAL_WORKING_HOURS,
  buildOfficialAboutSectionsBilingual,
} from "../src/lib/cms/about/customer-official"
import { getDefaultHomeSections } from "../src/lib/cms/home/defaults"
import { getDefaultSimpleSections } from "../src/lib/cms/simple-page/defaults"

const prisma = new PrismaClient()

const scryptAsync = promisify(scrypt)

async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const buf = (await scryptAsync(plain, salt, 64)) as Buffer
  return `${salt}:${buf.toString("hex")}`
}

const SEED_BRANCHES: {
  titleRu: string
  titleKz: string
  type: "REGIONAL" | "CITY" | "DISTRICT"
}[] = [
  {
    titleRu: "Алматинская областная библиотека",
    titleKz: "Алматы облыстық кітапханасы",
    type: "REGIONAL",
  },
  {
    titleRu: "Городская библиотека №1",
    titleKz: "Қала кітапханасы №1",
    type: "CITY",
  },
  {
    titleRu: "Городская библиотека №2",
    titleKz: "Қала кітапханасы №2",
    type: "CITY",
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    titleRu: `Районная библиотека №${i + 1}`,
    titleKz: `Аудандық кітапхана №${i + 1}`,
    type: "DISTRICT" as const,
  })),
]

/** Синхронно с backend/prisma/seed.ts; переопределите через env при необходимости. */
const SUPER_LOGIN =
  process.env.SEED_SUPERADMIN_LOGIN?.trim() || "oblkitap-portal"
const SUPER_EMAIL =
  process.env.SEED_SUPERADMIN_EMAIL?.trim() || "portal@oblkitap.kz"
const SUPER_PASSWORD =
  process.env.SEED_SUPERADMIN_PASSWORD || "OblKitap.Portal-2026"
const SUPER_NAME =
  process.env.SEED_SUPERADMIN_NAME?.trim() || "Администратор портала"

async function seedBranchesAndSuperAdmin() {
  for (const b of SEED_BRANCHES) {
    const found = await prisma.branch.findFirst({
      where: { titleRu: b.titleRu },
    })
    if (!found) {
      await prisma.branch.create({
        data: {
          titleRu: b.titleRu,
          titleKz: b.titleKz,
          type: b.type,
          descriptionRu: "",
          descriptionKz: null,
        },
      })
    } else if (!found.titleKz?.trim() && b.titleKz) {
      await prisma.branch.update({
        where: { id: found.id },
        data: { titleKz: b.titleKz },
      })
    }
  }
  await prisma.user.deleteMany({})
  const passwordHash = await hashPassword(SUPER_PASSWORD)
  await prisma.user.create({
    data: {
      login: SUPER_LOGIN,
      email: SUPER_EMAIL.toLowerCase(),
      password: passwordHash,
      name: SUPER_NAME,
      role: "SUPER_ADMIN",
      branchId: null,
    },
  })
}

const DEFAULT_WORKING_HOURS_SEED = OFFICIAL_WORKING_HOURS

function pickHomeELibraryManualBooks() {
  const sections = getDefaultHomeSections()
  const elib = sections.find((s) => s.type === "eLibrary")
  const data = (elib as any)?.data
  const manualBooks = (data?.manualBooks ?? []) as {
    coverUrl?: string
    title?: string
    author?: string
  }[]
  return manualBooks
}

function pickHomeNewArrivalsManualBooks() {
  const sections = getDefaultHomeSections()
  const sec = sections.find((s) => s.type === "newArrivals")
  const data = (sec as any)?.data
  const manualBooks = (data?.manualBooks ?? []) as {
    coverUrl?: string
    title?: string
    author?: string
    detailHref?: string
  }[]
  return manualBooks
}

async function seedDigitalBooksIfEmpty() {
  const count = await prisma.digitalBook.count()
  if (count > 0) return

  const src = pickHomeELibraryManualBooks().slice(0, 5)
  if (!src.length) return

  await prisma.digitalBook.createMany({
    data: src.map((b, i) => {
      const titleRu = (b.title ?? `Книга ${i + 1}`).trim()
      const authorRu = (b.author ?? "Автор").trim()
      return {
        titleRu,
        titleKz: titleRu,
        authorRu,
        authorKz: authorRu,
        imageUrl: (b.coverUrl ?? "").trim() || null,
        fileUrl: null,
        externalUrl: null,
        isActive: true,
        order: i,
      }
    }),
  })
}

async function seedPopularBooksIfEmpty() {
  const count = await prisma.popularBook.count()
  if (count > 0) return

  const src = pickHomeELibraryManualBooks().slice(0, 5)
  if (!src.length) return

  await prisma.popularBook.createMany({
    data: src.map((b, i) => {
      const titleRu = (b.title ?? `Книга ${i + 1}`).trim()
      const authorRu = (b.author ?? "Автор").trim()
      return {
        titleRu,
        titleKz: titleRu,
        authorRu,
        authorKz: authorRu,
        imageUrl: (b.coverUrl ?? "").trim() || null,
        // Чтобы карточки были кликабельны сразу: ведём на страницу электронной библиотеки
        externalUrl: "/digital-library",
        isActive: true,
        order: i,
      }
    }),
  })
}

async function seedNewArrivalsIfEmpty() {
  const count = await prisma.newArrival.count()
  if (count > 0) return

  const src = pickHomeNewArrivalsManualBooks().slice(0, 8)
  if (!src.length) return

  await prisma.newArrival.createMany({
    data: src.map((b, i) => {
      const title = (b.title ?? `Книга ${i + 1}`).trim()
      const author = (b.author ?? "Автор").trim()
      const detailUrl = (b.detailHref ?? "").trim()
      return {
        title,
        titleKz: title,
        author,
        authorKz: author,
        coverUrl: (b.coverUrl ?? "").trim() || null,
        detailUrl: detailUrl && detailUrl !== "#" ? detailUrl : null,
        sortOrder: i,
        isActive: true,
      }
    }),
  })
}

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
      workingHours: DEFAULT_WORKING_HOURS_SEED,
      sanitaryDayRu: OFFICIAL_SANITARY.ru,
      sanitaryDayKz: OFFICIAL_SANITARY.kz,
      copyrightLine: `© ${OFFICIAL_ORG.orgNameLong}`,
      copyrightLineKz: `© ${OFFICIAL_ORG.orgNameLongKz}`,
    } as never,
    update: {},
  })

  const siteAfter = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  })
  if (siteAfter && siteAfter.workingHours == null) {
    await prisma.siteSettings.update({
      where: { id: "default" },
      data: { workingHours: DEFAULT_WORKING_HOURS_SEED as object },
    })
  }

  await prisma.homeHero.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      titleLine1: "Алматинская областная",
      titleLine2: "центральная универсальная библиотека",
      quoteText: "Ғылым таппай мақтанба, орын таппай баптанба.",
      quoteAuthor: "Абай Құнанбайұлы",
    },
    update: {},
  })

  const marqueeCount = await prisma.marqueeItem.count()
  if (marqueeCount === 0) {
    await prisma.marqueeItem.createMany({
      data: [
        { text: "Новости библиотеки", sortOrder: 0 },
        { text: "Новые поступления", sortOrder: 1 },
        { text: "Мероприятия", sortOrder: 2 },
        { text: "Объявления", sortOrder: 3 },
      ],
    })
  }

  const metricCount = await prisma.homeMetric.count()
  if (metricCount === 0) {
    await prisma.homeMetric.createMany({
      data: [
        {
          iconName: "library_books",
          valueText: "450k+",
          label: "Общий объем книжного фонда",
          sortOrder: 0,
        },
        {
          iconName: "translate",
          valueText: "120k+",
          label: "Книги на казахском языке",
          sortOrder: 1,
        },
        {
          iconName: "group",
          valueText: "15k+",
          label: "Число зарегистрированных читателей",
          sortOrder: 2,
        },
        {
          iconName: "new_releases",
          valueText: "2.5k",
          label: "Новые поступления",
          sortOrder: 3,
        },
      ],
    })
  }

  const homePage = await prisma.pageContent.findUnique({
    where: { page: "home" },
  })
  if (!homePage) {
    await prisma.pageContent.create({
      data: {
        page: "home",
        sections: getDefaultHomeSections() as object[],
      },
    })
  }

  // Устаревший slug: контент «О библиотеке» теперь только в page "about" (двуязычный JSON).
  await prisma.pageContent.deleteMany({ where: { page: "about_kz" } })

  const aboutPage = await prisma.pageContent.findUnique({
    where: { page: "about" },
  })
  if (!aboutPage) {
    await prisma.pageContent.create({
      data: {
        page: "about",
        sections: buildOfficialAboutSectionsBilingual() as object[],
      },
    })
  }

  for (const slug of ["news", "events", "branches"] as const) {
    const row = await prisma.pageContent.findUnique({ where: { page: slug } })
    if (!row) {
      await prisma.pageContent.create({
        data: {
          page: slug,
          sections: getDefaultSimpleSections(slug) as object[],
        },
      })
    }
  }

  await seedEventsIfEmpty(prisma)
  await seedNewsIfEmpty(prisma)

  await seedDigitalBooksIfEmpty()
  await seedPopularBooksIfEmpty()
  await seedNewArrivalsIfEmpty()

  const socialCount = await prisma.socialLink.count()
  if (socialCount === 0) {
    await prisma.socialLink.createMany({
      data: [
        {
          icon: "youtube",
          label: "YouTube",
          url: "https://www.youtube.com/channel/UCmOCuDXoKUh-lqTSdOS9KsQ",
          sortOrder: 0,
        },
        {
          icon: "instagram",
          label: "Instagram",
          url: "https://www.instagram.com/almatyobl_kitapkhana?igsh=djdwYmlxcTZnNGdh",
          sortOrder: 1,
        },
        {
          icon: "facebook",
          label: "Facebook",
          url: "https://www.facebook.com/oqy.zaly/",
          sortOrder: 2,
        },
        {
          icon: "tiktok",
          label: "TikTok",
          url: "https://www.tiktok.com/@almatyobl.kitaphana",
          sortOrder: 3,
        },
      ],
    })
  }

  await seedBranchesAndSuperAdmin()
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
