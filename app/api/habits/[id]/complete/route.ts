import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfLocalDay } from "@/lib/dates/local-day";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const habit = await prisma.habit.findFirst({ where: { id, userId: user.id } });
  if (!habit) return NextResponse.json({ ok: false, message: "Habit not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const mode = body?.mode === "increment" ? "increment" : "complete";
  const date = startOfLocalDay(new Date());
  const existing = await prisma.habitEntry.findUnique({ where: { habitId_date: { habitId: habit.id, date } } });
  const nextValue = mode === "increment" ? Math.min(habit.targetValue, (existing?.value ?? 0) + 1) : habit.targetValue;

  try {
    await prisma.habitEntry.upsert({
      where: { habitId_date: { habitId: habit.id, date } },
      create: { habitId: habit.id, date, completed: nextValue >= habit.targetValue, value: nextValue },
      update: { completed: nextValue >= habit.targetValue, value: nextValue }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: false, message: "Already updated" }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({
    ok: true,
    message: mode === "increment" ? `Added 1 ${habit.unit ?? "step"} to ${habit.name}` : `${habit.name} completed`
  });
}
