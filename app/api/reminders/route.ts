import { NextResponse } from "next/server";
import { getTodayDashboard } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

type ReminderHabit = {
  id: string;
  name: string;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
};

function isReminderHabit(habit: unknown): habit is ReminderHabit {
  return Boolean(habit && typeof habit === "object" && "id" in habit && "name" in habit);
}

export async function GET() {
  const dashboard = await getTodayDashboard();
  const reminders = dashboard.habits
    .filter((row) => !row.completed && isReminderHabit(row.habit))
    .map((row) => row.habit)
    .filter((habit) => habit.reminderEnabled && habit.reminderTime)
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      time: habit.reminderTime ?? "09:00"
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  return NextResponse.json({ reminders });
}
