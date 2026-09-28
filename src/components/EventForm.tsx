"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/validation";
import { FieldError } from "./Field";
import { FormActions } from "./FormActions";
import { stagger } from "./stagger";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: { title: string; eventDate: string; startTime: string; description: string };
};

export function EventForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // After a failed submit, React resets the form to its defaultValues, so show what was sent.
  const values = state.values ?? initial;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="card rise flex flex-col gap-4" style={stagger(1)}>
      <label className="field">
        <span>Tittel</span>
        <input
          name="title"
          maxLength={100}
          required
          placeholder="f.eks. Ola har besøk"
          defaultValue={values?.title}
        />
        <FieldError errors={errors.title} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="field">
          <span>Dato</span>
          <input type="date" name="eventDate" required defaultValue={values?.eventDate} />
          <FieldError errors={errors.eventDate} />
        </label>
        <label className="field">
          <span>Klokkeslett</span>
          <input type="time" name="startTime" defaultValue={values?.startTime} />
          <FieldError errors={errors.startTime} />
        </label>
      </div>

      <label className="field">
        <span>Beskrivelse</span>
        <textarea name="description" rows={3} maxLength={1000} defaultValue={values?.description} />
        <FieldError errors={errors.description} />
      </label>

      {state.formError && <p className="error">{state.formError}</p>}
      <FormActions pending={pending} cancelHref="/kalender" />
    </form>
  );
}
