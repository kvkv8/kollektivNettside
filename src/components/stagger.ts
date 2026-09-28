import type { CSSProperties } from "react";

/** Style for the `rise` utility: the i-th element starts a little later than the one before. */
export function stagger(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
