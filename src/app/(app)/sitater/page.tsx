import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { QuoteCard } from "@/components/QuoteCard";
import { listQuotes } from "@/lib/quotes";
import { deleteQuoteAction } from "./actions";

export const metadata: Metadata = { title: "Sitater" };

export default async function QuotesPage() {
  const quotes = await listQuotes();

  return (
    <>
      <PageHeader title="Sitater" action={{ href: "/sitater/ny", label: "+ Nytt sitat" }} />
      {quotes.length === 0 ? (
        <p className="text-muted">Ingen sitater ennå — legg til det første!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <QuoteCard quote={quote}>
                <div className="flex justify-end gap-4">
                  <Link href={`/sitater/${quote.id}`} className="text-sm text-muted">
                    Rediger
                  </Link>
                  <DeleteButton action={deleteQuoteAction.bind(null, quote.id)} />
                </div>
              </QuoteCard>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
