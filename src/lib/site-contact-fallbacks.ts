/** Значения по умолчанию, если в SiteSettings ещё не заполнено (согласованные данные заказчика). */
export const SITE_CONTACT_FALLBACK = {
  address: "г. Алматы, ул. С. Татибекова, 27",
  addressKz: "Алматы қаласы, С. Тәтібеков көшесі, 27",
  phone: "+7 (771) 409 9100",
  phoneSecondary: "+7 (702) 191 52 57",
  email: "almatyoblkitaphana@mail.ru",
  footerTagline:
    "Современный культурно-информационный центр со свободным доступом к знаниям, информации и культурному наследию.",
  footerTaglineKz:
    "Білім мен ақпаратқа, мәдени мұраға еркін қол жеткізуді қамтамасыз ететін заманауи мәдени-ақпараттық орталық.",
  orgNameShort: "АООЦУБ",
  orgNameLong: "Алматинская областная центральная универсальная библиотека",
  orgNameShortKz: "АООӘК",
  orgNameLongKz: "Алматы облыстық орталық әмбебап кітапхана",
  copyrightLine: "© Алматинская областная центральная универсальная библиотека",
  copyrightLineKz: "© Алматы облыстық орталық әмбебап кітапхана",
} as const

export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return "#"
  if (digits.startsWith("8") && digits.length === 11) {
    return `tel:+7${digits.slice(1)}`
  }
  if (digits.startsWith("7")) {
    return `tel:+${digits}`
  }
  return `tel:+${digits}`
}
