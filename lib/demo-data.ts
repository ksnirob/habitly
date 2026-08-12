import { endOfMonth, startOfMonth, subDays, subMonths } from "date-fns";
import type { Category, Habit, HabitEntry, User, UserSettings } from "@prisma/client";
import { dayKey, eachLocalDay, startOfLocalDay } from "@/lib/dates/local-day";
import { habitScheduledForDate } from "@/lib/habits/schedule";
import { completionRate, currentStreak, entryMeetsTarget, longestStreak } from "@/lib/habits/streaks";
import { percent } from "@/lib/utils";

const now = new Date();
const createdAt = subDays(now, 100);

export const demoUser: User & { settings: UserSettings } = {
  id: "demo-user",
  name: "Khaled",
  email: "khaled@example.com",
  image: null,
  timezone: "Asia/Dhaka",
  weekStart: "MONDAY",
  createdAt,
  updatedAt: now,
  settings: {
    id: "demo-settings",
    userId: "demo-user",
    theme: "SYSTEM",
    defaultReminders: false,
    completionBehavior: "TOGGLE",
    createdAt,
    updatedAt: now
  }
};

export const demoCategories: Category[] = [
  { id: "cat-health", name: "Health", icon: "Heart", color: "emerald", userId: demoUser.id, createdAt, updatedAt: now },
  { id: "cat-fitness", name: "Fitness", icon: "Dumbbell", color: "rose", userId: demoUser.id, createdAt, updatedAt: now },
  { id: "cat-learning", name: "Learning", icon: "BookOpen", color: "sky", userId: demoUser.id, createdAt, updatedAt: now },
  { id: "cat-mindfulness", name: "Mindfulness", icon: "Brain", color: "violet", userId: demoUser.id, createdAt, updatedAt: now },
  { id: "cat-personal", name: "Personal", icon: "Moon", color: "amber", userId: demoUser.id, createdAt, updatedAt: now }
];

type DemoHabitSeed = Omit<Habit, "createdAt" | "updatedAt"> & { probability: number };

const demoHabitSeeds: DemoHabitSeed[] = [
  {
    id: "habit-water",
    name: "Drink 8 Glasses of Water",
    description: "Keep a bottle nearby and finish it steadily.",
    icon: "Droplets",
    color: "sky",
    frequency: "DAILY",
    goalType: "NUMBER",
    targetValue: 8,
    unit: "glasses",
    weekdays: [],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: true,
    reminderTime: "08:00",
    isActive: true,
    isArchived: false,
    userId: demoUser.id,
    categoryId: "cat-health",
    probability: 0.86
  },
  {
    id: "habit-read",
    name: "Read 20 Minutes",
    description: "A quiet block before bed.",
    icon: "BookOpen",
    color: "emerald",
    frequency: "DAILY",
    goalType: "DURATION",
    targetValue: 20,
    unit: "minutes",
    weekdays: [],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: true,
    reminderTime: "21:30",
    isActive: true,
    isArchived: false,
    userId: demoUser.id,
    categoryId: "cat-learning",
    probability: 0.68
  },
  {
    id: "habit-workout",
    name: "Workout",
    description: "Strength session on alternating weekdays.",
    icon: "Dumbbell",
    color: "rose",
    frequency: "CUSTOM",
    goalType: "BOOLEAN",
    targetValue: 1,
    unit: null,
    weekdays: [1, 3, 5],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: true,
    reminderTime: "18:00",
    isActive: true,
    isArchived: false,
    userId: demoUser.id,
    categoryId: "cat-fitness",
    probability: 0.76
  },
  {
    id: "habit-meditate",
    name: "Meditate",
    description: "Reset attention for fifteen minutes.",
    icon: "Brain",
    color: "violet",
    frequency: "DAILY",
    goalType: "DURATION",
    targetValue: 15,
    unit: "minutes",
    weekdays: [],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: true,
    reminderTime: "07:30",
    isActive: true,
    isArchived: false,
    userId: demoUser.id,
    categoryId: "cat-mindfulness",
    probability: 0.74
  },
  {
    id: "habit-steps",
    name: "Walk 10,000 Steps",
    description: "Get outside after lunch.",
    icon: "Footprints",
    color: "amber",
    frequency: "WEEKDAYS",
    goalType: "NUMBER",
    targetValue: 10000,
    unit: "steps",
    weekdays: [],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: false,
    reminderTime: null,
    isActive: true,
    isArchived: false,
    userId: demoUser.id,
    categoryId: "cat-fitness",
    probability: 0.7
  },
  {
    id: "habit-sleep",
    name: "Sleep Before 11 PM",
    description: "Wind down before the day gets away.",
    icon: "Moon",
    color: "slate",
    frequency: "DAILY",
    goalType: "BOOLEAN",
    targetValue: 1,
    unit: null,
    weekdays: [],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: true,
    reminderTime: "22:15",
    isActive: true,
    isArchived: false,
    userId: demoUser.id,
    categoryId: "cat-personal",
    probability: 0.58
  },
  {
    id: "habit-archive",
    name: "No Sugar",
    description: "Archived example with retained history.",
    icon: "Apple",
    color: "emerald",
    frequency: "WEEKDAYS",
    goalType: "BOOLEAN",
    targetValue: 1,
    unit: null,
    weekdays: [],
    weeklyTarget: null,
    startDate: subDays(startOfLocalDay(now), 90),
    endDate: null,
    reminderEnabled: false,
    reminderTime: null,
    isActive: false,
    isArchived: true,
    userId: demoUser.id,
    categoryId: "cat-health",
    probability: 0.64
  }
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function categoryFor(habit: Habit) {
  return demoCategories.find((category) => category.id === habit.categoryId) ?? null;
}

export function getDemoHabits() {
  return demoHabitSeeds.map((seed) => {
    const { probability, ...habitFields } = seed;
    void probability;
    const habit: Habit = { ...habitFields, createdAt, updatedAt: now };

    return {
      ...habit,
      category: categoryFor(habit),
      entries: demoEntriesForHabit(habit)
    };
  });
}

export function demoEntriesForHabit(habit: Habit): HabitEntry[] {
  const days = eachLocalDay(subDays(startOfLocalDay(now), 90), startOfLocalDay(now));
  const probability = demoHabitSeeds.find((item) => item.id === habit.id)?.probability ?? 0.7;

  return days.flatMap((date, index) => {
    if (!habitScheduledForDate(habit, date)) return [];
    const roll = seededRandom(index * 89 + habit.id.length * 31);
    if (roll > probability) return [];
    const partial = roll < 0.16 && habit.goalType !== "BOOLEAN";
    const value = habit.goalType === "BOOLEAN" ? 1 : partial ? Math.max(1, Math.floor(habit.targetValue * 0.55)) : habit.targetValue + Math.floor(roll * 3);
    return [
      {
        id: `${habit.id}-${dayKey(date)}`,
        habitId: habit.id,
        date,
        completed: value >= habit.targetValue,
        value,
        createdAt: date,
        updatedAt: date
      }
    ];
  });
}

export function getDemoTodayDashboard(date = new Date()) {
  const today = startOfLocalDay(date);
  const habits = getDemoHabits().filter((habit) => habit.isActive && !habit.isArchived);
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
    user: demoUser,
    date: today,
    habits: rows,
    completedCount,
    totalCount: rows.length,
    progress: percent(completedCount, rows.length),
    weekly
  };
}

export function getDemoHabitRows(filter = "active", query = "") {
  const today = startOfLocalDay(now);
  return getDemoHabits()
    .filter((habit) => {
      if (filter === "active") return habit.isActive && !habit.isArchived;
      if (filter === "archived") return habit.isArchived;
      return true;
    })
    .filter((habit) => {
      const search = query.toLowerCase();
      if (!search) return true;
      return habit.name.toLowerCase().includes(search) || (habit.category?.name.toLowerCase().includes(search) ?? false);
    })
    .map((habit) => ({
      habit,
      currentStreak: currentStreak(habit, habit.entries, today),
      completionRate: completionRate(habit, habit.entries, subDays(today, 30), today)
    }));
}

export function getDemoHabitDetail(id: string) {
  const habit = getDemoHabits().find((item) => item.id === id);
  if (!habit) return null;
  const today = startOfLocalDay(now);
  return {
    habit: {
      ...habit,
      notes: [
        {
          id: `${habit.id}-note-1`,
          habitId: habit.id,
          date: subDays(today, 2),
          content: "Felt easier once it was done early.",
          createdAt: subDays(today, 2),
          updatedAt: subDays(today, 2)
        }
      ]
    },
    currentStreak: currentStreak(habit, habit.entries, today),
    longestStreak: longestStreak(habit, habit.entries, habit.startDate, today),
    completionRate: completionRate(habit, habit.entries, habit.startDate, today),
    totalCompletions: habit.entries.filter((entry) => entryMeetsTarget(habit, entry)).length
  };
}

export function getDemoCalendarData(date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const habits = getDemoHabits().filter((habit) => habit.isActive && !habit.isArchived);

  return eachLocalDay(start, end).map((day) => {
    const scheduled = habits.filter((habit) => habitScheduledForDate(habit, day));
    const completed = scheduled.filter((habit) =>
      entryMeetsTarget(habit, habit.entries.find((entry) => dayKey(entry.date) === dayKey(day)))
    );
    return { day, scheduled, completedCount: completed.length, rate: percent(completed.length, scheduled.length) };
  });
}

export function getDemoAnalytics() {
  const dashboard = getDemoTodayDashboard();
  const calendar = getDemoCalendarData(now);
  const previousCalendar = getDemoCalendarData(subMonths(now, 1));
  const rows = getDemoHabitRows("all");
  const totalCompletions = rows.reduce(
    (sum, row) => sum + row.habit.entries.filter((entry) => entryMeetsTarget(row.habit, entry)).length,
    0
  );
  const monthRate = percent(calendar.reduce((sum, day) => sum + day.rate, 0), calendar.length * 100);
  const previousRate = percent(previousCalendar.reduce((sum, day) => sum + day.rate, 0), previousCalendar.length * 100);

  return {
    ...dashboard,
    monthStart: startOfMonth(now),
    successfulDays: calendar.filter((day) => day.rate === 100 && day.scheduled.length).length,
    missedDays: calendar.filter((day) => day.rate === 0 && day.scheduled.length).length,
    totalCompletions,
    longestStreak: Math.max(0, ...rows.map((row) => longestStreak(row.habit, row.habit.entries, row.habit.startDate, now))),
    monthRate,
    monthDelta: monthRate - previousRate,
    habits: rows
  };
}
