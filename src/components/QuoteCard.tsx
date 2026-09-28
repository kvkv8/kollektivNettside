import { formatDate } from "@/lib/dates";
import type { QuoteRow } from "@/lib/quotes";

export function QuoteCard({ quote, children }: { quote: QuoteRow; children?: React.ReactNode }) {
  return (
    <figure className="card flex flex-col gap-2">
      <blockquote className="text-lg leading-snug whitespace-pre-line">«{quote.text}»</blockquote>
      <figcaption className="text-sm text-muted">
        — <span className="font-semibold text-foreground">{quote.speaker}</span>
        {quote.context && <>, {quote.context}</>}
        {quote.said_on && <> · {formatDate(quote.said_on)}</>}
      </figcaption>
      {children}
    </figure>
  );
}
