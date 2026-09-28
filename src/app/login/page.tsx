import type { Metadata } from "next";
import { stagger } from "@/components/stagger";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Logg inn" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6">
      <div className="rise flex flex-col items-center gap-3 text-center">
        <span aria-hidden className="float text-7xl drop-shadow-lg">
          🏠
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight">Eidsvolls gate 5</h1>
        <p className="text-sm text-muted">Kun for de som bor her (og de som vet passordet).</p>
      </div>
      <div className="rise" style={stagger(2)}>
        <LoginForm />
      </div>
    </main>
  );
}
