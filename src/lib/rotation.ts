import { anchorMonday, names } from "@/config/rotation";
import { addDays, daysBetween, mondayOf } from "./dates";

/** Who has trash duty in the week containing `date`. Pure function of config + date (D7). */
export function dutyFor(date: string): string {
  const weeks = Math.floor(daysBetween(anchorMonday, mondayOf(date)) / 7);
  const n = names.length;
  return names[((weeks % n) + n) % n]; // double-mod handles dates before the anchor
}

export function dutyThisAndNextWeek(today: string) {
  return { thisWeek: dutyFor(today), nextWeek: dutyFor(addDays(today, 7)) };
}
