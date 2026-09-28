import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { QuoteForm } from "@/components/QuoteForm";
import { getQuote, listSpeakerNames } from "@/lib/quotes";
import { isId } from "@/lib/validation";
import { updateQuoteAction } from "../actions";

export const metadata: Metadata = { title: "Rediger sitat" };

export default async function EditQuotePage({ params }: PageProps<"/sitater/[id]">) {
  const { id } = await params;
  if (!isId(id)) notFound();

  const [quote, speakers] = await Promise.all([getQuote(id), listSpeakerNames()]);
  if (!quote) notFound();

  return (
    <PageTransition>
      <PageHeader title="Rediger sitat" emoji="✏️" back={{ href: "/sitater", label: "Sitater" }} />
      <QuoteForm
        action={updateQuoteAction.bind(null, id)}
        speakers={speakers}
        initial={{
          text: quote.text,
          speaker: quote.speaker,
          saidOn: quote.said_on ?? "",
          context: quote.context ?? "",
        }}
      />
    </PageTransition>
  );
}
