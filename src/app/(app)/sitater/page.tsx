import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { ItemActions } from "@/components/ItemActions";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { QuoteCard } from "@/components/QuoteCard";
import { stagger } from "@/components/stagger";
import { listQuotes } from "@/lib/quotes";
import { deleteQuoteAction } from "./actions";

export const metadata: Metadata = { title: "Sitater" };

export default async function QuotesPage() {
  const quotes = await listQuotes();

  return (
    <PageTransition>
      <PageHeader title="Sitater" emoji="💬" action={{ href: "/sitater/ny", label: "+ Nytt sitat" }} />
      {quotes.length === 0 ? (
        <EmptyState emoji="🦜" i={1}>
          Ingen sitater ennå — legg til det første!
        </EmptyState>
      ) : (
        <ul className="note-list flex flex-col gap-4">
          {quotes.map((quote, i) => (
            // Cap the stagger so a long list doesn't take seconds to appear.
            <li key={quote.id} className="rise" style={stagger(Math.min(i + 1, 8))}>
              <QuoteCard quote={quote}>
                <ItemActions editHref={`/sitater/${quote.id}`} deleteAction={deleteQuoteAction.bind(null, quote.id)} />
              </QuoteCard>
            </li>
          ))}
        </ul>
      )}
    </PageTransition>
  );
}
