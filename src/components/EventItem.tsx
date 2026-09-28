import { formatDay, formatTime } from "@/lib/dates";
import type { EventRow } from "@/lib/events";

export function EventItem({ event, children }: { event: EventRow; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-sm text-muted">
        {formatDay(event.event_date)}
        {event.start_time && <> · kl. {formatTime(event.start_time)}</>}
      </p>
      <p className="font-semibold">{event.title}</p>
      {event.description && <p className="text-sm whitespace-pre-line">{event.description}</p>}
      {children}
    </div>
  );
}
