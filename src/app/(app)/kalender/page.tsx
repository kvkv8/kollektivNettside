import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { EventItem } from "@/components/EventItem";
import { ItemActions } from "@/components/ItemActions";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { stagger } from "@/components/stagger";
import { listUpcomingEvents } from "@/lib/events";
import { deleteEventAction } from "./actions";

export const metadata: Metadata = { title: "Kalender" };

export default async function CalendarPage() {
  const events = await listUpcomingEvents();

  return (
    <PageTransition>
      <PageHeader title="Kalender" emoji="📅" action={{ href: "/kalender/ny", label: "+ Ny hendelse" }} />
      {events.length === 0 ? (
        <EmptyState emoji="🛋️" i={1}>
          Ingenting planlagt.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event, i) => (
            <li key={event.id} className="rise" style={stagger(Math.min(i + 1, 8))}>
              <EventItem event={event}>
                <ItemActions editHref={`/kalender/${event.id}`} deleteAction={deleteEventAction.bind(null, event.id)} />
              </EventItem>
            </li>
          ))}
        </ul>
      )}
    </PageTransition>
  );
}
