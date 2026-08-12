import type { Category, Habit, HabitEntry, HabitNote } from "@prisma/client";

export type HabitWithRelations = Habit & {
  category: Category | null;
  entries: HabitEntry[];
  notes?: HabitNote[];
};
