/**
 * Файлы из frontend/web/Краеведения → slug карточки LocalHistoryCard.
 * sortOrder — порядок на главной (как в списке заказчика); без фото — 22–25.
 */
export const KRAEVEDENIE_PORTRAIT_FILES: {
  oldFile: string
  slug: string
  sortOrder: number
}[] = [
  { oldFile: "image1.jpg", slug: "sulushash-nurmambetova", sortOrder: 1 },
  { oldFile: "image2.png", slug: "batyk-majituuly", sortOrder: 2 },
  { oldFile: "image3.jpg", slug: "rakhman-zharyqbaev", sortOrder: 3 },
  { oldFile: "image4.jpg", slug: "nuketai-myshbaeva", sortOrder: 4 },
  { oldFile: "image5.png", slug: "baidilda-kaltaev", sortOrder: 5 },
  { oldFile: "image6.jpg", slug: "zhanarbek-ashimzhan", sortOrder: 6 },
  { oldFile: "image7.png", slug: "sharbanu-kumarova", sortOrder: 7 },
  { oldFile: "image8.png", slug: "moldabek-salamatov", sortOrder: 8 },
  { oldFile: "image9.jpg", slug: "atymtai-kisanov", sortOrder: 9 },
  { oldFile: "image10.jpg", slug: "idris-nogaibaev", sortOrder: 10 },
  { oldFile: "image11.jpg", slug: "ilakhun-ushurov", sortOrder: 11 },
  { oldFile: "image12.jpg", slug: "alnur-meirbekov", sortOrder: 12 },
  { oldFile: "image13.jpg", slug: "muhamedzhan-yetekbaev", sortOrder: 13 },
  { oldFile: "image14.png", slug: "adil-akhmetov", sortOrder: 14 },
  { oldFile: "image15.jpg", slug: "darkembay-shokparuly", sortOrder: 15 },
  { oldFile: "image16.jpg", slug: "sain-aldan", sortOrder: 16 },
  { oldFile: "image17.jpg", slug: "zhakypzhan-nurgazhaev", sortOrder: 17 },
  { oldFile: "image18.jpg", slug: "abuov-tursyn", sortOrder: 18 },
  { oldFile: "image19.png", slug: "ahyn-kasymzhanov", sortOrder: 19 },
  { oldFile: "image20.jpg", slug: "anuarbek-duisenbiev", sortOrder: 20 },
  { oldFile: "image21.jpg", slug: "zhanbolat-aupbaev", sortOrder: 21 },
]

/** Карточки без отдельного фото — в конец списка. */
export const KRAEVEDENIE_SORT_NO_PHOTO: Record<string, number> = {
  "sagat-massimakinov": 22,
  "musa-zhanadilov": 23,
  "maidan-suleimenov": 24,
  "shekerbek-sadyqanuly": 25,
}
