import { redirect } from "next/navigation"

import { DIGITAL_LIBRARY_URL } from "@/lib/digital-library-url"

export default function DigitalLibraryPage() {
  redirect(DIGITAL_LIBRARY_URL)
}
