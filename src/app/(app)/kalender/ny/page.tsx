import type { Metadata } from "next";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/auth";
import { createEventAction } from "../actions";

export const metadata: Metadata = { title: "Ny hendelse" };

export default async function NewEventPage() {
  await requireSession();

  return (
    <>
      <PageHeader title="Ny hendelse" />
      <EventForm action={createEventAction} />
    </>
  );
}
