"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { isCheckViolation } from "@/lib/db";
import { createQuote, deleteQuote, updateQuote } from "@/lib/quotes";
import { formValues, isId, quoteSchema, type FormState } from "@/lib/validation";

function parse(formData: FormData) {
  return quoteSchema.safeParse({
    text: formData.get("text") ?? "",
    speaker: formData.get("speaker") ?? "",
    saidOn: formData.get("saidOn") ?? "",
    context: formData.get("context") ?? "",
  });
}

function rejected(formData: FormData): FormState {
  return { formError: "Kunne ikke lagre. Sjekk feltene og prøv igjen.", values: formValues(formData) };
}

function done(): never {
  revalidatePath("/");
  revalidatePath("/sitater");
  redirect("/sitater");
}

export async function createQuoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: formValues(formData) };
  }
  try {
    await createQuote(parsed.data);
  } catch (error) {
    if (isCheckViolation(error)) return rejected(formData);
    throw error;
  }
  done();
}

export async function updateQuoteAction(
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
    found = await updateQuote(id, parsed.data);
  } catch (error) {
    if (isCheckViolation(error)) return rejected(formData);
    throw error;
  }
  if (!found) notFound();
  done();
}

export async function deleteQuoteAction(id: string): Promise<void> {
  await requireSession();
  if (!isId(id)) notFound();
  await deleteQuote(id);
  done();
}
