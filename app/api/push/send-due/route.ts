import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { dayKey, startOfLocalDay } from "@/lib/dates/local-day";
import { habitScheduledForDate } from "@/lib/habits/schedule";
import { entryMeetsTarget } from "@/lib/habits/streaks";
import { isPushConfigured, sendHabitPush } from "@/lib/push";

export const dynamic = "force-dynamic";

const windowMinutes = 5;

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minutes: Number(value("hour")) * 60 + Number(value("minute"))
  };
}

function reminderMinutes(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

function notificationAction(habit: { goalType: string; unit: string | null }) {
  return habit.goalType === "BOOLEAN"
    ? { action: "complete", title: "Complete", icon: "/check.svg" }
    : { action: "increment", title: `+1 ${habit.unit ?? ""}`.trim(), icon: "/plus.svg" };
}

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function sendDue(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, message: "VAPID keys are not configured" }, { status: 503 });
  }

  const now = new Date();
  const users = await prisma.user.findMany({
    where: {
      pushSubscriptions: { some: {} },
      habits: { some: { isActive: true, isArchived: false, reminderEnabled: true, reminderTime: { not: null } } }
    },
    include: {
      pushSubscriptions: true,
      habits: {
        where: { isActive: true, isArchived: false, reminderEnabled: true, reminderTime: { not: null } },
        include: { entries: true }
      }
    }
  });

  let sent = 0;
  let skipped = 0;
  let removed = 0;

  for (const user of users) {
    const timeZone = user.timezone || "Asia/Dhaka";
    const parts = localParts(now, timeZone);
    const reminderDate = startOfLocalDay(new Date(`${parts.date}T00:00:00`));

    for (const habit of user.habits) {
      const time = habit.reminderTime ?? "09:00";
      const elapsed = parts.minutes - reminderMinutes(time);
      const todaysEntry = habit.entries.find((entry) => dayKey(entry.date) === parts.date);

      if (elapsed < 0 || elapsed >= windowMinutes) {
        skipped += 1;
        continue;
      }
      if (!habitScheduledForDate(habit, reminderDate) || entryMeetsTarget(habit, todaysEntry)) {
        skipped += 1;
        continue;
      }

      try {
        await prisma.pushReminderDelivery.create({
          data: {
            habitId: habit.id,
            userId: user.id,
            reminderDate,
            reminderTime: time
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          skipped += 1;
          continue;
        }
        throw error;
      }

      const payload = {
        title: "Habitly",
        body: `Time for ${habit.name}.`,
        tag: `habitly-${habit.id}-${parts.date}`,
        data: {
          url: "/today",
          habitId: habit.id,
          goalType: habit.goalType
        },
        actions: [notificationAction(habit)]
      };

      for (const subscription of user.pushSubscriptions) {
        try {
          await sendHabitPush(subscription, payload);
          sent += 1;
        } catch (error) {
          const statusCode = typeof error === "object" && error && "statusCode" in error ? error.statusCode : null;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => undefined);
            removed += 1;
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, removed });
}

export async function GET(request: Request) {
  return sendDue(request);
}

export async function POST(request: Request) {
  return sendDue(request);
}
