"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Reminder = {
  id: string;
  habitId: string;
  name: string;
  goalType: string;
  targetValue: number;
  unit: string | null;
  date: string;
  time: string;
};

type NotificationAction = {
  action: string;
  title: string;
  icon?: string;
};

type HabitNotificationOptions = NotificationOptions & {
  actions?: NotificationAction[];
};

function reminderDateTime(reminder: Reminder) {
  const date = new Date(`${reminder.date}T${reminder.time}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const maxScheduleDelay = 15 * 60 * 1000;

function notificationAction(reminder: Reminder) {
  return reminder.goalType === "BOOLEAN"
    ? { action: "complete", title: "Complete", icon: "/check.svg" }
    : { action: "increment", title: `+1 ${reminder.unit ?? ""}`.trim(), icon: "/plus.svg" };
}

async function showHabitNotification(reminder: Reminder) {
  const registration = await navigator.serviceWorker.ready;
  const options: HabitNotificationOptions = {
    body: `Time for ${reminder.name}.`,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "habitly-daily-reminder",
    actions: [notificationAction(reminder)],
    data: {
      url: "/today",
      habitId: reminder.habitId,
      goalType: reminder.goalType
    }
  };
  await registration.showNotification("Habitly", options);
}

export function PwaProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    const schedule = async () => {
      window.clearTimeout(timeoutId);
      if (!("Notification" in window)) return;
      if (window.localStorage.getItem("habitly-reminders") !== "enabled") return;
      if (window.localStorage.getItem("habitly-push") === "enabled") return;
      if (Notification.permission !== "granted") return;

      let reminders: Reminder[] = [];
      try {
        const response = await fetch("/api/reminders", { cache: "no-store" });
        reminders = (await response.json()).reminders ?? [];
      } catch {
        reminders = [];
      }

      const nextReminder = reminders
        .map((reminder) => ({ reminder, date: reminderDateTime(reminder) }))
        .filter((item): item is { reminder: Reminder; date: Date } => Boolean(item.date))
        .filter((item) => item.date.getTime() > Date.now())
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      const delay = nextReminder ? Math.max(0, nextReminder.date.getTime() - Date.now()) : maxScheduleDelay;
      const timeoutDelay = Math.min(delay, maxScheduleDelay);

      timeoutId = window.setTimeout(async () => {
        if (nextReminder && timeoutDelay === delay) {
          await showHabitNotification(nextReminder.reminder);
        }
        schedule();
      }, timeoutDelay);
    };

    schedule();
    const scheduleOnVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    window.addEventListener("habitly-reminders-change", schedule);
    window.addEventListener("focus", schedule);
    window.addEventListener("online", schedule);
    document.addEventListener("visibilitychange", scheduleOnVisible);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("habitly-reminders-change", schedule);
      window.removeEventListener("focus", schedule);
      window.removeEventListener("online", schedule);
      document.removeEventListener("visibilitychange", scheduleOnVisible);
    };
  }, [pathname]);

  return null;
}
