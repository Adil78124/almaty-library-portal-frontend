import { EventForm } from "@/components/admin/events/event-form"

export default function AdminEventNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Новое мероприятие</h1>
      </div>
      <EventForm mode="create" />
    </div>
  )
}

