"use client";

import { useEffect } from "react";

type Reminder = {
  id: string;
  habitId: string;
  name: string;
  date: string;
  time: string;
};

function reminderDateTime(reminder: Reminder) {
  const date = new Date(`${reminder.date}T${reminder.time}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nextRefresh() {
  const next = new Date();
  next.setMinutes(next.getMinutes() + 15, 0, 0);
  return next;
}

async function showHabitNotification(body: string) {
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification("Habitly", {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "habitly-daily-reminder",
    data: {
      url: "/today"
    }
  });
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
        .map((reminder) => ({ reminder, date: reminderDateTime(reminder) }))
        .filter((item): item is { reminder: Reminder; date: Date } => Boolean(item.date))
        .filter((item) => item.date.getTime() > Date.now())
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      const next = nextReminder?.date ?? nextRefresh();

      timeoutId = window.setTimeout(async () => {
        if (nextReminder) {
          await showHabitNotification(`Time for ${nextReminder.reminder.name}.`);
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
