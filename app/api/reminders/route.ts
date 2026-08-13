import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { dayKey } from "@/lib/dates/local-day";
import { getTodayDashboard } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

type ReminderHabit = {
  id: string;
  name: string;
  goalType?: string;
  targetValue?: number;
  unit?: string | null;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
};

function isReminderHabit(habit: unknown): habit is ReminderHabit {
  return Boolean(habit && typeof habit === "object" && "id" in habit && "name" in habit);
}

export async function GET() {
  const dates = [new Date(), addDays(new Date(), 1)];
  const dashboards = await Promise.all(dates.map((date) => getTodayDashboard(date)));
  const reminders = dashboards
    .flatMap((dashboard) =>
      dashboard.habits
        .filter((row) => !row.completed && isReminderHabit(row.habit))
        .map((row) => row.habit)
        .filter((habit) => habit.reminderEnabled && habit.reminderTime)
        .map((habit) => ({
          id: `${habit.id}-${dayKey(dashboard.date)}`,
          habitId: habit.id,
          name: habit.name,
          goalType: habit.goalType ?? "BOOLEAN",
          targetValue: habit.targetValue ?? 1,
          unit: habit.unit ?? null,
          date: dayKey(dashboard.date),
          time: habit.reminderTime ?? "09:00"
        }))
    )
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return NextResponse.json({ reminders });
}
