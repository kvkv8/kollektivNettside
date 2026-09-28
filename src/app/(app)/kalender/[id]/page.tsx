import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { getEvent } from "@/lib/events";
import { formatTime } from "@/lib/dates";
import { isId } from "@/lib/validation";
import { updateEventAction } from "../actions";

export const metadata: Metadata = { title: "Rediger hendelse" };

export default async function EditEventPage({ params }: PageProps<"/kalender/[id]">) {
  const { id } = await params;
  if (!isId(id)) notFound();

  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <PageTransition>
      <PageHeader title="Rediger hendelse" emoji="✏️" back={{ href: "/kalender", label: "Kalender" }} />
      <EventForm
        action={updateEventAction.bind(null, id)}
        initial={{
          title: event.title,
          eventDate: event.event_date,
          startTime: event.start_time ? formatTime(event.start_time) : "",
          description: event.description ?? "",
        }}
      />
    </PageTransition>
  );
}
