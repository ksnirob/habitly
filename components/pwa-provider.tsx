"use client";

import { useEffect } from "react";

type Reminder = {
  id: string;
  name: string;
  time: string;
};

function nextReminderTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  return next > new Date() ? next : null;
}

function nextMidnightRefresh() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 1, 0, 0);
  return next;
}

export function PwaProvider() {
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
      if (Notification.permission !== "granted") return;

      let reminders: Reminder[] = [];
      try {
        const response = await fetch("/api/reminders", { cache: "no-store" });
        reminders = (await response.json()).reminders ?? [];
      } catch {
        reminders = [];
      }

      const nextReminder = reminders
        .map((reminder) => ({ reminder, date: nextReminderTime(reminder.time) }))
        .filter((item): item is { reminder: Reminder; date: Date } => Boolean(item.date))
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      const next = nextReminder?.date ?? nextMidnightRefresh();

      timeoutId = window.setTimeout(async () => {
        if (nextReminder) {
          const registration = await navigator.serviceWorker.ready;
          registration.active?.postMessage({
            type: "SHOW_HABIT_REMINDER",
            body: `Time for ${nextReminder.reminder.name}.`
          });
        }
        schedule();
      }, next.getTime() - Date.now());
    };

    schedule();
    window.addEventListener("habitly-reminders-change", schedule);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("habitly-reminders-change", schedule);
    };
  }, []);

  return null;
}
