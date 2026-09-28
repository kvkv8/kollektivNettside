import { ViewTransition } from "react";

/**
 * Slides page content left or right depending on the Link's transitionTypes
 * ("nav-forward" / "nav-back"). Navigations without a type (redirects, browser back) just swap.
 * Must wrap each page, not the layout: layouts persist, so enter/exit never fire there.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const slide = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };
  return (
    <ViewTransition enter={slide} exit={slide} default="none">
      {children}
    </ViewTransition>
  );
}
