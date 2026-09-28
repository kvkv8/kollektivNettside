import type { Metadata } from "next";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { requireSession } from "@/lib/auth";
import { createEventAction } from "../actions";

export const metadata: Metadata = { title: "Ny hendelse" };

export default async function NewEventPage() {
  await requireSession();

  return (
    <PageTransition>
      <PageHeader title="Ny hendelse" emoji="🗓️" back={{ href: "/kalender", label: "Kalender" }} />
      <EventForm action={createEventAction} />
    </PageTransition>
  );
}
