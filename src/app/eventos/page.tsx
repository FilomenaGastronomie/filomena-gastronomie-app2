import { EventsPlaceholder } from "@/components/events-placeholder";
import { getEventRecords } from "@/lib/event-records";

export default async function EventosPage() {
  const records = await getEventRecords();

  return <EventsPlaceholder initialRecords={records} />;
}
