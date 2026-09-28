"use client";

import { useEffect, useRef, useState } from "react";
import { SCENE_COOKIE, SCENES, type SceneId } from "@/config/scenes";

/** Switches the backdrop right away and remembers it for this device for a year. */
function applyScene(id: SceneId) {
  document.documentElement.dataset.bg = id;
  document.cookie = `${SCENE_COOKIE}=${id}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
}

/** The 🎨 button next to the bottom bar: pick a backdrop for this device. */
export function SceneSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);

  // Close on outside tap or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(id: SceneId) {
    applyScene(id);
    setCurrent(id);
    setOpen(false);
  }

  function toggle() {
    // Read the live value when opening, so the tick is right even after a server re-render.
    setCurrent(document.documentElement.dataset.bg);
    setOpen((o) => !o);
  }

  return (
    <div ref={root} className="relative flex">
      {open && (
        <ul
          role="menu"
          aria-label="Bakgrunn"
          className="pop absolute right-0 bottom-full mb-2 flex w-48 origin-bottom-right flex-col gap-0.5 rounded-3xl border border-border bg-surface p-1.5 shadow-[var(--shadow)] backdrop-blur-xl"
        >
          {SCENES.map((scene) => (
            <li key={scene.id}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={current === scene.id}
                onClick={() => pick(scene.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-foreground/5 ${
                  current === scene.id ? "font-semibold" : ""
                }`}
              >
                <span
                  aria-hidden
                  className="size-7 shrink-0 rounded-full border border-white/15"
                  style={{ background: scene.swatch }}
                />
                <span className="flex-1">{scene.label}</span>
                {current === scene.id && <span className="text-accent">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Bytt bakgrunn"
        className="grid aspect-square h-full place-items-center rounded-full border border-border bg-surface/80 text-xl shadow-[var(--shadow)] backdrop-blur-xl transition-transform active:scale-90"
      >
        <span aria-hidden className={open ? "pop" : ""}>
          🎨
        </span>
      </button>
    </div>
  );
}
