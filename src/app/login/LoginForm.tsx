"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    // A new key on every failed attempt remounts the form, which replays the shake.
    <form
      key={state.attempt ?? 0}
      action={formAction}
      className={`card flex flex-col gap-4 p-5 ${state.attempt ? "shake" : "rise"}`}
    >
      <label className="field">
        <span>Passord</span>
        <input type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Logger inn …" : "Logg inn"}
      </button>
    </form>
  );
}
