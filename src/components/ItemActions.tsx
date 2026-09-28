import Link from "next/link";
import { DeleteButton } from "./DeleteButton";

/** The "Rediger / Slett" row under a quote or event. */
export function ItemActions({ editHref, deleteAction }: { editHref: string; deleteAction: () => Promise<void> }) {
  return (
    <div className="-mb-1 flex justify-end gap-1">
      <Link
        href={editHref}
        transitionTypes={["nav-forward"]}
        className="rounded-full px-3 py-1 text-sm font-medium text-muted transition-colors hover:bg-foreground/5"
      >
        Rediger
      </Link>
      <DeleteButton action={deleteAction} />
    </div>
  );
}
