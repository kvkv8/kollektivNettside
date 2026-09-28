// Helpers for plain calendar dates ("YYYY-MM-DD") in house time (Europe/Oslo).
// Arithmetic runs on UTC-midnight Dates, so DST never shifts a day.

const WEEKDAYS = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date in Oslo, e.g. "2026-09-27". */
export function todayInOslo(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(now);
}

function toUtc(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromUtc(new Date(toUtc(date).getTime() + days * DAY_MS));
}

/** Monday of the Monday–Sunday week containing `date`. */
export function mondayOf(date: string): string {
  const daysSinceMonday = (toUtc(date).getUTCDay() + 6) % 7;
  return addDays(date, -daysSinceMonday);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Onsdag 30. sep" */
export function formatDay(date: string): string {
  const d = toUtc(date);
  return `${capitalize(WEEKDAYS[d.getUTCDay()])} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

/** "30. sep 2025" */
export function formatDate(date: string): string {
  const d = toUtc(date);
  return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "19:00:00" → "19:00" */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** ISO 8601 week number (weeks start Monday; week 1 contains the year's first Thursday). */
export function isoWeek(date: string): number {
  const thursday = addDays(mondayOf(date), 3);
  return 1 + Math.floor(daysBetween(`${thursday.slice(0, 4)}-01-01`, thursday) / 7);
}

/** Pieces for a little calendar tile: { weekday: "ons", day: 30, month: "sep" } */
export function dateParts(date: string) {
  const d = toUtc(date);
  return {
    weekday: WEEKDAYS[d.getUTCDay()].slice(0, 3),
    day: d.getUTCDate(),
    month: MONTHS[d.getUTCMonth()],
  };
}

/** "I dag", "I morgen", "Om 3 dager", or null when it's further than a week away (or past). */
export function relativeDay(date: string, today: string): string | null {
  const days = daysBetween(today, date);
  if (days === 0) return "I dag";
  if (days === 1) return "I morgen";
  if (days > 1 && days <= 7) return `Om ${days} dager`;
  return null;
}

/** The current hour (0–23) in Oslo. */
export function hourInOslo(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", hourCycle: "h23" }).format(now),
  );
}
