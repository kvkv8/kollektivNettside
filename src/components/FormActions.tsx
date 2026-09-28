import Link from "next/link";

export function FormActions({ pending, cancelHref }: { pending: boolean; cancelHref: string }) {
  return (
    <div className="flex gap-3">
      <button type="submit" className="btn-primary flex-1" disabled={pending}>
        {pending ? "Lagrer …" : "Lagre"}
      </button>
      <Link href={cancelHref} className="btn-secondary">
        Avbryt
      </Link>
    </div>
  );
}
