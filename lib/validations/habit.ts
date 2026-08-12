import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  icon: z.string().min(1),
  color: z.string().min(1),
  categoryId: z.string().optional().or(z.literal("")),
  goalType: z.enum(["BOOLEAN", "NUMBER", "DURATION", "DISTANCE"]),
  targetValue: z.coerce.number().int().min(1).max(100000),
  unit: z.string().trim().max(24).optional().or(z.literal("")),
  frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS", "WEEKLY", "CUSTOM"]),
  weekdays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  weeklyTarget: z.coerce.number().int().min(1).max(7).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  reminderEnabled: z.coerce.boolean().default(false),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid reminder time").optional().nullable()
});

export type HabitInput = z.infer<typeof habitSchema>;

export const noteSchema = z.object({
  habitId: z.string().cuid(),
  date: z.coerce.date(),
  content: z.string().trim().min(1).max(500)
});
