import { PrismaClient, type GoalType, type HabitFrequency } from "@prisma/client";
import { subDays } from "date-fns";
import { startOfLocalDay } from "../lib/dates/local-day";
import { habitScheduledForDate } from "../lib/habits/schedule";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const categories = [
  ["Health", "Heart", "emerald"],
  ["Fitness", "Dumbbell", "rose"],
  ["Learning", "BookOpen", "sky"],
  ["Mindfulness", "Brain", "violet"],
  ["Work", "Code", "slate"],
  ["Personal", "User", "amber"],
  ["Finance", "Wallet", "emerald"],
  ["Other", "Circle", "slate"]
];

const habits: Array<{
  name: string;
  icon: string;
  category: string;
  frequency: HabitFrequency;
  goalType: GoalType;
  targetValue: number;
  unit?: string;
  weekdays?: number[];
  reminderEnabled?: boolean;
  reminderTime?: string;
  probability: number;
}> = [
  { name: "Drink 8 Glasses of Water", icon: "Droplets", category: "Health", frequency: "DAILY", goalType: "NUMBER", targetValue: 8, unit: "glasses", reminderEnabled: true, reminderTime: "08:00", probability: 0.82 },
  { name: "Read 20 Minutes", icon: "BookOpen", category: "Learning", frequency: "DAILY", goalType: "DURATION", targetValue: 20, unit: "minutes", reminderEnabled: true, reminderTime: "21:30", probability: 0.68 },
  { name: "Workout", icon: "Dumbbell", category: "Fitness", frequency: "CUSTOM", goalType: "BOOLEAN", targetValue: 1, weekdays: [1, 3, 5], reminderEnabled: true, reminderTime: "18:00", probability: 0.76 },
  { name: "Meditate", icon: "Brain", category: "Mindfulness", frequency: "DAILY", goalType: "DURATION", targetValue: 15, unit: "minutes", reminderEnabled: true, reminderTime: "07:30", probability: 0.74 },
  { name: "Walk 10,000 Steps", icon: "Footprints", category: "Fitness", frequency: "WEEKDAYS", goalType: "NUMBER", targetValue: 10000, unit: "steps", probability: 0.7 },
  { name: "No Sugar", icon: "Apple", category: "Health", frequency: "WEEKDAYS", goalType: "BOOLEAN", targetValue: 1, probability: 0.63 },
  { name: "Learn Something", icon: "Code", category: "Work", frequency: "DAILY", goalType: "BOOLEAN", targetValue: 1, reminderEnabled: true, reminderTime: "10:00", probability: 0.72 },
  { name: "Sleep Before 11 PM", icon: "Moon", category: "Personal", frequency: "DAILY", goalType: "BOOLEAN", targetValue: 1, reminderEnabled: true, reminderTime: "22:15", probability: 0.58 }
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function main() {
  const adminPasswordHash = hashPassword("681074@ks");
  const user = await prisma.user.upsert({
    where: { email: "admin@ksnirob.com" },
    update: { passwordHash: adminPasswordHash },
    create: { email: "admin@ksnirob.com", name: "Admin", passwordHash: adminPasswordHash, timezone: "Asia/Dhaka", settings: { create: {} } }
  });

  for (const [name, icon, color] of categories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: { icon, color },
      create: { userId: user.id, name, icon, color }
    });
  }

  const categoryRows = await prisma.category.findMany({ where: { userId: user.id } });
  const byName = new Map(categoryRows.map((category) => [category.name, category]));
  const startDate = startOfLocalDay(subDays(new Date(), 90));

  for (const [index, habit] of habits.entries()) {
    const created = await prisma.habit.create({
      data: {
        name: habit.name,
        icon: habit.icon,
        color: byName.get(habit.category)?.color ?? "sky",
        categoryId: byName.get(habit.category)?.id,
        userId: user.id,
        frequency: habit.frequency,
        goalType: habit.goalType,
        targetValue: habit.targetValue,
        unit: habit.unit,
        weekdays: habit.weekdays ?? [],
        startDate,
        reminderEnabled: habit.reminderEnabled ?? false,
        reminderTime: habit.reminderEnabled ? habit.reminderTime ?? "09:00" : null
      }
    });

    for (let offset = 90; offset >= 0; offset -= 1) {
      const date = startOfLocalDay(subDays(new Date(), offset));
      if (!habitScheduledForDate(created, date)) continue;
      const roll = seededRandom(index * 1000 + offset);
      if (roll > habit.probability) continue;
      const partial = roll < 0.12 && habit.goalType !== "BOOLEAN";
      const value = habit.goalType === "BOOLEAN" ? 1 : partial ? Math.floor(habit.targetValue * 0.55) : habit.targetValue + Math.floor(roll * 3);
      await prisma.habitEntry.create({
        data: { habitId: created.id, date, completed: value >= habit.targetValue, value }
      });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
