import { formatDate } from "@/lib/dates";
import type { QuoteRow } from "@/lib/quotes";

export function QuoteCard({ quote, children }: { quote: QuoteRow; children?: React.ReactNode }) {
  return (
    <figure className="note card-tinted flex flex-col gap-3">
      <blockquote className="relative font-display text-xl leading-snug font-medium whitespace-pre-line">
        «{quote.text}»
      </blockquote>
      <figcaption className="flex items-center gap-2.5 text-sm text-muted">
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full font-display font-bold text-white"
          style={{ background: "var(--tone)" }}
        >
          {quote.speaker.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="font-semibold text-foreground">{quote.speaker}</span>
          {quote.context && <>, {quote.context}</>}
          {quote.said_on && <span className="block text-xs">{formatDate(quote.said_on)}</span>}
        </span>
      </figcaption>
      {children}
    </figure>
  );
}
