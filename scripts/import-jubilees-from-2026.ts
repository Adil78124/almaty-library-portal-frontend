import fs from "node:fs"
import path from "node:path"

import { prisma } from "../src/lib/prisma"
import { nameKeyToPortraitFile } from "./jubilee-portrait-files"

type ParsedItem = {
  title: string
  imageSrc: string | null
  paragraphsKz: string[]
  paragraphsRu: string[]
}

function normalizeNameKey(input: string) {
  return input
    .toLowerCase()
    .normalize("NFC")
    .replace(/ё/g, "е")
    .replace(/[’'".,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function nameVariants(input: string) {
  const cleaned = normalizeNameKey(input)
  const parts = cleaned.split(" ").filter(Boolean)
  const out = new Set<string>()
  out.add(cleaned)
  if (parts.length >= 2) {
    out.add([parts[1], parts[0], ...parts.slice(2)].join(" "))
    out.add([...parts].reverse().join(" "))
  }
  return Array.from(out)
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/[\s_]+/g, "-")
    // оставляем буквы/цифры/дефис (в т.ч. кириллицу/казахские)
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function uniqueSlug(desired: string, used: Set<string>) {
  let s = desired
  let i = 2
  while (used.has(s) || s.length === 0) {
    s = desired.length ? `${desired}-${i}` : `jubilee-${i}`
    i += 1
  }
  used.add(s)
  return s
}

function decodeNumericEntities(s: string) {
  return s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
}

function decodeNamedEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
}

function stripTags(s: string) {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function isKazakh(text: string) {
  return /[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/.test(text)
}

function isLikelyPersonName(line: string) {
  const s = line.trim().replace(/\s+/g, " ")
  if (s.length < 5 || s.length > 80) return false
  if (/\d/.test(s)) return false
  if (/[.,;:()]/.test(s)) return false
  // 2–4 "слов", каждое начинается с заглавной буквы (кириллица/латиница/казахские)
  return /^[\p{Lu}][\p{L}'’-]+(?:\s+[\p{Lu}][\p{L}'’-]+){1,3}$/u.test(s)
}

function parse2026Html(html: string): ParsedItem[] {
  const decoded = decodeNamedEntities(decodeNumericEntities(html))
  const bi = decoded.toLowerCase().indexOf("<body")
  const body = bi >= 0 ? decoded.slice(bi) : decoded

  // Сканиуем поток html в порядке: <img ...> и <p>...</p>.
  // Так мы корректно привяжем фото, даже если <img> не вложен в <p>.
  const tokens =
    /<img\b[^>]*\bsrc="([^"]+)"[^>]*>|<(?:p|h1)\b[^>]*>([\s\S]*?)<\/(?:p|h1)>/gi

  const items: ParsedItem[] = []
  let current:
    | {
        title: string
        paragraphsKz: string[]
        paragraphsRu: string[]
        imageSrc: string | null
      }
    | null = null
  let pendingImage: string | null = null

  for (const m of body.matchAll(tokens)) {
    const imgSrc = m[1] ? m[1] : null
    const blockInner = m[2] ? m[2] : null

    if (imgSrc) {
      if (/^images\/image\d+\.(jpg|jpeg|png)$/i.test(imgSrc)) {
        pendingImage = imgSrc
      }
      continue
    }

    if (!blockInner) continue

    // Если <img> вложен в <p>, достаём его тоже.
    for (const mm of blockInner.matchAll(/<img[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
      const src = mm[1]
      if (/^images\/image\d+\.(jpg|jpeg|png)$/i.test(src)) pendingImage = src
    }

    const line = decodeNamedEntities(stripTags(blockInner))
      .replace(/\s+/g, " ")
      .trim()
    if (!line) continue

    if (isLikelyPersonName(line)) {
      // flush previous
      if (current) items.push(current)

      const imageSrc = pendingImage
      pendingImage = null

      current = {
        title: line,
        imageSrc,
        paragraphsKz: [],
        paragraphsRu: [],
      }
      continue
    }

    if (!current) continue
    // пропускаем повтор имени внутри блока
    if (line === current.title) continue

    if (isKazakh(line)) current.paragraphsKz.push(line)
    else current.paragraphsRu.push(line)
  }

  if (current) items.push(current)

  // фильтр мусора: оставляем только тех, у кого есть хотя бы 1 абзац
  const filtered = items.filter(
    (it) => it.paragraphsKz.length + it.paragraphsRu.length > 0
  )

  // Дедуп по имени: если один и тот же человек встретился несколько раз,
  // оставляем запись с самым длинным текстом.
  const bestByName = new Map<
    string,
    { idx: number; item: ParsedItem; score: number }
  >()

  filtered.forEach((it, idx) => {
    const key = normalizeNameKey(it.title)
    const score =
      it.paragraphsKz.join("\n").length + it.paragraphsRu.join("\n").length
    const prev = bestByName.get(key)
    if (!prev || score > prev.score) {
      bestByName.set(key, { idx, item: it, score })
    }
  })

  return Array.from(bestByName.values())
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.item)
}

async function main() {
  const root = process.cwd()
  const htmlPath = path.join(root, "public", "2026.html")
  const html = fs.readFileSync(htmlPath, "utf8")

  const parsed = parse2026Html(html)
  const imagesDir = path.join(root, "public", "images")

  /** Имя (нормализованное) → файл в /public/images (после rename — slug-имена). */
  const portraitByName = nameKeyToPortraitFile()
  const NAME_TO_IMAGE: Record<string, string> = { ...portraitByName }
  const medeuFile =
    portraitByName["біғайша медеу"] ?? portraitByName["биғайша медеу"]
  if (medeuFile) {
    NAME_TO_IMAGE["біғайша медеу"] = medeuFile
    NAME_TO_IMAGE["биғайша медеу"] = medeuFile
  }

  if (process.env.DEBUG_JUBILEES === "1") {
    console.log(
      "parsed preview",
      parsed.slice(0, 8).map((p) => ({ title: p.title, imageSrc: p.imageSrc }))
    )
  }

  // Запасной механизм: если HTML-ассоциация не сработала, распределяем оставшиеся фото
  // по порядку (image1, image2, ...). Это лучше, чем пустые картинки.
  const stockImages = fs
    .readdirSync(imagesDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((n) => /\.(jpe?g|png)$/i.test(n))
    .filter((n) => !/^Emblem_/i.test(n) && !/^evntsform/i.test(n))
    .sort((a, b) => a.localeCompare(b, "kk"))
  let stockIdx = 0

  const usedSlugs = new Set<string>()
  const items = parsed.map((p, idx) => {
    // В текущем export Google Docs RU/KZ часто смешаны; делаем “мягкий” вывод:
    // RU: берём русские параграфы, либо fallback на общий текст из KZ.
    // KZ: берём казахские параграфы.
    const bioRu =
      p.paragraphsRu.join("\n\n").trim() ||
      p.paragraphsKz.join("\n\n").trim() ||
      ""
    const bioKz = p.paragraphsKz.join("\n\n").trim() || null

    // 1) пытаемся привязать фото по точной карте (имя → файл)
    let filename: string | null = null
    for (const v of nameVariants(p.title)) {
      const mapped = NAME_TO_IMAGE[v]
      if (mapped) {
        filename = mapped
        break
      }
    }

    // 2) иначе — пробуем взять то, что вытащили из HTML
    if (!filename) {
      filename = p.imageSrc?.split("/").pop() ?? null
    }

    // 3) иначе — fallback по порядку
    if (!filename || !fs.existsSync(path.join(imagesDir, filename))) {
      filename = stockImages[stockIdx] ?? null
      if (filename) stockIdx += 1
    }
    const imageUrl = filename ? `/images/${filename}` : null

    const baseSlug = slugify(p.title) || `jubilee-${idx + 1}`
    const slug = uniqueSlug(baseSlug, usedSlugs)

    return {
      slug,
      titleRu: p.title,
      titleKz: null,
      imageUrl,
      bioRu,
      bioKz,
      sortOrder: idx,
    }
  })

  await prisma.pageContent.upsert({
    where: { page: "jubilees" },
    create: {
      page: "jubilees",
      sections: [{ type: "jubilees", data: { items } }],
    },
    update: {
      sections: [{ type: "jubilees", data: { items } }],
    },
  })

  console.log(`Imported jubilees: ${items.length}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

