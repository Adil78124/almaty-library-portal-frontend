/**
 * Safe one-way content migration from the old local SQLite database
 * (prisma/dev.db) into the current PostgreSQL database from DATABASE_URL.
 *
 * Dry run is the default:
 *   npm run db:migrate:sqlite-to-postgres
 *
 * Apply changes explicitly:
 *   npm run db:migrate:sqlite-to-postgres -- --apply
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

import { PrismaClient } from "@prisma/client"

type RawRow = Record<string, unknown>
type ReportRow = {
  sqliteFound: number
  postgresBefore: number | null
  postgresAfter: number | null
  created: number
  updated: number
  skipped: number
  missingInSQLite: boolean
  missingInPostgres: boolean
  notes: string[]
}
type MigrationReport = {
  mode: "dry-run" | "apply"
  sqlitePath: string
  postgresUrl: string
  startedAt: string
  finishedAt?: string
  tables: Record<string, ReportRow>
  missingTables: {
    sqlite: string[]
    postgres: string[]
  }
  branchIdMap: {
    mapped: number
    missing: string[]
  }
  homeSources: {
    sqlite: HomeSourceState | null
    postgresBefore: HomeSourceState | null
    postgresAfter: HomeSourceState | null
    expectedAfterApply: HomeSourceState | null
  }
}
type HomeSourceState = {
  localHistory: string | null
  usefulLinks: string | null
}
type TableConfig = {
  table: string
  delegate: string
  fields: string[]
  primaryField: "id" | "page"
  required?: string[]
  dateFields?: string[]
  boolFields?: string[]
  jsonFields?: string[]
  prepare?: (data: RawRow, ctx: MigrationContext) => RawRow
  findExisting?: (client: DbClient, data: RawRow) => Promise<RawRow | null>
  afterResolved?: (args: {
    sqliteRow: RawRow
    targetId: string | null
    ctx: MigrationContext
  }) => void
}
type MigrationContext = {
  branchIdMap: Map<string, string>
  missingBranchIds: Set<string>
}
type DbClient = Record<string, any>

const require = createRequire(import.meta.url)
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (
    filename: string,
    options?: { readOnly?: boolean }
  ) => SqliteDatabase
}

type SqliteDatabase = {
  prepare(sql: string): {
    all(...params: unknown[]): RawRow[]
    get(...params: unknown[]): RawRow | undefined
  }
  close(): void
}

const prisma = new PrismaClient()

const args = new Set(process.argv.slice(2))
const apply = args.has("--apply") || process.env.APPLY_SQLITE_TO_POSTGRES === "1"
const sqliteArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--sqlite="))
const sqlitePath = path.resolve(
  process.cwd(),
  sqliteArg?.slice("--sqlite=".length) ||
    process.env.SQLITE_DB_PATH ||
    "prisma/dev.db"
)

function maskDatabaseUrl(raw: string | undefined) {
  if (!raw) return "(not set)"
  try {
    const u = new URL(raw)
    const auth = u.username ? `${u.username}:***@` : ""
    return `${u.protocol}//${auth}${u.host}${u.pathname}`
  } catch {
    return raw.slice(0, 20) + "..."
  }
}

function quoteIdent(name: string) {
  return `"${name.replaceAll('"', '""')}"`
}

function toDate(value: unknown): Date | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return value
  if (typeof value === "number") return new Date(value)
  if (typeof value === "bigint") return new Date(Number(value))
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^\d+$/.test(trimmed)) return new Date(Number(trimmed))
    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value === "bigint") return value !== 0n
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "yes"
  }
  return false
}

function parseJsonField(value: unknown) {
  if (value == null || value === "") return null
  if (typeof value !== "string") return value
  return JSON.parse(value)
}

function normalizeHomeSectionsSource(sections: unknown) {
  if (!Array.isArray(sections)) return sections
  return sections.map((section) => {
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      return section
    }
    const typed = section as Record<string, unknown>
    const data = typed.data
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return section
    }
    if (typed.type !== "localHistory" && typed.type !== "usefulLinks") {
      return section
    }
    const nextData = {
      ...(data as Record<string, unknown>),
      source: "database",
    }
    if (
      !nextData.database ||
      typeof nextData.database !== "object" ||
      Array.isArray(nextData.database)
    ) {
      nextData.database = { limit: typed.type === "localHistory" ? 50 : 8 }
    }
    return { ...typed, data: nextData }
  })
}

function readHomeSources(sections: unknown): HomeSourceState | null {
  if (!Array.isArray(sections)) return null
  const findSource = (type: string) => {
    const section = sections.find(
      (s) => !!s && typeof s === "object" && (s as { type?: unknown }).type === type
    ) as { data?: { source?: unknown } } | undefined
    return typeof section?.data?.source === "string" ? section.data.source : null
  }
  return {
    localHistory: findSource("localHistory"),
    usefulLinks: findSource("usefulLinks"),
  }
}

function pickData(row: RawRow, cfg: TableConfig, columns: Set<string>) {
  const data: RawRow = {}
  const dateFields = new Set(cfg.dateFields ?? [])
  const boolFields = new Set(cfg.boolFields ?? [])
  const jsonFields = new Set(cfg.jsonFields ?? [])

  for (const field of cfg.fields) {
    if (!columns.has(field)) continue
    const raw = row[field]
    if (dateFields.has(field)) {
      const value = toDate(raw)
      if (value) data[field] = value
    } else if (boolFields.has(field)) {
      data[field] = toBool(raw)
    } else if (jsonFields.has(field)) {
      data[field] = parseJsonField(raw)
    } else {
      data[field] = raw
    }
  }

  return data
}

function hasRequiredFields(data: RawRow, required: string[] = []) {
  return required.every((field) => {
    const value = data[field]
    return value !== null && value !== undefined && value !== ""
  })
}

function updateDataWithoutPrimary(data: RawRow, primaryField: string) {
  const next = { ...data }
  delete next[primaryField]
  return next
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

async function findById(client: DbClient, delegate: string, data: RawRow) {
  const id = stringValue(data.id)
  if (!id) return null
  return client[delegate].findUnique({ where: { id } })
}

async function findByIdOrSlug(client: DbClient, delegate: string, data: RawRow) {
  const byId = await findById(client, delegate, data)
  if (byId) return byId
  const slug = stringValue(data.slug)
  if (!slug) return null
  return client[delegate].findUnique({ where: { slug } })
}

async function findFirstByWhere(
  client: DbClient,
  delegate: string,
  where: RawRow | null
) {
  if (!where) return null
  return client[delegate].findFirst({ where })
}

function compositeWhere(data: RawRow, fields: string[]) {
  const where: RawRow = {}
  for (const field of fields) {
    const value = data[field]
    if (value === null || value === undefined || value === "") return null
    where[field] = value
  }
  return where
}

function remapBranchId(data: RawRow, ctx: MigrationContext) {
  const branchId = stringValue(data.branchId)
  if (!branchId) return data
  const mapped = ctx.branchIdMap.get(branchId)
  if (mapped) return { ...data, branchId: mapped }
  ctx.missingBranchIds.add(branchId)
  return { ...data, branchId: null }
}

const dateFields = ["createdAt", "updatedAt"]
const contentDateFields = [...dateFields, "publishedAt"]
const eventDateFields = [...dateFields, "startsAt"]
const boolActiveFields = ["isActive"]

const configs: TableConfig[] = [
  {
    table: "Branch",
    delegate: "branch",
    primaryField: "id",
    required: ["id", "titleRu", "type"],
    boolFields: ["published", "isMainBranch"],
    dateFields,
    fields: [
      "id",
      "titleRu",
      "titleKz",
      "type",
      "published",
      "isMainBranch",
      "subtitle",
      "subtitleKz",
      "cityLabel",
      "cityLabelKz",
      "address",
      "addressKz",
      "phone",
      "email",
      "hours",
      "descriptionRu",
      "descriptionKz",
      "cardImageUrl",
      "heroImageUrl",
      "socialLinksJson",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findById(client, "branch", data)) ||
      (await findFirstByWhere(
        client,
        "branch",
        compositeWhere(data, ["titleRu", "type"])
      )),
    afterResolved: ({ sqliteRow, targetId, ctx }) => {
      const sqliteId = stringValue(sqliteRow.id)
      if (sqliteId && targetId) ctx.branchIdMap.set(sqliteId, targetId)
    },
  },
  {
    table: "PageContent",
    delegate: "pageContent",
    primaryField: "page",
    required: ["page", "sections"],
    jsonFields: ["sections"],
    dateFields,
    fields: ["page", "sections", "createdAt", "updatedAt"],
    prepare: (data) =>
      data.page === "home"
        ? { ...data, sections: normalizeHomeSectionsSource(data.sections) }
        : data,
    findExisting: (client, data) =>
      client.pageContent.findUnique({ where: { page: data.page } }),
  },
  {
    table: "PartnerLink",
    delegate: "partnerLink",
    primaryField: "id",
    required: ["id", "title", "href"],
    boolFields: boolActiveFields,
    dateFields,
    fields: [
      "id",
      "title",
      "titleKz",
      "logoUrl",
      "href",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findById(client, "partnerLink", data)) ||
      (await findFirstByWhere(
        client,
        "partnerLink",
        compositeWhere(data, ["href", "title"])
      )),
  },
  {
    table: "LocalHistoryCard",
    delegate: "localHistoryCard",
    primaryField: "id",
    required: ["id", "name", "excerpt"],
    boolFields: boolActiveFields,
    dateFields,
    fields: [
      "id",
      "name",
      "nameKz",
      "excerpt",
      "excerptKz",
      "portraitUrl",
      "slug",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findByIdOrSlug(client, "localHistoryCard", data)) ||
      (await findFirstByWhere(
        client,
        "localHistoryCard",
        compositeWhere(data, ["name", "sortOrder"])
      )),
  },
  {
    table: "Staff",
    delegate: "staff",
    primaryField: "id",
    required: ["id", "slug", "fullNameRu", "branchRu"],
    boolFields: boolActiveFields,
    dateFields: [...dateFields, "birthDate"],
    fields: [
      "id",
      "slug",
      "fullNameRu",
      "fullNameKz",
      "birthDate",
      "phone",
      "positionRu",
      "positionKz",
      "branchRu",
      "branchKz",
      "imageUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    findExisting: (client, data) => findByIdOrSlug(client, "staff", data),
  },
  {
    table: "NewsArticle",
    delegate: "newsArticle",
    primaryField: "id",
    required: ["id", "slug", "titleRu", "descriptionRu"],
    dateFields: contentDateFields,
    fields: [
      "id",
      "slug",
      "titleRu",
      "titleKz",
      "descriptionRu",
      "descriptionKz",
      "coverImageUrl",
      "publishedAt",
      "location",
      "locationKz",
      "curator",
      "curatorKz",
      "status",
      "sortOrder",
      "branchId",
      "createdAt",
      "updatedAt",
    ],
    prepare: remapBranchId,
    findExisting: (client, data) => findByIdOrSlug(client, "newsArticle", data),
  },
  {
    table: "Event",
    delegate: "event",
    primaryField: "id",
    required: ["id", "slug", "titleRu"],
    boolFields: ["featuredOnHome"],
    dateFields: eventDateFields,
    fields: [
      "id",
      "slug",
      "titleRu",
      "titleKz",
      "descriptionRu",
      "descriptionKz",
      "posterUrl",
      "startsAt",
      "timeDisplay",
      "timeDisplayKz",
      "format",
      "formatKz",
      "category",
      "categoryKz",
      "location",
      "locationKz",
      "ctaLabel",
      "ctaLabelKz",
      "ctaHref",
      "featuredOnHome",
      "status",
      "sortOrder",
      "branchId",
      "createdAt",
      "updatedAt",
    ],
    prepare: remapBranchId,
    findExisting: (client, data) => findByIdOrSlug(client, "event", data),
  },
  {
    table: "DigitalBook",
    delegate: "digitalBook",
    primaryField: "id",
    required: ["id", "titleRu", "titleKz", "authorRu", "authorKz"],
    boolFields: boolActiveFields,
    dateFields,
    fields: [
      "id",
      "titleRu",
      "titleKz",
      "authorRu",
      "authorKz",
      "imageUrl",
      "fileUrl",
      "externalUrl",
      "isActive",
      "order",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findById(client, "digitalBook", data)) ||
      (await findFirstByWhere(
        client,
        "digitalBook",
        compositeWhere(data, ["titleRu", "authorRu"])
      )),
  },
  {
    table: "PopularBook",
    delegate: "popularBook",
    primaryField: "id",
    required: ["id", "titleRu", "titleKz", "authorRu", "authorKz", "externalUrl"],
    boolFields: boolActiveFields,
    dateFields,
    fields: [
      "id",
      "titleRu",
      "titleKz",
      "authorRu",
      "authorKz",
      "imageUrl",
      "externalUrl",
      "order",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findById(client, "popularBook", data)) ||
      (await findFirstByWhere(
        client,
        "popularBook",
        compositeWhere(data, ["titleRu", "authorRu"])
      )),
  },
  {
    table: "NewArrival",
    delegate: "newArrival",
    primaryField: "id",
    required: ["id", "title", "author"],
    boolFields: boolActiveFields,
    dateFields,
    fields: [
      "id",
      "title",
      "titleKz",
      "author",
      "authorKz",
      "coverUrl",
      "detailUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findById(client, "newArrival", data)) ||
      (await findFirstByWhere(
        client,
        "newArrival",
        compositeWhere(data, ["title", "author"])
      )),
  },
  {
    table: "SiteSettings",
    delegate: "siteSettings",
    primaryField: "id",
    required: ["id", "orgNameShort", "orgNameLong"],
    jsonFields: ["workingHours"],
    dateFields,
    fields: [
      "id",
      "orgNameShort",
      "orgNameLong",
      "orgNameShortKz",
      "orgNameLongKz",
      "footerTagline",
      "footerTaglineKz",
      "address",
      "addressKz",
      "phone",
      "phoneSecondary",
      "email",
      "sanitaryDayRu",
      "sanitaryDayKz",
      "workingHours",
      "copyrightLine",
      "copyrightLineKz",
      "privacyUrl",
      "termsUrl",
      "socialLinksJson",
      "homeNewsLimit",
      "homeNewsAutoRefresh",
      "homeNewsPollSeconds",
      "homeEventsLimit",
      "homeEventsAutoRefresh",
      "homeEventsPollSeconds",
      "createdAt",
      "updatedAt",
    ],
    boolFields: ["homeNewsAutoRefresh", "homeEventsAutoRefresh"],
    findExisting: (client, data) =>
      client.siteSettings.findUnique({ where: { id: data.id } }),
  },
  {
    table: "SocialLink",
    delegate: "socialLink",
    primaryField: "id",
    required: ["id", "label", "url"],
    dateFields,
    fields: [
      "id",
      "label",
      "labelKz",
      "icon",
      "logoUrl",
      "url",
      "sortOrder",
      "createdAt",
      "updatedAt",
    ],
    findExisting: async (client, data) =>
      (await findById(client, "socialLink", data)) ||
      (await findFirstByWhere(
        client,
        "socialLink",
        compositeWhere(data, ["url"])
      )),
  },
  {
    table: "MediaAsset",
    delegate: "mediaAsset",
    primaryField: "id",
    required: ["id", "url"],
    dateFields: ["createdAt"],
    fields: ["id", "url", "filename", "alt", "mimeType", "createdAt"],
    findExisting: async (client, data) =>
      (await findById(client, "mediaAsset", data)) ||
      (await findFirstByWhere(client, "mediaAsset", compositeWhere(data, ["url"]))),
  },
]

function createEmptyReportRow(): ReportRow {
  return {
    sqliteFound: 0,
    postgresBefore: null,
    postgresAfter: null,
    created: 0,
    updated: 0,
    skipped: 0,
    missingInSQLite: false,
    missingInPostgres: false,
    notes: [],
  }
}

function readSqliteTables(db: SqliteDatabase) {
  return new Set(
    db
      .prepare(
        "select name from sqlite_master where type = 'table' and name not like 'sqlite_%'"
      )
      .all()
      .map((row) => String(row.name))
  )
}

function readSqliteColumns(db: SqliteDatabase, table: string) {
  return new Set(
    db
      .prepare(`pragma table_info(${quoteIdent(table)})`)
      .all()
      .map((row) => String(row.name))
  )
}

function readSqliteRows(db: SqliteDatabase, table: string) {
  return db.prepare(`select * from ${quoteIdent(table)}`).all()
}

async function readPostgresTables() {
  const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
  `
  return new Set(rows.map((row) => row.table_name))
}

async function readPostgresHomeSources(client: DbClient) {
  const row = await client.pageContent.findUnique({
    where: { page: "home" },
    select: { sections: true },
  })
  return readHomeSources(row?.sections ?? null)
}

async function migrateTable(
  client: DbClient,
  db: SqliteDatabase,
  cfg: TableConfig,
  sqliteTables: Set<string>,
  postgresTables: Set<string>,
  ctx: MigrationContext,
  tableReport: ReportRow
) {
  if (!sqliteTables.has(cfg.table)) {
    tableReport.missingInSQLite = true
    tableReport.notes.push("SQLite table not found")
    return
  }
  if (!postgresTables.has(cfg.table)) {
    tableReport.missingInPostgres = true
    tableReport.notes.push("PostgreSQL table not found")
    return
  }

  const delegate = client[cfg.delegate]
  const columns = readSqliteColumns(db, cfg.table)
  const rows = readSqliteRows(db, cfg.table)
  tableReport.sqliteFound = rows.length
  tableReport.postgresBefore = await delegate.count()

  for (const sqliteRow of rows) {
    let data: RawRow
    try {
      data = pickData(sqliteRow, cfg, columns)
      data = cfg.prepare ? cfg.prepare(data, ctx) : data
    } catch (error) {
      tableReport.skipped += 1
      tableReport.notes.push(
        `Skipped row: failed to prepare data (${error instanceof Error ? error.message : String(error)})`
      )
      continue
    }

    if (!hasRequiredFields(data, cfg.required)) {
      tableReport.skipped += 1
      tableReport.notes.push(
        `Skipped row: missing required fields (${cfg.required?.join(", ") ?? ""})`
      )
      continue
    }

    const existing = cfg.findExisting ? await cfg.findExisting(client, data) : null
    const primaryValue =
      existing?.[cfg.primaryField] ?? data[cfg.primaryField] ?? null
    if (!primaryValue) {
      tableReport.skipped += 1
      tableReport.notes.push(`Skipped row: missing ${cfg.primaryField}`)
      continue
    }

    if (cfg.afterResolved) {
      cfg.afterResolved({
        sqliteRow,
        targetId: typeof primaryValue === "string" ? primaryValue : null,
        ctx,
      })
    }

    if (!apply) {
      if (existing) tableReport.updated += 1
      else tableReport.created += 1
      continue
    }

    await delegate.upsert({
      where: { [cfg.primaryField]: primaryValue },
      create: { ...data, [cfg.primaryField]: primaryValue },
      update: updateDataWithoutPrimary(data, cfg.primaryField),
    })

    if (existing) tableReport.updated += 1
    else tableReport.created += 1
  }

  tableReport.postgresAfter = apply ? await delegate.count() : tableReport.postgresBefore
}

async function main() {
  if (!fs.existsSync(sqlitePath)) {
    throw new Error(`SQLite database not found: ${sqlitePath}`)
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set for PostgreSQL")
  }
  if (!process.env.DATABASE_URL.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL must point to PostgreSQL for this migration")
  }

  const db = new DatabaseSync(sqlitePath, { readOnly: true })
  const sqliteTables = readSqliteTables(db)
  const postgresTables = await readPostgresTables()
  const ctx: MigrationContext = {
    branchIdMap: new Map(),
    missingBranchIds: new Set(),
  }
  const report: MigrationReport = {
    mode: apply ? "apply" : "dry-run",
    sqlitePath,
    postgresUrl: maskDatabaseUrl(process.env.DATABASE_URL),
    startedAt: new Date().toISOString(),
    tables: {},
    missingTables: { sqlite: [], postgres: [] },
    branchIdMap: { mapped: 0, missing: [] },
    homeSources: {
      sqlite: null,
      postgresBefore: await readPostgresHomeSources(prisma),
      postgresAfter: null,
      expectedAfterApply: null,
    },
  }

  const sqliteHome = sqliteTables.has("PageContent")
    ? db
        .prepare('select sections from "PageContent" where page = ?')
        .get("home")
    : null
  if (sqliteHome?.sections) {
    report.homeSources.sqlite = readHomeSources(
      normalizeHomeSectionsSource(parseJsonField(sqliteHome.sections))
    )
    report.homeSources.expectedAfterApply = report.homeSources.sqlite
  }

  const runner = async (client: DbClient) => {
    for (const cfg of configs) {
      const row = createEmptyReportRow()
      report.tables[cfg.table] = row
      await migrateTable(client, db, cfg, sqliteTables, postgresTables, ctx, row)
    }
  }

  if (apply) {
    await prisma.$transaction(async (tx) => runner(tx as DbClient), {
      timeout: 120_000,
      maxWait: 20_000,
    })
  } else {
    await runner(prisma)
  }

  report.missingTables.sqlite = configs
    .map((cfg) => cfg.table)
    .filter((table) => !sqliteTables.has(table))
  report.missingTables.postgres = configs
    .map((cfg) => cfg.table)
    .filter((table) => !postgresTables.has(table))
  report.branchIdMap.mapped = ctx.branchIdMap.size
  report.branchIdMap.missing = [...ctx.missingBranchIds]
  report.homeSources.postgresAfter = await readPostgresHomeSources(prisma)
  report.finishedAt = new Date().toISOString()

  console.log(JSON.stringify(report, null, 2))

  if (!apply) {
    console.log(
      "\nDry run only. To write data, run: npm run db:migrate:sqlite-to-postgres -- --apply"
    )
  }

  db.close()
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
