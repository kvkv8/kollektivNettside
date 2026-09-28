import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { QuoteForm } from "@/components/QuoteForm";
import { listSpeakerNames } from "@/lib/quotes";
import { createQuoteAction } from "../actions";

export const metadata: Metadata = { title: "Nytt sitat" };

export default async function NewQuotePage() {
  const speakers = await listSpeakerNames();

  return (
    <>
      <PageHeader title="Nytt sitat" />
      <QuoteForm action={createQuoteAction} speakers={speakers} />
    </>
  );
}
