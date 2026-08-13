"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
  const [nextReminder, setNextReminder] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(() =>
    typeof window === "undefined" ? false : window.localStorage.getItem("habitly-reminders") === "enabled"
  );
  const [supported, setSupported] = useState(() =>
    typeof window === "undefined" ? true : "Notification" in window && "serviceWorker" in navigator
  );

  useEffect(() => {
    async function loadNextReminder() {
      try {
        const response = await fetch("/api/reminders", { cache: "no-store" });
        const reminders: { name: string; date: string; time: string }[] = (await response.json()).reminders ?? [];
        const next = reminders
          .map((reminder) => ({ reminder, date: new Date(`${reminder.date}T${reminder.time}:00`) }))
          .filter((item) => !Number.isNaN(item.date.getTime()) && item.date.getTime() > Date.now())
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
        setNextReminder(next ? `${next.reminder.name} at ${next.date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : null);
      } catch {
        setNextReminder(null);
      }
    }

    const sync = () => {
      setSupported("Notification" in window && "serviceWorker" in navigator);
      setEnabled(window.localStorage.getItem("habitly-reminders") === "enabled");
      loadNextReminder();
    };
    loadNextReminder();
    window.addEventListener("habitly-reminders-change", sync);
    return () => window.removeEventListener("habitly-reminders-change", sync);
  }, []);

  async function enable() {
    if (!supported) {
      toast.error("Notifications are not supported in this browser");
      return;
    }

    await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notifications were not enabled");
      return;
    }

    window.localStorage.setItem("habitly-reminders", "enabled");
    setEnabled(true);
    window.dispatchEvent(new Event("habitly-reminders-change"));
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Habitly", {
        body: "Reminders are on. Habitly will nudge you daily.",
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: "habitly-reminders-enabled",
        data: {
          url: "/today"
        }
      });
      toast.success("Daily reminders enabled");
    } catch {
      toast.error("Notifications are enabled, but the browser blocked the preview");
    }
  }

  async function showTestNotification() {
    if (!supported) {
      toast.error("Notifications are not supported in this browser");
      return;
    }
    if (Notification.permission !== "granted") {
      toast.error("Turn on reminders first");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Habitly", {
        body: "Notifications are working.",
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: "habitly-test-notification",
        data: {
          url: "/today"
        }
      });
      toast.success("Test notification sent");
    } catch {
      toast.error("The browser or OS blocked the notification");
    }
  }

  function disable() {
    window.localStorage.removeItem("habitly-reminders");
    setEnabled(false);
    window.dispatchEvent(new Event("habitly-reminders-change"));
    toast.success("Daily reminders disabled");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          {enabled ? <Bell className="size-5" /> : <BellOff className="size-5" />}
        </span>
        <div className="min-w-0">
          <div className="font-medium">Daily habit reminder</div>
          <div className="text-sm text-muted-foreground">
            {enabled ? "Habitly will use the reminder time set on each habit." : "Enable mobile browser reminders for today's habits."}
          </div>
          {enabled && nextReminder && <div className="mt-1 text-xs text-muted-foreground">Next: {nextReminder}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        {enabled && <Button type="button" variant="outline" onClick={showTestNotification}>Test</Button>}
        <Button type="button" variant={enabled ? "outline" : "default"} onClick={enabled ? disable : enable}>
          {enabled ? "Turn off" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
