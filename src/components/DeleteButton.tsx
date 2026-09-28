"use client";

import { useTransition } from "react";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="text-sm text-danger disabled:opacity-60"
      disabled={pending}
      onClick={() => {
        if (confirm("Er du sikker?")) startTransition(action);
      }}
    >
      {pending ? "Sletter …" : "Slett"}
    </button>
  );
}
