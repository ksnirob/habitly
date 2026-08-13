import { addDays, endOfMonth, startOfMonth, subDays, subMonths } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dayKey, eachLocalDay, endOfLocalDay, startOfLocalDay } from "@/lib/dates/local-day";
import { habitScheduledForDate } from "@/lib/habits/schedule";
import { completionRate, currentStreak, entryMeetsTarget, longestStreak } from "@/lib/habits/streaks";
import { percent } from "@/lib/utils";

export async function getCategories() {
  const user = await getCurrentUser();
  return prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
}

export async function getTodayDashboard(date = new Date()) {
  const user = await getCurrentUser();
  const today = startOfLocalDay(date);
  const from = subDays(today, 370);
  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      isActive: true,
      isArchived: false,
      startDate: { lte: endOfLocalDay(today) },
      OR: [{ endDate: null }, { endDate: { gte: today } }]
    },
    include: {
      category: true,
      entries: { where: { date: { gte: from, lte: today } }, orderBy: { date: "asc" } }
    },
    orderBy: [{ category: { name: "asc" } }, { createdAt: "asc" }]
  });

  const scheduled = habits.filter((habit) => habitScheduledForDate(habit, today));
  const rows = scheduled.map((habit) => {
    const entry = habit.entries.find((item) => dayKey(item.date) === dayKey(today));
    const completed = entryMeetsTarget(habit, entry);
    return {
      habit,
      entry,
      completed,
      streak: currentStreak(habit, habit.entries, today),
      rate: completionRate(habit, habit.entries, subDays(today, 30), today)
    };
  });

  const completedCount = rows.filter((row) => row.completed).length;
  const weekly = eachLocalDay(subDays(today, 6), today).map((day) => {
    const dailyScheduled = habits.filter((habit) => habitScheduledForDate(habit, day));
    const done = dailyScheduled.filter((habit) =>
      entryMeetsTarget(habit, habit.entries.find((entry) => dayKey(entry.date) === dayKey(day)))
    ).length;
    return { date: day, label: day.toLocaleDateString("en", { weekday: "short" }), rate: percent(done, dailyScheduled.length) };
  });

  return {
    user,
    date: today,
    habits: rows,
    completedCount,
    totalCount: rows.length,
    progress: percent(completedCount, rows.length),
    weekly
  };
}

export async function getHabits(filter = "active", query = "") {
  const user = await getCurrentUser();
  const today = startOfLocalDay(new Date());
  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      ...(filter === "active" ? { isActive: true, isArchived: false } : {}),
      ...(filter === "archived" ? { isArchived: true } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { category: { name: { contains: query, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: { category: true, entries: { where: { date: { gte: subDays(today, 90), lte: today } } } },
    orderBy: { updatedAt: "desc" }
  });

  return habits.map((habit) => ({
    habit,
    currentStreak: currentStreak(habit, habit.entries, today),
    completionRate: completionRate(habit, habit.entries, subDays(today, 30), today)
  }));
}

export async function getHabitDetail(id: string) {
  const user = await getCurrentUser();
  const today = startOfLocalDay(new Date());
  const habit = await prisma.habit.findFirst({
    where: { id, userId: user.id },
    include: {
      category: true,
      entries: { where: { date: { gte: subDays(today, 370), lte: today } }, orderBy: { date: "asc" } },
      notes: { orderBy: { date: "desc" } }
    }
  });

  if (!habit) return null;
  return {
    habit,
    currentStreak: currentStreak(habit, habit.entries, today),
    longestStreak: longestStreak(habit, habit.entries, habit.startDate, today),
    completionRate: completionRate(habit, habit.entries, habit.startDate, today),
    totalCompletions: habit.entries.filter((entry) => entryMeetsTarget(habit, entry)).length
  };
}

export async function getCalendarData(date = new Date()) {
  const user = await getCurrentUser();
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const habits = await prisma.habit.findMany({
    where: { userId: user.id, isActive: true, isArchived: false, startDate: { lte: end } },
    include: { category: true, entries: { where: { date: { gte: start, lte: end } } } }
  });

  return eachLocalDay(start, end).map((day) => {
    const scheduled = habits.filter((habit) => habitScheduledForDate(habit, day));
    const completed = scheduled.filter((habit) =>
      entryMeetsTarget(habit, habit.entries.find((entry) => dayKey(entry.date) === dayKey(day)))
    );
    return { day, scheduled, completedCount: completed.length, rate: percent(completed.length, scheduled.length) };
  });
}

export async function getAnalytics(date = new Date()) {
  const dashboard = await getTodayDashboard();
  const monthStart = startOfMonth(date);
  const previousMonthStart = startOfMonth(subMonths(date, 1));
  const calendar = await getCalendarData(date);
  const previousCalendar = await getCalendarData(previousMonthStart);
  const successfulDays = calendar.filter((day) => day.rate === 100 && day.scheduled.length).length;
  const missedDays = calendar.filter((day) => day.rate === 0 && day.scheduled.length).length;
  const allRows = await getHabits("all");
  const totalCompletions = allRows.reduce(
    (sum, row) => sum + row.habit.entries.filter((entry) => entryMeetsTarget(row.habit, entry)).length,
    0
  );
  const longest = Math.max(0, ...allRows.map((row) => longestStreak(row.habit, row.habit.entries, row.habit.startDate, new Date())));
  const avgMonth = percent(calendar.reduce((sum, day) => sum + day.rate, 0), calendar.length * 100);
  const avgPrevious = percent(previousCalendar.reduce((sum, day) => sum + day.rate, 0), previousCalendar.length * 100);

  return {
    ...dashboard,
    monthStart,
    successfulDays,
    missedDays,
    totalCompletions,
    longestStreak: longest,
    monthRate: avgMonth,
    monthDelta: avgMonth - avgPrevious,
    monthDaily: calendar.map((day) => ({ label: day.day.getDate().toString(), rate: day.rate })),
    habits: allRows
  };
}

export function nextSevenDays() {
  const today = startOfLocalDay(new Date());
  return Array.from({ length: 7 }, (_, index) => addDays(today, index));
}
