import { dateParts, formatTime, relativeDay, todayInOslo } from "@/lib/dates";
import type { EventRow } from "@/lib/events";

/** An event with a little tear-off calendar tile on the left. */
export function EventItem({ event, children }: { event: EventRow; children?: React.ReactNode }) {
  const { weekday, day, month } = dateParts(event.event_date);
  const soon = relativeDay(event.event_date, todayInOslo());

  return (
    <div className="card tone-event flex flex-col gap-2">
      <div className="flex gap-3.5">
        <div
          aria-hidden
          className="flex w-14 shrink-0 flex-col overflow-hidden rounded-2xl border text-center"
          style={{ borderColor: "color-mix(in oklab, var(--tone) 30%, var(--border))" }}
        >
          <span className="py-0.5 text-[0.65rem] font-bold tracking-wider text-white uppercase" style={{ background: "var(--tone)" }}>
            {weekday}
          </span>
          <span className="font-display text-2xl leading-tight font-bold">{day}</span>
          <span className="pb-1 text-[0.65rem] font-semibold text-muted uppercase">{month}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {soon && <span className="chip">{soon}</span>}
            {event.start_time && (
              <span className="text-sm font-medium text-muted">kl. {formatTime(event.start_time)}</span>
            )}
          </div>
          <p className="font-display text-lg leading-snug font-semibold">{event.title}</p>
          {event.description && <p className="text-sm whitespace-pre-line text-muted">{event.description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
