"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { isCheckViolation } from "@/lib/db";
import { createEvent, deleteEvent, updateEvent } from "@/lib/events";
import { eventSchema, formValues, isId, type FormState } from "@/lib/validation";

function parse(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title") ?? "",
    eventDate: formData.get("eventDate") ?? "",
    startTime: formData.get("startTime") ?? "",
    description: formData.get("description") ?? "",
  });
}

function rejected(formData: FormData): FormState {
  return { formError: "Kunne ikke lagre. Sjekk feltene og prøv igjen.", values: formValues(formData) };
}

function done(): never {
  revalidatePath("/");
  revalidatePath("/kalender");
  redirect("/kalender");
}

export async function createEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: formValues(formData) };
  }
  try {
    await createEvent(parsed.data);
  } catch (error) {
    if (isCheckViolation(error)) return rejected(formData);
    throw error;
  }
  done();
}

export async function updateEventAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
  if (!isId(id)) notFound();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: formValues(formData) };
  }
  let found: boolean;
  try {
    found = await updateEvent(id, parsed.data);
  } catch (error) {
    if (isCheckViolation(error)) return rejected(formData);
    throw error;
  }
  if (!found) notFound();
  done();
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireSession();
  if (!isId(id)) notFound();
  await deleteEvent(id);
  done();
}
