import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Logg inn" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6">
      <h1 className="text-center text-3xl font-bold">Eidsvolls gate 5</h1>
      <LoginForm />
    </main>
  );
}
