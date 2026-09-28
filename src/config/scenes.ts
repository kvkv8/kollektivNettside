// Backdrops anyone can pick with the 🎨 button (styles in src/app/scenes.css).
// The choice is per device, kept in a cookie so the server renders the right one straight away.

export const SCENES = [
  { id: "lavalampe", label: "Lavalampe", swatch: "radial-gradient(circle at 30% 70%, #ff5e3a, transparent 60%), radial-gradient(circle at 75% 30%, #d9368b, transparent 60%), #230f24" },
  { id: "nordlys", label: "Nordlys", swatch: "linear-gradient(160deg, transparent 20%, #2ee59d 45%, #8b5cf6 65%, transparent 85%), #070b18" },
  { id: "solnedgang", label: "Solnedgang", swatch: "linear-gradient(180deg, #2b1340, #b8403a 70%, #e9793a)" },
  { id: "stjerner", label: "Stjerner", swatch: "radial-gradient(1.5px 1.5px at 30% 30%, #fff, transparent), radial-gradient(1.5px 1.5px at 70% 60%, #fff, transparent), radial-gradient(1px 1px at 45% 80%, #fff, transparent), #0b0f24" },
  { id: "regn", label: "Regnvær", swatch: "radial-gradient(circle at 30% 60%, #f6b35b88, transparent 35%), radial-gradient(circle at 70% 40%, #6fb6ff66, transparent 35%), #121a26" },
  { id: "disko", label: "Disko", swatch: "conic-gradient(from 180deg at 50% 0%, #ff5e3a55, #0c0716 20deg, #a58bff66 40deg, #0c0716 60deg, #3ecf8e55 80deg, #0c0716 100deg)" },
  { id: "glod", label: "Glød", swatch: "radial-gradient(circle at 20% 20%, #f59e0b99, transparent 60%), radial-gradient(circle at 80% 80%, #d93f7699, transparent 60%), #1f1a15" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const DEFAULT_SCENE: SceneId = "lavalampe";
export const SCENE_COOKIE = "scene";

export function isSceneId(value: string | undefined): value is SceneId {
  return SCENES.some((s) => s.id === value);
}
