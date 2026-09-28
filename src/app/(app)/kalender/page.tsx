import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { EventItem } from "@/components/EventItem";
import { PageHeader } from "@/components/PageHeader";
import { listUpcomingEvents } from "@/lib/events";
import { deleteEventAction } from "./actions";

export const metadata: Metadata = { title: "Kalender" };

export default async function CalendarPage() {
  const events = await listUpcomingEvents();

  return (
    <>
      <PageHeader title="Kalender" action={{ href: "/kalender/ny", label: "+ Ny hendelse" }} />
      {events.length === 0 ? (
        <p className="text-muted">Ingenting planlagt.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id}>
              <EventItem event={event}>
                <div className="flex justify-end gap-4">
                  <Link href={`/kalender/${event.id}`} className="text-sm text-muted">
                    Rediger
                  </Link>
                  <DeleteButton action={deleteEventAction.bind(null, event.id)} />
                </div>
              </EventItem>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
