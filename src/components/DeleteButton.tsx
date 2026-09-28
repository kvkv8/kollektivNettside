"use client";

import { useTransition } from "react";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="rounded-full px-3 py-1 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
      disabled={pending}
      onClick={() => {
        if (confirm("Er du sikker?")) startTransition(action);
      }}
    >
      {pending ? "Sletter …" : "Slett"}
    </button>
  );
}
