import { subDays } from "date-fns";
import { dayKey, eachLocalDay, startOfLocalDay } from "@/lib/dates/local-day";
import { habitScheduledForDate, type SchedulableHabit } from "@/lib/habits/schedule";

type EntryLike = { date: Date; completed: boolean; value: number | null };
type TargetHabit = SchedulableHabit & { targetValue: number };

export function entryMeetsTarget(habit: TargetHabit, entry?: EntryLike) {
  if (!entry) return false;
  if (entry.completed) return true;
  return (entry.value ?? 0) >= habit.targetValue;
}

export function currentStreak(habit: TargetHabit, entries: EntryLike[], today = new Date()) {
  const byDate = new Map(entries.map((entry) => [dayKey(entry.date), entry]));
  let streak = 0;
  let cursor = startOfLocalDay(today);

  for (let guard = 0; guard < 730; guard += 1) {
    if (!habitScheduledForDate(habit, cursor)) {
      cursor = subDays(cursor, 1);
      continue;
    }
    if (!entryMeetsTarget(habit, byDate.get(dayKey(cursor)))) break;
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function longestStreak(habit: TargetHabit, entries: EntryLike[], from: Date, to: Date) {
  const byDate = new Map(entries.map((entry) => [dayKey(entry.date), entry]));
  let current = 0;
  let longest = 0;

  for (const day of eachLocalDay(from, to)) {
    if (!habitScheduledForDate(habit, day)) continue;
    if (entryMeetsTarget(habit, byDate.get(dayKey(day)))) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

export function completionRate(habit: TargetHabit, entries: EntryLike[], from: Date, to: Date) {
  const scheduledDays = eachLocalDay(from, to).filter((day) => habitScheduledForDate(habit, day));
  const byDate = new Map(entries.map((entry) => [dayKey(entry.date), entry]));
  if (!scheduledDays.length) return 0;
  const completed = scheduledDays.filter((day) => entryMeetsTarget(habit, byDate.get(dayKey(day)))).length;
  return Math.round((completed / scheduledDays.length) * 100);
}
