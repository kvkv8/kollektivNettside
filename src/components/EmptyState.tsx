import { stagger } from "./stagger";

export function EmptyState({ emoji, children, i = 0 }: { emoji: string; children: React.ReactNode; i?: number }) {
  return (
    <div
      className="rise flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-border px-4 py-8 text-center text-muted"
      style={stagger(i)}
    >
      <span aria-hidden className="float text-4xl">
        {emoji}
      </span>
      <p>{children}</p>
    </div>
  );
}
