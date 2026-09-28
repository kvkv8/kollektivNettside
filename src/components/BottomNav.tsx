"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SceneSwitcher } from "./SceneSwitcher";

const tabs = [
  { href: "/", label: "Hjem", icon: "🏠" },
  { href: "/sitater", label: "Sitater", icon: "💬" },
  { href: "/kalender", label: "Kalender", icon: "📅" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = tabs.findIndex((tab) => (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{ viewTransitionName: "bottom-nav" }}
    >
      <div className="mx-auto flex max-w-md items-stretch gap-2">
        <ul className="relative flex flex-1 rounded-full border border-border bg-surface/80 p-1.5 shadow-[var(--shadow)] backdrop-blur-xl">
          {/* The highlight pill slides to the active tab. */}
          {activeIndex >= 0 && (
            <li
              aria-hidden
              className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/3)] rounded-full bg-accent/12 transition-transform duration-500 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
          )}
          {tabs.map((tab, i) => {
            const active = i === activeIndex;
            return (
              <li key={tab.href} className="relative flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  transitionTypes={active ? undefined : [i > activeIndex ? "nav-forward" : "nav-back"]}
                  className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-xs transition-colors ${
                    active ? "font-semibold text-accent" : "text-muted"
                  }`}
                >
                  <span
                    aria-hidden
                    key={active ? "on" : "off"}
                    className={`text-xl transition-transform ${active ? "pop" : "opacity-80 grayscale-[40%]"}`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <SceneSwitcher />
      </div>
    </nav>
  );
}
