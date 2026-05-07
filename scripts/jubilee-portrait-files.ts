/**
 * Соответствие «старый файл в public/images» → каноническое ФИО для имени файла.
 * image15 / image18 — без ФИО в источнике, слоты для дальнейшего заполнения.
 */
export const JUBILEE_PORTRAIT_ROWS: { oldFile: string; displayName: string }[] = [
  { oldFile: "image1.png", displayName: "Серік Қалиев" },
  { oldFile: "image2.jpg", displayName: "Нұрсапа Аманжолов" },
  { oldFile: "image3.jpg", displayName: "Марат Ысқақов" },
  { oldFile: "image4.png", displayName: "Мұса Жанәділов" },
  { oldFile: "image5.jpg", displayName: "Бек Тоғысбаев" },
  { oldFile: "image6.png", displayName: "Айтақын Әбдіқалұлы" },
  { oldFile: "image7.jpg", displayName: "Ізтілеу Тойшыбайұлы" },
  { oldFile: "image8.png", displayName: "Нағашыбек Қапалбекұлы" },
  { oldFile: "image9.jpg", displayName: "Сағат Әшімбаев" },
  { oldFile: "image10.jpg", displayName: "Күмісжан Байжан" },
  { oldFile: "image11.jpg", displayName: "Мұхтархан Қалиұлы" },
  { oldFile: "image12.jpg", displayName: "Надежда Лушникова" },
  { oldFile: "image13.jpg", displayName: "Биғайша Медеу" },
  { oldFile: "image14.jpg", displayName: "Үмбетәлі Кәрібаев" },
  { oldFile: "image15.png", displayName: "" },
  { oldFile: "image16.jpg", displayName: "Естеу Нүсіпбеков" },
  { oldFile: "image17.jpg", displayName: "Бекен Ыбырайымов" },
  { oldFile: "image18.png", displayName: "" },
  { oldFile: "image19.jpg", displayName: "Әли Ысқабай" },
  { oldFile: "image20.jpg", displayName: "Сүйінбай Аронұлы" },
  { oldFile: "image21.jpg", displayName: "Кенен Әзірбаев" },
  { oldFile: "image22.png", displayName: "Рахман Жарықбаев" },
  { oldFile: "image23.jpg", displayName: "Жамбыл Жабаев" },
  { oldFile: "image24.jpg", displayName: "Балғабек Қыдырбекұлы" },
  { oldFile: "image25.jpg", displayName: "Шаяхмет Құсайынов" },
  { oldFile: "image26.jpg", displayName: "Дінмұхамед Қонаев" },
  { oldFile: "image27.jpg", displayName: "Есенқұл Жақыпбеков" },
  { oldFile: "image28.jpg", displayName: "Бердібек Соқпақбаев" },
  { oldFile: "image29.png", displayName: "Амангелді Сарбасов" },
  { oldFile: "image30.jpg", displayName: "Мұқағали Мақатаев" },
  { oldFile: "image31.jpg", displayName: "Тұманбай Молдғалиев" },
  { oldFile: "image32.jpg", displayName: "Оразақын Асқар" },
  { oldFile: "image33.png", displayName: "Бексұлтан Көлбаев" },
  { oldFile: "image34.jpg", displayName: "Үсенбай Тастанбеков" },
  { oldFile: "image35.png", displayName: "Бүбішхан Тікебаева" },
  { oldFile: "image36.jpg", displayName: "Жұмабай Шаштайұлы" },
]

export function slugifyFileBase(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function uniqueFileBase(desired: string, used: Set<string>) {
  let s = desired || "portrait"
  let i = 2
  while (used.has(s)) {
    s = `${desired || "portrait"}-${i}`
    i += 1
  }
  used.add(s)
  return s
}

/** Имя файла после переименования (без пути). */
export function buildPortraitRenames() {
  const used = new Set<string>()
  const oldToNew: Record<string, string> = {}
  for (const row of JUBILEE_PORTRAIT_ROWS) {
    const ext = row.oldFile.includes(".") ? row.oldFile.split(".").pop()! : "jpg"
    const baseRaw = row.displayName.trim()
      ? slugifyFileBase(row.displayName)
      : slugifyFileBase(
          row.oldFile.replace(/^image/i, "slot-").replace(/\.[^.]+$/, "")
        ) || "slot"
    const base = uniqueFileBase(baseRaw, used)
    const newFile = `${base}.${ext}`
    oldToNew[row.oldFile] = newFile
  }
  return oldToNew
}

/** Карта для импорта: нормализованное имя → новое имя файла. */
export function nameKeyToPortraitFile(): Record<string, string> {
  const oldToNew = buildPortraitRenames()
  const out: Record<string, string> = {}

  function norm(s: string) {
    return s
      .toLowerCase()
      .normalize("NFC")
      .replace(/ё/g, "е")
      .replace(/[’'".,;:()]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  const aliases: [string, string][] = [
    ["Құсайынов Шаяхмет", "Шаяхмет Құсайынов"],
    ["Дінмұхамед Ахметұлы Қонаев", "Дінмұхамед Қонаев"],
    ["Сарбасов Амангелді Сұлтанбекұлы", "Амангелді Сарбасов"],
    ["Сарбасов Амангелді", "Амангелді Сарбасов"],
    ["Тастанбеков Үсенбай Бақтиярұлы", "Үсенбай Тастанбеков"],
    ["Тұманбай Молдағалиев", "Тұманбай Молдғалиев"],
  ]

  for (const row of JUBILEE_PORTRAIT_ROWS) {
    if (!row.displayName.trim()) continue
    const newFile = oldToNew[row.oldFile]
    const k = norm(row.displayName)
    out[k] = newFile
    for (const [a, b] of aliases) {
      if (norm(a) === k) out[norm(b)] = newFile
      if (norm(b) === k) out[norm(a)] = newFile
    }
  }

  return out
}
