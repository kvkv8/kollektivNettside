import Link from "next/link";

export function FormActions({ pending, cancelHref }: { pending: boolean; cancelHref: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="submit" className="btn-primary flex-1" disabled={pending}>
        {pending ? "Lagrer …" : "Lagre"}
      </button>
      <Link href={cancelHref} transitionTypes={["nav-back"]} className="btn-secondary">
        Avbryt
      </Link>
    </div>
  );
}
