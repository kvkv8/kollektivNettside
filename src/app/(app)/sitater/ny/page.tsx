import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { QuoteForm } from "@/components/QuoteForm";
import { listSpeakerNames } from "@/lib/quotes";
import { createQuoteAction } from "../actions";

export const metadata: Metadata = { title: "Nytt sitat" };

export default async function NewQuotePage() {
  const speakers = await listSpeakerNames();

  return (
    <PageTransition>
      <PageHeader title="Nytt sitat" emoji="✍️" back={{ href: "/sitater", label: "Sitater" }} />
      <QuoteForm action={createQuoteAction} speakers={speakers} />
    </PageTransition>
  );
}
