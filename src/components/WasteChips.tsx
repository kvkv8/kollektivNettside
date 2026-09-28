// TRV's waste types ("fraksjoner"), each with the colour of its bin lid where there is one.
const tones: [RegExp, string][] = [
  [/mat/i, "#6a9a2a"],
  [/papp|papir/i, "#2b78d0"],
  [/plast/i, "#9b4fd1"],
  [/glass|metall/i, "#0f9a9a"],
  [/rest/i, "#6b6b6b"],
];

function toneFor(wasteType: string): string {
  return tones.find(([pattern]) => pattern.test(wasteType))?.[1] ?? "var(--accent)";
}

export function WasteChips({ wasteTypes }: { wasteTypes: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {wasteTypes.map((type) => (
        <li key={type} className="chip" style={{ "--tone": toneFor(type) } as React.CSSProperties}>
          {type}
        </li>
      ))}
    </ul>
  );
}
