import Link from "next/link";
import { EventItem } from "@/components/EventItem";
import { QuoteCard } from "@/components/QuoteCard";
import { requireSession } from "@/lib/auth";
import { formatDay, todayInOslo } from "@/lib/dates";
import { listUpcomingEvents } from "@/lib/events";
import { getRandomQuote } from "@/lib/quotes";
import { dutyThisAndNextWeek } from "@/lib/rotation";
import { getNextCollection } from "@/lib/trv";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default async function HomePage() {
  await requireSession();
  const today = todayInOslo();
  const duty = dutyThisAndNextWeek(today);

  const [collection, events, quote] = await Promise.all([
    getNextCollection(today),
    listUpcomingEvents(3),
    getRandomQuote(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Hjem</h1>

      <div className="grid grid-cols-2 gap-3">
        <Section title="Søppeluke">
          <div className="card h-full">
            <p className="text-xl font-bold">{duty.thisWeek}</p>
            <p className="mt-1 text-sm text-muted">Neste uke: {duty.nextWeek}</p>
          </div>
        </Section>

        <Section title="Neste tømming">
          <div className="card h-full">
            {collection ? (
              <>
                <p className="font-bold">{formatDay(collection.date)}</p>
                <p className="mt-1 text-sm text-muted">{collection.wasteTypes.join(", ")}</p>
              </>
            ) : (
              <p className="text-sm text-muted">Ingen tømmedatoer tilgjengelig.</p>
            )}
          </div>
        </Section>
      </div>

      <Section title="Kommende">
        {events.length === 0 ? (
          <p className="text-muted">Ingenting planlagt.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((event) => (
              <li key={event.id}>
                <EventItem event={event} />
              </li>
            ))}
          </ul>
        )}
        <Link href="/kalender" className="text-sm text-accent">
          Se hele kalenderen →
        </Link>
      </Section>

      <Section title="Tilfeldig sitat">
        {quote ? (
          <QuoteCard quote={quote} />
        ) : (
          <p className="text-muted">Ingen sitater ennå — legg til det første!</p>
        )}
      </Section>
    </div>
  );
}
