import { addDays, endOfDay, format, startOfDay } from "date-fns";

export function startOfLocalDay(date: Date | string | number) {
  const value = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return startOfDay(value);
}

export function endOfLocalDay(date: Date | string | number) {
  const value = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return endOfDay(value);
}

export function dayKey(date: Date | string | number) {
  return format(startOfLocalDay(date), "yyyy-MM-dd");
}

export function eachLocalDay(start: Date, end: Date) {
  const days: Date[] = [];
  let cursor = startOfLocalDay(start);
  const last = startOfLocalDay(end);
  while (cursor <= last) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}
