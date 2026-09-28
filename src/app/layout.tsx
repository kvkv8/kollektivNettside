import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { cookies } from "next/headers";
import { Scene } from "@/components/Scene";
import { DEFAULT_SCENE, isSceneId, SCENE_COOKIE } from "@/config/scenes";
import "./globals.css";
import "./scenes.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display face for headings and big names: a bit of personality on top of Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Kollektivet", template: "%s · Kollektivet" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf5ec" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const saved = (await cookies()).get(SCENE_COOKIE)?.value;
  const scene = isSceneId(saved) ? saved : DEFAULT_SCENE;

  return (
    <html lang="nb" data-bg={scene} className={`${geistSans.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Scene />
        {children}
      </body>
    </html>
  );
}
