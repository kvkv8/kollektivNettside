"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/validation";
import { FieldError } from "./Field";
import { FormActions } from "./FormActions";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  speakers: string[];
  initial?: { text: string; speaker: string; saidOn: string; context: string };
};

export function QuoteForm({ action, speakers, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // After a failed submit, React resets the form to its defaultValues, so show what was sent.
  const values = state.values ?? initial;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="field">
        <span>Sitat</span>
        <textarea name="text" rows={4} maxLength={1000} required defaultValue={values?.text} />
        <FieldError errors={errors.text} />
      </label>

      <label className="field">
        <span>Hvem sa det?</span>
        <input
          name="speaker"
          list="speakers"
          maxLength={50}
          required
          autoComplete="off"
          defaultValue={values?.speaker}
        />
        <datalist id="speakers">
          {speakers.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <FieldError errors={errors.speaker} />
      </label>

      <label className="field">
        <span>Dato</span>
        <input type="date" name="saidOn" defaultValue={values?.saidOn} />
        <FieldError errors={errors.saidOn} />
      </label>

      <label className="field">
        <span>Kontekst</span>
        <input
          name="context"
          maxLength={300}
          placeholder="f.eks. på hyttetur, kl. 03"
          defaultValue={values?.context}
        />
        <FieldError errors={errors.context} />
      </label>

      {state.formError && <p className="error">{state.formError}</p>}
      <FormActions pending={pending} cancelHref="/sitater" />
    </form>
  );
}
