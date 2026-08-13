"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dayKey, startOfLocalDay } from "@/lib/dates/local-day";
import { habitSchema, noteSchema } from "@/lib/validations/habit";

function formValues(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "Circle",
    color: formData.get("color") ?? "sky",
    categoryId: formData.get("categoryId") ?? "",
    goalType: formData.get("goalType") ?? "BOOLEAN",
    targetValue: formData.get("targetValue") ?? 1,
    unit: formData.get("unit") ?? "",
    frequency: formData.get("frequency") ?? "DAILY",
    weekdays: formData.getAll("weekdays").map(Number),
    weeklyTarget: formData.get("weeklyTarget") || null,
    startDate: formData.get("startDate") ?? new Date(),
    endDate: formData.get("endDate") || null,
    reminderEnabled: formData.get("reminderEnabled") === "on",
    reminderTime: formData.get("reminderTime") || "09:00"
  };
}

export async function createHabit(_: unknown, formData: FormData) {
  const parsed = habitSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid habit" };

  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    return { ok: false, message: "Please sign in and connect PostgreSQL before creating habits" };
  }

  await prisma.habit.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      unit: parsed.data.unit || null,
      categoryId: parsed.data.categoryId || null,
      userId: user.id,
      reminderEnabled: parsed.data.reminderEnabled,
      reminderTime: parsed.data.reminderEnabled ? parsed.data.reminderTime : null
    }
  });
  revalidatePath("/");
  redirect("/habits");
}

export async function updateHabit(id: string, _: unknown, formData: FormData) {
  const parsed = habitSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid habit" };

  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    return { ok: false, message: "Please sign in and connect PostgreSQL before editing habits" };
  }

  const existing = await prisma.habit.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { ok: false, message: "Habit not found" };

  await prisma.habit.update({
    where: { id },
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      unit: parsed.data.unit || null,
      categoryId: parsed.data.categoryId || null,
      userId: user.id,
      reminderEnabled: parsed.data.reminderEnabled,
      reminderTime: parsed.data.reminderEnabled ? parsed.data.reminderTime : null
    }
  });
  revalidatePath("/");
  redirect(`/habits/${id}`);
}

export async function toggleHabitCompletion(habitId: string, value?: number) {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    return { ok: false, message: "Please sign in before updating habits" };
  }

  try {
    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: user.id } });
    if (!habit) return { ok: false, message: "Habit not found" };

    const date = startOfLocalDay(new Date());
    const existing = await prisma.habitEntry.findUnique({ where: { habitId_date: { habitId, date } } });
    const nextValue = value ?? habit.targetValue;
    const completed = nextValue >= habit.targetValue;

    if (existing && habit.goalType === "BOOLEAN") {
      await prisma.habitEntry.delete({ where: { id: existing.id } });
    } else {
      await prisma.habitEntry.upsert({
        where: { habitId_date: { habitId, date } },
        create: { habitId, date, completed, value: nextValue },
        update: { completed, value: nextValue }
      });
    }
    revalidatePath("/");
    return { ok: true, message: existing && habit.goalType === "BOOLEAN" ? "Completion undone" : "Habit completed" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "This habit already has an entry for today" };
    }
    return { ok: false, message: "Could not update habit" };
  }
}

export async function archiveHabit(id: string) {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    return;
  }
  await prisma.habit.updateMany({ where: { id, userId: user.id }, data: { isArchived: true, isActive: false } });
  revalidatePath("/");
}

export async function restoreHabit(id: string) {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    return;
  }
  await prisma.habit.updateMany({ where: { id, userId: user.id }, data: { isArchived: false, isActive: true } });
  revalidatePath("/");
}

export async function deleteHabit(id: string) {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/habits");
  }
  await prisma.habit.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/");
  redirect("/habits");
}

export async function addHabitNote(formData: FormData) {
  const parsed = noteSchema.safeParse({
    habitId: formData.get("habitId"),
    date: formData.get("date") ?? dayKey(new Date()),
    content: formData.get("content")
  });
  if (!parsed.success) return;
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    return;
  }
  const habit = await prisma.habit.findFirst({ where: { id: parsed.data.habitId, userId: user.id } });
  if (!habit) return;
  await prisma.habitNote.create({ data: parsed.data });
  revalidatePath(`/habits/${parsed.data.habitId}`);
}
