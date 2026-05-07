import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SectionPlaceholder({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items?: string[]
}) {
  return (
    <Card className="max-w-3xl border-dashed">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant="secondary">В разработке</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {items && items.length > 0 ? (
          <>
            <p className="mb-2 font-medium text-foreground">Планируется:</p>
            <ul className="list-inside list-disc space-y-1">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
