import { EventsPlaceholder } from "@/components/events-placeholder";
import { getEventRecords } from "@/lib/event-records";

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const records = await getEventRecords();

  return <EventsPlaceholder initialRecords={records} />;
}
