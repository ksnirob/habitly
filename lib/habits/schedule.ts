import type { HabitFrequency } from "@prisma/client";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { startOfLocalDay } from "@/lib/dates/local-day";

export type SchedulableHabit = {
  frequency: HabitFrequency;
  weekdays: number[];
  startDate: Date;
  endDate: Date | null;
};

export function habitScheduledForDate(habit: SchedulableHabit, date: Date) {
  const day = startOfLocalDay(date);
  const start = startOfLocalDay(habit.startDate);
  const end = habit.endDate ? startOfLocalDay(habit.endDate) : null;

  if (isBefore(day, start) && !isSameDay(day, start)) return false;
  if (end && isAfter(day, end) && !isSameDay(day, end)) return false;

  const weekday = day.getDay();
  if (habit.frequency === "DAILY") return true;
  if (habit.frequency === "WEEKDAYS") return weekday >= 1 && weekday <= 5;
  if (habit.frequency === "WEEKENDS") return weekday === 0 || weekday === 6;
  if (habit.frequency === "CUSTOM") return habit.weekdays.includes(weekday);
  if (habit.frequency === "WEEKLY") return habit.weekdays.length ? habit.weekdays.includes(weekday) : weekday === start.getDay();
  return false;
}
