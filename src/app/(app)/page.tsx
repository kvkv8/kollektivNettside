import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { EventItem } from "@/components/EventItem";
import { PageTransition } from "@/components/PageTransition";
import { QuoteCard } from "@/components/QuoteCard";
import { stagger } from "@/components/stagger";
import { WasteChips } from "@/components/WasteChips";
import { requireSession } from "@/lib/auth";
import { formatDay, hourInOslo, isoWeek, relativeDay, todayInOslo } from "@/lib/dates";
import { listUpcomingEvents } from "@/lib/events";
import { getRandomQuote } from "@/lib/quotes";
import { dutyThisAndNextWeek } from "@/lib/rotation";
import { getNextCollection } from "@/lib/trv";

function greeting(hour: number): string {
  if (hour >= 5 && hour < 10) return "God morgen";
  if (hour >= 10 && hour < 17) return "Hei hei";
  if (hour >= 17 && hour < 23) return "God kveld";
  return "Fortsatt våken?";
}

function Eyebrow({ emoji, wiggle, children }: { emoji: string; wiggle?: boolean; children: React.ReactNode }) {
  return (
    <h2 className="eyebrow">
      <span aria-hidden className={`inline-block text-base ${wiggle ? "wobble" : ""}`}>
        {emoji}
      </span>
      {children}
    </h2>
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
    <PageTransition>
      <div className="flex flex-col gap-6">
        <header className="rise flex flex-col gap-1" style={stagger(0)}>
          <p className="text-sm font-medium text-muted">
            {formatDay(today)} · Uke {isoWeek(today)}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            {greeting(hourInOslo())} <span className="wobble inline-block">👋</span>
          </h1>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <section className="card-tinted tone-trash rise flex flex-col gap-2" style={stagger(1)}>
            <Eyebrow emoji="🗑️" wiggle>
              Søppeluke
            </Eyebrow>
            <p className="text-shine font-display text-2xl leading-tight font-extrabold break-words sm:text-3xl">
              {duty.thisWeek}
            </p>
            <p className="mt-auto text-xs text-muted">
              Neste uke: <span className="font-semibold text-foreground">{duty.nextWeek}</span>
            </p>
          </section>

          <section className="card-tinted tone-pickup rise flex flex-col gap-2" style={stagger(2)}>
            <Eyebrow emoji="🚛">Neste tømming</Eyebrow>
            {collection ? (
              <>
                <div>
                  <p className="font-display text-2xl leading-tight font-extrabold">
                    {relativeDay(collection.date, today) ?? formatDay(collection.date)}
                  </p>
                  {relativeDay(collection.date, today) && (
                    <p className="text-xs text-muted">{formatDay(collection.date)}</p>
                  )}
                </div>
                <div className="mt-auto">
                  <WasteChips wasteTypes={collection.wasteTypes} />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Ingen tømmedatoer tilgjengelig.</p>
            )}
          </section>
        </div>

        <section className="tone-event flex flex-col gap-3">
          <div className="rise flex items-baseline justify-between" style={stagger(3)}>
            <Eyebrow emoji="🎉">Kommende</Eyebrow>
            <Link href="/kalender" transitionTypes={["nav-forward"]} className="text-sm font-semibold text-accent">
              Se alle →
            </Link>
          </div>
          {events.length === 0 ? (
            <EmptyState emoji="🛋️" i={4}>
              Ingenting planlagt.
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {events.map((event, i) => (
                <li key={event.id} className="rise" style={stagger(4 + i)}>
                  <EventItem event={event} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="tone-quote flex flex-col gap-3">
          <div className="rise" style={stagger(7)}>
            <Eyebrow emoji="✨">Tilfeldig sitat</Eyebrow>
          </div>
          {quote ? (
            <div className="rise" style={stagger(8)}>
              <QuoteCard quote={quote} />
            </div>
          ) : (
            <EmptyState emoji="🦜" i={8}>
              Ingen sitater ennå — legg til det første!
            </EmptyState>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
